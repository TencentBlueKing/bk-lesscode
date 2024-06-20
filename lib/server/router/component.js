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
    list,
    useing,
    detail,
    versionDetail,
    create,
    update,
    updateData,
    exportComps,
    off,
    online,
    compDelete,
    upload,
    nameMap,
    categoryCount,
    updatePageComp,
    scope
} = require('../controller/component')

const router = new Router({
    prefix: '/api/component'
})

// 只校验projectId
router.use(['/list', '/export', '/upload'], async (ctx, next) => {
    const projectId = ctx.query.belongProjectId
    await handleProjectPerm(ctx, next, projectId)
})

// 只校验projectId
router.use(['/using', '/create', '/version-detail'], async (ctx, next) => {
    handleProjectPerm(ctx, next)
})

// 校验projectId跟资源id
router.use(['/detail', '/update', '/updateData', '/off', '/online', 'scope', '/delete', '/page-useing-version'], async (ctx, next) => {
    const tableName = 'COMP'

    const resourceId = ['POST', 'PUT'].includes(ctx.request.method)
        ? (ctx.request.body?.compId || ctx.request.body?.id)
        : (ctx.request.query?.id || ctx.request.query?.compId)
    
    // 校验header获参数中获传过来的projceId，与根据传过来的资源id反差出来的projectId是否一致
    const projectId = await findRealProjectId(ctx, { tableName, resourceId } )
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

router.get('/list', list)
router.get('/useing', useing)
router.get('/detail', detail)
router.get('/version-detail', versionDetail)
router.get('/export', exportComps)
router.post('/create', create)
router.post('/update', update)
router.post('/updateData', updateData)
router.post('/off', off)
router.post('/online', online)
router.delete('/delete', compDelete)
router.post('/upload', upload)
router.get('/name-map', nameMap)
router.get('/category-count', categoryCount)
router.put('/page-using-version', updatePageComp)
router.post('/scope', scope)

module.exports = router
