import Vue from 'vue'
import VueRouter from 'vue-router'

import store from '@/store'
import http from '@/api'
import preload from '@/common/preload'
import { IAM_BUILDIN_ACTION } from 'shared/constant.js'

Vue.use(VueRouter)

const BkMainEntry = () => import(/* webpackChunkName: 'entry' */'@/views')
const BkNotFound = () => import(/* webpackChunkName: 'none' */'@/views/404')

${importStr}

const routes = [
    {
        path: '/',
        name: 'appMain',
        component: BkMainEntry,
        ${defaultRedirect},
        children: [
            ${routerStr}
        ]
    },
    // 404
    {
        path: '/404',
        name: '404',
        component: BkNotFound,
        meta: {
            pageName: '404'
        }
    },
    {
        path: '*',
        redirect: { name: '404' }
    }
]

const router = new VueRouter({
    mode: 'history',
    base: window.SITE_URL,
    routes: routes
})

const cancelRequest = async () => {
    const allRequest = http.queue.get()
    const requestQueue = allRequest.filter(request => request.cancelWhenRouteChange)
    await http.cancel(requestQueue.map(request => request.requestId))
}

let preloading = true
let canceling = true
let pageMethodExecuting = true

router.beforeEach(async (to, from, next) => {
    canceling = true
    await cancelRequest()
    canceling = false

    if (window.PROJECT_CONFIG.IAM_ENABLE) {
        const meta = to.meta || {}
        const { pageId = '', pageCode = '', needAuth = false } = meta
        if (pageId) {
            try {
                await store.dispatch('iam/check', {
                    data: {
                        action: IAM_BUILDIN_ACTION.access_page[0],
                        resourceId: pageId,
                        resourceName: pageCode,
                        needAuth: needAuth
                    }
                })
            } catch (e) {
                console.error(e)
            }
        }
    }

    next()
})

router.afterEach(async (to, from) => {
    store.commit('setMainContentLoading', true)

    preloading = true
    await preload()
    preloading = false

    const pageDataMethods = []
    const routerList = to.matched
    routerList.forEach(r => {
        Object.values(r.instances).forEach(vm => {
            if (typeof vm.fetchPageData === 'function') {
                pageDataMethods.push(vm.fetchPageData())
            }
            if (typeof vm.$options.preload === 'function') {
                pageDataMethods.push(vm.$options.preload.call(vm))
            }
        })
    })

    pageMethodExecuting = true
    await Promise.all(pageDataMethods)
    pageMethodExecuting = false

    if (!preloading && !canceling && !pageMethodExecuting) {
        store.commit('setMainContentLoading', false)
    }

    const meta = to.meta || {}
    document.title = meta.pageName || 'index'
})

export default router
