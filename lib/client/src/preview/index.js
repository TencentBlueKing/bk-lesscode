/**
 * Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
 * Copyright (C) 2017-2018 THL A29 Limited, a Tencent company. All rights reserved.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */
import Vue from 'vue'
import pureAxios from '@/api/pureAxios.js'
import { errorHandle } from './overlay'
import registerComponent from './component'
import App from './children/App.vue'
import i18n from '@/locales/i18n'
import ApplyPage from '@/components/apply-permission/apply-page.vue'
import generateRouter from './router'
import generateStore from './store'
// 注入全局样式
import '../../../server/project-template/project-init-code/lib/client/src/css/app.css'
import '../../../server/project-template/project-init-code/lib/client/src/css/reset.css'

// 解析 url 参数
const location = window.location
const projectIdReg = new RegExp(`${location.origin}/preview/project/(\\d+)(/version/(\\d+))?(/platform/(PC|MOBILE))?`)
const [, projectId, , versionId = null, , platform] = projectIdReg.exec(location.href) || []

Promise.all([
    pureAxios.get('/projectCode/previewCode', {
        params: {
            projectId,
            platform,
            versionId
        }
    }),
    registerComponent(Vue, projectId, versionId)
]).then(([res]) => {
    const { code, data } = res
    if (code === 403) {
        if (data.pass === false) {
            window.app = new Vue({
                el: '#preview-app',
                components: { ApplyPage },
                data () {
                    return {
                        authResult: data
                    }
                },
                template: '<apply-page :auth-result="authResult"/>'
            })
        } else {
            errorHandle({
                response: {
                    data: {
                        message: window.i18n.t('当前页面无权限')
                    }
                }
            })
        }
    } else {
        Vue.prototype.$http = pureAxios
        const data = res.data || {}
        const projectPageRouteList = (data.pageRouteList || []).map(item => ({
            ...item,
            fullPath: item.id ? `${item.layoutPath}${item.layoutPath.endsWith('/') ? '' : '/'}${item.path}` : ''
        }))
        const projectRouteList = (Object.values(data.routeGroup || {}) || []).map(({ children }) => children)
            .reduce((pre, cur) => pre.concat(cur), [])
            .map(({ id, layoutPath, path, redirect, pageCode }) => ({
                id,
                layoutPath,
                path,
                redirect,
                pageCode,
                fullPath: `${layoutPath}${layoutPath.endsWith('/') ? '' : '/'}${path}`
            }))

        const router = generateRouter(data.routeGroup, projectPageRouteList, projectRouteList, projectId, platform, versionId)
        const store = generateStore(data.storeData, { projectPageRouteList, projectRouteList })
        window.app = new Vue({
            el: '#preview-app',
            components: { App },
            router,
            store,
            i18n,
            template: '<App/>'
        })
    }
}).catch(errorHandle)
