/**
 * Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company. All rights reserved.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */
import cloneDeep from 'lodash.clonedeep'
import { transApiToWebhook, parseResponseToVariables } from 'shared/no-code'

export default {
    namespaced: true,
    state: {
        isNodeDataChanged: false, // 节点数据有变更，用来判断返回是否需要提示保存
        nodeData: {},
        formConfig: { // 人工节点表单配置的数据
            id: '',
            formName: '',
            type: '',
            content: [],
            code: ''
        },
        createTicketPage: {}, // 提单节点上绑定的提单页配置
        initialFieldIds: [] // 已保存的表单项的id，itsm批量更新表单字段接口需要传被删除的表单项id
    },
    mutations: {
        setNodeData (state, data) {
            state.nodeData = cloneDeep(data)
        },
        setNodeName (state, name) {
            state.nodeData.name = name
            state.isNodeDataChanged = true
        },
        setInitialFieldIds (state, content) {
            const ids = []
            content.forEach(item => {
                if (typeof item.id === 'number') {
                    ids.push(item.id)
                }
            })
            state.initialFieldIds = ids
        },
        // 节点处理人配置
        updateProcessor (state, data) {
            const { type, processors } = data
            state.nodeData.processors_type = type
            state.nodeData.processors = processors
            state.isNodeDataChanged = true
        },
        // 设置人工节点表单配置
        setFormConfig (state, data) {
            state.formConfig = Object.assign({}, state.formConfig, data)
            if (typeof data.id === 'number') {
                state.nodeData.extras.formConfig.id = data.id
                state.nodeData.extras.formConfig.type = data.type
            }
            state.isNodeDataChanged = true
        },
        // 设置数据处理节点配置
        setDataProcessConfig (state, payload) {
            const { projectId, data } = payload
            state.nodeData.extras.dataManager = cloneDeep(data)
            state.nodeData.extras.webhook_info = {
                auth: {
                    auth_type: 'none',
                    auth_config: {}
                },
                body: {
                    type: 'raw',
                    raw_type: 'JSON',
                    content: JSON.stringify(data)
                },
                headers: [{ checked: true, key: 'x-project-id', value: String(projectId), select: true }],
                method: 'POST',
                query_params: [],
                success_exp: '',
                settings: { timeout: 10 },
                url: '{{appApigwPrefix}}/dataManage'
            }
            state.isNodeDataChanged = true
        },
        // 设置api节点配置
        setApiNodeConfig (state, payload) {
            const { projectId, data } = payload
            const apiInfo = cloneDeep(data)
            state.nodeData.extras.api_info = apiInfo
            state.nodeData.extras.webhook_info = transApiToWebhook(apiInfo, String(projectId))
            const outputs = parseResponseToVariables(apiInfo.response)
            state.nodeData.variables.outputs = outputs
            state.isNodeDataChanged = true
        },
        // 审批节点审批方式配置
        setApprovalConfig (state, data) {
            const { isMulti, isSequential } = data
            state.nodeData.is_multi = isMulti
            state.nodeData.is_sequential = isSequential
            if (isMulti && Object.keys(state.nodeData.finish_condition).length === 0) {
                state.nodeData.finish_condition = {
                    type: 'or',
                    expressions: []
                }
            }
            state.isNodeDataChanged = true
        },
        // 审批节点转单人配置
        updateDeliver (state, data) {
            const { type, processors } = data
            state.nodeData.delivers_type = type
            state.nodeData.delivers = processors
            state.isNodeDataChanged = true
        },
        // 设置审批节点提前终止条件
        setFinishCondition (state, data) {
            state.nodeData.finish_condition = cloneDeep(data)
            state.isNodeDataChanged = true
        },
        clearNodeConfigData (state) {
            state.nodeData = {}
            state.formConfig = {
                id: '',
                formName: '',
                type: '',
                content: [],
                code: ''
            }
            state.initialFieldIds = []
            state.createTicketPage = {}
            state.isNodeDataChanged = false
        },
        setNodeDataChangeStatus (state, val) {
            state.isNodeDataChanged = val
        },
        setCreateTicketPageData (state, val) {
            state.createTicketPage = val
        }
    },
    getters: {
        // 处理人配置
        processorData (state) {
            const { processors_type, processors } = state.nodeData
            return {
                type: processors_type,
                processors: cloneDeep(processors)
            }
        },
        // 转单人配置
        deliverData (state) {
            const { delivers_type, delivers } = state.nodeData
            return {
                type: delivers_type,
                processors: cloneDeep(delivers)
            }
        }
    }
}
