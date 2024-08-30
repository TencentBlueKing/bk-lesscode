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

const Router = require('koa-router')

const {
    createProject,
    importProject,
    exportProject,
    queryProject,
    updateProject,
    deleteProject,
    getTemplateIds,
    favorite,
    checkname,
    projectDetail,
    my,
    getPreviewImg
} = require('../controller/project')

const router = new Router({
    prefix: '/api/project'
})

router.use(['/detail', '/update', '/delete', '/favorite', '/delete', '/export', '/previewimg'], async (ctx, next) => {
    const projectId = ['POST', 'PUT', 'DELETE'].includes(ctx.request.method)
        ? (ctx.request.body?.id || ctx.request.body?.projectId)
        : (ctx.request.query?.id || ctx.request.query?.projectId)
    await handleProjectPerm(ctx, next, projectId)
})

router.post('/create', createProject)
router.post('/import', importProject)
router.get('/export', exportProject)
router.get('/query', queryProject)
router.get('/previewimg', getPreviewImg)
router.put('/update', updateProject)
router.delete('/delete', deleteProject)
router.post('/favorite', favorite)
router.post('/checkname', checkname)
router.get('/detail', projectDetail)
router.get('/my', my)
router.get('/getTemplateIds', getTemplateIds)

module.exports = router
