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

import http from '@/api'

export default {
    namespaced: true,
    state: {
        // 当前项目内所有 action 集合
        projectPermActionList: []
    },
    mutations: {
        setProjectPermActionList (state, projectPermActionList) {
            state.projectPermActionList = projectPermActionList || []
        }
    },
    getters: {
        projectPermActionList: state => state.projectPermActionList
    },

    actions: {
        check ({ commit }, { data, config }) {
            return http.post('/iam/check', data, config).then(response => {
                const data = response.data || ''
                return data
            })
        },

        getAuthSubject ({ commit }, { data, config }) {
            return http.post('/iam/auth-subject', data, config).then(response => {
                const data = response.data || ''
                return data
            })
        },

        myProject ({ commit }, { config }) {
            return http.get('/iam/my-project', config).then(response => {
                const data = response.data || ''
                return data
            })
        },

        getIamAppPerm ({ commit }, params) {
            return http.get(`/iam/app-perm-model?projectId=${params.projectId}`).then(response => {
                const data = response.data || []
                return data
            })
        },

        getIamAppPermAction ({ commit }, params) {
            return http.get(`/iam/app-perm-model-action?projectId=${params.projectId}`).then(response => {
                const data = response.data || []
                commit('setProjectPermActionList', data)
                return data
            })
        },

        updateIamAppPermAction ({ commit }, { data, config }) {
            return http.put('/iam/app-perm-model-action', data, config).then(response => {
                const data = response.data || ''
                return data
            })
        },

        addIamAppPermAction ({ commit }, params) {
            return http.post('/iam/app-perm-model-action', params.data).then(response => {
                const data = response.data || ''
                return data
            })
        },

        checkActionId ({ commit }, params) {
            return http.post('/iam/check-action', params.data).then(response => {
                const data = response.data || ''
                return data
            })
        },

        deleteIamAppPermAction ({ commit }, params) {
            const { projectId, actionId } = params
            return http.delete(`/iam/app-perm-model-action?projectId=${projectId}&actionId=${actionId}`).then(
                response => {
                    return response.data
                }
            )
        }
    }
}
