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
    HeaderParams,
    CookieParams,
    OutputJson
} from '../decorator'
import dataService, {
    Like
} from '../service/data-service'
import {
    validate,
    transferData,
    transferTimeByTimezoneOffset,
    querySqlCheck,
    getTableDatas as getTableDatasInPreview
} from '../service/data-source'
import {
    getTableDatas as getTableDatasInBkBase,
    execSQL as execSqlInBkBase
} from '../service/bk-base'
 
@Controller('/api/data-source')
export default class DataSourceController {
    // 用户获取某张表的某个数据详情
    @OutputJson()
    @Get('/user/tableName/:tableName/detail')
    async getTableDataDetail (
        @PathParams({ name: 'tableName', require: true }) tableFileName,
        @QueryParams() queryData,
        @HeaderParams({ name: 'x-timezone-offset' }) timezoneOffset
    ) {
        const result = await dataService.findOne(
            tableFileName,
            queryData
        )
        const { columns } = dataService.getTableMetadata(tableFileName)
        return transferTimeByTimezoneOffset(columns, result, timezoneOffset)
    }

    // 获取某张表下数据
    @OutputJson()
    @Get('/user/projectId/:projectId/tableName/:tableName')
    async getTableDataWithProjectPath (
        @PathParams({ name: 'tableName', require: true }) tableFileName,
        @HeaderParams({ name: 'x-timezone-offset' }) timezoneOffset,
        @QueryParams() queryData
    ) {
        const {
            page,
            pageSize,
            sortKey,
            sortValue,
            ...others
        } = queryData
        const order = sortKey
            ? {
                [sortKey]: sortValue
            }
            : {
                id: 'DESC'
            }
        const query = Object
            .keys(others)
            .reduce((acc, cur) => {
                acc[cur] = Like(`%${others[cur]}%`)
                return acc
            }, {})
        const result = await dataService.get({
            tableFileName,
            page,
            pageSize,
            order,
            query
        })
        const { columns } = dataService.getTableMetadata(tableFileName)
        result.list = transferTimeByTimezoneOffset(columns, result.list, timezoneOffset)
        return result
    }

    // 获取某张表下数据
    @OutputJson()
    @Get('/user/tableName/:tableName')
    getTableData (
        @PathParams({ name: 'tableName', require: true }) tableFileName,
        @HeaderParams({ name: 'x-timezone-offset' }) timezoneOffset,
        @CookieParams({ name: global.AUTH_NAME }) bkTicket,
        @QueryParams({ name: 'bkDataSourceType', default: 'preview' }) bkDataSourceType,
        @QueryParams() queryData
    ) {
        const getTableDataMap = {
            'preview': () => getTableDatasInPreview(queryData, tableFileName, timezoneOffset),
            'bk-base': () => getTableDatasInBkBase(queryData, tableFileName, bkTicket)
        }
        return getTableDataMap[bkDataSourceType]()
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
        await validate(formId, data)
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
        await validate(formId, data)
        // 入库
        const result = await dataService.add(tableName, transferData(formId, data))
        return result
    }

    // // 更新数据
    @OutputJson()
    @Put('/user/tableName/:tableName/update/condition')
    async updatePerviewTableDataWithCondition (
        @PathParams({ name: 'tableName', require: true }) tableName,
        @BodyParams({ name: 'data', require: true }) data,
        @BodyParams({ name: 'where', require: true }) where
    ) {
        const result = await dataService.updateWithCondition(tableName, data, where)
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
        await validate(formId, data)
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
        await validate(formId, data)
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
        @QueryParams() queryData
    ) {
        const result = await dataService.delete(tableName, queryData)
        return result
    }

    // 获取表结构
    @OutputJson()
    @Get('/user/tableName/:tableName/columns')
    async getTableMetaData (
        @PathParams({ name: 'tableName', require: true }) tableName
    ) {
        const { columns } = dataService.getTableMetadata(tableName)
        return columns.map(({ entityMetadata, ...others }) => {
            return others
        })
    }

    @OutputJson()
    @Post('/user/queryBySql')
    queryBySql (
        @BodyParams({ name: 'sql' }) sql,
        @BodyParams({ name: 'dataSourceType', default: 'preview' }) dataSourceType,
        @CookieParams({ name: global.AUTH_NAME }) bkTicket
    ) {
        querySqlCheck(sql)
        const querySqlMap = {
            'preview': () => dataService.execMultSql(sql),
            'bk-base': () => execSqlInBkBase(sql, bkTicket)
        }
        return querySqlMap[dataSourceType]()
    }
}
