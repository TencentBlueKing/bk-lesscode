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
        curNameMap: {},
        interactiveComponents: ['bk-dialog', 'bk-sideslider'],
        categoryList: []
    },
    mutations: {
        setCurNameMap (state, nameMap) {
            state.curNameMap = Object.assign({}, nameMap)
        },
        setCategoryList (state, categoryList) {
            state.categoryList = categoryList
        }
    },
    getters: {
        curNameMap: state => state.curNameMap,
        interactiveComponents: state => state.interactiveComponents
    },
    actions: {
        list (state, params = {}) {
            return http.get('/component/list', { params }).then(response => {
                const data = response.data || ''
                return data
            })
        },
        useing (state, params = {}) {
            return http.get('/component/useing', { params }).then(response => {
                const data = response.data || ''
                return data
            })
        },
        detail (state, params = {}) {
            return http.get('/component/detail', { params }).then(response => {
                const data = response.data || ''
                return data
            })
        },
        versionDetail (state, params = {}) {
            return http.get('/component/version-detail', { params }).then(response => {
                const data = response.data || ''
                return data
            })
        },
        create (state, params = {}) {
            return http.post('/component/create', params).then(response => {
                const data = response.data || ''
                return data
            })
        },
        update (state, params = {}) {
            return http.post('/component/update', params).then(response => {
                const data = response.data || ''
                return data
            })
        },
        updateData (state, params = {}) {
            return http.post('component/updateData', params).then(response => {
                const data = response.date || ''
                return data
            })
        },
        off (state, params = {}) {
            return http.post('/component/off', params).then(response => {
                const data = response.data || ''
                return data
            })
        },
        online (state, params) {
            return http.post('/component/online', params).then(response => {
                const data = response.data || ''
                return data
            })
        },
        upload () {
            return http.get('/component/upload').then(response => {
                const data = response.data || ''
                return data
            })
        },
        categoryCount (state, params) {
            return http.get('/component/category-count', { params }).then(response => {
                const data = response.data || ''
                return data
            })
        },
        categoryList ({ commit }, params = {}) {
            return http.get('/componentCategory/list', { params }).then(response => {
                const data = response.data || ''
                commit('setCategoryList', data)
                return data
            })
        },

        categoryCreate (state, params) {
            return http.post('/componentCategory/create', params).then(response => {
                const data = response.data || ''
                return data
            })
        },
        categoryUpdate (state, params) {
            return http.post('/componentCategory/update', params).then(response => {
                const data = response.data || ''
                return data
            })
        },
        categorySort (state, params) {
            return http.post('/componentCategory/sort', params).then(response => {
                const data = response.data || ''
                return data
            })
        },
        categoryDelete (state, params) {
            return http.delete('/componentCategory/delete', { params }).then(response => {
                const data = response.data || ''
                return data
            })
        },

        componentNameMap (context) {
            return http.get('/component/name-map').then(response => {
                const data = response.data || {}
                context.commit('setCurNameMap', data)
                return data
            })
        },

        updatePageComp (state, params) {
            return http.put('/component/page-using-version', params).then(response => {
                const data = response.data || ''
                return data
            })
        },

        favoriteList ({ commit }, params = {}) {
            return http.get('/componentFavourite/list', { params }).then(response => {
                const data = response.data || ''
                return data
            })
        },
        favoriteAdd ({ commit }, { data, config }) {
            return http.post('/componentFavourite/add', data, config).then(response => {
                const data = response.data || ''
                return data
            })
        },
        favoriteDelete ({ commit }, { data, config }) {
            return http.post('/componentFavourite/delete', data, config).then(response => {
                const data = response.data || ''
                return data
            })
        },

        scope ({ commit }, { data, config }) {
            return http.post('/component/scope', data, config).then(response => {
                const data = response.data || ''
                return data
            })
        }
    }
}
