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

import PageModel from '../model/page'
import iamModel from '../model/iam'
import { IAM_ACTION } from '../utils/constant'
import { check } from '../controller/iam'

const Router = require('koa-router')

const {
    createPage,
    getPageList,
    updatePage,
    copyPage,
    deletePage,
    checkName,
    pageDetail,
    verify,
    importJson,
    verifyPreview,
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
            message: '项目不存在',
            data: null
        })
        return
    }

    // 不是项目的创建者，那么需要去权限中心查询是否具有 develop_app 权限
    if (!project.isCreator) {
        ctx.request.body.action = IAM_ACTION.develop_app[0]
        ctx.request.body.resourceId = projectId
        const iamRes = await check(ctx)
        // 权限中心 develop_app 操作权限未申请或未审批通过
        if (!iamRes.pass) {
            ctx.send({
                code: 403,
                message: '没有权限，请去权限中心申请权限',
                data: iamRes
            })
            return
        }
        await next()
    } else {
        await next()
    }
})

// 访问控制
router.use(['/update', '/copy', '/delete', '/detail', 'getDeletePageCodes'], async (ctx, next) => {
    let pageId = ['POST', 'PUT'].includes(ctx.request.method)
        ? (ctx.request.body.id || ctx.request.body.pageId)
        : (ctx.request.query.id || ctx.request.query.pageId)

    pageId = pageId || (ctx.request.body.pageData || {}).id
    if (pageId) {
        const result = await PageModel.findUserPageById(ctx.session.userInfo.id, pageId)
        if (!result) {
            ctx.throw(403)
        }
    } else {
        ctx.throw(400)
    }

    await next()
})

router.post('/create', createPage)
router.get('/getList', getPageList)
router.put('/update', updatePage)
router.post('/copy', copyPage)
router.delete('/delete', deletePage)
router.post('/checkName', checkName)
router.get('/detail', pageDetail)
router.post('/verify', verify)
router.post('/importJson', importJson)
router.post('/verifyPreview', verifyPreview)
router.get('/pageLockStatus', pageLockStatus)
router.post('/updatePageActive', updatePageActive)
router.post('/occupyPage', occupyPage)
router.post('/releasePage', releasePage)
router.get('/previewimg', getPreviewImg)
router.get('/syncPageData', syncPageData)
router.get('/fixPageData', fixPageData)
router.get('/getDeletePageCodes', getDeletePageCodes)

module.exports = router
