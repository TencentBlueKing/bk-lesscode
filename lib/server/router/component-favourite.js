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
    add,
    favouriteDelete
} = require('../controller/component-favourite')

const router = new Router({
    prefix: '/api/componentFavourite'
})

// 只校验projectId
router.use(['/list', '/add', '/delete'], async (ctx, next) => {
    await handleProjectPerm(ctx, next)
})

router.get('/list', list)
router.post('/add', add)
router.post('/delete', favouriteDelete)

module.exports = router
