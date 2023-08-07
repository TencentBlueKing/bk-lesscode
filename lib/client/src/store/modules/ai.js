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
import http from '@/api'
const prefix = '/ai'

export default {
    namespaced: true,
    state: {
        isAiAvailable: false
    },
    mutations: {
        setAiAvailable (state, data) {
            state.isAiAvailable = data
        }
    },
    getters: {
        isAiAvailable: state => state.isAiAvailable
    },
    actions: {
        checkAiAvailable ({ commit }) {
            return http.get(`${prefix}/available`).then((res = {}) => {
                commit('setAiAvailable', res.data)
                return res.data
            })
        }
    }
}
