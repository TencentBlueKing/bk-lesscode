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
    PathParams,
    Ctx
} from '../decorator'
import http from '../utils/http/index'
import { apiPrefix } from '../conf/no-code'
import { LCDataService, TABLE_FILE_NAME } from '../service/common/data-service'
import { METHODS_WITHOUT_DATA } from '../../shared/api'
import { createNocodeForm, updateNocodeForm } from '../service/business/nocode-form'
import { getFlowList, parseConditions } from '../service/business/no-code'
import { getPreviewDataService } from '../service/business/preview-db-service'

@Controller('/api/nocode')
export default class NoCodeController {
    @OutputJson()
    @All('/(workflow|state|field|service|transition|role_type)/*')
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
        @QueryParams({ name: 'page' }) page,
        @QueryParams({ name: 'pageSize' }) pageSize,
        @QueryParams({ name: 'deleteFlag', default: 0 }) deleteFlag,
        @QueryParams({ name: 'flowName' }) flowName
    ) {
        const query = Object.assign({
            projectId,
            deleteFlag
        }, (flowName ? { flowName: `%${flowName}%` } : {}))
        const { list, count } = await getFlowList({ page, pageSize, query, projectId })
        return { list, count }
    }

    // 新增服务
    @OutputJson()
    @Post('/service')
    async createService (
        @BodyParams({ name: 'projectId' }) projectId,
        @BodyParams({ name: 'flowName' }) flowName,
        @BodyParams({ name: 'summary' }) summary
    ) {
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
                summary,
                flowName,
                itsmId: data.id
            }
        )
        return flowData
    }

    @OutputJson()
    @Put('/service')
    async editService (@Ctx() ctx) {
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
                    formName: formData.formName,
                    projectId: projectId,
                    versionId: versionId
                })
                formId = resData.id
            }
        }
        // 更新flow表的formIds字段
        const curNodeFormMap = { [nodeId]: formId }
        const formIds = JSON.parse((flowDetail.formIds || '{}'))
        Object.assign(formIds, curNodeFormMap)
    
        const flowData = {
            id,
            pageId,
            formIds: JSON.stringify(formIds)
        }
        await LCDataService.update(TABLE_FILE_NAME.FLOW, flowData)
        return { formId }
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

    // 归档or恢复流程
    @OutputJson()
    @Put('/archiveservice')
    async archiveService (
        @BodyParams({ name: 'id' }) flowId,
        @BodyParams({ name: 'deleteFlag' }) deleteFlag
    ) {
        console.log(flowId, deleteFlag, 2125)
        // 归档流程，同时删除提单页和流程数据管理页， 恢复流程，同时恢复提单页和数据管理页
        const flowDetail = await LCDataService.findOne(
            TABLE_FILE_NAME.FLOW,
            { id: flowId }
        )
        if (!flowDetail.id) {
            throw new global.BusinessError('流程id不存在', -1)
        }
        await LCDataService.update(TABLE_FILE_NAME.FLOW, {
            id: flowId, deleteFlag
        })
        if (flowDetail?.pageId) {
            const pageData = { id: flowDetail?.pageId, deleteFlag }
            await LCDataService.update(TABLE_FILE_NAME.PAGE, pageData)
        }
        if (flowDetail?.managePageIds) {
            const managePageData = { id: flowDetail?.managePageIds, deleteFlag }
            await LCDataService.update(TABLE_FILE_NAME.PAGE, managePageData)
        }
        return flowDetail
    }

    // 数据筛选接口
    @OutputJson()
    @Post('/filterTableData/keys/formId/:formId/tableName/:tableName')
    async filterTableDataWithKeys (
        @PathParams({ name: 'formId', require: true }) formId,
        @PathParams({ name: 'tableName', require: true }) tableName,
        @BodyParams({ name: 'page' }) page,
        @BodyParams({ name: 'pageSize' }) pageSize,
        @BodyParams({ name: 'query' }) query
    ) {
        const formData = await LCDataService.findOne(
            TABLE_FILE_NAME.FORM,
            {
                id: formId,
                deleteFlag: 0
            }
        )
        let dataService
        try {
            dataService = await getPreviewDataService(formData.projectId)
            const result = await dataService.get({
                tableFileName: tableName,
                page,
                pageSize,
                query
            })
            return result
        } catch (error) {
            throw new global.BusinessError(error.message || error, -1, 500, error.stack)
        } finally {
            if (dataService) await dataService.close()
        }
    }

    // 表单数据源
    @OutputJson()
    @Post('/filterTableData/conditions/formId/:formId/tableName/:tableName')
    async filterTableDataWithConditions (
        @PathParams({ name: 'formId', require: true }) formId,
        @PathParams({ name: 'tableName', require: true }) tableName,
        @BodyParams({ name: 'conditions' }) conditions,
        @BodyParams({ name: 'field' }) field
    ) {
        const formData = await LCDataService.findOne(
            TABLE_FILE_NAME.FORM,
            {
                id: formId,
                deleteFlag: 0
            }
        )
        let dataService
        try {
            dataService = await getPreviewDataService(formData.projectId)
            const query = parseConditions(conditions)
            const { list } = await dataService.get({
                tableFileName: tableName,
                query
            })
            return list.map((item) => ({
                id: item.id,
                [field]: item[field]
            }))
        } catch (error) {
            throw new global.BusinessError(error.message || error, -1, 500, error.stack)
        } finally {
            if (dataService) await dataService.close()
        }
    }
}
