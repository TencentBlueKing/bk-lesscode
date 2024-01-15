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
import { createBuilder, patchBuilder, updateBuilder, queryBuilder } from '../service/business/saas_builder'
import {
    Controller,
    Post,
    Get,
    Put,
    BodyParams,
    OutputJson,
    QueryParams,
    CookieParams,
    ProjectAuthorization,
} from '../decorator'
import { IAM_ACTION } from '../../shared/constant.js'

@Controller('/api/projects/:projectId/saas-module-story')
export default class SaasModuleStoryController {
    //模块列表
    @OutputJson()
    @Get('/getStoryList')
    // @ProjectAuthorization({ getId: ctx => ctx.params?.projectId, needAuthActions: [IAM_ACTION.develop_app[0]] })
    async getModuleList (
        @QueryParams({ name: 'moduleId', require: true }) moduleId,
    ) {
        const { list } = await LCDataService.get({
            tableFileName: TABLE_FILE_NAME.SAAS_MODULE_STORY,
            query: {
                moduleId
            },
            order: {
                id: 'ASC'
            }
        })
        return list
    }

    // 新增需求
    @OutputJson()
    @Post('/createStory')
    // @ProjectAuthorization({ getId: ctx => ctx.params?.projectId, needAuthActions: [IAM_ACTION.develop_app[0]] })
    async createStory (
        @BodyParams() params,
        @CookieParams({ name: global.AUTH_NAME }) bkToken
    ) {
        const storyParams = {
            story: params.story,
            moduleId: params.moduleId,
            uuid: params.uuid,
        }
        
        // 调用接口生成saas-builder
        const res = await createBuilder(params, bkToken)
        
        // 生成后存到本地db
        const id = await LCDataService.add(TABLE_FILE_NAME.SAAS_MODULE_STORY, storyParams)
        Object.assign(params, { id })

        // 调用patch写入需求具体内容并执行
        const patchRes = await patchBuilder(params, bkToken)

        return params
    }

    // 修改需求并执行
    @OutputJson()
    @Post('/patchStory')
    // @ProjectAuthorization({ getId: ctx => ctx.params?.projectId, needAuthActions: [IAM_ACTION.develop_app[0]] })
    async patchStory (
        @BodyParams() params,
        @CookieParams({ name: global.AUTH_NAME }) bkToken
    ) {
        const storyParams = {
            story: params.story,
            uuid: params.uuid,
        }
        
        const res = await patchBuilder(storyParams, bkToken)
        
        const storyItem = await LCDataService.findOne(
            TABLE_FILE_NAME.SAAS_MODULE_STORY,
            { uuid: storyParams.uuid }
        )
        await LCDataService.update(TABLE_FILE_NAME.SAAS_MODULE_STORY, {
            id: storyItem.id,
            sotry: storyParams.story
        })
        
        return params
    }

    // 修改需求并执行
    @OutputJson()
    @Put('/updateStory')
    // @ProjectAuthorization({ getId: ctx => ctx.params?.projectId, needAuthActions: [IAM_ACTION.develop_app[0]] })
    async updateStory (
        @BodyParams() params,
        @CookieParams({ name: global.AUTH_NAME }) bkToken
    ) {
        const res = await updateBuilder(params, bkToken)
        
        return res
    }

    // 查询saas-builder详情
    @OutputJson()
    @Get('/getBuilderDetail')
    // @ProjectAuthorization({ getId: ctx => ctx.params?.projectId, needAuthActions: [IAM_ACTION.develop_app[0]] })
    async getBuilderDetail (
        @QueryParams({ name: 'uuid' }) uuid,
        @CookieParams({ name: global.AUTH_NAME }) bkToken
    ) {
        return queryBuilder(uuid, bkToken)
    } 
}