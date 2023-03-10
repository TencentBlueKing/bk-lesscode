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
import VueCodeModel from '../model/vue-code'
// import PageCodeModel from '../model/page-code'
import getPageCode from '../../shared/page-code'
import routeModel from '../model/route'
import variableModel from '../model/variable'

import {
    getAllGroupAndFunction
} from '../service/business/function'
import OperationLogger from '../service/common/operation-logger'
import {
    LCDataService,
    TABLE_FILE_NAME
} from '../service/common/data-service'

const AU = require('ansi_up')
const ansiUp = new AU.default  // eslint-disable-line

// npm.js配置文件不存在时赋值空对象
let npmConf
try {
    npmConf = require('../conf/npm')
} catch (_) {
    npmConf = {}
}

const VueCode = {
    async saveAsFile (ctx) {
        try {
            ctx.send({
                code: 0,
                message: 'success',
                data: ''
            })
        } catch (err) {
            ctx.throwError({
                message: err.message
            })
        }
    },
    async formatCode (ctx) {
        try {
            const post = ctx.request.body || {}
            const ret = await VueCodeModel.formatCode(post.code)

            ctx.send({
                code: 0,
                message: 'success',
                // ret 为空的话，说明 formatCode 是 eslint 检测正确的
                data: ret
            })
        } catch (err) {
            ctx.throwError({
                message: err.message
            })
        }
    },
    async getPageCode (ctx) {
        const operationLogger = new OperationLogger(ctx)
        try {
            const {
                pageType = 'vueCode',
                projectId = '',
                versionId,
                pageId,
                layoutContent,
                targetData = [],
                from,
                withNav,
                fromPageCode = '',
                layoutType,
                platform,
                variableData
            } = ctx.request.body

            const [funcGroups, routeList, { list: apiList }] = await Promise.all([
                getAllGroupAndFunction(projectId, versionId),
                routeModel.findProjectRoute(projectId, versionId),
                LCDataService.get({
                    tableFileName: TABLE_FILE_NAME.API,
                    query: {
                        projectId,
                        versionId
                    }
                })
            ])

            let allVariableList = variableData
            if (!allVariableList) {
                allVariableList = await variableModel.getAll({ projectId, versionId })
            }

            const curPage = routeList.find((route) => (route.pageId === +pageId)) || {}
            const variableList = [
                ...allVariableList.filter(variable => variable.effectiveRange === 0),
                ...allVariableList.filter((variable) => (variable.effectiveRange === 1 && (variable.pageCode === curPage.pageCode || variable.pageCode === fromPageCode)))
            ]
            let curLayoutCon = {}
            if (withNav) {
                curLayoutCon = layoutContent || JSON.parse(curPage.layoutContent || '{}')
                const routeMap = {}
                routeList.forEach((route) => {
                    routeMap[route.pageCode] = route.pageId
                });
                [...(curLayoutCon.menuList || []), ...(curLayoutCon.topMenuList || [])].forEach((nav) => {
                    if (nav.pageCode) nav.pageId = routeMap[nav.pageCode];
                    (nav.children || []).forEach((child) => {
                        child.pageId = routeMap[child.pageCode]
                    })
                })
            }
            const pagePlatform = platform || 'PC' // platform默认为PC, 但主要以curPage数据库中的标志位为准； 找不到再以platform为准
            const pageTargetData = Array.isArray(targetData) && targetData.length > 0 ? targetData : JSON.parse(curPage.content || '[]')
            const pageCodeData = await getPageCode({
            // const pageCodeData = await PageCodeModel.getPageData({
                targetData: pageTargetData,
                platform: curPage.platform ? curPage.platform : pagePlatform,
                pageType,
                funcGroups,
                lifeCycle: curPage.lifeCycle || {},
                projectId,
                pageId,
                layoutContent: curLayoutCon,
                isGenerateNav: false,
                isEmpty: false,
                layoutType: layoutType || curPage.layoutType,
                variableList,
                styleSetting: curPage.styleSetting || {},
                user: ctx.session.userInfo,
                npmConf,
                origin: ctx.origin,
                apiList,
                isRenderAppPermComponents: false
            })
            let code = ''
            if (pageType === 'vueCode') {
                // 格式化，报错是抛出异常
                code = await VueCodeModel.formatPageCode(pageCodeData.code)
            } else if (['preview', 'previewSingle'].includes(pageType)) {
                // 不需格式化
                code = pageCodeData.code
            } else {
                // 格式化，报错不抛出异常
                code = await VueCodeModel.formatCode(pageCodeData.code)
            }
            // 此接口被多方调用，目前仅收集下载页面源码
            if (from === 'download_page') {
                operationLogger.success()
            }
            ctx.send({
                code: 0,
                message: 'success',
                data: code,
                codeErrMessage: pageCodeData.codeErrMessage
            })
        } catch (err) {
            if (ctx.request.body.from === 'download_page') {
                operationLogger.error(err)
            }
            ctx.send({
                code: 0,
                message: 'success',
                data: ansiUp.ansi_to_html(err.message || err)
            })
        }
    }
}

module.exports = VueCode
