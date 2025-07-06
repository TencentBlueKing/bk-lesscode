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
    Controller,
    Get,
    Post,
    Ctx,
    QueryParams,
    HeaderParams
} from '../decorator'
import {
    getDataService
} from '../service/data-source'
import dayjs from 'dayjs'
const fs = require('fs')
const path = require('path')
 
@Controller('/api/custom-business')
export default class DataSourceController {
    // 用户获取某张表的某个数据详情
    @Post('/user/h5/signin')
    async getTableDataDetail (
        @QueryParams() queryData,
        @HeaderParams({ name: 'x-timezone-offset' }) timezoneOffset,
        @Ctx() ctx
    ) {
        const activityTableName = 'activity'
        const signinTableName = 'signin'
        let failReason = ''
        let status = ''
        let dataService
        const activityId = queryData.id
        try {
            dataService = await getDataService()
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
            } else if (!users.includes(ctx.session.userInfo.username)) {
                failReason = '你不在访问名单内'
                status = 'fail'
            } else if (currentTimestamp < startTimestamp || currentTimestamp > endTimestamp) {
                failReason = '当前不在签到时间范围内'
                status = 'fail'
            } else {
                // 先查询是否有签到过
                const signRecord = await dataService.findOne(signinTableName, {
                    activityId: queryData.id,
                    user: username
                })
                // 没有签到记录则签到
                if (!signRecord?.id) {
                    const addData = {
                        user: username,
                        signTime: new Date(),
                        activityId: queryData.id
                    }
                    await dataService.add(signinTableName, addData)
                }
                status = 'success'
            }
            ctx.send({
                data: {
                    status,
                    title: result?.title,
                    failReason,
                    username,
                    chineseName: '',
                    avatarUrl: '',
                    config: {}
                },
                code: status === 'success' ? 0 : 500,
                message: failReason || ''
            })
        } catch (err) {
            ctx.send({
                code: 500,
                message: failReason || '',
                data: err
            })
        }
    }

    // check是否已签到
    @Get('/user/h5/checkSignIn')
    async checkSignIn (
        @QueryParams() queryData,
        @Ctx() ctx
    ) {
        const signinTableName = 'signin'
        let dataService
        const activityId = queryData.id
        const username = ctx.session.userInfo?.username
        try {
            dataService = await getDataService()
            
            const record = await dataService.findOne(
                signinTableName,
                {
                    activityId,
                    user: username
                }
            )
            const isSignIn = !!record?.id
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
        }
    }

    // 获取签到记录
    @Get('/user/h5/getSignInRecord')
    async getSignInRecord (
        @QueryParams() queryData,
        @Ctx() ctx
    ) {
        const activityTableName = 'activity'
        const signinTableName = 'signin'
        let dataService
        const activityId = queryData.id
        try {
            dataService = await getDataService()
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
        }
    }

    // 获取模板信息
    @Get('/user/h5/getTemplateInfo')
    async getTemplateInfo (
        @Ctx() ctx
    ) {
        try {
            const filepath = '../../shared/page-route/info.json'
            const fileBuffer = fs.readFileSync(path.resolve(__dirname, filepath))
            const fileString = fileBuffer.toString()

            const list = JSON.parse(fileString) || []
            
            ctx.send({
                code: 0,
                message: 'success',
                data: list
            })
        } catch (err) {
            ctx.send({
                code: 0,
                data: [],
                message: err.message || err
            })
        }
    }
}
