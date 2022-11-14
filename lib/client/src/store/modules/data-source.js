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
const perfix = 'data-source'

export default {
    namespaced: true,
    state: {
        tableList: []
    },
    mutations: {
        setTableList (state, tableList) {
            state.tableList = tableList || []
        }
    },
    getters: {
    },
    actions: {
        enable (_, projectId) {
            return http.post(`${perfix}/enable`, { projectId }).then(response => {
                const data = response.data || []
                return data
            })
        },
        list ({ commit }, params = {}) {
            return http.get(`${perfix}/getTables`, { params }).then(response => {
                const data = response.data || []
                commit('setTableList', data?.list)
                return data
            })
        },
        add (_, postData) {
            return http.post(`${perfix}/addTable`, postData).then(response => {
                return response.data
            })
        },
        delete (_, deleteData) {
            return http.put(`${perfix}/deleteTable`, deleteData).then(response => {
                return response.data
            })
        },
        edit (_, postData) {
            return http.put(`${perfix}/updateTable`, postData).then(response => {
                return response.data
            })
        },
        findOne (_, id) {
            return http.get(`${perfix}/getTableDetail`, { params: { id } }).then(response => {
                const data = response.data || []
                return data
            })
        },
        getTableDatas (_, { tableName, ...params }) {
            return http.get(`${perfix}/user/tableName/${tableName}`, { params }).then(response => {
                const data = response.data || []
                return data
            })
        },
        modifyOnlineDb (_, data) {
            return http.put(`${perfix}/modifyOnlineDb`, data, { globalError: false }).then(response => {
                const data = response.data || []
                return data
            })
        },
        tableRecordList (_, params) {
            return http.post(`${perfix}/tableRecordList`, params).then(response => {
                const data = response.data || []
                return data
            })
        },
        getOnlineTableList (_, params) {
            return http.get(`${perfix}/getOnlineTableList`, { params }, { globalError: false }).then(response => {
                const data = response.data || []
                return data
            })
        },
        getOnlineTableDatas (_, params) {
            return http.get(`${perfix}/getOnlineTableDatas`, { params }).then(response => {
                const data = response.data || []
                return data
            })
        },
        getSqlRecords (_, params) {
            return http.get(`${perfix}/getSqlRecords`, { params }).then(response => {
                const data = response.data || []
                return data
            })
        },
        queryByJson (_, params) {
            return http.post(`${perfix}/user/queryByJson/time`, params).then(response => {
                const data = response.data || []
                return data
            })
        },
        queryBySql (_, params) {
            return http.post(`${perfix}/user/queryBySql/time`, params).then(response => {
                const data = response.data || []
                return data
            })
        },
        addQueryHistory (_, params) {
            return http.post(`${perfix}/user/queryHistory`, params).then(response => {
                const data = response.data || {}
                return data
            })
        },
        getQueryHistory (_, params) {
            return http.get(`${perfix}/user/queryHistory`, { params }).then(response => {
                const data = response.data || []
                return data
            })
        },
        getBkBaseTables (_, bkBizId) {
            const bkBizIds = Array.isArray(bkBizId) ? bkBizId : [bkBizId]
            return http.get(`${perfix}/getBkBaseTables?${bkBizIds.map(x => `bkBizId=${x}`).join('&')}`).then(response => {
                const data = response.data || []
                return data
            })
        }
    }
}
