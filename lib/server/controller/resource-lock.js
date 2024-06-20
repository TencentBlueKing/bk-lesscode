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
    LCDataService,
    TABLE_FILE_NAME
} from '../service/common/data-service'
import {
    Controller,
    Post,
    Get,
    Put,
    Ctx,
    BodyParams,
    OutputJson,
    ProjectAuthorization,
} from '../decorator'

@Controller('/api/resourceLock')
export default class SaasModuleStoryController {
    // 获取锁状态
    @OutputJson()
    @Post('/lockStatus')
    async lockStatus (
        @BodyParams() params,
        @Ctx() ctx
    ) {
        const { tableName, resourceId } = params
        const lcdTableName = tableName.replaceAll('-', '_').toUpperCase()
        const resource = await LCDataService.findOne(TABLE_FILE_NAME[lcdTableName],  { id: resourceId })
        const { activeUser, activeTime } = resource

        const lockStatus = {
            isLock: false,
            activeUser,
            accessible: false,
            resourceId,
            tableName
        }

        const userInfo = ctx.session.userInfo || {}

        if (activeUser !== null && userInfo.username !== activeUser) {
            const invalidTime = 30 * 60 * 1000
            const accessedTime = 10 * 60 * 1000
            // 大于30分钟就要锁， 大于10分钟可抢占
            Object.assign(lockStatus, {
                isLock: !(new Date().getTime() - new Date(activeTime).getTime() > invalidTime),
                activeUser: activeUser,
                activeTime: activeTime,
                accessible: new Date().getTime() - new Date(activeTime).getTime() > accessedTime
            })
        }

        return lockStatus
    }

    // 更新锁信息
    @OutputJson()
    @ProjectAuthorization({})
    @Put('/updateLockInfo')
    async updateLockInfo (
        @BodyParams() params,
        @Ctx() ctx
    ) {
        try {
            const userInfo = ctx.session.userInfo || {}
            const { tableName, resourceId } = params
            const lcdTableName = tableName.replaceAll('-', '_').toUpperCase()
            const currentResource = await LCDataService.findOne(TABLE_FILE_NAME[lcdTableName], { id: resourceId })

            const updateFields = {
                id: resourceId,
                activeUser: userInfo.username,
                activeTime: new Date(),
                updateTime: currentResource?.updateTime,
                updateUser: currentResource?.updateUser
            }
            const res = await LCDataService.update(TABLE_FILE_NAME[lcdTableName], updateFields)
            return {
                activeUser: updateFields.activeUser,
                activeTime: updateFields.activeTime
            }
        } catch (error) {
            throw new global.BusinessError(error, -1)
        }
    }

    // 修改需求并执行
    @OutputJson()
    @ProjectAuthorization({})
    @Post('/occupy')
    async occupyResource (
        @BodyParams() params,
        @Ctx() ctx
    ) {
        const { tableName, resourceId } = params
        const lcdTableName = tableName.replaceAll('-', '_').toUpperCase()
        const resource = await LCDataService.findOne(TABLE_FILE_NAME[lcdTableName],  { id: resourceId })
        const { activeUser, activeTime } = resource

        const userInfo = ctx.session.userInfo || {}

        if (activeUser !== null && userInfo.username !== activeUser) {
            const accessedTime = 10 * 60 * 1000

            const accessible = new Date().getTime() - new Date(activeTime).getTime() > accessedTime
            if (accessible) {
                const updateFields = {
                    id: resourceId,
                    activeUser: userInfo.username,
                    activeTime: new Date(),
                    updateTime: resource?.updateTime,
                    updateUser: resource?.updateUser
                }
                const res = await LCDataService.update(TABLE_FILE_NAME[lcdTableName], updateFields)
                return {
                    activeUser: userInfo.username,
                    activeTime: new Date()
                }
            } else {
                throw new global.BusinessError(global.i18n.t('没有抢占权限'), -1)
            }
            
        }
    }

    // 释放
    @OutputJson()
    @ProjectAuthorization({})
    @Post('/release')
    async releaseResource (
        @BodyParams() params
    ) {
        const { tableName, resourceId, activeUser } = params
        const lcdTableName = tableName.replaceAll('-', '_').toUpperCase()
        const currentResource = await LCDataService.findOne(TABLE_FILE_NAME[lcdTableName], { id: resourceId })
        if (activeUser === currentResource.activeUser) {
            await LCDataService.update(TABLE_FILE_NAME[lcdTableName], {
                id: resourceId,
                activeUser: null,
                updateTime: currentResource.updateTime,
                updateUser: currentResource.updateUser
            })
            
            return global.i18n.t('解锁成功')
        }
    }
}