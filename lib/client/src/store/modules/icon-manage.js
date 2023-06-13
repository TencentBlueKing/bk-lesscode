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

export default {
    namespaced: true,
    state: {
        iconList: []
    },
    mutations: {
        setIconList (state, iconList) {
            state.iconList = Object.freeze(iconList)
        }
    },
    getters: {
    },
    actions: {
        projectList (state, params = {}) {
            return http.get('/icon-manage/project-list', { params }).then(response => {
                const data = response.data || {}
                return data
            })
        },
        list ({ commit }, params = {}) {
            return http.get('/icon-manage/list', { params }).then(response => {
                const data = response.data || []
                commit('setIconList', data)
            })
        },
        useing (state, params = {}) {
            return http.get('/icon-manage/useing', { params }).then(response => {
                const data = response.data || ''
                return data
            })
        },
        use (state, params = {}) {
            return http.post('/icon-manage/use', params).then(response => {
                const data = response.data || ''
                return data
            })
        },
        usageRecord (state, params = {}) {
            return http.get('/icon-manage/usageRecord', { params }).then(response => {
                const data = response.data || []
                return data
            })
        },
        upgrade (state, params = {}) {
            return http.post('/icon-manage/upgrade', params).then(response => {
                const data = response.data || ''
                return data
            })
        },
        remove (state, params = {}) {
            return http.post('/icon-manage/remove', params).then(response => {
                const data = response.data || ''
                return data
            })
        }
    }
}
