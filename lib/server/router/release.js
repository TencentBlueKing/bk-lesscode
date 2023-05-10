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

import iamModel from '../model/iam'
import { checkInServer } from '../controller/iam'
import { IAM_ACTION } from '../../shared/constant.js'

const {
    checkConfig,
    applicationList,
    moduleList,
    releaseProject,
    getList,
    detailInfo,
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

router.use(['/getProjectVersionOptionList', '/getSucVersionList', '/getList'], async (ctx, next) => {
    const id = ['POST', 'PUT', 'DELETE'].includes(ctx.request.method)
        ? (ctx.request.body.id || ctx.request.body.projectId)
        : (ctx.request.query.id || ctx.request.query.projectId)

    const project = await iamModel.queryProjectByCreatorAndProjectId(ctx.session.userInfo.username, id)
    if (!project) {
        ctx.send({
            code: 404,
            message: global.i18n.t('项目不存在'),
            data: null
        })
        return
    }

    // 需要去权限中心查询是否具有 deploy_app 权限
    const iamRes = await checkInServer(ctx, String(id))
    // deploy_app 无权限
    if (!iamRes[IAM_ACTION.deploy_app[0]]) {
        ctx.send({
            code: 403,
            message: global.i18n.t('没有权限，请去权限中心申请权限'),
            data: {
                pass: false,
                applyUrl: iamRes.applyUrl,
                requiredPermissions: iamRes.requiredPermissions,
                permissionType: 'page'
            }
        })
        return
    }
    await next()
})

router.get('/checkConfig', checkConfig)
router.get('/applicationList', applicationList)
router.get('/moduleList', moduleList)
router.post('/releaseProject', releaseProject)
router.get('/getList', getList)
router.post('/detailInfo', detailInfo)
router.get('/getSucVersionList', getSucVersionList)
router.get('/getProjectVersionOptionList', getProjectVersionOptionList)
router.get('/getRunningLog', getRunningLog)
router.get('/detailFromV3', detailFromV3)
router.put('/updateReleaseVersion', updateReleaseVersion)
router.post('/checkAppInfoExist', checkAppInfoExist)
router.post('/offlineProject', offlineProject)
router.get('/offlineResult', checkOfflineResult)
router.get('/deployPhaseResult', getDeployPhasesData)
router.get('/processListResult', getLastVersionProcesses)
router.post('/processDetailResult', getLastVersionProcessesDetail)

module.exports = router
