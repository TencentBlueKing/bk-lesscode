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
        setFormConfig (state, data) {
            state.formConfig = Object.assign({}, state.formConfig, data)
            if (typeof data.id === 'number') {
                state.nodeData.extras.formConfig.id = data.id
                state.nodeData.extras.formConfig.type = data.type
            }
        },
        updateProcessor (state, data) {
            const { type, processors } = data
            state.nodeData.processors_type = type
            state.nodeData.processors = processors
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
        processorData (state) {
            const { processors_type, processors } = state.nodeData
            return {
                type: processors_type,
                processors: cloneDeep(processors)
            }
        },
        dataProcessConfig (state) {
            return state.nodeData.extras.dataProcess ? cloneDeep(state.nodeData.extras.dataProcess) : {
                conditions: {
                    connector: 'and',
                    expressions: []
                },
                mapping: [],
                worksheet_id: ''
            }
        }
    }
}
