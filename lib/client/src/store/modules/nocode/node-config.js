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

export default {
    namespaced: true,
    state: {
        nodeData: {},
        formConfig: { // 人工节点表单配置的数据
            id: '',
            name: '',
            type: '',
            content: [],
            code: ''
        }
    },
    mutations: {
        setNodeData (state, data) {
            state.nodeData = cloneDeep(data)
        },
        // 节点处理人配置
        updateProcessor (state, data) {
            const { type, processors } = data
            state.nodeData.processors_type = type
            state.nodeData.processors = processors
        },
        // 设置人工节点表单配置
        setFormConfig (state, data) {
            state.formConfig = Object.assign({}, state.formConfig, data)
            if (typeof data.id === 'number') {
                state.nodeData.extras.formConfig.id = data.id
                state.nodeData.extras.formConfig.type = data.type
            }
        },
        // 设置数据处理节点配置
        setDataProcessConfig (state, data) {
            const config = cloneDeep(data)
            delete config.name
            state.nodeData.name = data.name
            state.nodeData.extras.dataManager = cloneDeep(config)
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
        },
        // 审批节点转单人配置
        updateDeliver (state, data) {
            const { type, processors } = data
            state.nodeData.delivers_type = type
            state.nodeData.delivers = processors
        },
        // 设置审批节点提前终止条件
        setFinishCondition (state, data) {
            state.nodeData.finish_condition = cloneDeep(data)
        },
        clearNodeConfigData (state) {
            state.nodeData = {}
            state.formConfig = {
                id: '',
                name: '',
                type: '',
                content: [],
                code: ''
            }
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
