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
import { getPreviewDbInfo } from '../service/business/preview-db-service'
import { createBuilder, patchBuilder, updateBuilder, queryBuilder, queryApiDoc } from '../service/business/saas_builder'
import {
    Controller,
    Post,
    Get,
    Put,
    BodyParams,
    HeaderParams,
    OutputJson,
    QueryParams,
    CookieParams,
    ProjectAuthorization,
} from '../decorator'

const dataBaseConf = require('../conf/data-source')

@Controller('/api/saas-module-story')
export default class SaasModuleStoryController {
    //模块列表
    @OutputJson()
    @ProjectAuthorization({})
    @Get('/getStoryList')
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
    @ProjectAuthorization({})
    @Post('/createStory')
    async createStory (
        @BodyParams() params,
        @HeaderParams({ name: 'x-project-id', require: true }) projectId,
        @CookieParams({ name: global.AUTH_NAME }) bkToken
    ) {
        const storyParams = {
            story: params.story,
            moduleId: params.moduleId,
            uuid: params.uuid,
            projectId: params.projectId
        }

        // 开启db或获取db配置
        const dbConfig = await getPreviewDbInfo(projectId)
        if (!dbConfig.id) {
            throw new Error(global.i18n.t('获取db信息失败'))
        }
        const config = process.env.NODE_ENV === 'production' ? dataBaseConf.prod : dataBaseConf.dev
        params.db_config = {
            name: dbConfig.dbName,
            username: dbConfig.userName,
            password: dbConfig.passWord,
            host: config.host,
            port: config.port
        }
        
        // 调用接口生成saas-builder
        await createBuilder(params, bkToken)
        
        // 生成后存到本地db
        const id = await LCDataService.add(TABLE_FILE_NAME.SAAS_MODULE_STORY, storyParams)
        Object.assign(params, { id })

        // 调用patch写入需求具体内容并执行
        await patchBuilder(params, bkToken)

        return params
    }

    // 修改需求并执行
    @OutputJson()
    @ProjectAuthorization({})
    @Post('/patchStory')
    async patchStory (
        @BodyParams() params,
        @CookieParams({ name: global.AUTH_NAME }) bkToken
    ) {
        const storyParams = {
            story: params.story,
            uuid: params.uuid,
        }
        
        await patchBuilder(params, bkToken)
        
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
    @ProjectAuthorization({})
    @Post('/execStory')
    async execStory (
        @BodyParams() params,
        @CookieParams({ name: global.AUTH_NAME }) bkToken
    ) {
        const res = await patchBuilder(params, bkToken)
        
        return res
    }

    // 修改需求并执行
    @OutputJson()
    @ProjectAuthorization({})
    @Put('/updateStory')
    async updateStory (
        @BodyParams() params,
        @CookieParams({ name: global.AUTH_NAME }) bkToken
    ) {
        const res = await updateBuilder(params, bkToken)
        
        return res
    }

    // 查询saas-builder详情
    @OutputJson()
    @ProjectAuthorization({})
    @Get('/getBuilderDetail')
    async getBuilderDetail (
        @QueryParams({ name: 'uuid' }) uuid,
        @CookieParams({ name: global.AUTH_NAME }) bkToken
    ) {
        return queryBuilder(uuid, bkToken)
    } 

    // 查询saas-builder详情
    @OutputJson()
    @ProjectAuthorization({})
    @Get('/getBuilderApiDoc')
    async getBuilderApiDoc (
        @QueryParams({ name: 'schemaUrl' }) schemaUrl,
        @QueryParams({ name: 'type' }) type,
        @CookieParams({ name: global.AUTH_NAME }) bkToken
    ) {
        try {
            const docJson = await queryApiDoc(schemaUrl, bkToken)
            if (type === 'API_DETAIL') {
                const paths = docJson?.paths || {}
                let apis = []
                Object.keys(paths).map(key => {
                    try {
                        const keyContent = Object.values(paths[key]).length && Object.values(paths[key])[0]
                        const tag = keyContent?.tags[0]
                        const id = keyContent?.operationId
                        let item = {
                            path: key,
                            desc: keyContent?.description,
                            link: `/${tag}/${id}`
                        }
                        apis.push(item)
                    } catch (error) {
                        console.log(error)
                    }  
                })
                return apis
            } else {
                return docJson
            }
        } catch (err) {
            return []
        }  
    }
}