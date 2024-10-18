/**
 * Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
 * Copyright (C) 2017-2024 THL A29 Limited, a Tencent company. All rights reserved.
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
import { LCDataService, TABLE_FILE_NAME } from '../service/common/data-service'
import httpConf from '../conf/http'
import flowConf from '../conf/flow'
import { transFlowTplToBkFlowPipelineTree } from '../utils/flow'

const authorization = {
    bk_app_code: flowConf.APP_CODE,
    bk_app_secret: flowConf.APP_SECRET
}

@Controller('/api/flow')
export default class NoCodeController {
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

        const index= nodes.findIndex(v => v.id === nodeId)
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

        const bkFlowTaskDetail = await execApiGateWay({
            apiName: 'bkflow-eng-svc',
            path: '/space/141/create_task_without_template', // @todo BkFlow需要传空间id
            method: 'post',
            authorization: {
                ...authorization,
                [global.AUTH_NAME]: bkToken
            },
            apiUrlTemp: httpConf.apiGateWayUrlTmpl,
            stageName: flowConf.STAGE_NAME,
            data: {
                creator: userInfo.username,
                pipeline_tree: pipelineTree,
                name: taskName,
                notify_type: notifyConfig.notifyType,
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
                apiName: 'bkflow-eng-svc',
                path: `/space/141/task/${bkFlowTaskDetail.data.id}/operate_task/start/`,
                method: 'post',
                authorization: {
                    ...authorization,
                    [global.AUTH_NAME]: bkToken
                },
                apiUrlTemp: httpConf.apiGateWayUrlTmpl,
                stageName: flowConf.STAGE_NAME,
                data: {
                    operator: userInfo.username,
                }
            })
            return { ...taskData, tplName: flowDetail.name }
        } else {
            throw new global.BusinessError(`${global.i18n.t('任务创建失败')}: ${bkFlowTaskDetail.message}`, -1)
        }
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
        @QueryParams({ name: 'createUser' }) createUser,
    ) {
        const query = { tplId }

        if (id) {
            query.id = id
        }

        if (createUser) {
            query.createUser = createUser
        }

        if (createAtStart && createAtEnd) {
            query.createTime = Between(createAtStart, createAtEnd)
        }

        // 调用BkFlow接口查询任务列表
        // @todo 目前是拉取全量列表，需要bkflow支持按状态查询任务列表
        // const bkFlowTaskList = await execApiGateWay({
        //     apiName: 'bkflow-eng-svc',
        //     path: '/space/141/get_task_list/',
        //     method: 'get',
        //     authorization: {
        //         ...authorization,
        //         [global.AUTH_NAME]: bkToken
        //     },
        //     apiUrlTemp: httpConf.apiGateWayUrlTmpl,
        //     stageName: flowConf.STAGE_NAME,
        //     data: {
        //         scope_type: 'project_tpl',
        //         scope_value: `${projectId}_${tplId}`
        //     }
        // })

        const { list, count } = await LCDataService.get({
            tableFileName: TABLE_FILE_NAME.FLOW_TASK,
            page,
            pageSize,
            deleteFlag: 0,
            query
        })

        const taskIds = list.map(item => item.bkFlowTaskId)

        // 调用BkFlow接口查询任务的执行状态
        const tasksStatusRes = await execApiGateWay({
            apiName: 'bkflow-eng-svc',
            path: '/space/141/get_tasks_states/',
            method: 'post',
            authorization: {
                ...authorization,
                [global.AUTH_NAME]: bkToken
            },
            apiUrlTemp: httpConf.apiGateWayUrlTmpl,
            stageName: flowConf.STAGE_NAME,
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
                throw new global.BusinessError(global.i18n.t('部署失败，请检查接节点、连线配置是否完整'), -1)
            }
            console.log('准备请求 =====')

            const pipelineTree = transFlowTplToBkFlowPipelineTree(projectId, nodes, edges)
            const res = await execApiGateWay({
                apiName: 'bkflow-eng-svc',
                path: '/space/141/validate_pipeline_tree',
                method: 'post',
                authorization: {
                    ...authorization,
                    [global.AUTH_NAME]: bkToken
                },
                apiUrlTemp: httpConf.apiGateWayUrlTmpl,
                stageName: flowConf.STAGE_NAME,
                data: {
                    pipeline_tree: pipelineTree
                }
            })

            console.log('validate_pipeline_tree==============>', res)

            if (res.result) {
                await LCDataService.update(TABLE_FILE_NAME.FLOW_TPL, { id: tplId, deployed: 1 })
                return { ...flowDetail, deployed: 1 }
            } else {
                throw new global.BusinessError(global.i18n.t('部署失败，请检查接节点、连线配置是否完整'), -1)
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
         @PathParams({ name: 'taskId', require: true }) taskId,
     ) {
        const runningNodeIds = []
        const taskItem = await LCDataService.findOne(TABLE_FILE_NAME.FLOW_TASK, { id: taskId })

        // 任务执行详情数据
        const taskExecDetail = await execApiGateWay({
            apiName: 'bkflow-eng-svc',
            path: `/space/141/task/${taskItem.bkFlowTaskId}/get_task_states/`,
            method: 'get',
            authorization: {
                ...authorization,
                [global.AUTH_NAME]: bkToken
            },
            apiUrlTemp: httpConf.apiGateWayUrlTmpl,
            stageName: flowConf.STAGE_NAME
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
                    apiName: 'bkflow-eng-svc',
                    path: `/space/141/task/${taskItem.bkFlowTaskId}/get_task_detail/`,
                    method: 'get',
                    authorization: {
                        ...authorization,
                        [global.AUTH_NAME]: bkToken
                    },
                    apiUrlTemp: httpConf.apiGateWayUrlTmpl,
                    stageName: flowConf.STAGE_NAME
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
        @PathParams({ name: 'taskId', require: true }) taskId,
    ) {
        const taskItem = await LCDataService.findOne(TABLE_FILE_NAME.FLOW_TASK, { id: taskId })

        // 任务执行详情数据
        const taskExecDetail = await execApiGateWay({
            apiName: 'bkflow-eng-svc',
            path: `/space/141/task/${taskItem.bkFlowTaskId}/get_task_states/`,
            method: 'get',
            authorization: {
                ...authorization,
                [global.AUTH_NAME]: bkToken
            },
            apiUrlTemp: httpConf.apiGateWayUrlTmpl,
            stageName: flowConf.STAGE_NAME
        })

        // 任务模板详情数据
        const taskTplDetail = await execApiGateWay({
            apiName: 'bkflow-eng-svc',
            path: `/space/141/task/${taskItem.bkFlowTaskId}/get_task_detail/`,
            method: 'get',
            authorization: {
                ...authorization,
                [global.AUTH_NAME]: bkToken
            },
            apiUrlTemp: httpConf.apiGateWayUrlTmpl,
            stageName: flowConf.STAGE_NAME
        })

        const getBkflowNodeStates = (data) => {
            const idMap = {}

            function traverse (taskNodes) {
                Object.keys(taskNodes).forEach(id => {
                    const node = taskTplDetail.data.pipeline_tree.activities[id]

                    if (node) {
                        idMap[node.template_node_id] = {
                            bkFlowNodeId: id,
                            state: taskNodes[id].state,
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
        @BodyParams() bodyData,
    ) {
        const nodeCallbackData = {}
        let bkFlowNodeId = ''

        Object.keys(bodyData).forEach(key => {
            nodeCallbackData[key] = bodyData[key]
        })

        const taskItem = await LCDataService.findOne(TABLE_FILE_NAME.FLOW_TASK, { id: taskId })

        const taskTplDetail = await execApiGateWay({
            apiName: 'bkflow-eng-svc',
            path: `/space/141/task/${taskItem.bkFlowTaskId}/get_task_detail/`,
            method: 'get',
            authorization: {
                ...authorization,
                [global.AUTH_NAME]: bkToken
            },
            apiUrlTemp: httpConf.apiGateWayUrlTmpl,
            stageName: flowConf.STAGE_NAME
        })

        Object.values(taskTplDetail.data.pipeline_tree.activities).some(node => {
            if (node.template_node_id === nodeId) {
                bkFlowNodeId = node.id
                return true
            }
            return false
        })

        if (bkFlowNodeId) {
            const res =  await execApiGateWay({
                apiName: 'bkflow-eng-svc',
                path: `/space/141/task/${taskItem.bkFlowTaskId}/node/${bkFlowNodeId}/operate_node/callback/`,
                method: 'post',
                authorization: {
                    ...authorization,
                    [global.AUTH_NAME]: bkToken
                },
                apiUrlTemp: httpConf.apiGateWayUrlTmpl,
                stageName: flowConf.STAGE_NAME,
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
