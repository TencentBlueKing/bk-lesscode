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
const prefix = '/api-manage'

export default {
    namespaced: true,
    state: {
        apiData: []
    },
    mutations: {
        setApiData (state, apiData) {
            state.apiData = apiData || []
        }
    },
    getters: {
        // 分组数据（包含api数据），只在画布区域有值，方便画布传递数据使用
        apiGroups (state) {
            return state.apiData
        },
        // api列表，只在画布区域有值，方便画布传递数据使用
        apiList (state) {
            return state.apiData.map(group => group.children).flat()
        }
    },
    actions: {
        getApiGateWayApiList (_, params) {
            return http.get(`${prefix}/apigateway/apis`, { params }).then((res = {}) => {
                return res.data || []
            })
        },

        getApiGateWayStagList (_, params) {
            return http.get(`${prefix}/apigateway/stages`, { params }).then((res = {}) => {
                return res.data || []
            })
        },

        getApiGateWayNameList () {
            return http.get(`${prefix}/apigateway/api-names`).then((res = {}) => {
                return res.data || []
            })
        },

        getCategoryAndApiList (_, params) {
            return http.get(`${prefix}/category-children-list`, { params }).then((res = {}) => {
                return res.data || []
            })
        },

        createCategory (_, params) {
            return http.post(`${prefix}/category`, params).then((res = {}) => {
                return res.data
            })
        },

        deleteCategory (_, params) {
            return http.delete(`${prefix}/category`, { params }).then((res) => {
                return res.data
            })
        },

        editCategory (_, params) {
            return http.put(`${prefix}/category`, params)
        },

        getCategoryList (_, params) {
            return http.get(`${prefix}/category`, { params }).then((res = {}) => {
                return res.data || []
            })
        },

        getApiList (_, params) {
            return http.get(`${prefix}/api`, { params }).then((res = {}) => {
                return res.data || []
            })
        },

        createApi (_, api) {
            return http.post(`${prefix}/api`, api).then((res = {}) => {
                return res.data || {}
            })
        },

        deleteApi (_, id) {
            return http.delete(`${prefix}/api`, { params: { id } }).then((res) => {
                return res.data
            })
        },

        editApi (_, api) {
            return http.put(`${prefix}/api`, api, { globalError: false }).then((res) => {
                return res.data || {}
            })
        },

        getApiDetail (_, params) {
            return http.get(`${prefix}/api/detail`, { params }).then((res) => {
                return res.data || {}
            })
        }
    }
}
