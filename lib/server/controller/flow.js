/**
 * Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
 * Copyright (C) 2025 Tencent. All rights reserved.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

import { execApiGateWay } from '@bkui/apigateway-nodejs-sdk'
import dayjs from 'dayjs'
import { Between } from 'typeorm'
import {
    Controller,
    OutputJson,
    Get,
    Post,
    Put,
    Delete,
    BodyParams,
    QueryParams,
    HeaderParams,
    PathParams,
    SessionParams,
    CookieParams,
    ProjectAuthorization,
    ProjectResAuthorization
} from '../decorator'
import PageModel from '../model/page'
import { LCDataService, TABLE_FILE_NAME } from '../service/common/data-service'
import httpConf from '../conf/http'
import v3Conf from '../conf/v3'
import { transFlowTplToBkFlowPipelineTree } from '../utils/flow'
import { getTaskList } from '../service/business/flow'

const bkflowApiGatewayName = global.BKFLOW_API_GATEWAY_NAME
const authorization = {
    bk_app_code: v3Conf.APP_ID,
    bk_app_secret: v3Conf.APP_SECRET
}

const CONTAINER_TYPE_MAP = {
    flowManageContainer: 'widget-flow-manage-container',
    flowWorkbenchContainer: 'widget-flow-workbench-container',
    formContainer: 'widget-form-container',
    dataManageContainer: 'widget-data-manage-container'
}

const CHECK_CONDITIONS = {
    [CONTAINER_TYPE_MAP.flowManageContainer]: (comp, tplId) =>
        comp.renderProps?.id?.code === Number(tplId),
    [CONTAINER_TYPE_MAP.flowWorkbenchContainer]: () => true,
    [CONTAINER_TYPE_MAP.formContainer]: (comp, tplId, nodeId) =>
        comp.renderProps?.dataSource?.code?.flowTplId === Number(tplId)
        && comp.renderProps?.dataSource?.code?.nodeId === nodeId,
    [CONTAINER_TYPE_MAP.dataManageContainer]: (comp, tplId, nodeId) =>
        comp.renderProps?.flowTplId?.code === Number(tplId)
        && comp.renderProps?.nodeId?.code === nodeId
}

// bkflow网关的预发布环境名称为stage，需要特殊处理
const stageName = httpConf.stageName === 'stag' ? 'stage' : httpConf.stageName

// 创建bkflow空间
export const createAppBkFlowSpace = async ({ projectId, name, appCode, superusers }) => {
    const spaceData = await LCDataService.findOne(TABLE_FILE_NAME.PROJECT_BKFLOW_SPACE, { projectId })

    if (!spaceData) {
        try {
            const response = await execApiGateWay({
                apiName: bkflowApiGatewayName,
                path: '/create_space/',
                method: 'post',
                authorization: {
                    ...authorization
                },
                apiUrlTemp: httpConf.apiGateWayUrlTmpl,
                stageName,
                data: {
                    name,
                    app_code: appCode,
                    desc: 'lesscode',
                    platform_url: 'https://lesscode-app.domain.com',
                    config: {
                        superusers
                    }
                }
            })

            console.log('create bkflow space response ============>', response)

            if (response.result) {
                await LCDataService.add(TABLE_FILE_NAME.PROJECT_BKFLOW_SPACE, {
                    projectId,
                    bkFlowSpaceId: response.data.space.id
                })
            }
        } catch (err) {
            console.error('create bkflow space error:\n', err)
            throw new Error(err.message, -1)
        }
    }

    return spaceData
}

@Controller('/api/flow')
export default class FlowController {
    // 获取项目下流程模板列表
    @OutputJson()
    @ProjectAuthorization({})
    @Get('/tpl')
    async getFlowTplList (
        @HeaderParams({ name: 'x-project-id', require: true }) projectId,
        @QueryParams({ name: 'page' }) page,
        @QueryParams({ name: 'pageSize' }) pageSize,
        @QueryParams({ name: 'deleteFlag', default: 0 }) deleteFlag,
        @QueryParams({ name: 'name' }) name
    ) {
        const query = Object.assign({
            projectId,
            deleteFlag
        }, (name ? { name: `%${name}%` } : {}))
        const { list, count } = await LCDataService.get({
            tableFileName: TABLE_FILE_NAME.FLOW_TPL,
            page,
            pageSize,
            query
        })
        const pages = await PageModel.getProjectPages(projectId)

        function hasFlowContainer (components, tplId) {
            return components.some(comp => {
                if (comp.type === CONTAINER_TYPE_MAP.flowManageContainer && CHECK_CONDITIONS[comp.type]?.(comp, tplId)) {
                    return true
                }
                return comp.renderSlots?.default?.length && hasFlowContainer(comp.renderSlots.default, tplId)
            })
        }

        list.forEach(tpl => {
            const pageMap = new Map()

            pages.forEach(page => {
                if (pageMap.has(page.id)) return

                try {
                    const components = JSON.parse(page.content || '[]')
                    if (hasFlowContainer(components, tpl.id)) {
                        pageMap.set(page.id, {
                            id: page.id,
                            name: page.pageName,
                            pageCode: page.pageCode
                        })
                    }
                } catch (e) {
                    console.error('页面内容解析失败:', page.id, e)
                }
            })
            tpl.flowManagePages = Array.from(pageMap.values())
        })
        return { list, count }
    }

    // 新增流程模板
    @OutputJson()
    @ProjectAuthorization({})
    @Post('/tpl')
    async createFlowTpl (
        @HeaderParams({ name: 'x-project-id', require: true }) projectId,
        @BodyParams({ name: 'name', require: true }) name,
        @BodyParams({ name: 'summary', default: '' }) summary,
        @BodyParams({ name: 'nodes', require: true, default: '[]' }) nodes,
        @BodyParams({ name: 'edges', require: true, default: '[]' }) edges,
        @BodyParams({ name: 'notifyConfig', require: true }) notifyConfig,
        @BodyParams({ name: 'deployed', default: 0 }) deployed
    ) {
        return LCDataService.add(TABLE_FILE_NAME.FLOW_TPL, { name, summary, nodes, edges, notifyConfig, deployed, projectId })
    }

    // 获取流程模板详情
    @OutputJson()
    @ProjectAuthorization({})
    @Get('/tpl/:tplId')
    async getFlowTplDetail (
        @HeaderParams({ name: 'x-project-id', require: true }) projectId,
        @PathParams({ name: 'tplId', require: true }) tplId
    ) {
        const tplDetail = await LCDataService.findOne(TABLE_FILE_NAME.FLOW_TPL, { projectId, id: tplId })
        if (tplDetail) {
            return tplDetail
        }
        throw new Error(global.i18n.t('流程模板不存在'))
    }

    // 更新流程模板
    @OutputJson()
    @ProjectAuthorization({})
    @Put('/tpl/:tplId')
    async updateFlowTpl (
        @HeaderParams({ name: 'x-project-id', require: true }) projectId,
        @PathParams({ name: 'tplId', require: true }) tplId,
        @BodyParams({ name: 'name', require: true }) name,
        @BodyParams({ name: 'summary', default: '' }) summary,
        @BodyParams({ name: 'nodes', require: true, default: '[]' }) nodes,
        @BodyParams({ name: 'edges', require: true, default: '[]' }) edges,
        @BodyParams({ name: 'notifyConfig', require: true }) notifyConfig,
        @BodyParams({ name: 'deployed', default: 0 }) deployed
    ) {
        return LCDataService.update(TABLE_FILE_NAME.FLOW_TPL, { id: tplId, name, summary, nodes, edges, notifyConfig, deployed, projectId })
    }

    // 归档/恢复流程模板
    @OutputJson()
    @ProjectResAuthorization({ tableName: 'FLOW_TPL' })
    @Put('/archive')
    async archiveFlowTpl (
        @BodyParams({ name: 'id' }) id,
        @BodyParams({ name: 'deleteFlag' }) deleteFlag
    ) {
        const flowDetail = await LCDataService.findOne(TABLE_FILE_NAME.FLOW_TPL, { id })
        if (!flowDetail) {
            throw new global.BusinessError(global.i18n.t('流程模板不存在'), -1)
        }
        await LCDataService.update(TABLE_FILE_NAME.FLOW_TPL, { id, deleteFlag })

        return flowDetail
    }

    // 新增流程节点
    @OutputJson()
    @ProjectAuthorization({})
    @Post('/tpl/:tplId/node')
    async createFlowNode (
        @PathParams({ name: 'tplId', require: true }) tplId,
        @BodyParams({ name: 'data', require: true }) data
    ) {
        const flowDetail = await LCDataService.findOne(TABLE_FILE_NAME.FLOW_TPL, { id: tplId })
        if (!flowDetail) {
            throw new global.BusinessError(global.i18n.t('流程模板不存在'), -1)
        }

        const nodes = JSON.parse(flowDetail.nodes || '[]')
        if (nodes.findIndex(item => item.id === data.id) === -1) {
            nodes.push(data)
        }

        return LCDataService.update(TABLE_FILE_NAME.FLOW_TPL, { id: tplId, nodes: JSON.stringify(nodes), deployed: 0 })
    }

    // 更新流程节点
    @OutputJson()
    @ProjectAuthorization({})
    @Put('/tpl/:tplId/node/:nodeId')
    async updateFlowNode (
        @PathParams({ name: 'tplId', require: true }) tplId,
        @PathParams({ name: 'nodeId', require: true }) nodeId,
        @BodyParams({ name: 'data', require: true }) data
    ) {
        const flowDetail = await LCDataService.findOne(TABLE_FILE_NAME.FLOW_TPL, { id: tplId })
        if (!flowDetail) {
            throw new global.BusinessError(global.i18n.t('流程模板不存在'), -1)
        }

        const nodes = JSON.parse(flowDetail.nodes || '[]')
        const index = nodes.findIndex(v => v.id === nodeId)
        if (index > -1) {
            nodes.splice(index, 1, data)
        } else {
            throw new global.BusinessError(global.i18n.t('流程节点不存在'), -1)
        }

        return LCDataService.update(TABLE_FILE_NAME.FLOW_TPL, { id: tplId, nodes: JSON.stringify(nodes), deployed: 0 })
    }

    // 删除流程节点
    @OutputJson()
    @ProjectAuthorization({})
    @Delete('/tpl/:tplId/node/:nodeId')
    async deleteFlowNode (
        @PathParams({ name: 'tplId', require: true }) tplId,
        @PathParams({ name: 'nodeId', require: true }) nodeId
    ) {
        const flowDetail = await LCDataService.findOne(TABLE_FILE_NAME.FLOW_TPL, { id: tplId })
        if (!flowDetail) {
            throw new global.BusinessError(global.i18n.t('流程模板不存在'), -1)
        }

        const nodes = JSON.parse(flowDetail.nodes || '[]')
        let edges = JSON.parse(flowDetail.edges || '[]')

        const index = nodes.findIndex(v => v.id === nodeId)
        if (index > -1) {
            nodes.splice(index, 1)
            edges = edges.filter(edge => edge.source.cell !== nodeId && edge.target.cell !== nodeId)
        } else {
            throw new global.BusinessError(global.i18n.t('流程节点不存在'), -1)
        }
        return LCDataService.update(TABLE_FILE_NAME.FLOW_TPL, { id: tplId, nodes: JSON.stringify(nodes), edges: JSON.stringify(edges), deployed: 0 })
    }

    // 新增流程边
    @OutputJson()
    @ProjectAuthorization({})
    @Post('/tpl/:tplId/edge')
    async createFlowEdge (
        @PathParams({ name: 'tplId', require: true }) tplId,
        @BodyParams({ name: 'data', require: true }) data
    ) {
        const flowDetail = await LCDataService.findOne(TABLE_FILE_NAME.FLOW_TPL, { id: tplId })
        if (!flowDetail) {
            throw new global.BusinessError(global.i18n.t('流程模板不存在'), -1)
        }

        const edges = JSON.parse(flowDetail.edges || '[]')
        if (edges.findIndex(item => item.id === data.id) === -1) {
            edges.push(data)
        }
        return LCDataService.update(TABLE_FILE_NAME.FLOW_TPL, { id: tplId, edges: JSON.stringify(edges), deployed: 0 })
    }

    // 删除流程边
    @OutputJson()
    @ProjectAuthorization({})
    @Delete('/tpl/:tplId/edge/:edgeId')
    async deleteFlowEdge (
        @PathParams({ name: 'tplId', require: true }) tplId,
        @PathParams({ name: 'edgeId', require: true }) edgeId
    ) {
        const flowDetail = await LCDataService.findOne(TABLE_FILE_NAME.FLOW_TPL, { id: tplId })
        if (!flowDetail) {
            throw new global.BusinessError(global.i18n.t('流程模板不存在'), -1)
        }

        const edges = JSON.parse(flowDetail.edges || '[]')
        const index = edges.findIndex(e => e.id === edgeId)
        if (index > -1) {
            edges.splice(index, 1)
        } else {
            throw new global.BusinessError(global.i18n.t('流程边不存在'), -1)
        }
        return LCDataService.update(TABLE_FILE_NAME.FLOW_TPL, { id: tplId, edges: JSON.stringify(edges), deployed: 0 })
    }
    // 查询包含流程工作台的页面
    @OutputJson()
    @ProjectAuthorization({})
    @Get('/queryRelatedWorkbenchPages')
    async queryRelatedWorkbenchPages (
        @HeaderParams({ name: 'x-project-id', require: true }) projectId
    ) {
        const relatedPages = []
        // 项目下所有页面
        const pages = await PageModel.getProjectPages(projectId)

        pages.forEach(page => {
            try {
                const components = JSON.parse(page.content || '[]')

                // 递归遍历组件树
                const traverse = (list) => {
                    for (const comp of list) {
                        if (comp.type == 'widget-flow-workbench-container') {
                            const { id, pageName: name, pageCode } = page
                            relatedPages.push({ id, name, pageCode })
                            break
                        }

                        // 递归处理子组件
                        if (comp.renderSlots?.default?.length) {
                            traverse(comp.renderSlots.default)
                        }
                    }
                }

                traverse(components)
            } catch (e) {
                console.error('Invalid component JSON:', e)
            }
        })

        return relatedPages
    }

    // 查询流程关联的页面信息
    @OutputJson()
    @ProjectAuthorization({})
    @Post('/tpl/:tplId/queryRelatedPages')
    async queryFlowRelatedPages (
        @HeaderParams({ name: 'x-project-id', require: true }) projectId,
        @PathParams({ name: 'tplId', require: true }) tplId,
        @BodyParams({ name: 'versionId', required: true }) versionId,
        @BodyParams({ name: 'containers', require: true, default: [] }) containers, // 数组类型，可选值：flowManageContainer(流程管理容器)、formContainer(表单容器)、dataManageContainer(数据管理容器)
        @BodyParams({ name: 'nodeId' }) nodeId // containers包含formContainer、dataManageContainer时必需
    ) {
        const flowDetail = await LCDataService.findOne(TABLE_FILE_NAME.FLOW_TPL, { id: tplId })
        if (!flowDetail) {
            throw new global.BusinessError(global.i18n.t('流程模板不存在'), -1)
        }
        // 检查nodeId是否存在于当前流程
        const nodes = JSON.parse(flowDetail.nodes || '[]')
        if (nodeId && nodes.findIndex(n => n.id === nodeId) === -1) {
            throw new global.BusinessError(global.i18n.t('流程节点不存在'), -1)
        }

        // 项目下所有页面
        const pages = await PageModel.getProjectPages(projectId, versionId)

        const relatedPages = containers.reduce((acc, type) => {
            acc[type] = []
            return acc
        }, {})
    
        // 转换为组件类型集合
        const targetComponentTypes = new Set(containers.map(c => CONTAINER_TYPE_MAP[c]))
    
        pages.forEach(page => {
            try {
                const components = JSON.parse(page.content || '[]')
                const remainingTypes = new Set(targetComponentTypes)

                // 递归遍历组件树
                const traverse = (list) => {
                    for (const comp of list) {
                        if (remainingTypes.size === 0) return

                        // 类型匹配检查
                        if (remainingTypes.has(comp.type)) {
                            const containerType = containers.find(c => CONTAINER_TYPE_MAP[c] === comp.type)

                            if (CHECK_CONDITIONS[comp.type]?.(comp, tplId, nodeId)) {
                                const { id, pageName: name, pageCode } = page
                                relatedPages[containerType].push({ id, name, pageCode })
                                remainingTypes.delete(comp.type)
                            }
                        }

                        // 递归处理子组件
                        if (comp.renderSlots?.default?.length) {
                            traverse(comp.renderSlots.default)
                        }
                    }
                }

                traverse(components)
            } catch (e) {
                console.error('Invalid component JSON:', e)
            }
        })

        return relatedPages
    }

    // 更新流程关联页面的配置
    @OutputJson()
    @ProjectAuthorization({})
    @Post('/updateRelatedPages')
    async updateRelatedPages (
        @HeaderParams({ name: 'x-project-id', require: true }) projectId,
        @BodyParams({ name: 'tplId' }) tplId,
        @BodyParams({ name: 'added' }) added, // 页面新增加的容器，{ [key: number]: Array<containerConfig> }
        @BodyParams({ name: 'removed' }) removed // 页面删除的容器, { [key: flowManageContainer|flowWorkbenchContainer|dataManageContainer|formContainer]: Array<{ pageId: number; nodeId?: string; }> }
    ) {
        for (const [pageId, configs] of Object.entries(added)) {
            const page = await LCDataService.findOne(TABLE_FILE_NAME.PAGE, { id: pageId })
            if (page) {
                const components = JSON.parse(page.content || '[]')
                components.push(...configs)
                await LCDataService.update(TABLE_FILE_NAME.PAGE, { id: pageId, content: JSON.stringify(components) })
            }
        }

        for (const [containerType, configs] of Object.entries(removed)) {
            for (const config of configs) {
                const { pageId, nodeId } = config
                const page = await LCDataService.findOne(TABLE_FILE_NAME.PAGE, { id: pageId })
                if (page) {
                    const content = JSON.parse(page.content || '[]')
                    const removeContainer = (components) => {
                        return components.filter(comp => {
                            if (comp.type === CONTAINER_TYPE_MAP[containerType] && CHECK_CONDITIONS[comp.type]?.(comp, tplId, nodeId)) {
                                return false
                            }
                            if (comp.renderSlots?.default?.length) {
                                comp.renderSlots.default = removeContainer(comp.renderSlots.default)
                            }

                            return true
                        })
                    }
                    const newComponents = removeContainer(content)
                    await LCDataService.update(TABLE_FILE_NAME.PAGE, { id: pageId, content: JSON.stringify(newComponents) })
                }
            }
        }

        return {}
    }

    // 更新流程关联页面的内容
    @OutputJson()
    @ProjectAuthorization({})
    @Post('/tpl/related/updateRelatedPageContent')
    async updateRelatedPageContent (
        @BodyParams({ name: 'pageId', require: true }) pageId,
        @BodyParams({ name: 'content', require: true }) content
    ) {
        const page = await LCDataService.findOne(TABLE_FILE_NAME.PAGE, { id: pageId })
        if (page) {
            return await LCDataService.update(TABLE_FILE_NAME.PAGE, { id: pageId, content: content })
        }

        throw new global.BusinessError(global.i18n.t('更新页面内容失败'), -1)
    }

    // 创建并执行流程任务
    @OutputJson()
    @ProjectAuthorization({})
    @Post('/tpl/:tplId/createAndExecuteTask')
    async createAndExecuteTask (
        @SessionParams({ name: 'userInfo' }) userInfo,
        @CookieParams({ name: global.AUTH_NAME }) bkToken,
        @HeaderParams({ name: 'x-project-id', require: true }) projectId,
        @PathParams({ name: 'tplId', require: true }) tplId
    ) {
        const flowDetail = await LCDataService.findOne(TABLE_FILE_NAME.FLOW_TPL, { id: tplId })
        if (!flowDetail) {
            throw new global.BusinessError(global.i18n.t('流程模板不存在'), -1)
        }

        if (flowDetail.deployed === 0) {
            throw new global.BusinessError(global.i18n.t('该流程编辑后未部署，不能进行执行操作'), -1)
        }

        const nodes = JSON.parse(flowDetail.nodes || '[]')
        const edges = JSON.parse(flowDetail.edges || '[]')
        const pipelineTree = transFlowTplToBkFlowPipelineTree(projectId, nodes, edges)
        const taskName = `${flowDetail.name}_${dayjs().format('YYYYMMDDHHmmss')}`
        const notifyConfig = JSON.parse(flowDetail.notifyConfig)

        const { bkFlowSpaceId } = await LCDataService.findOne(TABLE_FILE_NAME.PROJECT_BKFLOW_SPACE, { projectId: 0 })

        const bkFlowTaskDetail = await execApiGateWay({
            apiName: bkflowApiGatewayName,
            path: `/space/${bkFlowSpaceId}/create_task_without_template`,
            method: 'post',
            authorization: {
                ...authorization,
                [global.AUTH_NAME]: bkToken
            },
            apiUrlTemp: httpConf.apiGateWayUrlTmpl,
            stageName,
            data: {
                creator: userInfo.username,
                pipeline_tree: pipelineTree,
                name: taskName,
                notify_config: {
                    notify_type: notifyConfig.notifyType,
                    notify_receivers: {
                        more_receiver: notifyConfig.receivers,
                        receiver_group: []
                    }
                },
                scope_type: 'project_tpl',
                scope_value: `${projectId}_${tplId}`
            }
        })
        if (bkFlowTaskDetail.result) {
            const taskData = await LCDataService.add(TABLE_FILE_NAME.FLOW_TASK, {
                projectId,
                tplId,
                bkFlowTaskId: bkFlowTaskDetail.data.id,
                name: taskName,
                nodes: flowDetail.nodes,
                edges: flowDetail.edges
            })
            await execApiGateWay({
                apiName: bkflowApiGatewayName,
                path: `/space/${bkFlowSpaceId}/task/${bkFlowTaskDetail.data.id}/operate_task/start/`,
                method: 'post',
                authorization: {
                    ...authorization,
                    [global.AUTH_NAME]: bkToken
                },
                apiUrlTemp: httpConf.apiGateWayUrlTmpl,
                stageName,
                data: {
                    operator: userInfo.username
                }
            })
            return { ...taskData, tplName: flowDetail.name }
        } else {
            throw new global.BusinessError(`${global.i18n.t('任务创建失败')}: ${bkFlowTaskDetail.message}`, -1)
        }
    }

    // 获取项目下所有流程的任务列表
    @OutputJson()
    @ProjectAuthorization({})
    @Get('/task/list')
    async getProjectTaskList (
        @CookieParams({ name: global.AUTH_NAME }) bkToken,
        @HeaderParams({ name: 'x-project-id', require: true }) projectId,
        @QueryParams({ name: 'id' }) id, // 任务id
        @QueryParams({ name: 'tplName', default: '' }) tplName,
        @QueryParams({ name: 'createAtStart' }) createAtStart,
        @QueryParams({ name: 'createAtEnd' }) createAtEnd,
        @QueryParams({ name: 'createUser' }) createUser,
        @QueryParams({ name: 'page', default: 1 }) page,
        @QueryParams({ name: 'pageSize', default: 10 }) pageSize
    ) {
        const [list, count] = await getTaskList({
            projectId,
            id,
            tplName,
            createAtStart,
            createAtEnd,
            createUser,
            page,
            pageSize
        })

        const taskIds = list.map(item => item.bkFlowTaskId)

        const { bkFlowSpaceId } = await LCDataService.findOne(TABLE_FILE_NAME.PROJECT_BKFLOW_SPACE, { projectId: 0 })

        // 调用BkFlow接口查询任务的执行状态
        const tasksStatusRes = await execApiGateWay({
            apiName: bkflowApiGatewayName,
            path: `/space/${bkFlowSpaceId}/get_tasks_states/`,
            method: 'post',
            authorization: {
                ...authorization,
                [global.AUTH_NAME]: bkToken
            },
            apiUrlTemp: httpConf.apiGateWayUrlTmpl,
            stageName,
            data: {
                task_ids: taskIds
            }
        })

        list.forEach(task => {
            task.status = tasksStatusRes.data[task.bkFlowTaskId]?.state || ''
        })

        return { list, count }
    }

    // 获取流程任务列表
    @OutputJson()
    @ProjectAuthorization({})
    @Get('/tpl/:tplId/task/list')
    async getFlowListByTpl (
        @CookieParams({ name: global.AUTH_NAME }) bkToken,
        @HeaderParams({ name: 'x-project-id', require: true }) projectId,
        @PathParams({ name: 'tplId', require: true }) tplId,
        @QueryParams({ name: 'page', default: 1 }) page,
        @QueryParams({ name: 'pageSize', default: 10 }) pageSize,
        @QueryParams({ name: 'id' }) id,
        @QueryParams({ name: 'createAtStart' }) createAtStart,
        @QueryParams({ name: 'createAtEnd' }) createAtEnd,
        @QueryParams({ name: 'createUser' }) createUser
    ) {
        const query = { tplId, projectId }

        if (id) {
            query.id = id
        }

        if (createUser) {
            query.createUser = createUser
        }

        if (createAtStart && createAtEnd) {
            query.createTime = Between(createAtStart, createAtEnd)
        }

        const { list, count } = await LCDataService.get({
            tableFileName: TABLE_FILE_NAME.FLOW_TASK,
            page,
            pageSize,
            deleteFlag: 0,
            query
        })

        const taskIds = list.map(item => item.bkFlowTaskId)

        const { bkFlowSpaceId } = await LCDataService.findOne(TABLE_FILE_NAME.PROJECT_BKFLOW_SPACE, { projectId: 0 })

        // 调用BkFlow接口查询任务的执行状态
        const tasksStatusRes = await execApiGateWay({
            apiName: bkflowApiGatewayName,
            path: `/space/${bkFlowSpaceId}/get_tasks_states/`,
            method: 'post',
            authorization: {
                ...authorization,
                [global.AUTH_NAME]: bkToken
            },
            apiUrlTemp: httpConf.apiGateWayUrlTmpl,
            stageName,
            data: {
                task_ids: taskIds
            }
        })

        list.forEach(task => {
            task.status = tasksStatusRes.data[task.bkFlowTaskId]?.state || ''
        })

        return { list, count }
    }

    // 部署流程模板
    @OutputJson()
    @ProjectAuthorization({})
    @Post('/tpl/:tplId/updateDeployStatus/')
    async updateDeployStatus (
        @HeaderParams({ name: 'x-project-id', require: true }) projectId,
        @CookieParams({ name: global.AUTH_NAME }) bkToken,
        @PathParams({ name: 'tplId', require: true }) tplId,
        @BodyParams({ name: 'deployed', require: true }) deployed

    ) {
        const flowDetail = await LCDataService.findOne(TABLE_FILE_NAME.FLOW_TPL, { id: tplId })
        if (!flowDetail) {
            throw new global.BusinessError(global.i18n.t('流程模板不存在'), -1)
        }
 
        if (deployed) {
            const nodes = JSON.parse(flowDetail.nodes || '[]')
            const edges = JSON.parse(flowDetail.edges || '[]')

            const taskNodes = nodes.filter(item => !['Start', 'End'].includes(item.type))

            if (taskNodes.some(item => item.isDraft)) {
                console.log('taskNodes=============>', taskNodes)
                throw new global.BusinessError(global.i18n.t('部署失败，请检查接节点、连线配置是否完整'), -1)
            }
            console.log('准备请求 =====')

            const pipelineTree = transFlowTplToBkFlowPipelineTree(projectId, nodes, edges)
            const { bkFlowSpaceId } = await LCDataService.findOne(TABLE_FILE_NAME.PROJECT_BKFLOW_SPACE, { projectId: 0 })
            try {
                const res = await execApiGateWay({
                    apiName: bkflowApiGatewayName,
                    path: `/space/${bkFlowSpaceId}/validate_pipeline_tree`,
                    method: 'post',
                    authorization: {
                        ...authorization,
                        [global.AUTH_NAME]: bkToken
                    },
                    apiUrlTemp: httpConf.apiGateWayUrlTmpl,
                    stageName,
                    data: {
                        pipeline_tree: pipelineTree
                    }
                })
    
                console.log('validate_pipeline_tree==============>', res)
    
                if (res.result) {
                    await LCDataService.update(TABLE_FILE_NAME.FLOW_TPL, { id: tplId, deployed: 1 })
                    return { ...flowDetail, deployed: 1 }
                } else {
                    throw new global.BusinessError(res.message, -1)
                }
            } catch (e) {
                throw new global.BusinessError(e, -1)
            }
        }
        await LCDataService.update(TABLE_FILE_NAME.FLOW_TPL, { id: tplId, deployed: 0 })
        return { ...flowDetail, deployed: 0 }
    }

     // 流程任务详情
     @OutputJson()
     @ProjectAuthorization({})
     @Get('/task/:taskId/detail')
    async getTaskDetail (
         @CookieParams({ name: global.AUTH_NAME }) bkToken,
         @HeaderParams({ name: 'x-project-id', require: true }) projectId,
         @PathParams({ name: 'taskId', require: true }) taskId
    ) {
        const runningNodeIds = []
        const taskItem = await LCDataService.findOne(TABLE_FILE_NAME.FLOW_TASK, { id: taskId })
        const { bkFlowSpaceId } = await LCDataService.findOne(TABLE_FILE_NAME.PROJECT_BKFLOW_SPACE, { projectId: 0 })

        // 任务执行详情数据
        const taskExecDetail = await execApiGateWay({
            apiName: bkflowApiGatewayName,
            path: `/space/${bkFlowSpaceId}/task/${taskItem.bkFlowTaskId}/get_task_states/`,
            method: 'get',
            authorization: {
                ...authorization,
                [global.AUTH_NAME]: bkToken
            },
            apiUrlTemp: httpConf.apiGateWayUrlTmpl,
            stageName
        })

        if (taskExecDetail.data.state === 'RUNNING') {
            const extractIdsOfNodeInExecution = (data) => {
                const ids = []

                function traverse (taskNodes) {
                    Object.keys(taskNodes).forEach(id => {
                        const node = taskNodes[id]
                        if (node.state === 'RUNNING') {
                            ids.push(node.id)
                        }

                        if (node.children) {
                            traverse(node.children)
                        }
                    })
                }
                traverse(data.children)

                return ids
            }

            const runningStateNodes = extractIdsOfNodeInExecution(taskExecDetail.data)

            if (runningStateNodes.length > 0) {
                // 任务模板详情数据，比较节点id
                const taskTplDetail = await execApiGateWay({
                    apiName: bkflowApiGatewayName,
                    path: `/space/${bkFlowSpaceId}/task/${taskItem.bkFlowTaskId}/get_task_detail/`,
                    method: 'get',
                    authorization: {
                        ...authorization,
                        [global.AUTH_NAME]: bkToken
                    },
                    apiUrlTemp: httpConf.apiGateWayUrlTmpl,
                    stageName
                })

                runningStateNodes.forEach(id => {
                    const node = taskTplDetail.data.pipeline_tree.activities[id]
                    if (node && node.template_node_id && node.component?.code === 'pause_node') {
                        runningNodeIds.push(node.template_node_id)
                    }
                })
            }
        }

        taskItem.status = taskExecDetail.data.state
        taskItem.runningNodeIds = runningNodeIds

        return taskItem
    }

    // 流程任务执行状态
    @OutputJson()
    @ProjectAuthorization({})
    @Get('/task/:taskId/states')
     async getTaskStates (
        @CookieParams({ name: global.AUTH_NAME }) bkToken,
        @HeaderParams({ name: 'x-project-id', require: true }) projectId,
        @PathParams({ name: 'taskId', require: true }) taskId
     ) {
         const taskItem = await LCDataService.findOne(TABLE_FILE_NAME.FLOW_TASK, { id: taskId })
         const { bkFlowSpaceId } = await LCDataService.findOne(TABLE_FILE_NAME.PROJECT_BKFLOW_SPACE, { projectId: 0 })

         // 任务执行详情数据
         const taskExecDetail = await execApiGateWay({
             apiName: bkflowApiGatewayName,
             path: `/space/${bkFlowSpaceId}/task/${taskItem.bkFlowTaskId}/get_task_states/`,
             method: 'get',
             authorization: {
                 ...authorization,
                 [global.AUTH_NAME]: bkToken
             },
             apiUrlTemp: httpConf.apiGateWayUrlTmpl,
             stageName
         })

         // 任务模板详情数据
         const taskTplDetail = await execApiGateWay({
             apiName: bkflowApiGatewayName,
             path: `/space/${bkFlowSpaceId}/task/${taskItem.bkFlowTaskId}/get_task_detail/`,
             method: 'get',
             authorization: {
                 ...authorization,
                 [global.AUTH_NAME]: bkToken
             },
             apiUrlTemp: httpConf.apiGateWayUrlTmpl,
             stageName
         })

         const getBkflowNodeStates = (data) => {
             const idMap = {}

             function traverse (taskNodes) {
                 Object.keys(taskNodes).forEach(id => {
                     const node = taskTplDetail.data.pipeline_tree.activities[id]

                     if (node) {
                         idMap[node.template_node_id] = {
                             bkFlowNodeId: id,
                             state: taskNodes[id].state
                         }
                     }

                     if (taskNodes[id].children) {
                         traverse(taskNodes[id].children)
                     }
                 })
             }
             traverse(data.children)

             return idMap
         }

         const bkflowNodeStates = getBkflowNodeStates(taskExecDetail.data)

         const nodes = JSON.parse(taskItem.nodes || '[]')

         nodes.forEach(node => {
             if (node.type === 'Start') {
                 node.status = 'FINISHED'
             } else if (node.type === 'End') {
                 node.status = taskExecDetail.data.state === 'FINISHED' ? 'FINISHED' : ''
             } else {
                 if (node.id in bkflowNodeStates) {
                     node.status = bkflowNodeStates[node.id].state
                 }
             }
         })

         taskItem.nodes = JSON.stringify(nodes)
         taskItem.status = taskExecDetail.data.state

         return taskItem
     }

    // 提交人工节点数据
    @OutputJson()
    @ProjectAuthorization({})
    @Post('/task/:taskId/manual_node/:nodeId/submit/')
    async submitManualNodeData (
        @SessionParams({ name: 'userInfo' }) userInfo,
        @CookieParams({ name: global.AUTH_NAME }) bkToken,
        @PathParams({ name: 'taskId', require: true }) taskId,
        @PathParams({ name: 'nodeId', require: true }) nodeId,
        @BodyParams() bodyData
    ) {
        const nodeCallbackData = {}
        let bkFlowNodeId = ''

        Object.keys(bodyData).forEach(key => {
            nodeCallbackData[key] = bodyData[key]
        })

        const taskItem = await LCDataService.findOne(TABLE_FILE_NAME.FLOW_TASK, { id: taskId })
        const { bkFlowSpaceId } = await LCDataService.findOne(TABLE_FILE_NAME.PROJECT_BKFLOW_SPACE, { projectId: 0 })

        const taskTplDetail = await execApiGateWay({
            apiName: bkflowApiGatewayName,
            path: `/space/${bkFlowSpaceId}/task/${taskItem.bkFlowTaskId}/get_task_detail/`,
            method: 'get',
            authorization: {
                ...authorization,
                [global.AUTH_NAME]: bkToken
            },
            apiUrlTemp: httpConf.apiGateWayUrlTmpl,
            stageName
        })

        Object.values(taskTplDetail.data.pipeline_tree.activities).some(node => {
            if (node.template_node_id === nodeId) {
                bkFlowNodeId = node.id
                return true
            }
            return false
        })

        if (bkFlowNodeId) {
            const res = await execApiGateWay({
                apiName: bkflowApiGatewayName,
                path: `/space/${bkFlowSpaceId}/task/${taskItem.bkFlowTaskId}/node/${bkFlowNodeId}/operate_node/callback/`,
                method: 'post',
                authorization: {
                    ...authorization,
                    [global.AUTH_NAME]: bkToken
                },
                apiUrlTemp: httpConf.apiGateWayUrlTmpl,
                stageName,
                data: {
                    operator: userInfo.username,
                    data: nodeCallbackData
                }
            })
            if (res.result) {
                return res.data
            } else {
                throw new global.BusinessError(res.message, -1)
            }
        } else {
            throw new global.BusinessError(global.i18n.t('提交失败，流程结构数据异常'), -1)
        }
    }
}
