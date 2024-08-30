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
    getPlatformList,
    getList,
    getFullList,
    checkName,
    create,
    update,
    deleteLayout,
    setDefault,
    getPageLayout,
    setRoutePath
} = require('../controller/layout')

const router = new Router({
    prefix: '/api/layout'
})

// 只校验projectId
router.use(['/getList', '/getFullList', '/create'], async (ctx, next) => {
    await handleProjectPerm(ctx, next)
})

// 校验projectId跟资源id
router.use(['/update', '/delete', '/default', '/routePath', '/page'], async (ctx, next) => {
    let tableName = 'LAYOUT_INST'
    let resourceKey = 'id'

    if (ctx.url.startsWith('/api/layout/page')) {
        tableName = 'PROJECT_PAGE'
        resourceKey = 'pageId'
    }
    
    // 校验header获参数中获传过来的projceId，与根据传过来的资源id反差出来的projectId是否一致
    const projectId = await findRealProjectId(ctx, { tableName,resourceKey } )
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

router.get('/getList', getList)
router.get('/getFullList', getFullList)
router.get('/getPlatformList', getPlatformList)
router.get('/page', getPageLayout)  //pageid
router.post('/create', create)
router.post('/checkName', checkName)
router.post('/update', update)
router.delete('/delete', deleteLayout)
router.post('/default', setDefault)
router.put('/routePath', setRoutePath)

module.exports = router
