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
    Put,
    Delete,
    PathParams,
    BodyParams,
    QueryParams,
    OutputJson
} from '../decorator'
import dataService from '../service/data-service'
import {
    validate,
    transferData
} from '../service/data-source'
 
@Controller('/api/data-source')
export default class DataSourceController {
    // 用户获取预览环境某张表的某个数据详情
    @OutputJson()
    @Get('/user/tableName/:tableName/id/:id')
    async getTableDataDetail (
        @PathParams({ name: 'tableName', require: true }) tableFileName,
        @PathParams({ name: 'id', require: true }) id
    ) {
        const result = await dataService.findOne(
            tableFileName,
            {
                id
            }
        )
        return result
    }

    // 获取某张表下数据
    @OutputJson()
    @Get('/user/projectId/:projectId/tableName/:tableName')
    async getTableDataWithProjectPath (
        @PathParams({ name: 'tableName', require: true }) tableFileName,
        @PathParams({ name: 'projectId', require: true }) projectId,
        @QueryParams() queryData
    ) {
        const {
            page,
            pageSize,
            sortKey,
            sortValue,
            ...query
        } = queryData
        const order = sortKey
            ? {
                [sortKey]: sortValue
            }
            : {
                id: 'DESC'
            }
        const result = await dataService.get({
            tableFileName,
            page,
            pageSize,
            order,
            query
        })
        return result
    }

    // 获取某张表下数据
    @OutputJson()
    @Get('/user/tableName/:tableName')
    async getTableData (
        @PathParams({ name: 'tableName', require: true }) tableFileName,
        @QueryParams({ name: 'pageSize' }) pageSize,
        @QueryParams({ name: 'page' }) page
    ) {
        const result = await dataService.get({
            tableFileName,
            page,
            pageSize,
            order: {
                id: 'DESC'
            },
            query: {}
        })
        return result
    }
 
    // 新增数据
    @OutputJson()
    @Post('/user/projectId/:projectId/tableName/:tableName')
    async addTableDataWithProjectPath (
        @PathParams({ name: 'tableName', require: true }) tableName,
        @QueryParams({ name: 'formId' }) formId,
        @BodyParams() data
    ) {
        // 入库校验
        validate(formId, data)
        // 入库
        const result = await dataService.add(tableName, transferData(formId, data))
        return result
    }

    // 新增数据
    @OutputJson()
    @Post('/user/tableName/:tableName')
    async addTableData (
        @PathParams({ name: 'tableName', require: true }) tableName,
        @QueryParams({ name: 'formId' }) formId,
        @BodyParams() data
    ) {
        // 入库校验
        validate(formId, data)
        // 入库
        const result = await dataService.add(tableName, transferData(formId, data))
        return result
    }
 
    // 更新数据
    @OutputJson()
    @Put('/user/projectId/:projectId/tableName/:tableName')
    async updateTableDataWithProjectPath (
        @PathParams({ name: 'tableName', require: true }) tableName,
        @QueryParams({ name: 'formId' }) formId,
        @BodyParams() data
    ) {
        // 入库校验
        validate(formId, data)
        // 入库
        const result = await dataService.update(tableName, transferData(formId, data))
        return result
    }

    // 更新数据
    @OutputJson()
    @Put('/user/tableName/:tableName')
    async updateTableData (
        @PathParams({ name: 'tableName', require: true }) tableName,
        @QueryParams({ name: 'formId' }) formId,
        @BodyParams() data
    ) {
        // 入库校验
        validate(formId, data)
        // 入库
        const result = await dataService.update(tableName, transferData(formId, data))
        return result
    }
 
    // 删除数据
    @OutputJson()
    @Delete('/user/projectId/:projectId/tableName/:tableName')
    async deleteTableDataWithProjectPat (
        @PathParams({ name: 'tableName', require: true }) tableName,
        @QueryParams({ name: 'id', require: true }) id
    ) {
        const result = await dataService.delete(tableName, id)
        return result
    }

    // 删除数据
    @OutputJson()
    @Delete('/user/tableName/:tableName')
    async deleteTableData (
        @PathParams({ name: 'tableName', require: true }) tableName,
        @QueryParams({ name: 'id', require: true }) id
    ) {
        const result = await dataService.delete(tableName, id)
        return result
    }

    // 获取表结构
    @OutputJson()
    @Get('/user/tableName/:tableName/metadata')
    async getTableMetaData (
        @PathParams({ name: 'tableName', require: true }) tableName
    ) {
        const { columns } = dataService.getTableMetadata(tableName)
        return columns.map(({ entityMetadata, ...others }) => {
            return others
        })
    }
}
