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
import VueCodeModel from './vue-code'
import routeModel from './route'
// import PageCodeModel from './page-code'
import getPageCode from '../../shared/page-code'
import ProjectModel from './project'
import { getAllGroupAndFunction } from '../service/business/function'
import { getFormList } from '../service/business/nocode-form'
import PageModel from './page'
import VariableModel from './variable'
import * as PageCompModel from './page-comp'
import { uuid } from '../util'
import { LCDataService, TABLE_FILE_NAME } from '../service/common/data-service'
import { RequestContext } from '../middleware/request-context'
import {
    BASE_COLUMNS
} from '../../shared/data-source'
import iamAppPermModel from './iam-app-perm'
import { IAM_APP_PERM_BUILDIN_ACTION } from '../../shared/constant.js'
import { IAM_SAAS_HOST, IAM_HOST, IAM_APP_ID, IAM_APP_SECRET } from '../conf/iam'

const httpConf = require('../conf/http')
// npm.js配置文件不存在时赋值空对象
let npmConf
try {
    npmConf = require('../conf/npm')
} catch (_) {
    npmConf = {}
}

const fs = require('fs')
const path = require('path')
const fse = require('fs-extra')

const DIR_PATH = '.'

const SHARE_PATH = `${DIR_PATH}/lib/shared/`

const STATIC_URL = `${DIR_PATH}/lib/server/project-template/`

const projectCode = {

    async previewCode (projectId, versionId, platform = 'PC') {
        // 获取预览相关的数据
        const [
            allRouteList,
            allPageRouteList,
            funcGroups = [],
            allVarableList = [],
            deletePages = [],
            {
                list: apiList
            }
        ] = await Promise.all([
            routeModel.findProjectRoute(projectId, versionId),
            routeModel.queryProjectPageRoute(projectId, versionId),
            getAllGroupAndFunction(projectId, versionId),
            VariableModel.getAll({ projectId, versionId }),
            PageModel.getDeletePageCodes(projectId, versionId),
            LCDataService.get({
                tableFileName: TABLE_FILE_NAME.API,
                query: {
                    projectId,
                    versionId
                }
            })
        ])
        const deletePageCodes = (deletePages || []).map(item => item.pageCode)

        // const routeList = allRouteList.filter(route => route.platform === platform)
        // const pageRouteList = allPageRouteList.filter(page => (page.pageType === platform || (!page.pageType && platform === 'PC')))
        // 根路由允许绑定移动端路由后需要所有的路由数据不能过滤
        const routeList = allRouteList
        const pageRouteList = allPageRouteList

        const routeGroup = {}
        for (const route of routeList) {
            // 允许pageId === -1，表示未绑定页面但绑定了路由，两者都未绑定则过虑
            if (route.pageId === -1 && !route.redirect) {
                continue
            }

            if (route.redirect) {
                const { id, pageCode, path, layoutPath } = routeList.find(item => item.id === route.redirect) || {}
                route.redirectRoute = { id, pageCode, path, layoutPath }
            }

            const layoutId = route.layoutId
            const curRoute = routeGroup[layoutId]
            if (curRoute) {
                curRoute.children.push(route)
            } else {
                routeGroup[layoutId] = {
                    children: [route],
                    content: JSON.parse(route.layoutContent || '{}'),
                    layoutType: route.layoutType,
                    path: route.layoutPath,
                    name: route.layoutCode || 'emptyView'
                }
            }
        }

        const projectVariables = allVarableList.filter(variable => variable.effectiveRange === 0)
        const layoutIns = Object.values(routeGroup)
        for (const layout of layoutIns) {
            // 父路由（布局）内容
            const pageDetail = await getPageCode({
                targetData: [],
                pageType: 'preview',
                funcGroups,
                lifeCycle: {},
                projectId,
                pageId: '',
                deletePageCodes,
                layoutContent: layout.content,
                isGenerateNav: true,
                isEmpty: false,
                layoutType: layout.layoutType,
                variableList: [],
                styleSetting: {},
                user: RequestContext.getCurrentUser(),
                npmConf,
                origin: RequestContext.getCurrentCtx().origin,
                apiList,
                platform,
                isRenderAppPermComponents: false
            })
            layout.content = pageDetail.code

            // 子路由（页面）内容，先排除未绑定页面的路由
            const routeList = layout.children.filter(route => route.pageId !== -1)
            await Promise.all(routeList.map(async route => {
                // 生成views部分
                const variableData = [
                    ...projectVariables,
                    ...allVarableList.filter((variable) => (variable.effectiveRange === 1 && variable.pageCode === route.pageCode))
                ]
                // 流程提单页注入当前流程部署状态字段
                if (route.flowId && route.nocodeType === 'FLOW') {
                    const flowDetail = await LCDataService.findOne(
                        TABLE_FILE_NAME.FLOW,
                        {
                            id: route.flowId
                        }
                    )
                    route.flowDeployed = !!flowDetail.deployed
                }
                const pageDetail = await getPageCode({
                    targetData: JSON.parse(route.content || '[]'),
                    pageType: 'preview',
                    nocodeType: route.nocodeType || '',
                    nocodePayload: this.getNocodePayload(route, 'preview'),
                    funcGroups,
                    lifeCycle: route.lifeCycle || {},
                    projectId,
                    pageId: route.pageId,
                    layoutContent: '',
                    isGenerateNav: false,
                    isEmpty: false,
                    layoutType: route.layoutType,
                    variableList: variableData,
                    styleSetting: route.styleSetting || {},
                    user: RequestContext.getCurrentUser(),
                    npmConf,
                    origin: RequestContext.getCurrentCtx().origin,
                    apiList,
                    platform: route.platform,
                    isRenderAppPermComponents: false
                })
                // 生成代码校验
                if (pageDetail.codeErrMessage) {
                    route.isError = true
                    route.content = ''
                    route.meta = {
                        message: `页面【${route.pageCode}】里面，${pageDetail.codeErrMessage}。请修复后刷新页面再试`
                    }
                } else {
                    route.content = pageDetail.code
                }
            }))
        }

        // 生成store
        const storeData = []
        projectVariables.forEach(({ variableCode, valueType, defaultValue, defaultValueType }) => {
            if ([3, 4].includes(valueType)) {
                // eslint-disable-next-line no-return-assign
                ['all', 'prod', 'stag'].forEach((key) => defaultValue[key] = JSON.parse(defaultValue[key]))
            }
            storeData.push({ variableCode, defaultValue, defaultValueType })
        })

        return { routeGroup, storeData, pageRouteList }
    },

    async generateCode (projectId, versionId, pathName) {
        const sourcePath = STATIC_URL + 'project-init-code'
        const targetPath = STATIC_URL + (pathName || `project-target-code${projectId}${versionId ? `-${versionId}` : ''}`)

        return new Promise(async (resolve, reject) => {
            try {
                fse.copySync(sourcePath, targetPath)

                const [
                    routeList,
                    pageRouteList,
                    funcGroups = [],
                    allVarableList = [],
                    deletePages = [],
                    { list: dataTables = [] },
                    { list: dataTableModifyRecords = [] },
                    { list: apiList = [] },
                    formList = [],
                    projectInfo,
                    { list: flowList },
                    iamAppPermActionList = [],
                    iamAppPerm = {}
                ] = await Promise.all([
                    routeModel.findProjectRoute(projectId, versionId),
                    routeModel.queryProjectPageRoute(projectId, versionId),
                    getAllGroupAndFunction(projectId, versionId),
                    VariableModel.getAll({ projectId, versionId }),
                    PageModel.getDeletePageCodes(projectId, versionId),
                    LCDataService.get({
                        tableFileName: TABLE_FILE_NAME.DATA_TABLE,
                        query: { projectId, deleteFlag: 0 }
                    }),
                    LCDataService.get({
                        tableFileName: TABLE_FILE_NAME.DATA_TABLE_MODIFY_RECORD,
                        query: {
                            projectId
                        },
                        order: {
                            createTime: 'DESC'
                        }
                    }),
                    LCDataService.get({
                        tableFileName: TABLE_FILE_NAME.API,
                        query: {
                            projectId,
                            versionId
                        }
                    }),
                    getFormList(projectId, versionId),
                    LCDataService.findOne(
                        TABLE_FILE_NAME.PROJECT,
                        {
                            id: projectId
                        }
                    ),
                    LCDataService.get({
                        tableFileName: TABLE_FILE_NAME.FLOW,
                        query: {
                            projectId
                        }
                    }),
                    iamAppPermModel.getIamAppPermActions(projectId),
                    iamAppPermModel.getIamAppPerm(projectId)
                ])

                const deletePageCodes = (deletePages || []).map(item => item.pageCode)
                const routeGroup = {}
                const routeMap = {}

                const isUseElement = true
                let hasMobilePage = false
                let hasBkvision = false
                routeList.forEach((route) => {
                    routeMap[route.pageCode] = route.pageId

                    // 有一个页面是移动端，则要引入Vant-ui
                    if (!hasMobilePage) {
                        hasMobilePage = route.platform === 'MOBILE'
                    }

                    // 有一个页面是使用了bkVision，则要生成网关
                    if (!hasBkvision) {
                        hasBkvision = route.content?.indexOf('widget-bk-vision') > 0
                    }
                })

                for (const route of routeList) {
                    // 允许pageId === -1，表示未绑定页面但绑定了路由，两者都未绑定则过虑
                    if (route.pageId === -1 && !route.redirect) {
                        continue
                    }

                    if (route.redirect) {
                        const { id, pageCode, path, layoutPath } = routeList.find(item => item.id === route.redirect) || {}
                        route.redirectRoute = { id, pageCode, path, layoutPath }
                    }

                    const layoutId = route.layoutId
                    const curRoute = routeGroup[layoutId]
                    if (curRoute) {
                        curRoute.children.push(route)
                    } else {
                        routeGroup[layoutId] = {
                            children: [route],
                            content: JSON.parse(route.layoutContent || '{}'),
                            layoutType: route.layoutType,
                            path: route.layoutPath,
                            name: route.layoutCode || 'emptyView'
                        }
                    }
                }

                let routerImport = ''
                let routerStr = ''
                let defaultRouteRedirect = 'redirect: { name: \'404\' }'

                // 获取生成view文件所需的数据
                const projectVariables = allVarableList.filter(variable => variable.effectiveRange === 0)
                let usedMethodList = []
                const layoutIns = Object.values(routeGroup)
                const uniqStr = uuid()

                const iamAppPermBuildinActionRelatedResourceId = ((iamAppPermActionList.find(
                    item => item.actionId === IAM_APP_PERM_BUILDIN_ACTION
                ) || {}).actionRelatedResourceId) || []

                for (const layout of layoutIns) {
                    const routeList = layout.children
                    const layoutName = layout.name.replace(/-(\w)/g, (a, b) => b.toUpperCase()) + uniqStr
                    routerImport += `const ${layoutName} = () => import(/* webpackChunkName: '${layout.name}' */'@/views/${layout.name}/bkindex')\n`

                    // 布局下的第一个子路由，用于默认跳转
                    let firstChildRouteName = ''

                    // 预览路由优化使用path跳转（防止因name不存在自动跳到首页），生成代码使用name跳转，因导航菜单中已经使用name跳转
                    const childRoute = routeList.map((route) => {
                        const pagePlatform = route.pagePlatform === 'MOBILE' ? route.pagePlatform : 'PC'

                        const iamAppPermNeedAuth = iamAppPermBuildinActionRelatedResourceId.indexOf(route.pageId) > -1
                        const iamAppPermMetaStr = `pageId: '${route.pageId}', pageCode: '${route.pageCode}', needAuth: ${iamAppPermNeedAuth}`
                        const meta = `meta: { pageName: '${route.pageName}', platform: '${pagePlatform}', ${iamAppPermMetaStr} }`
                        if (route.redirectRoute) {
                            const { layoutPath, path } = route.redirectRoute
                            const fullPath = `${layoutPath}${layoutPath?.endsWith('/') ? '' : '/'}${path}`
                            const routeName = route.pageCode || `${fullPath.replace(/[\/\-\:]/g, '')}${route.id}`
                            const routeComponent = route.pageCode ? ` component: ${route.pageCode},` : ''
                            if (!firstChildRouteName) {
                                firstChildRouteName = routeName
                            }
                            return `{ path: '${route.path}', name: '${routeName}',${routeComponent} redirect: { path: '${fullPath}' }, ${meta} }`
                        } else if (route.pageId !== -1) {
                            if (!firstChildRouteName) {
                                firstChildRouteName = route.pageCode
                            }
                            return `{ path: '${route.path}', name: '${route.pageCode}', component: ${route.pageCode}, ${meta} }`
                        } else {
                            return `{ path: '${route.path}', redirect: { name: '404' } }`
                        }
                    })
                    if (layout.path !== '/') childRoute.push('{ path: \'*\', component: BkNotFound, meta: { pageName: \'404\' } }')

                    const currentFilePath = path.join(targetPath, `lib/client/src/views/${layout.name}/bkindex.vue`)
                    // 生成父路由view文件
                    await this.writeViewCode({
                        currentFilePath,
                        pathName,
                        targetData: [],
                        funcGroups,
                        pageCode: '',
                        projectId,
                        lifeCycle: {},
                        pageId: '',
                        deletePageCodes,
                        layoutContent: layout.content,
                        isGenerateNav: true,
                        layoutType: layout.layoutType,
                        variableData: [],
                        styleSetting: {},
                        apiList
                    })
                    // layout.path需要去掉开头的/
                    routerStr += `{
                        path: '${(layout.path?.startsWith('/') ? layout.path.substr(1) : layout.path).replace(/^\//, '')}',
                        name: '${layout.name + uniqStr}',
                        component: ${layoutName},
                        redirect: ${firstChildRouteName ? `{ name: '${firstChildRouteName}' }` : ''},
                        children: [
                            ${childRoute.join(',\n')}
                        ]
                    },\n`

                    // 绑定了路由的页面才需要生成内容
                    const usePageRouteList = layout.children.filter(route => route.pageId !== -1)
                    await Promise.all(usePageRouteList.map(async route => {
                        // 生成router部分
                        routerImport += `const ${route.pageCode} = () => import(/* webpackChunkName: '${route.pageCode}' */'@/views/${layout.name}/${route.pageCode}.vue')\n`
                        // 生成views部分
                        const pageId = route.pageId
                        const currentFilePath = path.join(targetPath, `lib/client/src/views/${layout.name}/${route.pageCode}.vue`)
                        const variableData = [
                            ...projectVariables,
                            ...allVarableList.filter((variable) => (variable.effectiveRange === 1 && variable.pageCode === route.pageCode))
                        ]
                        // 生成具体页面view文件
                        const methodStrList = await this.writeViewCode({
                            currentFilePath,
                            targetData: JSON.parse(route.content || '[]'),
                            funcGroups,
                            pageCode: route.pageCode,
                            pathName,
                            projectId,
                            lifeCycle: route.lifeCycle,
                            pageId,
                            layoutContent: '',
                            isGenerateNav: false,
                            layoutType: route.layoutType,
                            variableData,
                            styleSetting: route.styleSetting,
                            apiList,
                            nocodeType: route.nocodeType,
                            nocodePayload: this.getNocodePayload(route)
                        }) || []

                        usedMethodList = [...usedMethodList, ...methodStrList]
                    }))
                }

                // 写入pageage.json
                const packageJsonArr = await PageCompModel.getProjectComp(projectId, versionId)
                await this.writePackageJSON(
                    path.join(targetPath, 'package.json'),
                    packageJsonArr
                )

                // 生成函数mixin
                const methodsMixinPath = path.join(targetPath, 'lib/client/src/mixins/methods-mixin.js')
                if (usedMethodList.length) await this.writeMethodsMixin(methodsMixinPath, usedMethodList, pathName)

                // 生成.npmrc文件内容
                if (npmConf.registry) {
                    const npmrcContent = `${npmConf.scopename}:registry=${npmConf.registry}`
                    fs.writeFileSync(path.join(targetPath, '.npmrc'), npmrcContent, 'utf8')
                }

                // 生成formMap文件
                const formMapPath = path.join(targetPath, 'lib/shared/form/index.js')
                await this.writeFormMap(formMapPath, formList)

                // 生成router
                pageRouteList.forEach(route => {
                    // 未绑定路由的页面跳转到404
                    if (!route.id) {
                        routerStr += `{
                            path: '${route.pageCode}404',
                            name: '${route.pageCode}',
                            redirect: { name: '404' }
                        },\n`
                    }
                })
                if (routerStr?.endsWith(',\n')) {
                    routerStr = routerStr.substr(0, routerStr.length - 2)
                }

                // 寻找默认首页
                const availableRoutList = routeList.filter(item => !(item.pageId === -1 && !item.redirect))
                    .map(({ id, layoutPath, path, pageCode, redirectRoute }) => ({ id, layoutPath, path, pageCode, redirectRoute }))
                let defaultHomeRoute = availableRoutList.find(({ layoutPath, path }) => layoutPath === '/' && path === '')
                if (!defaultHomeRoute) {
                    defaultHomeRoute = pageRouteList.find(item => item.layoutPath === '/' && item.id)
                }
                // 任意layoutPath但path为空的路由，通常是第1个布局模板的根路由
                const firstRootRoute = availableRoutList.find(({ path }) => path === '')

                const defaultRoute = defaultHomeRoute || (firstRootRoute || availableRoutList[0])
                if (defaultRoute) {
                    const { id, layoutPath, path, pageCode, redirectRoute } = defaultRoute
                    let fullPath = `${layoutPath}${layoutPath?.endsWith('/') ? '' : '/'}${path}`
                    if (redirectRoute) {
                        fullPath = `${redirectRoute.layoutPath}${redirectRoute.layoutPath?.endsWith('/') ? '' : '/'}${redirectRoute.path}`
                    }
                    // 跳转路由可能没有pageCode，使用跳转路径作为name，同时跳转路径可能会重复加上路由id防止
                    const redirectRouteName = pageCode || `${fullPath.replace(/[\/\-\:]/g, '')}${id}`
                    defaultRouteRedirect = `redirect: { name: '${redirectRouteName}' }`
                }

                const routeSourcePath = path.join(STATIC_URL, 'router-template.js')
                const routeTargetPath = path.join(targetPath, 'lib/client/src/router/index.js')
                await this.generateFileByReplace(routeSourcePath, routeTargetPath, (content) => {
                    return content.replace(/\$\{importStr\}/, routerImport)
                        .replace(/\$\{routerStr\}/, routerStr)
                        .replace(/\$\{defaultRedirect\}/, defaultRouteRedirect)
                })

                // 生成store
                const storeStr = projectVariables.length ? [] : ['example: getInitVariableValue({all: 0, stag: 0, prod: 0}, 0)']
                projectVariables.forEach(({ variableCode, defaultValue, valueType, defaultValueType }) => {
                    if ([3, 4].includes(valueType)) {
                        // eslint-disable-next-line no-return-assign
                        ['all', 'prod', 'stag'].forEach((key) => defaultValue[key] = JSON.parse(defaultValue[key]))
                    }
                    storeStr.push(`${variableCode}: getInitVariableValue(${JSON.stringify(defaultValue)}, ${defaultValueType})`)
                })
                const variablePath = path.join(targetPath, 'lib/client/src/store/modules/variable.js')
                await this.generateFileByReplace(variablePath, variablePath, (content) => {
                    return content.replace(/\$\{stateStr\}/, storeStr.join(',\n'))
                })

                /**
                 * 对element、vant处理
                 */
                const mainFilePath = path.join(targetPath, 'lib/client/src/main.js')
                const remJS = fs.readFileSync(path.join(SHARE_PATH, 'rem.js'), 'utf8')
                let mainFileContent = fs.readFileSync(mainFilePath, 'utf8')

                if (isUseElement) {
                    mainFileContent = mainFileContent.replace(/\$\{importElementLib\}/, 'import \'@/common/element\'')
                    await this.writePackageJSON(
                        path.join(targetPath, 'package.json'),
                        [{ name: 'element-ui', version: 'latest' }]
                    )
                } else {
                    mainFileContent = mainFileContent.replace(/\$\{importElementLib\}/, '')
                    fs.unlinkSync(path.join(targetPath, 'lib/client/src/common/element.js'))
                }

                if (hasMobilePage) {
                    mainFileContent = mainFileContent.replace(/\$\{importVantLib\}/, 'import \'@/components/patch/vant-widget/index.js\'')
                    mainFileContent = mainFileContent.replace(/\$\{remJs\}/, remJS)
                    await this.writePackageJSON(
                        path.join(targetPath, 'package.json'),
                        [
                            { name: 'vant', version: 'latest-v2' },
                            { name: 'moment', version: '2.29.4' }
                        ]
                    )
                } else {
                    mainFileContent = mainFileContent.replace(/\$\{importVantLib\}/, '')
                    mainFileContent = mainFileContent.replace(/\$\{remJs\}/, '')
                    fs.unlinkSync(path.join(targetPath, 'lib/client/src/common/vant.js'))
                }

                fs.writeFileSync(
                    mainFilePath,
                    mainFileContent,
                    'utf8'
                )

                await this.writePackageJSON(
                    path.join(targetPath, 'package.json'),
                    [],
                    projectId
                )

                const isGenerateApigw = flowList.length > 0 || hasBkvision
                await this.generateDataSource(dataTables, dataTableModifyRecords, targetPath, isGenerateApigw)
                await this.generateFileByReplace(
                    path.join(targetPath, 'lib/server/service/form.js'),
                    path.join(targetPath, 'lib/server/service/form.js'),
                    (content) => {
                        const user = RequestContext.getCurrentUser()
                        return content.replace(/\$\{apiName\}/, `lesscode-${projectId}${projectInfo.projectCode}`.slice(0, 30)).replace(/\$\{user\}/, user.username)
                    }
                )
                await this.generateFileByReplace(
                    path.join(targetPath, 'lib/server/conf/apigw.js'),
                    path.join(targetPath, 'lib/server/conf/apigw.js'),
                    (content) => {
                        return content.replace(/\$\{stageName\}/, httpConf.stageName)
                    }
                )
                await this.generateFileByReplace(
                    path.join(targetPath, 'lib/shared/data-source/constant.js'),
                    path.join(targetPath, 'lib/shared/data-source/constant.js'),
                    (content) => {
                        return content.replace(/\$\{tableList\}/, JSON.stringify(dataTables))
                    }
                )

                // 部署到权限中心后，下载的项目源码才会写入权限中心相关的配置
                // 应用权限模型，权限中心的配置
                await this.generateFileByReplace(
                    path.join(targetPath, 'lib/server/conf/iam.js'),
                    path.join(targetPath, 'lib/server/conf/iam.js'),
                    (content) => {
                        return content.replace(/\$\{iamSaasHost\}/g, iamAppPerm.deployed === 1 ? IAM_SAAS_HOST : '')
                            .replace(/\$\{iamHost\}/g, iamAppPerm.deployed === 1 ? IAM_HOST : '')
                            .replace(/\$\{iamAppId\}/g, iamAppPerm.deployed === 1 ? IAM_APP_ID : '')
                            .replace(/\$\{iamAppSecret\}/g, iamAppPerm.deployed === 1 ? IAM_APP_SECRET : '')
                            .replace(/\$\{iamSystemId\}/g, iamAppPerm.deployed === 1 ? iamAppPerm.systemId : '')
                    }
                )

                resolve('success')
            } catch (err) {
                reject(err.message || err)
            }
        })
    },

    async generateDataSource (dataTables = [], dataTableModifyRecords = [], targetPath = '', isGenerateApigw = false) {
        const hasDataTable = dataTables.length > 0

        // replace app.browser.js
        const appPath = path.join(targetPath, 'lib/server/app.browser.js')
        await this.generateFileByReplace(appPath, appPath, (content) => {
            const dbImport = hasDataTable ? 'const { createConnection } = require(\'typeorm\')\r\nconst dataBaseConf = require(\'./conf/data-base\')\r\n' : ''
            const startStr = hasDataTable ? 'createConnection(dataBaseConf).then((connection) => {\r\n    return startServer()\r\n}).catch((err) => logger.error(err.message || err))\r\n' : 'startServer()'
            return content
                .replace(/\$\{dbImport\}/, dbImport)
                .replace(/\$\{startStr\}/, startStr)
                .replace(
                    /\$\{gwImport\}/,
                    isGenerateApigw ? 'const { grantApiGWPermissionForApps } = require(\'./service/form\')' : ''
                )
                .replace(
                    /\$\{grantApiGWPermissionForApps\}/,
                    isGenerateApigw ? 'await grantApiGWPermissionForApps()' : ''
                )
        })

        if (hasDataTable) {
            // generate data-base-config
            await this.generateFileByReplace(
                path.join(STATIC_URL, 'data-base-template.js'),
                path.join(targetPath, 'lib/server/conf/data-base.js')
            )

            // generate model & entity
            for (const dataTable of dataTables) {
                const { tableName, columns = '[]' } = dataTable
                const tableFields = JSON.parse(columns).reduce((acc, cur) => {
                    if (BASE_COLUMNS.every(item => item.name !== cur.name)) {
                        let columnPropStr = `name: '${cur.name}', type: '${cur.type}'`
                        if (cur.type === 'varchar') columnPropStr += `, length: ${cur.length}`
                        if (cur.type === 'decimal') columnPropStr += `, precision: ${cur.length}, scale: ${cur.scale}`
                        acc += `\r\n    @Column({ ${columnPropStr} })\r\n    '${cur.name}'\r\n`
                    }
                    return acc
                }, '')
                const importColumnStr = tableFields ? ', Column' : ''
                await this.generateFileByReplace(
                    path.join(STATIC_URL, 'entity-template.js'),
                    path.join(targetPath, `lib/server/model/entities/${tableName}.js`),
                    content => content.replace(/\$\{importColumnStr\}/, importColumnStr).replace(/\$\{tableName\}/, tableName).replace(/\$\{tableFields\}/, tableFields)
                )
            }
        }

        if (dataTableModifyRecords.length) {
            // generate migrations
            fse.ensureDirSync(path.join(targetPath, 'lib/server/model/migrations'))
            fse.ensureDirSync(path.join(targetPath, 'lib/server/model/migrations/sql'))
            for (const record of dataTableModifyRecords) {
                const { sql, createTime } = record
                const migrationName = `Lesscode${+createTime}`
                const fileName = `${+createTime}-lesscode`
                fs.writeFileSync(
                    path.join(targetPath, `lib/server/model/migrations/sql/${fileName}.sql`),
                    sql,
                    'utf8'
                )
                await this.generateFileByReplace(
                    path.join(STATIC_URL, 'data-migration-template.js'),
                    path.join(targetPath, `lib/server/model/migrations/${fileName}.js`),
                    content => content.replace(/\$\{migrationName\}/, migrationName).replace(/\$\{fileName\}/, fileName)
                )
            }
        }
    },

    async generateFileByReplace (sourcePath, targetPath, replaceCallBack = str => str) {
        const fileConent = fs.readFileSync(sourcePath, 'utf8')
        const newFileContent = replaceCallBack(fileConent)
        const [message, fileStr] = await VueCodeModel.formatJsByEslint(newFileContent)
        if (message) throw new Error(message)
        fs.writeFileSync(targetPath, fileStr, 'utf8')
    },

    // 将form表数据写入到配置文件
    async writeFormMap (formMapPath, formList = []) {
        return new Promise(async (resolve, reject) => {
            let formStr = 'export const formMap = {\n'
            const arr = []
            formList.forEach(({ id, content, tableName }) => {
                arr.push(`'${id}': {
                    'tableName': '${tableName}',
                    'content': ${content}
                }`)
            })
            formStr += arr.join(',\n')
            formStr += '}'
            const [message, fileStr] = await VueCodeModel.formatJsByEslint(formStr)
            if (message) throw new Error(message)
            fse.ensureFile(formMapPath).then(() => {
                fs.writeFileSync(formMapPath, fileStr, 'utf8')
                resolve()
            }).catch(err => {
                reject(err)
            })
        })
    },

    async writeMethodsMixin (methodsMixinPath, usedMethodList, pathName) {
        let methodsStr = `
            export default {
                methods: {
        `
        // 去重
        const methodMap = {}
        usedMethodList.forEach(({ id, funcStr }) => {
            const curStr = methodMap[id]
            if (!curStr) {
                methodMap[id] = funcStr
            } else {
                const hasUnknowCode = /lesscode((\[\'\$\{prop:([\S]+)\}\'\])|(\[\'\$\{func:([\S]+)\}\'\]))/.test(curStr)
                if (hasUnknowCode) {
                    methodMap[id] = funcStr
                }
            }
        })
        const mixinsList = Object.keys(methodMap).map((id) => (methodMap[id]))
        methodsStr += `${mixinsList.join(',')}\n}\n}`
        const [errMessage, formatedMethodStr] = await VueCodeModel.formatJsByEslint(methodsStr) || ''
        if (errMessage && !pathName) {
            throw new global.BusinessError(errMessage, 499)
        }
        fs.writeFileSync(methodsMixinPath, formatedMethodStr, 'utf8')
    },

    writePackageJSON (packageJsonFilePath, deps, projectId = 0) {
        return new Promise(async (resolve, reject) => {
            fse.ensureFile(packageJsonFilePath).then(async () => {
                const str = await fs.readFileSync(packageJsonFilePath, 'utf8')
                const ret = JSON.parse(str)
                const dependencies = ret.dependencies
                deps.forEach(item => {
                    dependencies[item.name] = item.version
                })

                if (projectId > 0) {
                    const project = await ProjectModel.findProjectDetail({ id: projectId })
                    // 将信息带到build命令的package.json的env中
                    Object.assign(ret.betterScripts.dev.env, {
                        BK_LOGIN_URL: httpConf.loginUrl,
                        BKPAAS_APP_ID: httpConf.appCode,
                        BKPAAS_APP_SECRET: httpConf.appSecret,
                        BK_COMPONENT_API_URL: httpConf.hostUrl,
                        BK_ITSM_URL: process.env.BK_ITSM_URL,
                        BK_USER_MANAGE_URL: httpConf.userManageUrl,
                        BKPAAS_ENGINE_REGION: global.AUTH_NAME === 'bk_ticket' ? 'ieod' : 'default',
                        BK_API_URL_TMPL: httpConf.apiGateWayUrlTmpl || '',
                        BK_PROJECT_ID: projectId, // 应用在lesscode的id
                        BK_PROJECT_CODE: project?.projectCode
                    })
                    Object.assign(ret.betterScripts.build.env, {
                        BK_LOGIN_URL: httpConf.loginUrl,
                        BKPAAS_APP_ID: httpConf.appCode,
                        BKPAAS_APP_SECRET: httpConf.appSecret,
                        BK_COMPONENT_API_URL: httpConf.hostUrl,
                        BK_ITSM_URL: process.env.BK_ITSM_URL,
                        BK_USER_MANAGE_URL: httpConf.userManageUrl,
                        BKPAAS_ENGINE_REGION: global.AUTH_NAME === 'bk_ticket' ? 'ieod' : 'default',
                        BK_API_URL_TMPL: httpConf.apiGateWayUrlTmpl || '',
                        BK_PROJECT_ID: projectId, // 应用在lesscode的id
                        BK_PROJECT_CODE: project?.projectCode
                    })
                }

                await fs.writeFileSync(packageJsonFilePath, JSON.stringify(ret, null, 2), 'utf8')
                resolve()
            }).catch(err => {
                reject(err)
            })
        })
    },

    writeViewCode ({ currentFilePath, pathName, pageCode, targetData, funcGroups, lifeCycle, projectId, pageId, deletePageCodes, layoutContent, isGenerateNav, layoutType, variableData, styleSetting, apiList, nocodeType = '', nocodePayload }) {
        return new Promise(async (resolve, reject) => {
            fse.ensureFile(currentFilePath).then(async () => {
                let code = ''
                let methodStrList = []
                const pageDetail = await getPageCode({
                    targetData: targetData,
                    pageType: 'projectCode',
                    funcGroups: funcGroups,
                    nocodeType,
                    nocodePayload: nocodePayload || {},
                    lifeCycle: lifeCycle || {},
                    projectId,
                    pageId,
                    deletePageCodes,
                    layoutContent,
                    isGenerateNav,
                    isEmpty: false,
                    layoutType,
                    variableList: variableData,
                    styleSetting,
                    user: RequestContext.getCurrentUser(),
                    npmConf,
                    origin: RequestContext.getCurrentCtx().origin,
                    apiList
                })
                code = await VueCodeModel.formatCode(pageDetail.code)
                methodStrList = pageDetail.methodStrList
                // 生成代码校验
                if (pageDetail.codeErrMessage && !pathName) {
                    throw new Error(`页面【${pageCode}】里面，${pageDetail.codeErrMessage}`)
                }
                fs.writeFileSync(currentFilePath, code, 'utf8')
                resolve(methodStrList)
            }).catch(err => {
                reject(err)
            })
        })
    },

    // 如果为nocodeType类型，所需的数据放到nocodePayload属性
    getNocodePayload (route = {}, codeType) {
        const nocodePayload = {}

        let versionMap = {}
        if (codeType !== 'preview') {
            versionMap = global.FLOW_VERSION_MAP || {}
        }

        if (route.nocodeType) {
            if (['FORM', 'FLOW'].includes(route.nocodeType)) {
                Object.assign(nocodePayload, { formId: route.formId, tableName: route.tableName, fields: JSON.parse(route.formContent || '[]'), serviceId: route.flowServiceId, flowDeployed: route.flowDeployed, versionId: versionMap[route.flowServiceId] || 0 })
            } else if (route.nocodeType === 'FORM_MANAGE') {
                Object.assign(nocodePayload, { tableName: route.tableName, config: JSON.parse(route.content || '{}'), formIds: route.formId })
            } else if (route.nocodeType === 'FLOW_MANAGE') {
                Object.assign(nocodePayload, { tableName: route.tableName, config: JSON.parse(route.content || '{}'), formIds: JSON.parse(route.flowFormIds || '{}'), serviceId: route.flowServiceId, versionId: versionMap[route.flowServiceId] || 0 })
            } else if (route.nocodeType === 'MARKDOWN') {
                const contentObj = JSON.parse(route.content || '{}')
                const content = contentObj?.content || ''
                Object.assign(nocodePayload, { content })
            }
        }
        return nocodePayload
    }

}

module.exports = projectCode
