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
import { handleProjectPerm } from '../service/common/project-auth'
import { officalProject } from '../controller/iam'

const { downloadCode, previewCode } = require('../controller/project-code')
const Router = require('koa-router')

const router = new Router({
    prefix: '/api/projectCode'
})

// 预览、下载官方应用不用鉴权
router.use('*', async (ctx, next) => {
    const projectId = String(ctx.request.query?.projectId)

    const officalProjectList = await officalProject(ctx)
    const officalProjectIdList = officalProjectList.map(item => String(item.id))
    
    // 应用模板 预览、下载源码 不需要鉴权了
    if (officalProjectIdList.indexOf(projectId) < 0) {
        await handleProjectPerm(ctx, next, projectId)
    } else {
        await next()
    }
})

router.get('/downloadCode', downloadCode)
router.get('/previewCode', previewCode)

module.exports = router
