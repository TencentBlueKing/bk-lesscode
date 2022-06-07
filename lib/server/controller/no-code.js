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
import { apiPrefix } from '../conf/no-code'
import { LCDataService, TABLE_FILE_NAME } from '../service/data-service'
import { METHODS_WITHOUT_DATA } from '../../shared/api'
import { createNocodeForm, updateNocodeForm } from '../service/nocode-form'

@Controller('/api/nocode')
export default class NoCodeController {
    @OutputJson()
    @All('/(workflow|state|field|service|transition)/*')
    async proxyApi (
        @Ctx({ name: 'method' }) method,
        @Ctx({ name: 'captures' }) captures,
        @BodyParams() body,
        @QueryParams() query
    ) {
        const httpMethod = method.toLowerCase()
        const httpUrl = apiPrefix + captures.join('/')
        const httpParams = [httpUrl]
        if (METHODS_WITHOUT_DATA.includes(httpMethod)) {
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
        @QueryParams({ name: 'versionId' }) versionId,
        @QueryParams({ name: 'page' }) page,
        @QueryParams({ name: 'pageSize' }) pageSize,
        @QueryParams({ name: 'deleteFlag', default: 0 }) deleteFlag,
        @QueryParams({ name: 'flowName' }) flowName
    ) {
        try {
            const query = Object.assign({
                projectId,
                versionId,
                deleteFlag
            }, (flowName ? { flowName: `%${flowName}%` } : {}))
            const { list } = await LCDataService.get({
                tableFileName: TABLE_FILE_NAME.FLOW,
                page,
                pageSize,
                query
            })
            const count = await LCDataService.count(
                TABLE_FILE_NAME.FLOW,
                query
            )
            return { list, count }
        } catch (err) {
            throw new Error(err.message || err)
        }
    }

    // 新增服务
    @OutputJson()
    @Post('/service')
    async createService (
        @BodyParams({ name: 'projectId' }) projectId,
        @BodyParams({ name: 'versionId' }) versionId,
        @BodyParams({ name: 'flowName' }) flowName,
        @BodyParams({ name: 'summary' }) summary
    ) {
        try {
            // 调用 itsm 新增接口
            const { result, data, message } = await http.post(`${apiPrefix}service/`, {
                project_key: 'lesscode',
                name: flowName,
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
                    flowName,
                    itsmId: data.id
                }
            )
            return flowData
        } catch (err) {
            throw new Error(err.message || err)
        }
    }

    @OutputJson()
    @Put('/service')
    async editService (@Ctx() ctx) {
        try {
            const params = ctx.request.body || {}
            // 如果参数里含有itsmId， 并且含有flowName或summary， 调用 itsm 编辑接口
            if (params.itsmId && (params.flowName || params.summary)) {
                const { result, message } = await http.put(`${apiPrefix}service/`, {
                    id: params.itsmId,
                    project_key: 'lesscode',
                    desc: params.summary,
                    name: params.flowName
                })
                if (!result) {
                    throw new global.BusinessError(message, -1)
                }
            }
            // 存储 lesscode flow 表的数据
            const flowData = await LCDataService.update(
                TABLE_FILE_NAME.FLOW,
                params
            )
            return flowData
        } catch (err) {
            throw new Error(err.message || err)
        }
    }

    // 编辑保存单个数据节点
    @OutputJson()
    @Put('/serviceNode')
    async editServiceNode (
        @BodyParams({ name: 'id' }) id,
        @BodyParams({ name: 'projectId' }) projectId,
        @BodyParams({ name: 'versionId' }) versionId,
        @BodyParams({ name: 'pageId' }) pageId,
        @BodyParams({ name: 'nodeId' }) nodeId,
        @BodyParams({ name: 'formData' }) formData
    ) {
        try {
            const flowDetail = await LCDataService.findOne(TABLE_FILE_NAME.FLOW, { id })
            let formId = formData.id || ''
            // 如果不是直接复用表，则需要同步创建或更新db表结构
            if (formData.type !== 'USE_FORM') {
                if (formData.id) {
                    await updateNocodeForm({
                        id: formData.id,
                        content: formData.content,
                        tableName: formData.code,
                        projectId: projectId
                    })
                } else {
                    const resData = await createNocodeForm({
                        content: formData.content,
                        tableName: formData.code,
                        projectId: projectId,
                        versionId: versionId
                    })
                    formId = resData.id
                }
            }
            // 更新flow表的formIds字段
            const curNodeFormMap = { nodeId: formId }
            const formIds = JSON.parse((flowDetail.formIds || '{}'))
            Object.assign(formIds, curNodeFormMap)
    
            const flowData = {
                id,
                pageId,
                formIds: JSON.stringify(formIds)
            }
            const res = await LCDataService.update(LCDataService.TABLE_FILE_NAME.FLOW, flowData)
            return res
        } catch (err) {
            throw new Error(err.message || err)
        }
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

    // 获取服务详情
    @OutputJson()
    @Get('/flow')
    getServiceDetail (
        @QueryParams({ name: 'id' }) id
    ) {
        return LCDataService.findOne(
            TABLE_FILE_NAME.FLOW,
            {
                id
            }
        )
    }
}
