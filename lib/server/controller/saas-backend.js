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
    Ctx,
    BodyParams,
    HeaderParams,
    CookieParams,
    OutputJson,
    QueryParams,
    ProjectAuthorization
} from '../decorator'
import { createModule, getModuleInfo } from '../service/business/v3-service'

@Controller('/api/saas-backend')
export default class SaasBackendController {
    //模块列表
    @OutputJson()
    @ProjectAuthorization({})
    @Get('/getModuleList')
    async getModuleList (
        @HeaderParams({ name: 'x-project-id', require: true }) projectId
    ) {
        const { list } = await LCDataService.get({
            tableFileName: TABLE_FILE_NAME.SAAS_BACKEND,
            query: {
                projectId
            },
            order: {
                id: 'ASC'
            }
        })
        return list
    }

    // 创建模块
    @OutputJson()
    @ProjectAuthorization({})
    @Post('/createModule')
    async createModule (
        @HeaderParams({ name: 'x-project-id', require: true }) projectId,
        @BodyParams({ name: 'createUser', require: true }) createUser,
        @BodyParams({ name: 'appCode', require: true }) appCode,
        @BodyParams({ name: 'moduleCode', require: true }) moduleCode,
        @CookieParams({ name: global.AUTH_NAME }) bkTicket
    ) {
        const params = {
            appCode,
            moduleCode,
            createUser
        }
        const res = await createModule(params, bkTicket)
        let id = ''
        if (res?.module) {
            id = await LCDataService.add(TABLE_FILE_NAME.SAAS_BACKEND, {
                projectId,
                appCode,
                moduleCode
            })
        }
        if (res?.module && id) {
            return res
        } else {
            throw new Error(global.i18n.t('创建失败'))
        }
    }

    //模块列表
    @OutputJson()
    @ProjectAuthorization({})
    @Post('/checkSaasPerm')
    async checkSaasPerm (
        @BodyParams({ name: 'appCode', require: true }) appCode,
        @BodyParams({ name: 'moduleCode' }) moduleCode,
        @BodyParams({ name: 'createUser' }) createUser,
        @CookieParams({ name: global.AUTH_NAME }) bkTicket
    ) {
        moduleCode = moduleCode || 'default'
        const res = await getModuleInfo(appCode, moduleCode, bkTicket, createUser)
        return res
    }
}