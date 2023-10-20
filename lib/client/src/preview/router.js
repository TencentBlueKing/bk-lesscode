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
import { uuid } from 'shared/util'
import {
    getRouteFullPath,
    getRouteName,
    getFinalRoute,
    getProjectDefaultRoute
} from 'shared/route'
import VueRouter from 'vue-router'
import Vue from 'vue'
import {
    createRouter,
    framework,
    vue3Resource
} from 'bk-lesscode-render'
import Home from './children/home/home'
import BkNotFound from './children/404/404'
import BkError from './children/bk-error/bk-error'
import {
    bundless,
    triggleUpdate
} from '@blueking/bundless'
import bundlessPluginVue2 from '@blueking/bundless-plugin-vue2'
import bundlessPluginVue3 from '@blueking/bundless-plugin-vue3'

Vue.use(VueRouter)
const uniqStr = uuid()

function registerComponent (source, id) {
    const bundlessPluginVue = framework === 'vue3'
        ? bundlessPluginVue3(vue3Resource)
        : bundlessPluginVue2
    return bundless({
        source,
        id,
        plugins: [bundlessPluginVue]
    })
}

// 监听 storage 变化触发热更新
window.addEventListener('storage', (event) => {
    try {
        if (['ONLINE_PREVIEW_CONTENT', 'ONLINE_PREVIEW_NAV'].includes(event.key)) {
            const payload = JSON.parse(event.newValue)
            if (payload) {
                triggleUpdate(payload)
            }
        }
        if (event.key === 'ONLINE_PREVIEW_RELOAD') {
            location.reload()
        }
    } catch (error) {
        console.error(window.i18n.t('热更新失败：{n}', { n: error.message || error }))
    }
})

// 生成路由
module.exports = (routeGroup, projectPageRouteList, projectRouteList, projectId, platform, versionId) => {
    // 如果是预览移动端， 则只生成移动端相关router
    if (platform === 'MOBILE') {
        Object.keys(routeGroup).forEach(key => {
            if (routeGroup[key]?.layoutType?.indexOf('mobile') === -1) {
                delete routeGroup[key]
            }
        })
    }
    const allPath = framework === 'vue3' ? '/:pathMatch(.*)' : '*'
    const routes = []
    // 当前编辑页面的内容信息
    const editPageData = JSON.parse(localStorage.getItem('ONLINE_PREVIEW_CONTENT') || '{}')
    // 当前编辑页面的导航信息
    const editNavData = JSON.parse(localStorage.getItem('ONLINE_PREVIEW_NAV') || '{}')

    for (const key in routeGroup) {
        const layout = routeGroup[key]

        // 父路由
        const parentPreviewId = projectId + layout.path + versionId
        const parentSource = parentPreviewId === editNavData.id ? editNavData.source : layout.content
        const parentCom = registerComponent(parentSource, parentPreviewId)

        // 子路由
        const routeList = layout.children
        const children = routeList.map((route) => {
            const routeConifg = {
                path: route.path.replace(/^\//, '')
            }

            try {
                // 与vue-router保持一致，优先使用redirect
                if (route.redirectRoute) {
                    routeConifg.name = getRouteName(route)
                    // 如果是多次跳转，将通过每个路由的redirect配置自动进行接力
                    routeConifg.redirect = {
                        path: getRouteFullPath(route.redirectRoute),
                        // pageCode参数用于高亮导航和面包屑，跳转地址不一定有pageCode但是最后跳转的那个地址通常会绑定页面即最终可得到一个pageCode
                        query: { pageCode: getRouteName(route.redirectRoute) }
                    }
                } else if (route.isError) {
                    // 后端生成页面信息的时候发生错误
                    routeConifg.component = BkError
                } else if (route.pageId !== -1) {
                    // 判断是从storage读取数据还是数据库
                    const pagePreviewId = projectId + route.pageCode + versionId
                    const source = pagePreviewId === editPageData.id ? editPageData.source : route.content
                    // 生成页面
                    const childCom = registerComponent(source, pagePreviewId)
                    routeConifg.name = getRouteName(route)
                    routeConifg.component = childCom
                } else {
                    routeConifg.redirect = {
                        path: '/404'
                    }
                }
                // 携带 meta 信息
                if (route.meta) {
                    routeConifg.meta = route.meta
                }
            } catch (error) {
                // 前端构造页面的时候发生错误
                console.error(error)
                routeConifg.component = BkError
                routeConifg.meta = {
                    message: error.message || error
                }
            }

            return routeConifg
        })

        // 404
        if (layout.path !== '/') {
            children.push({ path: allPath, component: BkNotFound })
        }

        routes.push({
            path: layout.path.replace(/^\//, ''),
            name: layout.name + uniqStr,
            component: parentCom,
            redirect: children[0].name ? { name: children[0].name } : null,
            children
        })
    }
    const noRoutePages = projectPageRouteList.filter(route => !route.id).map(route => {
        return {
            path: `${route.pageCode}404`,
            name: route.pageCode,
            redirect: { name: '404' }
        }
    })

    // 应用默认首页
    const defaultRoute = getProjectDefaultRoute(projectPageRouteList, projectRouteList, platform)

    // 应用默认跳转route
    let defaultRedirect = null
    if (defaultRoute?.id) {
        const finalRoute = getFinalRoute(defaultRoute, projectRouteList)
        // 最终跳转路由绑定的那个页面的pageCode
        const name = getRouteName(finalRoute)
        defaultRedirect = { name, query: { pageCode: name } }
    }

    const allRoutes = [
        {
            path: '/',
            name: 'previewHome',
            component: Home,
            redirect: defaultRedirect,
            children: [...routes, ...noRoutePages]
        },
        {
            path: '/404',
            name: '404',
            component: BkNotFound
        },
        {
            path: allPath,
            redirect: { name: '404' }
        }
    ]

    let base = `/preview/project/${projectId}`
    if (versionId) {
        base = `${base}/version/${versionId}`
    }
    if (platform) {
        base = `${base}/platform/${platform}`
    }
    return createRouter(
        {
            base,
            routes: allRoutes
        },
        VueRouter
    )
}
