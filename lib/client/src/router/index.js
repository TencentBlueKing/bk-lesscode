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
import VueRouter from 'vue-router'
import { bus } from '@/common/bus'

import store from '@/store'
import preload from '@/common/preload'
import { IAM_ACTION } from 'shared/constant'
import { leaveConfirm } from '@/common/leave-confirm'
import { FOLD_MENU_ROUTE_LIST } from '@/common/constant-en'

Vue.use(VueRouter)

// 首页
const Home = () => import(/* webpackChunkName: 'home' */'@/views/home')

// 项目管理相关
const SystemEntry = () => import(/* webpackChunkName: 'projects' */'@/views/system')
const ProjectManage = () => import(/* webpackChunkName: 'projects' */'@/views/system/project-manage')
const Account = () => import(/* webpackChunkName: 'projects' */'@/views/system/account')
const functionMarket = () => import(/* webpackChunkName: 'projects' */'@/views/system/function-market')
const templateMarket = () => import(/* webpackChunkName: 'projects' */'@/views/system/template-market')

// 项目资源相关
const ProjectEntry = () => import(/* webpackChunkName: 'resources' */'@/views/project')
const ComponentManage = () => import(/* webpackChunkName: 'resources' */'@/views/project/component-manage')
const FunctionManage = () => import(/* webpackChunkName: 'resources' */'@/views/project/function-manage')
const TemplateManage = () => import(/* webpackChunkName: 'resources' */'@/views/project/template-manage')
const MemberManage = () => import(/* webpackChunkName: 'resources' */'@/views/project/member-manage')
const VariableManage = () => import(/* webpackChunkName: 'resources' */'@/views/project/variable-manage')
const ApiManage = () => import(/* webpackChunkName: 'resources' */'@/views/project/api-manage')
const PageManage = () => import(/* webpackChunkName: 'resources' */'@/views/project/page-manage')
const RouterManage = () => import(/* webpackChunkName: 'resources' */'@/views/project/router-manage')
const Release = () => import(/* webpackChunkName: 'resources' */'@/views/project/release')
const Basic = () => import(/* webpackChunkName: 'resources' */'@/views/project/basic')
const Logs = () => import(/* webpackChunkName: 'resources' */'@/views/project/logs')
const Layout = () => import(/* webpackChunkName: 'resources' */'@/views/project/layout')
const VersionManage = () => import(/* webpackChunkName: 'resources' */'@/views/project/version-manage')
const FileManage = () => import(/* webpackChunkName: 'resources' */'@/views/project/file-manage')
const AuthManage = () => import(/* webpackChunkName: 'resources' */'@/views/project/auth-manage/index.vue')
const AppPermModel = () => import(/* webpackChunkName: 'resources' */'@/views/project/app-perm-model/index.vue')

// 画布
const MainEntry = () => import(/* webpackChunkName: 'canvas' */'@/views')
const Index = () => import(/* webpackChunkName: 'canvas' */'@/views/index/index')
const EditNocode = () => import(/* webpackChunkName: 'canvas' */'@/views/edit-nocode/index')

// 内置预览
const PreviewTemplate = () => import(/* webpackChunkName: 'inner-preview' */'@/views/preview/preview-template')
const PreviewMobile = () => import(/* webpackChunkName: 'inner-preview' */'@/views/preview/preview-mobile')

// 404
const NotFound = () => import(/* webpackChunkName: 'none' */'@/views/status/404')

// 健康管理
const HealthPage = () => import(/* webpackChunkName: 'health' */'@/views/system/health')

// 文档
const MainHelpEntry = () => import(/* webpackChunkName: 'help' */'@/views/help')
const Custom = () => import(/* webpackChunkName: 'help' */'@/views/help/docs/custom.md')
const Grid = () => import(/* webpackChunkName: 'help' */'@/views/help/docs/grid.md')
const LayoutGuide = () => import(/* webpackChunkName: 'help' */'@/views/help/docs/layout.md')
const Intro = () => import(/* webpackChunkName: 'help' */'@/views/help/docs/intro.md')
const Start = () => import(/* webpackChunkName: 'help' */'@/views/help/docs/start.md')
const Develop = () => import(/* webpackChunkName: 'help' */'@/views/help/docs/develop.md')
const TableSearch = () => import(/* webpackChunkName: 'help' */'@/views/help/docs/case-table-search.md')
const Method = () => import(/* webpackChunkName: 'help' */'@/views/help/docs/method.md')
const Variable = () => import(/* webpackChunkName: 'help' */'@/views/help/docs/variable.md')
const Directive = () => import(/* webpackChunkName: 'help' */'@/views/help/docs/directive.md')
const FreeLayoutDoc = () => import(/* webpackChunkName: 'help' */'@/views/help/docs/free-layout.md')
const TemplateProject = () => import(/* webpackChunkName: 'help' */'@/views/help/docs/template-project.md')
const TemplatePage = () => import(/* webpackChunkName: 'help' */'@/views/help/docs/template-page.md')
const Interactive = () => import(/* webpackChunkName: 'help' */'@/views/help/docs/interactive.md')
const Courses = () => import(/* webpackChunkName: 'help' */'@/views/help/docs/courses.md')

// 数据源管理
const DataSourceHome = () => import(/* webpackChunkName: 'DataSource' */'@/views/project/data-source-manage/data-table/index.vue')
const DataSourceTableList = () => import(/* webpackChunkName: 'DataSource' */'@/views/project/data-source-manage/data-table/table-design/table-list/index.vue')
const DataSourceCreateTable = () => import(/* webpackChunkName: 'DataSource' */'@/views/project/data-source-manage/data-table/table-design/create-table.vue')
const DataSourceEditTable = () => import(/* webpackChunkName: 'DataSource' */'@/views/project/data-source-manage/data-table/table-design/edit-table.vue')
const DataSourceShowTable = () => import(/* webpackChunkName: 'DataSource' */'@/views/project/data-source-manage/data-table/table-design/show-table.vue')
const DataSourceUpdateRecord = () => import(/* webpackChunkName: 'DataSource' */'@/views/project/data-source-manage/data-table/table-design/update-record.vue')
const DataSourceDataManage = () => import(/* webpackChunkName: 'DataSource' */'@/views/project/data-source-manage/data-table/data-manage/index.vue')
const DataOperation = () => import(/* webpackChunkName: 'DataSource' */'@/views/project/data-source-manage/data-operation/index.vue')

// 运营统计
const OperationEntry = () => import(/* webpackChunkName: 'operation-stats' */'@/views/system/operation/index.vue')
const OperationStatsUser = () => import(/* webpackChunkName: 'operation-stats' */'@/views/system/operation/stats/user/index.vue')
const OperationStatsProject = () => import(/* webpackChunkName: 'operation-stats' */'@/views/system/operation/stats/project/index.vue')
const OperationStatsFunc = () => import(/* webpackChunkName: 'operation-stats' */'@/views/system/operation/stats/func/index.vue')
const OperationStatsComp = () => import(/* webpackChunkName: 'operation-stats' */'@/views/system/operation/stats/comp/index.vue')

// 流程管理
const FlowManage = () => import(/* webpackChunkName: 'flow' */'@/views/project/flow-manage/index.vue')
const FlowList = () => import(/* webpackChunkName: 'flow' */'@/views/project/flow-manage/list/flow-list.vue')
const FlowArchivedList = () => import(/* webpackChunkName: 'flow' */'@/views/project/flow-manage/list/archived-list.vue')
const FlowEdit = () => import(/* webpackChunkName: 'flow' */'@/views/project/flow-manage/edit/index.vue')
const FlowConfig = () => import(/* webpackChunkName: 'flow' */'@/views/project/flow-manage/edit/flow-config.vue')
const FlowAdvancedConfig = () => import(/* webpackChunkName: 'flow' */'@/views/project/flow-manage/edit/advanced-config.vue')
const CreateTicketPageEdit = () => import(/* webpackChunkName: 'flow' */'@/views/project/flow-manage/create-ticket-page-edit/index.vue')

const routes = [
    {
        path: '/help',
        name: 'help',
        component: MainHelpEntry,
        children: [
            { path: 'custom', name: 'custom', component: Custom },
            { path: 'grid', name: 'grid', component: Grid },
            { path: 'grid', name: '', component: Grid },
            { path: 'layout', name: 'layout-guide', component: LayoutGuide },
            { path: 'intro', name: 'intro', component: Intro, alias: '' },
            { path: 'start', name: 'start', component: Start },
            { path: 'develop', name: 'develop', component: Develop },
            { path: 'case-table-search', name: 'table-search', component: TableSearch },
            { path: 'method', name: 'method', component: Method },
            { path: 'variable', name: 'variable', component: Variable },
            { path: 'directive', name: 'directive', component: Directive },
            { path: 'template-project', name: 'template-project', component: TemplateProject },
            { path: 'template-page', name: 'template-page', component: TemplatePage },
            { path: 'free-layout', name: 'freeLayout', component: FreeLayoutDoc },
            { path: 'interactive', name: 'interactive', component: Interactive },
            { path: 'courses', name: 'courses', component: Courses }
        ]
    },
    {
        path: '/checkHealth',
        component: HealthPage
    },
    {
        path: '/home',
        name: 'home',
        component: Home
    },
    {
        path: '/',
        components: {
            default: SystemEntry,
            permission: require('@/views/status/403').default
        },
        redirect: { name: 'projects' },
        children: [
            {
                path: 'projects',
                name: 'projects',
                component: ProjectManage,
                meta: {
                    title: '我的应用',
                    hideSideNav: true,
                    hideCrumb: true,
                    showFooter: true
                }
            },
            {
                path: 'account',
                name: 'account',
                component: Account,
                meta: {
                    title: '账号管理'
                }
            },
            {
                name: 'marketplace-entry',
                path: '/marketplace',
                component: OperationEntry,
                redirect: { name: 'templateMarket' },
                children: [
                    {
                        path: 'function',
                        name: 'functionMarket',
                        component: functionMarket,
                        meta: {
                            title: '函数市场'
                        }
                    },
                    {
                        path: 'template',
                        name: 'templateMarket',
                        component: templateMarket,
                        meta: {
                            title: '模板市场'
                        }
                    }
                ]
            },
            {
                name: 'op-entry',
                path: '/op',
                component: OperationEntry,
                redirect: { name: 'op-stats-user' },
                children: [
                    {
                        path: 'stats/user',
                        name: 'op-stats-user',
                        component: OperationStatsUser,
                        meta: {
                            title: '用户数据'
                        }
                    },
                    {
                        path: 'stats/project',
                        name: 'op-stats-project',
                        component: OperationStatsProject,
                        meta: {
                            title: '应用数据'
                        }
                    },
                    {
                        path: 'stats/func',
                        name: 'op-stats-func',
                        component: OperationStatsFunc,
                        meta: {
                            title: '函数数据'
                        }
                    },
                    {
                        path: 'stats/comp',
                        name: 'op-stats-comp',
                        component: OperationStatsComp,
                        meta: {
                            title: '自定义组件数据'
                        }
                    }
                ]
            }
        ]
    },
    {
        name: 'project-entry',
        path: '/project/:projectId',
        components: {
            default: ProjectEntry,
            permission: require('@/views/status/non-exist-project').default
        },
        meta: {
            owner: 'projects'
        },
        redirect: { name: 'pageList' },
        children: [
            {
                name: 'page-entry',
                path: 'page/:pageId',
                redirect: { name: 'new' },
                components: {
                    default: MainEntry,
                    permission: require('@/views/status/403').default
                },
                children: [
                    {
                        path: '',
                        name: 'new',
                        component: Index
                    },
                    {
                        path: 'edit',
                        name: 'editNocode',
                        component: EditNocode
                    }
                ]
            },
            {
                path: 'pages',
                name: 'pageList',
                component: PageManage
            },
            {
                path: 'component-manage',
                name: 'componentManage',
                component: ComponentManage,
                meta: {
                    title: '自定义组件管理',
                    helpDocument: '/help/custom'
                }
            },
            {
                path: 'function-manage',
                name: 'functionManage',
                component: FunctionManage,
                meta: {
                    title: '函数管理',
                    helpDocument: '/help/method'
                }
            },
            {
                path: 'template-manage',
                name: 'templateManage',
                component: TemplateManage,
                meta: {
                    title: '页面模板管理',
                    helpDocument: '/help/template-page'
                }
            },
            {
                path: 'variable-manage',
                name: 'variableManage',
                component: VariableManage,
                meta: {
                    title: '变量管理',
                    helpDocument: '/help/variable'
                }
            },
            {
                path: 'manage-api',
                name: 'apiManage',
                component: ApiManage,
                meta: {
                    title: 'API 管理'
                }
            },
            {
                path: 'data-source-manage',
                name: 'dataSourceManage',
                component: DataSourceHome,
                redirect: { name: 'tableList' },
                children: [
                    {
                        path: '',
                        name: 'tableList',
                        component: DataSourceTableList
                    },
                    {
                        path: 'create-table',
                        name: 'createTable',
                        component: DataSourceCreateTable
                    },
                    {
                        path: 'edit-table',
                        name: 'editTable',
                        component: DataSourceEditTable
                    },
                    {
                        path: 'show-table',
                        name: 'showTable',
                        component: DataSourceShowTable
                    },
                    {
                        path: 'update-table-record',
                        name: 'updateTableRecord',
                        component: DataSourceUpdateRecord
                    },
                    {
                        path: 'data-manage',
                        name: 'dataManage',
                        component: DataSourceDataManage
                    },
                    {
                        path: 'data-operation',
                        name: 'dataOperation',
                        component: DataOperation
                    }
                ]
            },
            {
                path: 'layout',
                name: 'layout',
                component: Layout,
                meta: {
                    title: '导航布局管理',
                    helpDocument: '/help/layout'
                }
            },
            {
                path: 'flow',
                component: FlowManage,
                redirect: { name: 'flowList' },
                meta: {
                    title: '流程管理'
                },
                children: [
                    {
                        path: '',
                        name: 'flowList',
                        component: FlowList
                    },
                    {
                        path: 'archived',
                        name: 'flowArchivedList',
                        component: FlowArchivedList
                    },
                    {
                        path: ':flowId', // 流程编辑页
                        name: 'flowEdit',
                        component: FlowEdit,
                        redirect: { name: 'flowConfig' },
                        children: [
                            // 流程设计
                            {
                                path: '',
                                name: 'flowConfig',
                                component: FlowConfig
                            },
                            // 流程设计
                            {
                                path: 'advanced',
                                name: 'flowAdvancedConfig',
                                component: FlowAdvancedConfig
                            }
                        ]
                    },
                    // 流程提单页编辑
                    {
                        path: ':flowId/page/:pageId',
                        name: 'createTicketPageEdit',
                        component: CreateTicketPageEdit
                    }
                ]
            },
            {
                path: 'release',
                name: 'release',
                component: Release,
                meta: {
                    title: '发布部署'
                }
            },
            {
                path: 'routes',
                name: 'routes',
                component: RouterManage,
                meta: {
                    title: '路由配置'
                }
            },
            {
                path: 'versions',
                name: 'versions',
                component: VersionManage,
                meta: {
                    title: '版本管理'
                }
            },
            {
                path: 'file-manage',
                name: 'fileManage',
                component: FileManage,
                meta: {
                    title: '文件管理'
                }
            },
            {
                path: 'member-manage',
                name: 'memberManage',
                component: MemberManage,
                meta: {
                    title: '成员管理'
                }
            },
            {
                path: 'basic',
                name: 'basicInfo',
                component: Basic,
                meta: {
                    title: '基本信息'
                }
            },
            {
                path: 'logs',
                name: 'logs',
                component: Logs,
                meta: {
                    title: '操作审计'
                }
            },
            {
                path: 'auth-manage',
                name: 'authManage',
                component: AuthManage,
                meta: {
                    title: '应用管理权限'
                }
            },
            {
                path: 'app-perm-model',
                name: 'appPermModel',
                component: AppPermModel,
                meta: {
                    title: '应用权限模型'
                }
            }
        ]
    },
    {
        path: '/preview-template/project/:projectId/:templateId',
        name: 'previewTemplate',
        component: PreviewTemplate,
        meta: {
            title: '模板预览'
        }
    },
    {
        path: '/preview-mobile/project/:projectId',
        name: 'previewMobile',
        component: PreviewMobile,
        meta: {
            title: '移动端预览'
        }
    },
    {
        path: '*',
        name: '404',
        component: NotFound
    }
]
const router = new VueRouter({
    mode: 'history',
    routes: routes
})

const checkViewAuth = async (to) => {
    const topRoute = to.matched[0]
    let hasPermission = true

    if (to.matched[1]) {
        const routeName = to.matched[1].name
        let authedRet
        if (routeName === 'op-entry' || routeName === 'pm-entry') {
            authedRet = await store.dispatch('checkIamNoResourcesPerm')
            hasPermission = authedRet[routeName === 'op-entry' ? IAM_ACTION.view_operation_data[0] : IAM_ACTION.manage_platform[0]]
        }
    }

    if (hasPermission) {
        Vue.set(topRoute.meta, 'view', 'default')
    } else {
        Vue.set(topRoute.meta, 'view', 'permission')
    }

    return Promise.resolve()
}

let preloading = true
let pageMethodExecuting = true

// 设置左侧菜单默认展开收起
const setAsideFold = (toName = '', fromName = '') => {
    console.log(toName, fromName, 'route')
    // 两个画布页面、流程子页面需要自动收起菜单
    const foldAsideList = FOLD_MENU_ROUTE_LIST
    if (foldAsideList.indexOf(toName) !== -1) {
        bus.$emit('is-fold-aside', { isFold: true, showMenuFooter: false })
    } else if (foldAsideList.indexOf(fromName) > -1) {
        bus.$emit('is-fold-aside', { isFold: false, showMenuFooter: true })
    }
}

router.beforeEach(async (to, from, next) => {
    try {
        Vue.set(to.meta, 'authed', false)
        await checkViewAuth(to)
        Vue.set(to.meta, 'authed', true)
        setAsideFold(to.name, from.name)
        next()
    } catch (e) {
        console.error(e)
    }
})

router.afterEach(async (to, from) => {
    if (to.path === from.path) {
        return
    }
    store.commit('setMainContentLoading', true)

    preloading = true
    await preload()
    preloading = false

    const pageDataMethods = []
    const routerList = to.matched
    routerList.forEach(r => {
        const fetchPageData = r.instances.default && r.instances.default.fetchPageData
        if (fetchPageData && typeof fetchPageData === 'function') {
            pageDataMethods.push(r.instances.default.fetchPageData())
        }
    })

    pageMethodExecuting = true
    await Promise.all(pageDataMethods)
    pageMethodExecuting = false

    if (!preloading && !pageMethodExecuting) {
        store.commit('setMainContentLoading', false)
    }
})

const routerPush = router.push
const routerReplace = router.replace

// url 路由切换时
// 检测页面数据的编辑状态——弹出确认框提示用户确认
router.push = (params, callback = () => {}) => {
    // 检测当前路由自定义离开确认交互
    leaveConfirm()
        .then(() => {
            routerPush.call(router, params)
        }, () => {
            callback()
        })
}
// url 路由切换时
// 检测页面数据的编辑状态——弹出确认框提示用户确认
router.replace = (params, callback = () => {}) => {
    // 检测当前路由自定义离开确认交互
    leaveConfirm().then(() => {
        routerReplace.call(router, params)
    }, () => {
        callback()
    })
}
// 浏览器路由回退时
router.afterEach(() => {
})

export const useRouter = () => router

export const useRoute = () => router.currentRoute

export default router
