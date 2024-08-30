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
    serviceCheckAppPerm, fetchResource, check, myProject, checkNoResources, fetchAuthSubject,
    fetchIamAppPerm, fetchIamAppPermAction, fetchResourceAppPerm, checkIamAppPermActionId,
    updateIamAppPermAction, addIamAppPermAction, deleteIamAppPermAction
} = require('../controller/iam')

const router = new Router({
    prefix: '/api/iam'
})

// 只校验projectId
router.use(['/auth-subject', '/check-action', '/app-perm-model'], async (ctx, next) => {
    await handleProjectPerm(ctx, next)
})

// /app-perm-model-action 增删改查用的是同一个path
router.use(['/app-perm-model-action'], async (ctx, next) => {
    // /app-perm-model-action 修改跟删除action用的是同一个path
    const methodType = ctx.request.method
    if (['DELETE', 'PUT'].includes(methodType)) {
        const tableName = 'IAM_APP_PERM_ACTION'
        const resourceId = (methodType === 'PUT' ? ctx.request.body.actionId : ctx.request.query.actionId)
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
    } else {
        await handleProjectPerm(ctx, next)
    }
})

router.post('/service-check-app-perm', serviceCheckAppPerm)
router.post('/resource', fetchResource)
router.post('/resource-app-perm', fetchResourceAppPerm)
router.post('/check', check)
router.get('/my-project', myProject)
router.post('/check-no-resources', checkNoResources)

router.post('/check-action', checkIamAppPermActionId)
router.post('/auth-subject', fetchAuthSubject)
router.get('/app-perm-model', fetchIamAppPerm)
router.get('/app-perm-model-action', fetchIamAppPermAction)
router.put('/app-perm-model-action', updateIamAppPermAction)
router.post('/app-perm-model-action', addIamAppPermAction)
router.delete('/app-perm-model-action', deleteIamAppPermAction)

module.exports = router
