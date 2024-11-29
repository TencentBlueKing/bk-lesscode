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

import {
    getPreviewDataService
} from '../service/business/preview-db-service'
import {
    Controller,
    Get,
    Post,
    QueryParams,
    HeaderParams,
    ProjectAuthorization,
    Ctx
} from '../decorator'
import dayjs from 'dayjs'
import routeModel from '../model/route'

@Controller('/api/custom-business')
export default class CustomBusinessController {
    // 业务逻辑， 签到系统
    @ProjectAuthorization({})
    @Post('/user/h5/signIn')
    async perviewH5SignIn (
        @QueryParams() queryData,
        @HeaderParams({ name: 'x-project-id', require: true }) projectId,
        @HeaderParams({ name: 'x-timezone-offset' }) timezoneOffset,
        @Ctx() ctx
    ) {
        const activityTableName = 'activity'
        const signinTableName = 'signin'
        let dataService
        let failReason = ''
        let status = ''
        const activityId = queryData.id
        try {
            dataService = await getPreviewDataService(projectId, false)
            const result = await dataService.findOne(
                activityTableName,
                {
                    id: activityId
                }
            )
            if (!result?.id) {
                ctx.send({
                    data: {},
                    code: 500,
                    message: '找不到活动信息'
                })
                return
            }
            const username = ctx.session.userInfo?.username
            const users = (result?.users || []).map(item => item.enName)
            const startTimestamp = dayjs(result?.startTime).valueOf()
            const endTimestamp = dayjs(result?.endTime).valueOf()
            const currentTimestamp = dayjs().valueOf()
            if (!username) {
                failReason = '无法获取当前登陆用户信息'
                status = 'fail'
            } else if (!users.includes(username)) {
                failReason = '你不在访问名单内'
                status = 'fail'
            } else if (currentTimestamp < startTimestamp || currentTimestamp > endTimestamp) {
                failReason = '当前不在签到时间范围内'
                status = 'fail'
            } else {
                // 先查询是否有签到过
                const signRecord = await dataService.findOne(signinTableName, {
                    activityId,
                    user: username
                })
                // 没有签到记录则签到
                if (!signRecord?.id) {
                    const addData = {
                        user: username,
                        signTime: new Date(),
                        activityId
                    }
                    await dataService.add(signinTableName, addData)
                }
                status = 'success'
            }
            ctx.send({
                data: {
                    status,
                    title: 
                    failReason,
                    username,
                    chineseName: '',
                    avatarUrl: '',
                    config: {}
                },
                code: failReason ? 500 : 0,
                message: failReason || ''
            })
        } catch (err) {
            console.log(err, 'err')
            ctx.send({
                code: 500,
                message: failReason || '',
                data: err
            })
        } finally {
            if (dataService) await dataService.close()
        }
    }

    // check是否已签到
    @ProjectAuthorization({})
    @Get('/user/h5/checkSignIn')
    async checkSignIn (
        @QueryParams() queryData,
        @HeaderParams({ name: 'x-project-id', require: true }) projectId,
        @Ctx() ctx
    ) {
        const signinTableName = 'signin'
        let dataService
        const activityId = queryData.id
        const username = ctx.session.userInfo?.username
        try {
            dataService = await getPreviewDataService(projectId, false)
            
            const record = await dataService.findOne(
                signinTableName,
                {
                    activityId,
                    user: username
                }
            )
            const isSignIn = record?.id ? true : false
            ctx.send({
                data: isSignIn,
                code: 0,
                message: 'success'
            })
        } catch (err) {
            console.log(err, 'err')
            ctx.send({
                code: 500,
                message: err.message || err,
                data: ''
            })
        } finally {
            if (dataService) await dataService.close()
        }
    }

    // 获取签到记录
    @ProjectAuthorization({})
    @Get('/user/h5/getSignInRecord')
    async getSignInRecord (
        @QueryParams() queryData,
        @HeaderParams({ name: 'x-project-id', require: true }) projectId,
        @HeaderParams({ name: 'x-timezone-offset' }) timezoneOffset,
        @Ctx() ctx
    ) {
        const activityTableName = 'activity'
        const signinTableName = 'signin'
        let dataService
        const activityId = queryData.id
        try {
            dataService = await getPreviewDataService(projectId, false)
            const result = await dataService.findOne(
                activityTableName,
                {
                    id: activityId
                }
            )
            if (!result?.id) {
                ctx.send({
                    data: {},
                    code: 500,
                    message: '找不到活动信息'
                })
                return
            }
            const activityUsers = (result?.users || []).map(item => item.enName)
            const signinRecords = await dataService.get({
                tableFileName: signinTableName,
                query: {
                    activityId
                }
            })
            const signinUsers = (signinRecords?.list || []).map(item => item.user)
            const signResult = activityUsers.map(item => ({
                user: item,
                isSignIn: signinUsers.includes(item)
            }))
            ctx.send({
                data: signResult,
                code: 0,
                message: 'success'
            })
        } catch (err) {
            console.log(err, 'err')
            ctx.send({
                code: 500,
                message: err.message || err,
                data: []
            })
        } finally {
            if (dataService) await dataService.close()
        }
    }

    // 获取模板信息
    @ProjectAuthorization({})
    @Get('/user/h5/getTemplateInfo')
    async getTemplateInfo (
        @HeaderParams({ name: 'x-project-id', require: true }) projectId,
        @Ctx() ctx
    ) {
        try {
            const res = await routeModel.queryProjectPageRoute(projectId, '')

            let list = res
            list = list.filter(item => item.pageType === 'MOBILE')
            list = list.map(({ id, layoutId, path, layoutPath, ...others }) => ({
                ...others,
                routePath: layoutPath + path
            }))
            ctx.send({
                code: 0,
                message: 'success',
                data: list
            })
        } catch (err) {
            throw new global.BusinessError(err.message || error, -1, 500, error.stack)
        }
    }
}
