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

const {
    checkConfig,
    applicationList,
    moduleList,
    releaseProject,
    getList,
    detailInfo,
    getAppDetail,
    getSucVersionList,
    getProjectVersionOptionList,
    getRunningLog,
    detailFromV3,
    updateReleaseVersion,
    checkAppInfoExist,
    offlineProject,
    checkOfflineResult,
    getDeployPhasesData,
    getLastVersionProcesses,
    getLastVersionProcessesDetail
} = require('../controller/release')
const Router = require('koa-router')

const router = new Router({
    prefix: '/api/release'
})

router.use('*', async (ctx, next) => {
    // const excludeRouters = ['/checkConfig', '/applicationList', '/moduleList', '/getRunningLog']
    await handleProjectPerm(ctx, next, ctx.request.headers['x-project-id'], ['deploy_app'])
})

router.get('/checkConfig', checkConfig)
router.get('/applicationList', applicationList)
router.get('/moduleList', moduleList)
router.get('/getRunningLog', getRunningLog)

router.post('/releaseProject', releaseProject)
router.get('/getList', getList)
router.get('/getAppDetail', getAppDetail)
router.post('/detailInfo', detailInfo)
router.get('/getSucVersionList', getSucVersionList)
router.get('/getProjectVersionOptionList', getProjectVersionOptionList)
router.get('/detailFromV3', detailFromV3)
router.put('/updateReleaseVersion', updateReleaseVersion)
router.post('/checkAppInfoExist', checkAppInfoExist)
router.post('/offlineProject', offlineProject)
router.get('/offlineResult', checkOfflineResult)
router.get('/deployPhaseResult', getDeployPhasesData)
router.get('/processListResult', getLastVersionProcesses)
router.post('/processDetailResult', getLastVersionProcessesDetail)

module.exports = router
