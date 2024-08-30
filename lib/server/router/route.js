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

// 只校验projectId
const checkList = ['/query/:projectId', '/project/:projectId/page', '/project/:id', '/project/:id/tree', '/bind-page-route']
router.use(checkList, async (ctx, next) => {
    await handleProjectPerm(ctx, next)
})

// 校验projectId跟资源id
router.use(['/save-page-route', '/remove'], async (ctx, next) => {
    let tableName = 'PAGE_ROUTE'
    let resourceKey = 'id'
    let resourceId = ctx.request.body?.pageRoute?.id

    if (ctx.url.startsWith('/api/route/remove')) {
        resourceKey = 'routeId'
        resourceId = ctx.query.id
    }
    
    // 校验header获参数中获传过来的projceId，与根据传过来的资源id反差出来的projectId是否一致
    const projectId = await findRealProjectId(ctx, { tableName, resourceKey, resourceId } )
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

// 校验projectId跟资源id
router.use(['/get-page-route/:pageId', '/update-page-route/:pageId'], async (ctx, next) => {
    const tableName = 'PROJECT_PAGE'
    const resourceKey = 'pageId'
    const resourceId = ctx.request.body?.pageId || ctx.params?.pageId
    
    // 校验header获参数中获传过来的projceId，与根据传过来的资源id反差出来的projectId是否一致
    const projectId = await findRealProjectId(ctx, { tableName, resourceId, resourceKey } )
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

router.get('/query/:projectId', queryProjectPageRoute)
router.get('/project/:projectId/page', queryProjectPageRoute)
router.get('/project/:id', getProjectRoute)
router.get('/project/:id/tree', getProjectRouteTree)
router.post('/project/:id', createProjectRoute)

router.get('/get-page-route/:pageId', getPageRoute)
router.put('/save-page-route/:pageId?', savePageRoute)
router.post('/update-page-route/:pageId', updatePageRoute)
router.post('/bind-page-route', bindPageRoute)

router.delete('/remove', removeRoute)

module.exports = router
