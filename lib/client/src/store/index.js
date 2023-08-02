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

import Vue from 'vue'
import Vuex from 'vuex'

import drag from './modules/drag'
import vueCode from './modules/vue-code'
import project from './modules/project'
import components from './modules/components'
import page from './modules/page'
import functions from './modules/functions'
import variable from './modules/variable'
import route from './modules/route'
import pageTemplate from './modules/page-template'
import projectCode from './modules/project-code'
import release from './modules/release'
import layout from './modules/layout'
import member from './modules/member'
import form from './modules/nocode/form'
import flow from './modules/nocode/flow'
import logs from './modules/logs'
import iconManage from './modules/icon-manage'
import functionMarket from './modules/function-market'
import projectVersion from './modules/project-version'
import dataSource from './modules/data-source'
import api from './modules/api'
import iam from './modules/iam'
import ai from './modules/ai'

import nocode from './modules/nocode'
import file from './modules/file'
import http from '@/api'
import pureAxios from '@/api/pureAxios.js'
import router from '../router'
import { unifyObjectStyle, json2Query, circleJSON } from '@/common/util'
import LC from '@/element-materials/core'
// 生成源码重构后，需要支持前端单独调用
import getPageCode from '../../../shared/page-code'
import { IAM_ACTION } from 'shared/constant'
import jsCookie from 'js-cookie'

Vue.use(Vuex)

export const storeConfig = {
    // 模块
    modules: {
        drag,
        vueCode,
        project,
        components,
        page,
        functions,
        variable,
        route,
        pageTemplate,
        projectCode,
        release,
        layout,
        member,
        form,
        flow,
        logs,
        iconManage,
        functionMarket,
        projectVersion,
        dataSource,
        api,
        nocode,
        file,
        iam,
        ai
    },
    // 公共 store
    state: {
        mainContentLoading: false,
        // 页面级dialog的popManager监测器，用于适配交互式组件
        pagePopMaskObserve: null,
        // 系统当前登录用户
        user: {},
        loadingConf: {
            speed: 2,
            primaryColor: '#f5f6fa',
            secondaryColor: '#FAFAFC'
        },
        isExternal: process.env.BK_ENGINE_REGION !== 'ieod',
        // 权限中心无依赖资源的操作权限
        iamNoResourcesPerm: {
            [IAM_ACTION.manage_function[0]]: false,
            [IAM_ACTION.manage_platform[0]]: false,
            [IAM_ACTION.manage_template[0]]: false,
            [IAM_ACTION.view_operation_data[0]]: false,
            [IAM_ACTION.create_app[0]]: false,
            [IAM_ACTION.create_app_with_template[0]]: false,
            [IAM_ACTION.preview_app_template[0]]: false,
            [IAM_ACTION.download_app_template_source[0]]: false,
            [IAM_ACTION.create_page_with_template[0]]: false,
            [IAM_ACTION.preview_page_template[0]]: false,
            [IAM_ACTION.download_page_template_source[0]]: false
        },
        // 获取当前语言环境
        Language: jsCookie.get('blueking_language') || 'zh-cn'
    },
    // 公共 getters
    getters: {
        pagePopMaskObserve: state => state.pagePopMaskObserve,
        mainContentLoading: state => state.mainContentLoading,
        user: state => state.user,
        iamNoResourcesPerm: state => state.iamNoResourcesPerm
    },
    // 公共 mutations
    mutations: {
        setPopMaskObserve (state, observe) {
            state.pagePopMaskObserve = observe
        },
        /**
         * 设置内容区的 loading 是否显示
         *
         * @param {Object} state store state
         * @param {boolean} loading 是否显示 loading
         */
        setMainContentLoading (state, loading) {
            state.mainContentLoading = loading
        },

        /**
         * 更新当前用户 user
         *
         * @param {Object} state store state
         * @param {Object} user user 对象
         */
        updateUser (state, user) {
            state.user = Object.assign({}, user)
        },

        setIamNoResourcesPerm (state, data) {
            state.iamNoResourcesPerm = data
        }
    },
    actions: {
        /**
         * 获取用户信息
         *
         * @param {Function} commit store commit mutation handler
         * @param {Object} state store state
         * @param {Function} dispatch store dispatch action handler
         *
         * @return {Promise} promise 对象
         */
        userInfo ({ commit, state, dispatch }, config) {
            return http.get('/user/userinfo', config).then(response => {
                const userData = response.data || {}
                commit('updateUser', userData)
                return userData
            })
        },

        testApi () {
            return http.post('/test/posttest').then(response => {
                const data = response.data || {}
                return data
            })
        },

        getApiData ({ state }, data) {
            const curRouter = router.currentRoute || {}
            const params = curRouter.params || {}
            const projectId = params.projectId || ''
            const postData = {
                projectId,
                ...data
            }
            return pureAxios.post('/data/getApiData', postData, { globalError: false }).then(response => {
                return response
            })
        },

        getHealthData ({ state }) {
            return http.get('/health/check').then(response => {
                const data = response.data || []
                return data
            })
        },

        checkIamNoResourcesPerm ({ commit }) {
            return http.post('/iam/check-no-resources', { globalError: false }).then(response => {
                const data = response.data || {}
                commit('setIamNoResourcesPerm', data)
                return data
            })
        },

        // x-table
        remove (context, params, config) {
            return http.delete(`/test/remove?${json2Query(params)}`, {}, config).then(res => {
                return res
            })
        },
        // x-table
        getTable (context, params, config) {
            return http.get(`/test/getTable?${json2Query(params)}`, {}, config).then(res => {
                return res
            })
        },

        updatePreview ({ state }, { isGenerateNav, id, curTemplateData, types, storageKey, nocodePayload = {}, framework }) {
            let targetData = []
            try {
                targetData = JSON.parse(circleJSON(LC.getRoot().toJSON().renderSlots.default))
            } catch (error) {
                targetData = []
            }
            curTemplateData = {
                ...curTemplateData,
                customMenuCon: LC.getNavCustomCon()?.renderSlots?.default || []
            }
            const funcGroups = JSON.parse(circleJSON(state.functions.funcGroups || []))
            const variableList = JSON.parse(circleJSON(state.variable.variableList || []))
            const lifeCycle = isGenerateNav ? {} : state.page.pageDetail?.lifeCycle
            const pageData = getPageCode({
                targetData,
                pageType: 'preview',
                platform: state.page.pageDetail?.pageType,
                funcGroups,
                lifeCycle,
                projectId: router.currentRoute.params?.projectId,
                pageId: router.currentRoute.params?.pageId,
                layoutContent: curTemplateData,
                isGenerateNav,
                isEmpty: false,
                layoutType: state.drag.curTemplateData?.layoutType,
                variableList,
                styleSetting: state.page.pageDetail?.styleSetting,
                user: state.user,
                npmConf: {},
                origin: location.origin,
                deletePageCodes: state.page.deletePageCodes || [],
                apiList: state.api.apiData?.map(group => group.children).flat(),
                nocodeType: state.page.pageDetail?.nocodeType,
                nocodePayload,
                isRenderAppPermComponents: false,
                framework
            })
            const payload = JSON.stringify({
                types,
                source: pageData.code,
                id
            })
            localStorage.setItem(storageKey, payload)
        }
    }
}

const store = new Vuex.Store(storeConfig)

/**
 * hack vuex dispatch, add third parameter `config` to the dispatch method
 *
 * @param {Object|string} _type vuex type
 * @param {Object} _payload vuex payload
 * @param {Object} config config 参数，主要指 http 的参数，详见 src/api/index initConfig
 *
 * @return {Promise} 执行请求的 promise
 */
store.dispatch = function (_type, _payload, config = {}) {
    const { type, payload } = unifyObjectStyle(_type, _payload)

    const action = { type, payload, config }
    const entry = store._actions[type]
    if (!entry) {
        if (process.env.NODE_ENV === 'development') {
            console.error(`[vuex] unknown action type: ${type}`)
        }
        return
    }
    store._actionSubscribers.forEach(sub => {
        if (typeof sub === 'function') {
            return sub(action, store.state)
        }
        if (typeof sub === 'object') {
            Object.keys(sub).forEach((subKey) => {
                if (typeof sub[subKey] === 'function') {
                    return sub[subKey](action, store.state)
                }
            })
        }
    })

    return entry.length > 1
        ? Promise.all(entry.map(handler => handler(payload, config)))
        : entry[0](payload, config)
}

export const useStore = () => store

export default store
