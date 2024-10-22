/**
 * Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
 * Copyright (C) 2017-2018 THL A29 Limited, a Tencent company. All rights reserved.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */
import dayjs from 'dayjs'
import dataService, { Between }  from '../service/data-service'
import {
    Controller,
    Post,
    Get,
    BodyParams,
    QueryParams,
    PathParams,
    CookieParams,
    SessionParams,
    OutputJson
} from '../decorator'

import {
    execApiGateWay
} from '@bkui/apigateway-nodejs-sdk'
import token from '../conf/token'
import apiGateWayConfig from '../conf/apigw'
import { flowTplListMap } from 'shared/shared/flow-tpl/index'
import { transFlowTplToBkFlowPipelineTree } from '../util/flow/index'

const spaceId = '${spaceId}'

// bkflow的预发布环境名称为stage
const bkflowGwStage = apiGateWayConfig.stageName === 'stag' ? 'stage' : apiGateWayConfig.stageName
 
@Controller('/api/flow')
export default class FlowController {
    // 创建并执行流程任务
    @OutputJson()
    @Post('/tpl/:tplId/createAndExecuteTask')
    async createAndExecuteTask (
        @SessionParams({ name: 'userInfo' }) userInfo,
        @CookieParams({ name: global.AUTH_NAME }) bkToken,
        @PathParams({ name: 'tplId', require: true }) tplId
    ) {
        const flowDetail = flowTplListMap[tplId]
        const { nodes, edges, notifyConfig } = flowDetail
        const pipelineTree = transFlowTplToBkFlowPipelineTree(nodes, edges)
        const taskName = `${flowDetail.name}_${dayjs().format('YYYYMMDDHHmmss')}`

        const bkFlowTaskDetail = await execApiGateWay({
            apiName: 'bkflow-eng-svc',
            path: `/space/${spaceId}/create_task_without_template`, // @todo BkFlow需要传空间id
            method: 'post',
            authorization: {
                ...token,
                [global.AUTH_NAME]: bkToken
            },
            stageName: bkflowGwStage,
            data: {
                creator: userInfo.username,
                pipeline_tree: pipelineTree,
                name: taskName,
                notify_config: {
                    notify_type: notifyConfig.notifyType,
                    notify_receivers: {
                        more_receiver:notifyConfig.receivers,
                        receiver_group: []
                    }
                },
                scope_type: 'app_env',
                scope_value: `${apiGateWayConfig.stageName}_${tplId}`
            }
        })
        if (bkFlowTaskDetail.result) {
            const taskData = await dataService.add(
                'flow-task',
                {
                    tplId,
                    bkFlowTaskId: bkFlowTaskDetail.data.id,
                    name: taskName,
                    nodes: flowDetail.nodes,
                    edges: flowDetail.edges
                }
            )
            await execApiGateWay({
                apiName: 'bkflow-eng-svc',
                path: `/space/${spaceId}/task/${bkFlowTaskDetail.data.id}/operate_task/start/`,
                method: 'post',
                authorization: {
                    ...token,
                    [global.AUTH_NAME]: bkToken
                },
                stageName: bkflowGwStage,
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
    @Get('/tpl/:tplId/task/list')
    async getFlowListByTpl (
        @CookieParams({ name: global.AUTH_NAME }) bkToken,
        @PathParams({ name: 'tplId', require: true }) tplId,
        @QueryParams({ name: 'page', default: 1 }) page,
        @QueryParams({ name: 'pageSize', default: 10 }) pageSize,
        @QueryParams({ name: 'id' }) id,
        @QueryParams({ name: 'createAtStart' }) createAtStart,
        @QueryParams({ name: 'createAtEnd' }) createAtEnd,
        @QueryParams({ name: 'createUser' }) createUser,
    ) {
        const query = { tplId, deleteFlag: 0 }

        if (id) {
            query.id = id
        }

        if (createUser) {
            query.createUser = createUser
        }

        if (createAtStart && createAtEnd) {
            query.createTime = Between(createAtStart, createAtEnd)
        }

        const { list, count } = await dataService.get({
            tableFileName: 'flow-task',
            page,
            pageSize,
            query
        })

        const taskIds = list.map(item => item.bkFlowTaskId)

        // 调用BkFlow接口查询任务的执行状态
        const tasksStatusRes = await execApiGateWay({
            apiName: 'bkflow-eng-svc',
            path: `/space/${spaceId}/get_tasks_states/`,
            method: 'post',
            authorization: {
                ...token,
                [global.AUTH_NAME]: bkToken
            },
            stageName: bkflowGwStage,
            data: {
                task_ids: taskIds
            }
        })

        list.forEach(task => {
            task.status = tasksStatusRes.data[task.bkFlowTaskId]?.state || ''
        })

        return { list, count }
    }

    // 流程任务详情
    @OutputJson()
    @Get('/task/:taskId/detail')
    async getTaskDetail (
        @CookieParams({ name: global.AUTH_NAME }) bkToken,
        @PathParams({ name: 'taskId', require: true }) taskId,
    ) {
        const runningNodeIds = []
        const taskItem = await dataService.findOne('flow-task', { id: taskId })

        // 任务执行详情数据
        const taskExecDetail = await execApiGateWay({
            apiName: 'bkflow-eng-svc',
            path: `/space/${spaceId}/task/${taskItem.bkFlowTaskId}/get_task_states/`,
            method: 'get',
            authorization: {
                ...token,
                [global.AUTH_NAME]: bkToken
            },
            stageName: bkflowGwStage
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
                    path: `/space/${spaceId}/task/${taskItem.bkFlowTaskId}/get_task_detail/`,
                    method: 'get',
                    authorization: {
                        ...token,
                        [global.AUTH_NAME]: bkToken
                    },
                    stageName: bkflowGwStage
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
    @Get('/task/:taskId/states')
    async getTaskStates (
        @CookieParams({ name: global.AUTH_NAME }) bkToken,
        @PathParams({ name: 'taskId', require: true }) taskId,
    ) {
        const taskItem = await dataService.findOne('flow-task', { id: taskId })

        // 任务执行详情数据
        const taskExecDetail = await execApiGateWay({
            apiName: 'bkflow-eng-svc',
            path: `/space/${spaceId}/task/${taskItem.bkFlowTaskId}/get_task_states/`,
            method: 'get',
            authorization: {
                ...token,
                [global.AUTH_NAME]: bkToken
            },
            stageName: bkflowGwStage
        })

        // 任务模板详情数据
        const taskTplDetail = await execApiGateWay({
            apiName: 'bkflow-eng-svc',
            path: `/space/${spaceId}/task/${taskItem.bkFlowTaskId}/get_task_detail/`,
            method: 'get',
            authorization: {
                ...token,
                [global.AUTH_NAME]: bkToken
            },
            stageName: bkflowGwStage
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

        const taskItem = await dataService.findOne('flow-task', { id: taskId })

        const taskTplDetail = await execApiGateWay({
            apiName: 'bkflow-eng-svc',
            path: `/space/${spaceId}/task/${taskItem.bkFlowTaskId}/get_task_detail/`,
            method: 'get',
            authorization: {
                ...token,
                [global.AUTH_NAME]: bkToken
            },
            stageName: bkflowGwStage
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
                path: `/space/${spaceId}/task/${taskItem.bkFlowTaskId}/node/${bkFlowNodeId}/operate_node/callback/`,
                method: 'post',
                authorization: {
                    ...token,
                    [global.AUTH_NAME]: bkToken
                },
                stageName: bkflowGwStage,
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
