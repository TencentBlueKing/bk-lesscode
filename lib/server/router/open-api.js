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

import { getRepository } from 'typeorm'
import iamModel from '../model/iam'
import projectModel from '../model/project'
import { checkInServer } from '../controller/iam'
import { IAM_ACTION } from '../../shared/constant.js'
import { getUserFromApiGW } from '../service/business/open-api'
import User from '../model/entities/user'
import { checkProjectPerm } from '../service/common/project-auth'
const { addUser } = require('../controller/user')

const Router = require('koa-router')

const { ERROR_CODES } = require('../controller/open-api')

const config = require('./open-api.config')

const getRouteOptions = function (route) {
    const options = route[route.length - 1]
    if (Object.prototype.toString.call(options) === '[object Object]') {
        return options
    }
    return {}
}

const router = new Router({
    prefix: config.prefix
})

router.use('*', async (ctx, next) => {
    const jwt = ctx.header['x-bkapi-jwt']
    // 本地调试没有jwt头部
    const { debug } = ctx.request.query
    let user = {}
    if (process.env.NODE_ENV === 'development' && debug) {
        user = { username: 'admin' }
    } else if (!jwt) {
        ctx.throw(401, 'Not Found JWT header', { code: 30001 })
    } else {
        user = await getUserFromApiGW(jwt)

        if (!user) {
            ctx.throw(401, ERROR_CODES()['INVAILD_USER'][1], { code: ERROR_CODES()['INVAILD_USER'][0] })
        }
    }
    ctx.state.jwt = {
        app: {},
        user
    }
    const userData = await getRepository(User).findOne({ username: user.username })
    let userId = userData?.id
    if (!userId) {
        userId = await addUser({
            username: user.username,
            bk: user.username
        })
    }
    // 注入平台用户id
    ctx.state.jwt.user.id = userId
    await next()
})

// 项目访问权限控制
const projectAccessControlRoutes = Object.values(config.routes).filter(route => {
    const options = getRouteOptions(route)
    return options.accessControl && options.accessControl.includes('project')
}).map(route => route[1])
router.use(projectAccessControlRoutes, async (ctx, next) => {
    const { user } = ctx.state.jwt || {}

    const id = ['POST', 'PUT', 'DELETE'].includes(ctx.request.method)
        ? (ctx.request.body.id || ctx.request.body.projectId)
        : (ctx.request.query.id || ctx.request.query.projectId)

    if (!id) {
        ctx.throw(400, ERROR_CODES()['MISSING_PARAMS_PROJECT_ID'][1], { code: ERROR_CODES()['MISSING_PARAMS_PROJECT_ID'][0] })
    }

    const res = await checkProjectPerm(ctx, id)
    if (res.code > 0) {
        ctx.send(res)
        return
    }
    await next()
})

// 路由绑定
Object.values(config.routes).forEach(route => {
    const [method, path, handler] = route
    router[method](path, handler)
})

module.exports = router
