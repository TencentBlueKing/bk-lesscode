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

import { handleProjectPerm, findRealProjectId } from '../service/common/project-auth'

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

const router = new Router({
    prefix: '/api/page'
})

router.use(['/getList', '/create', '/getDeletePageCodes'], async (ctx, next) => {
    await handleProjectPerm(ctx, next)
})

const hasPageIdRoutes = ['/update', '/copy', '/delete', '/detail', '/updatePageActive', '/occupyPage', '/releasePage']
router.use(hasPageIdRoutes, async (ctx, next) => {
    const tableName = 'PROJECT_PAGE'
    const resourceKey = 'pageId'
    
    // 校验header获参数中获传过来的projceId，与根据传过来的资源id反差出来的projectId是否一致
    const projectId = await findRealProjectId(ctx, { tableName, resourceKey } )
    if (!projectId) {
        ctx.send({
            code: 500,
            message: global.i18n.t('projectId非法'),
            data: null
        })
        return
        await next()
    } else {
        await handleProjectPerm(ctx, next, projectId)
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
router.get('/getDeletePageCodes', getDeletePageCodes)

module.exports = router
