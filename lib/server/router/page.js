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

// import PageModel from '../model/page'
import iamModel from '../model/iam'
import { checkInServer } from '../controller/iam'
import { IAM_ACTION } from '../../shared/constant.js'

const Router = require('koa-router')

const {
    createPage,
    getPageList,
    updatePage,
    copyPage,
    deletePage,
    checkName,
    pageDetail,
    importJson,
    pageLockStatus,
    updatePageActive,
    occupyPage,
    releasePage,
    getPreviewImg,
    getDeletePageCodes
} = require('../controller/page')

const {
    syncPageData,
    fixPageData
} = require('../controller/db-migration-helper')

const router = new Router({
    prefix: '/api/page'
})

router.use(['/getList'], async (ctx, next) => {
    const projectId = ctx.request.query.projectId
    const project = await iamModel.queryProjectByCreatorAndProjectId(ctx.session.userInfo.username, projectId)
    if (!project) {
        ctx.send({
            code: 404,
            message: global.i18n.t('项目不存在'),
            data: null
        })
        return
    }

    // 需要去权限中心查询是否具有 develop_app 权限
    const iamRes = await checkInServer(ctx, String(projectId))
    // develop_app 无权限
    if (!iamRes[IAM_ACTION.develop_app[0]]) {
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

// 访问控制
router.use(['/update', '/copy', '/delete', '/detail', 'getDeletePageCodes'], async (ctx, next) => {
    let pageId = ['POST', 'PUT'].includes(ctx.request.method)
        ? (ctx.request.body.id || ctx.request.body.pageId)
        : (ctx.request.query.id || ctx.request.query.pageId)

    pageId = pageId || (ctx.request.body.pageData || {}).id
    if (pageId) {
        const project = await iamModel.queryProjectByCreatorAndPageId(ctx.session.userInfo.username, pageId)
        if (!project) {
            ctx.send({
                code: 404,
                message: global.i18n.t('页面不存在'),
                data: null
            })
            return
        }

        // 需要去权限中心查询是否具有 develop_app 权限
        const iamRes = await checkInServer(ctx, String(project.id))
        // deploy_app 无权限
        if (!iamRes[IAM_ACTION.deploy_app[0]]) {
            ctx.send({
                code: 403,
                message: global.i18n.t('没有权限，请去权限中心申请权限'),
                data: iamRes,
                permissionType: 'page'
            })
            return
        }
        await next()
    } else {
        ctx.throw(400)
    }
})

router.post('/create', createPage)
router.get('/getList', getPageList)
router.put('/update', updatePage)
router.post('/copy', copyPage)
router.delete('/delete', deletePage)
router.post('/checkName', checkName)
router.get('/detail', pageDetail)
router.post('/importJson', importJson)
router.get('/pageLockStatus', pageLockStatus)
router.post('/updatePageActive', updatePageActive)
router.post('/occupyPage', occupyPage)
router.post('/releasePage', releasePage)
router.get('/previewimg', getPreviewImg)
router.get('/syncPageData', syncPageData)
router.get('/fixPageData', fixPageData)
router.get('/getDeletePageCodes', getDeletePageCodes)

module.exports = router
