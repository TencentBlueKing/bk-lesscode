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
        pageList: [],
        deletePageCodes: [],
        pageDetail: {},
        pageRoute: {},
        layoutList: [],
        routeGroup: [],
        mobilePreview: true,
        pageSize: { // 移动端页面默认尺寸
            height: 812,
            width: 375
        }
    },
    mutations: {
        setMobilePreview (state, preview) {
            state.mobilePreview = preview
        },
        setPageDetail (state, page) {
            state.pageDetail = Object.freeze(page)
        },
        setPageList (state, pageList) {
            state.pageList = pageList
        },
        updatePageDetail (state, page) {
            state.pageDetail = Object.freeze({ ...state.pageDetail, ...page })
        },
        updatePageList (state, page) {
            const index = state.pageList.findIndex(item => item.id === page.id)
            state.pageList[index] = { ...state.pageList[index], ...page }
        },
        setDeletePageCodes (state, codes) {
            state.deletePageCodes = codes
        },
        setPageRoute (state, route) {
            state.pageRoute = route
        },
        setLayoutList (state, list) {
            state.layoutList = list
        },
        setRouteGroup (state, group) {
            state.routeGroup = group
        },
        setPageSize (state, size) {
            state.pageSize = size
        }
    },
    getters: {
        pageDetail: state => state.pageDetail,
        pageList: state => state.pageList,
        pageRoute: state => state.pageRoute,
        layoutList: state => state.layoutList,
        routeGroup: state => state.routeGroup,
        platform: state => state.pageDetail.pageType ? state.pageDetail.pageType : 'PC',
        mobilePreview: state => state.mobilePreview,
        pageSize: state => state.pageSize
    },
    actions: {
        async getPageSetting ({ dispatch, commit }, { pageId, projectId, versionId }) {
            const [pageRoute, layoutList, routeGroup, deletePageCodes] = await Promise.all([
                dispatch('route/find', { pageId }, { root: true }),
                dispatch('layout/getList', { projectId, versionId }, { root: true }),
                dispatch('route/getProjectRouteGroup', { projectId, versionId }, { root: true }),
                dispatch('getDeletePageCodes', { projectId, versionId })
            ])
            layoutList.forEach(item => {
                item.defaultName = item.showName || item.defaultName
            })
            commit('setRouteGroup', routeGroup)
            commit('setLayoutList', layoutList)
            commit('setPageRoute', pageRoute)
            commit('setDeletePageCodes', deletePageCodes)
            return true
        },
        create ({ commit }, { data = {} }) {
            return http.post('/page/create', data).then(response => {
                const data = response.data || ''
                return data
            })
        },
        getList ({ commit }, params) {
            return http.get('/page/getList', { params }).then(response => {
                const data = response.data || ''
                return data
            })
        },
        getLiteList ({ commit }, { projectId, config = {} }) {
            return http.get(`/page/getList?lite=1&projectId=${projectId}`, config).then(response => {
                const data = response.data || ''
                return data
            })
        },
        update ({ commit }, { data = {} }) {
            data.pageId = data?.pageData?.id
            return http.put('/page/update', data).then(response => {
                const data = response.data || ''
                return data
            })
        },
        copy ({ commit }, { data = {} }) {
            data.pageId = data?.pageData?.id
            return http.post('/page/copy', data).then(response => {
                const data = response.data || ''
                return data
            })
        },
        delete ({ commit }, { pageId }) {
            return http.delete(`/page/delete?pageId=${pageId}`).then(response => {
                const data = response.data || ''
                return data
            })
        },
        checkName ({ commit }, { data = {} }) {
            return http.post('/page/checkName', data).then(response => {
                return response.data || ''
            })
        },
        detail ({ commit }, { pageId }) {
            return http.get(`/page/detail?pageId=${pageId}`).then(response => {
                const data = response.data || ''
                return data
            })
        },
        pageLockStatus ({ commit }, { pageId }) {
            return http.get(`/page/pageLockStatus?pageId=${pageId}`).then(response => {
                const data = response.data || ''
                return data
            })
        },
        updatePageLock ({ commit }, { data = {} }) {
            return http.post('/page/updatePageActive', data).then(response => {
                return response.data || ''
            })
        },
        occupyPage ({ commit }, { data = {} }) {
            return http.post('/page/occupyPage', data).then(response => {
                return response.data || ''
            })
        },
        getDeletePageCodes ({ commit }, { projectId, versionId }) {
            return http.get(`/page/getDeletePageCodes?projectId=${projectId}&versionId=${versionId}`).then(response => {
                const data = response.data || []
                return data
            })
        }
    }
}
