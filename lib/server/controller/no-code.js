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
    OutputJson,
    All,
    Get,
    Post,
    Put,
    Delete,
    BodyParams,
    QueryParams,
    Ctx
} from '../decorator'
import http from '../utils/http/index'
import { apiPerfix } from '../conf/no-code'
import { LCDataService, TABLE_FILE_NAME } from '../service/data-service'

@Controller('/api/nocode')
export default class NoCodeController {
    @OutputJson()
    @All('/*')
    async proxyApi (
        @Ctx({ name: 'method' }) method,
        @Ctx({ name: 'captures' }) captures,
        @BodyParams() body,
        @QueryParams() query
    ) {
        const methodsWithoutData = ['delete', 'get', 'head', 'options']
        const httpMethod = method.toLowerCase()
        const httpUrl = apiPerfix + captures[0]
        const httpParams = [httpUrl]
        if (methodsWithoutData.includes(httpMethod)) {
            httpParams.push({ params: query })
        } else {
            httpParams.push(body)
        }
        const { result, data, message } = await http[httpMethod](...httpParams)
        if (result) {
            return data
        } else {
            throw new global.BusinessError(message, -1)
        }
    }

    // 获取已有服务列表
    @OutputJson()
    @Get('/service')
    async getService (
        @QueryParams({ name: 'projectId' }) projectId,
        @QueryParams({ name: 'versionId' }) versionId
    ) {
        const { list } = await LCDataService.get({
            tableFileName: TABLE_FILE_NAME.FLOW,
            query: {
                projectId,
                versionId
            }
        })
        return list
    }

    // 新增服务
    @OutputJson()
    @Post('/service')
    async createService (
        @BodyParams({ name: 'projectId' }) projectId,
        @BodyParams({ name: 'versionId' }) versionId,
        @BodyParams({ name: 'name' }) name,
        @BodyParams({ name: 'summary' }) summary
    ) {
        // 调用 itsm 新增接口
        const { result, data, message } = await http.post(`${apiPerfix}service/`, {
            catalog_id: 2,
            key: 'request',
            project_key: 'lesscode',
            name,
            desc: summary
        })
        if (!result) {
            throw new global.BusinessError(message, -1)
        }
        // 存储 lesscode flow 表的数据
        const flowData = await LCDataService.add(
            TABLE_FILE_NAME.FLOW,
            {
                projectId,
                versionId,
                summary,
                flowName: name,
                itsmId: data.id
            }
        )
        return flowData
    }

    // 编辑服务
    @OutputJson()
    @Put('/service')
    async editService (
        @BodyParams({ name: 'projectId' }) projectId,
        @BodyParams({ name: 'versionId' }) versionId,
        @BodyParams({ name: 'name' }) name,
        @BodyParams({ name: 'summary' }) summary,
        @BodyParams({ name: 'itsmId' }) itsmId,
        @BodyParams({ name: 'id' }) id
    ) {
        // 调用 itsm 编辑接口
        const { result, message } = await http.put(`${apiPerfix}service/`, {
            catalog_id: 2,
            id: itsmId,
            key: 'request',
            project_key: 'lesscode',
            desc: summary,
            name
        })
        if (!result) {
            throw new global.BusinessError(message, -1)
        }
        // 存储 lesscode flow 表的数据
        const flowData = await LCDataService.update(
            TABLE_FILE_NAME.FLOW,
            {
                id,
                projectId,
                versionId,
                summary,
                flowName: name
            }
        )
        return flowData
    }

    // 删除服务
    @OutputJson()
    @Delete('/service')
    deleteService (
        @QueryParams({ name: 'id' }) id
    ) {
        return LCDataService.softDelete(
            TABLE_FILE_NAME.FLOW,
            id
        )
    }
}
