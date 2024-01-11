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
import iamModel from '../model/iam'
import { checkInServer } from '../controller/iam'
import { IAM_ACTION } from '../../shared/constant.js'

const Router = require('koa-router')
const {
    queryProjectPageRoute,
    getPageRoute,
    savePageRoute,
    getProjectRoute,
    createProjectRoute,
    updatePageRoute,
    getProjectRouteTree,
    bindPageRoute,
    removeRoute
} = require('../controller/route')

const router = new Router({
    prefix: '/api/route'
})

router.use(['/query/:projectId', '/project/:projectId/page', '/project/:id', '/project/:id/tree'], async (ctx, next) => {
    const id = ctx.params.projectId || ctx.params.id

    const project = await iamModel.queryProjectByCreatorAndProjectId(ctx.session.userInfo.username, id)
    if (!project) {
        ctx.send({
            code: 404,
            message: global.i18n.t('项目不存在'),
            data: null
        })
        return
    }

    // 需要去权限中心查询是否具有 deploy_app 权限
    const iamRes = await checkInServer(ctx, String(id))
    // deploy_app 无权限
    if (!iamRes[IAM_ACTION.deploy_app[0]]) {
        ctx.send({
            code: 403,
            message: global.i18n.t('没有权限，请去权限中心申请权限'),
            data: {
                pass: false,
                applyUrl: iamRes.applyUrl,
                requiredPermissions: iamRes.requiredPermissions,
                permissionType: 'page'
            }
        })
        return
    }
    await next()
})

router.get('/query/:projectId', queryProjectPageRoute)
router.get('/project/:projectId/page', queryProjectPageRoute)
router.get('/project/:id', getProjectRoute)
router.get('/project/:id/tree', getProjectRouteTree)
router.get('/page/:id', getPageRoute)
router.put('/page/:id?', savePageRoute)
router.post('/project/:id', createProjectRoute)
router.post('/page-route/:id', updatePageRoute)
router.post('/bind', bindPageRoute)
router.delete('/remove', removeRoute)

module.exports = router
