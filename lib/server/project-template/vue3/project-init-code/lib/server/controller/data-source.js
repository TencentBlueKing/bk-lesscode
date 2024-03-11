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
import {
    Like
} from '../service/data-service'
import {
    validate,
    transferData,
    transferTimeByTimezoneOffset,
    querySqlCheck,
    decodeSql,
    getDataService,
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
    @Get('/user/tableName/:tableName/detail/:thirdPartDBName?')
    async getTableDataDetail (
        @PathParams({ name: 'tableName', require: true }) tableFileName,
        @PathParams({ name: 'thirdPartDBName' }) thirdPartDBName,
        @QueryParams() queryData,
        @HeaderParams({ name: 'x-timezone-offset' }) timezoneOffset
    ) {
        const dataService = await getDataService(thirdPartDBName)
        const result = await dataService.findOne(
            tableFileName,
            queryData
        )
        const { columns } = dataService.getTableMetadata(tableFileName)
        return transferTimeByTimezoneOffset(columns, result, timezoneOffset)
    }

    // 获取表结构
    @OutputJson()
    @Get('/user/tableName/:tableName/columns/:thirdPartDBName?')
    async getTableMetaData (
        @PathParams({ name: 'tableName', require: true }) tableName,
        @PathParams({ name: 'thirdPartDBName' }) thirdPartDBName
    ) {
        const dataService = await getDataService(thirdPartDBName)
        const { columns } = dataService.getTableMetadata(tableName)
        return columns.map(({ entityMetadata, ...others }) => {
            return others
        })
    }

    // 获取某张表下数据
    @OutputJson()
    @Get('/user/projectId/:projectId/tableName/:tableName')
    async getTableDataWithProjectPath (
        @PathParams({ name: 'tableName', require: true }) tableFileName,
        @HeaderParams({ name: 'x-timezone-offset' }) timezoneOffset,
        @QueryParams() queryData
    ) {
        const dataService = await getDataService()
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
    @Get('/user/tableName/:tableName/:thirdPartDBName?')
    getTableData (
        @PathParams({ name: 'tableName', require: true }) tableFileName,
        @PathParams({ name: 'thirdPartDBName' }) thirdPartDBName,
        @HeaderParams({ name: 'x-timezone-offset' }) timezoneOffset,
        @CookieParams({ name: global.AUTH_NAME }) bkTicket,
        @QueryParams({ name: 'bkDataSourceType', default: 'preview' }) bkDataSourceType,
        @QueryParams() queryData
    ) {
        const getTableDataMap = {
            'preview': () => getTableDatasInPreview(queryData, tableFileName, timezoneOffset),
            'bk-base': () => getTableDatasInBkBase(queryData, tableFileName, bkTicket),
            'third-part': () => getTableDatasInPreview(queryData, tableFileName, timezoneOffset, thirdPartDBName)
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
        const dataService = await getDataService()
        const result = await dataService.add(tableName, transferData(formId, data))
        return result
    }

    // 新增数据
    @OutputJson()
    @Post('/user/tableName/:tableName/:thirdPartDBName?')
    async addTableData (
        @PathParams({ name: 'tableName', require: true }) tableName,
        @PathParams({ name: 'thirdPartDBName' }) thirdPartDBName,
        @QueryParams({ name: 'formId' }) formId,
        @BodyParams() data
    ) {
        // 入库校验
        await validate(formId, data)
        // 入库
        const dataService = await getDataService(thirdPartDBName)
        const result = await dataService.add(tableName, transferData(formId, data))
        return result
    }

    // // 更新数据
    @OutputJson()
    @Put('/user/tableName/:tableName/update/condition/:thirdPartDBName?')
    async updatePerviewTableDataWithCondition (
        @PathParams({ name: 'tableName', require: true }) tableName,
        @PathParams({ name: 'thirdPartDBName' }) thirdPartDBName,
        @BodyParams({ name: 'data', require: true }) data,
        @BodyParams({ name: 'where', require: true }) where
    ) {
        const dataService = await getDataService(thirdPartDBName)
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
        const dataService = await getDataService()
        // 入库
        const result = await dataService.update(tableName, transferData(formId, data))
        return result
    }

    // 更新数据
    @OutputJson()
    @Put('/user/tableName/:tableName/:thirdPartDBName?')
    async updateTableData (
        @PathParams({ name: 'tableName', require: true }) tableName,
        @PathParams({ name: 'thirdPartDBName' }) thirdPartDBName,
        @QueryParams({ name: 'formId' }) formId,
        @BodyParams() data
    ) {
        // 入库校验
        await validate(formId, data)
        // 入库
        const dataService = await getDataService(thirdPartDBName)
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
        const dataService = await getDataService()
        const result = await dataService.delete(tableName, id)
        return result
    }

    // 删除数据
    @OutputJson()
    @Delete('/user/tableName/:tableName/:thirdPartDBName?')
    async deleteTableData (
        @PathParams({ name: 'tableName', require: true }) tableName,
        @PathParams({ name: 'thirdPartDBName' }) thirdPartDBName,
        @QueryParams() queryData
    ) {
        const dataService = await getDataService(thirdPartDBName)
        const result = await dataService.delete(tableName, queryData)
        return result
    }

    @OutputJson()
    @Post('/user/queryBySql/:thirdPartDBName?')
    async queryBySql (
        @PathParams({ name: 'thirdPartDBName' }) thirdPartDBName,
        @BodyParams({ name: 'sql' }) sql,
        @BodyParams({ name: 'dataSourceType', default: 'preview' }) dataSourceType,
        @CookieParams({ name: global.AUTH_NAME }) bkTicket
    ) {
        const clearSql = decodeSql(sql)
        querySqlCheck(clearSql)
        const dataService = await getDataService(thirdPartDBName)
        const querySqlMap = {
            'preview': () => dataService.execMultSql(clearSql),
            'bk-base': () => execSqlInBkBase(clearSql, bkTicket),
            'third-part': () => dataService.execMultSql(clearSql)
        }
        return querySqlMap[dataSourceType]()
    }
}
