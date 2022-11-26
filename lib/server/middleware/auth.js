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
import {
    decodeToken
} from '@bkui/apigateway-nodejs-sdk'
import v3Conf from '../conf/v3'
const https = require('https')
const axios = require('axios')
const querystring = require('querystring')
const unless = require('koa-unless')
const { randomString } = require('../../shared/util')
const httpConf = require('../conf/http')
const { isAjaxReq } = require('../util')
const { findUserByUsername, addUser } = require('../controller/user')
const { setRequestContext } = require('./request-context')
const { createDemoProject } = require('../controller/project')
const authWhiteList = [
    '/static/monaco-editor',
    '/api/nocode/dataManage',
    '/api/nocode/filterTableData',
    '/api/nocode/executeApi'
]
const openApiList = ['/api/data/getApiData']

module.exports = () => {
    const authMiddleware = async function (ctx, next) {
        try {
            // 基础信息
            const bkToken = ctx.cookies.get('bk_token')
            const hostUrl = httpConf.hostUrl.replace(/\/$/, '')
            const loginRedirectUrl = `${httpConf.loginUrl}?app_id=${httpConf.appCode}`
            const apiJwt = ctx.header['x-bkapi-jwt']
            // 未登陆处理
            const handleAuthFail = () => {
                // 非 ajax 异步请求，页面跳转到登录
                if (!isAjaxReq(ctx.request)) {
                    ctx.status = 302
                    ctx.redirect(`${loginRedirectUrl}&c_url=${encodeURIComponent(ctx.href)}`)
                } else {
                    ctx.status = 401
                    ctx.send({
                        code: 401,
                        message: '登录态过期，请重新登录',
                        data: {
                            loginUrl: `${loginRedirectUrl}&c_url=${encodeURIComponent(ctx.request.header.referer)}`
                        }
                    })
                }
            }
            if (authWhiteList.some(authWhitePath => ctx.originalUrl.includes(authWhitePath))) {
                // 白名单请求不鉴权
                await next()
            } else if (openApiList.some(openApiPath => ctx.originalUrl.includes(openApiPath)) && apiJwt) {
                // apigateway 使用jwt鉴权
                const { user } = await decodeToken(
                    'bk-lesscode',
                    apiJwt,
                    {
                        bk_app_code: v3Conf.APP_ID,
                        bk_app_secret: v3Conf.APP_SECRET
                    },
                    'prod'
                )
                if (user.username) {
                    setRequestContext(ctx)
                    const userData = await findUserByUsername(user.username)
                    ctx.session.userInfo.id = userData.id
                    ctx.session.userInfo.username = userData.username
                } else {
                    handleAuthFail()
                }
            } else if (!bkToken) {
                handleAuthFail()
            } else {
                const params = querystring.stringify({
                    bk_app_code: httpConf.appCode,
                    bk_app_secret: httpConf.appSecret,
                    bk_token: bkToken
                })
                const response = await axios({
                    withCredentials: true,
                    url: `${hostUrl}/api/c/compapi/v2/bk_login/get_user/?${params}`,
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    responseType: 'json',
                    httpsAgent: new https.Agent({ rejectUnauthorized: false }),
                    // 不设置 proxy false 的话，会导致 rejectUnauthorized: false 的设置（忽略 ssl 证书）生效
                    proxy: false
                })

                const { code, data } = response.data
                if (code !== 0) {
                    handleAuthFail()
                    return
                }

                ctx.session.userInfo = { ...data, ...{ loginRedirectUrl } }
                const userData = await findUserByUsername(ctx.session.userInfo.bk_username)

                if (!userData) {
                    setRequestContext(ctx)
                    const userId = await addUser({
                        username: ctx.session.userInfo.bk_username,
                        bk: ctx.session.userInfo.bk_username
                    })
                    ctx.session.userInfo.id = userId
                    ctx.session.userInfo.username = ctx.session.userInfo.bk_username
                    await createDemoProject(ctx, {
                        bkTicket: ctx.cookies.get(global.AUTH_NAME),
                        userInfo: {
                            username: ctx.session.userInfo.bk_username,
                            id: ctx.session.userInfo.id
                        },
                        projectData: {
                            copyFrom: null,
                            projectCode: 'demo' + randomString(5),
                            projectName: ctx.session.userInfo.bk_username + 'Demo应用',
                            projectDesc: '欢迎使用蓝鲸智云可视化开发平台，这是为您默认创建的Demo应用，创建该LessCode应用的同时，已在“PaaS平台-开发者中心”创建了同名SaaS。'
                        }
                    })
                } else {
                    ctx.session.userInfo.id = userData.id
                    ctx.session.userInfo.username = userData.username
                }

                await next()
            }
        } catch (error) {
            ctx.throwError({
                status: error.status || 401,
                code: error.code,
                message: error.message
            })
        }
    }

    authMiddleware.unless = unless
    return authMiddleware
}
