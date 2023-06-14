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
    TABLE_FILE_NAME,
    Between,
    Like
} from '../service/common/data-service'
import OnlineDBService, { getOnlineDbConfig } from '../service/common/online-db-service'
import DBEngineService from '../service/common/db-engine-service'
import {
    enablePerviewDb,
    getPreviewDbConfig,
    getPreviewDataService,
    execSQL as execSqlInPreview,
    getTables as getTablesInPreview,
    getTableDatas as getTableDatasInPreview
} from '../service/business/preview-db-service'
import {
    execSQL as execSqlInBkBase,
    getTables as getTablesInBkBase,
    getTableDatas as getTableDatasInBkBase,
    getMetaBizs
} from '../service/business/bk-base'
import {
    validate,
    transferData,
    transferTimeByTimezoneOffset,
    querySqlCheck
} from '../service/business/data-source'
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
    ProjectAuthorization,
    OutputJson,
    OutputZip
} from '../decorator'
import {
    generateExportDatas,
    generateExportStruct,
    DATA_FILE_TYPE
} from '../../shared/data-source'
import { IAM_ACTION } from '../../shared/constant.js'

@Controller('/api/data-source')
export default class DataSourceController {
    // 开启数据源，需要同步创建项目下的数据库和用户
    @OutputJson()
    @Post('/enable')
    async enable (
        @BodyParams({ name: 'projectId', require: true }) projectId
    ) {
        const projectInfo = await LCDataService.findOne(TABLE_FILE_NAME.PROJECT, { id: projectId, deleteFlag: 0 })
        if (projectInfo.isEnableDataSource <= 0) {
            // 如果未开启，则开启
            projectInfo.isEnableDataSource = 1
            await enablePerviewDb(projectId, projectInfo.id + projectInfo.projectCode)
            await LCDataService.update(TABLE_FILE_NAME.PROJECT, projectInfo)
        } else {
            throw new Error(global.i18n.t('已开启数据源的项目，不能重复开启！'))
        }
    }

    // 获取项目下的所有表结构
    @OutputJson()
    @ProjectAuthorization({ getId: ctx => ctx.request.headers['x-project-id'], needAuthActions: [IAM_ACTION.develop_app[0]] })
    @Get('/getTables')
    async getTables (
        @QueryParams({ name: 'projectId', require: true }) projectId,
        @QueryParams({ name: 'pageSize' }) pageSize,
        @QueryParams({ name: 'page' }) page,
        @QueryParams({ name: 'dataSourceType', default: 'preview' }) dataSourceType,
        @CookieParams({ name: global.AUTH_NAME }) bkTicket
    ) {
        // 下拉列表的时候：preview 拉取表列表。bk-base 拉取业务列表（表分类），表列表需要二次拉取
        const getTableMap = {
            'preview': () => getTablesInPreview(projectId, page, pageSize),
            'bk-base': () => getMetaBizs(projectId, bkTicket)
        }
        return getTableMap[dataSourceType]()
    }

    // 获取 bkbase 表列表
    @OutputJson()
    @ProjectAuthorization({ getId: ctx => ctx.request.headers['x-project-id'], needAuthActions: [IAM_ACTION.develop_app[0]] })
    @Get('/getBkBaseTables')
    getBkBaseTables (
        @HeaderParams({ name: 'x-project-id', require: true }) projectId,
        @QueryParams({ name: 'bkBizId', require: true }) bkBizId,
        @CookieParams({ name: global.AUTH_NAME }) bkTicket
    ) {
        return getTablesInBkBase(projectId, bkTicket, bkBizId)
    }

    // 获取表详情
    @OutputJson()
    @ProjectAuthorization({ getId: ctx => ctx.request.headers['x-project-id'], needAuthActions: [IAM_ACTION.develop_app[0]] })
    @Get('/getTableDetail')
    async getTableDetail (
        @HeaderParams({ name: 'x-project-id', require: true }) projectId,
        @QueryParams() query
    ) {
        const queryParams = { deleteFlag: 0, projectId, ...query }
        const data = await LCDataService.findOne(TABLE_FILE_NAME.DATA_TABLE, queryParams)
        data.columns = JSON.parse(data.columns)
        return data
    }

    // 获取表详情
    @OutputJson()
    @ProjectAuthorization({ getId: ctx => ctx.request.headers['x-project-id'], needAuthActions: [IAM_ACTION.develop_app[0], IAM_ACTION.deploy_app[0]] })
    @Post('/tableRecordList')
    async tableRecordList (
        @BodyParams({ name: 'id' }) tableId,
        @BodyParams({ name: 'projectId' }) projectId,
        @BodyParams({ name: 'createUser' }) createUser,
        @BodyParams({ name: 'timeRange', default: [] }) timeRange
    ) {
        timeRange = timeRange.filter(v => v)
        const [
            startTime = 0,
            endTime = new Date()
        ] = timeRange
        const query = {
            deleteFlag: 0,
            createTime: Between(startTime, endTime)
        }
        if (createUser) query.createUser = Like(`%${createUser}%`)
        if (projectId) query.projectId = projectId
        if (tableId) query.tableId = tableId

        const { list } = await LCDataService.get({
            tableFileName: TABLE_FILE_NAME.DATA_TABLE_MODIFY_RECORD,
            query,
            order: {
                createTime: 'DESC'
            }
        })

        return list
    }

    // 通过 id 获取sql变更详情
    @OutputJson()
    @ProjectAuthorization({ getId: ctx => ctx.request.headers['x-project-id'], needAuthActions: [IAM_ACTION.develop_app[0]] })
    @Get('/getSqlRecords')
    async getSqlRecords (
        @QueryParams({ name: 'ids' }) ids
    ) {
        const sqlIdArray = (ids || '').split(',')
        const { list } = await LCDataService.get({
            tableFileName: TABLE_FILE_NAME.DATA_TABLE_MODIFY_RECORD,
            query: {
                deleteFlag: 0,
                id: sqlIdArray
            }
        })
        return list
    }

    // 新增表结构
    @OutputJson()
    @ProjectAuthorization({ getId: ctx => ctx.request.headers['x-project-id'], needAuthActions: [IAM_ACTION.develop_app[0]] })
    @Post('/addTable')
    async addTable (
        @BodyParams({ name: 'dataTable', require: true }) dataTable,
        @BodyParams({ name: 'record', require: true }) record
    ) {
        dataTable.columns = JSON.stringify(dataTable.columns)
        const data = await LCDataService.add(TABLE_FILE_NAME.DATA_TABLE, dataTable)
        const tableModifyRecord = {
            ...record,
            tableId: data.id
        }
        await LCDataService.add(TABLE_FILE_NAME.DATA_TABLE_MODIFY_RECORD, tableModifyRecord)
        return data
    }

    // 修改表结构
    @OutputJson()
    @ProjectAuthorization({ getId: ctx => ctx.request.headers['x-project-id'], needAuthActions: [IAM_ACTION.develop_app[0]] })
    @Put('/updateTable')
    async updateTable (
        @BodyParams({ name: 'dataTable', require: true }) dataTable,
        @BodyParams({ name: 'record', require: true }) record
    ) {
        dataTable.columns = JSON.stringify(dataTable.columns)
        const data = await LCDataService.update(TABLE_FILE_NAME.DATA_TABLE, dataTable)
        await LCDataService.add(TABLE_FILE_NAME.DATA_TABLE_MODIFY_RECORD, record)
        return data
    }

    // 删除表结构
    @OutputJson()
    @Put('/deleteTable')
    async deleteTable (
        @BodyParams({ name: 'ids', require: true }) ids,
        @BodyParams({ name: 'records', require: true }) records
    ) {
        const data = await LCDataService.bulkSoftDelete(TABLE_FILE_NAME.DATA_TABLE, ids)
        await LCDataService.add(TABLE_FILE_NAME.DATA_TABLE_MODIFY_RECORD, records)
        return data
    }

    // 修改线上环境数据库，包含表结构和表数据修改
    @OutputJson()
    @ProjectAuthorization({ getId: ctx => ctx.request.body.projectId, needAuthActions: [IAM_ACTION.develop_app[0]] })
    @Put('/modifyOnlineDb')
    async modifyOnlineDb (
        @BodyParams({ name: 'environment', default: 'preview' }) environment,
        @BodyParams({ name: 'projectId', require: true }) projectId,
        @BodyParams({ name: 'sql', require: true }) sql
    ) {
        const getDbConfig = environment === 'preview'
            ? getPreviewDbConfig
            : getOnlineDbConfig
        const previewDbConfig = await getDbConfig(projectId, environment)
        const dbEngine = new DBEngineService(previewDbConfig)
        return dbEngine.execMultSql(sql)
    }

    // 获取线上表列表，纯sql的方式
    @OutputJson()
    @ProjectAuthorization({ getId: ctx => ctx.request.headers['x-project-id'], needAuthActions: [IAM_ACTION.develop_app[0]] })
    @Get('/getOnlineTableList')
    async getOnlineTableList (
        @QueryParams({ name: 'environment', require: true }) environment,
        @QueryParams({ name: 'projectId', require: true }) projectId
    ) {
        const getDbConfig = environment === 'preview'
            ? getPreviewDbConfig
            : getOnlineDbConfig
        const previewDbConfig = await getDbConfig(projectId, environment)
        const dbEngine = new DBEngineService(previewDbConfig)
        const onlineDBService = new OnlineDBService(dbEngine)
        const onlineTables = await onlineDBService.showTables()
        return onlineDBService.describeTables(onlineTables)
    }

    // 获取线上表数据，纯sql的方式
    @OutputJson()
    @ProjectAuthorization({ getId: ctx => ctx.request.headers['x-project-id'], needAuthActions: [IAM_ACTION.develop_app[0]] })
    @Get('/getOnlineTableDatas')
    async getOnlineTableDatas (
        @QueryParams({ name: 'environment', require: true }) environment,
        @QueryParams({ name: 'projectId', require: true }) projectId,
        @QueryParams({ name: 'tableName', require: true }) tableName,
        @QueryParams({ name: 'page' }) page,
        @QueryParams({ name: 'pageSize' }) pageSize
    ) {
        const getDbConfig = environment === 'preview'
            ? getPreviewDbConfig
            : getOnlineDbConfig
        const previewDbConfig = await getDbConfig(projectId, environment)
        const dbEngine = new DBEngineService(previewDbConfig)
        const onlineDBService = new OnlineDBService(dbEngine)
        const result = page && pageSize
            ? await onlineDBService.getTableData(tableName, page, pageSize)
            : await onlineDBService.getTableAllData(tableName)
        return result
    }

    // 用户获取预览环境某张表的某个数据详情
    @OutputJson()
    @ProjectAuthorization({ getId: ctx => ctx.request.headers['x-project-id'], needAuthActions: [IAM_ACTION.develop_app[0]] })
    @Get('/user/tableName/:tableName/detail')
    async getPerviewTableDataDetail (
        @PathParams({ name: 'tableName', require: true }) tableFileName,
        @QueryParams() queryData,
        @HeaderParams({ name: 'x-project-id', require: true }) projectId,
        @HeaderParams({ name: 'x-timezone-offset' }) timezoneOffset
    ) {
        let dataService
        try {
            dataService = await getPreviewDataService(projectId)
            const result = await dataService.findOne(
                tableFileName,
                queryData
            )
            const { columns } = dataService.getTableMetadata(tableFileName)
            return transferTimeByTimezoneOffset(columns, result, timezoneOffset)
        } catch (error) {
            throw new global.BusinessError(error.message || error, -1, 500, error.stack)
        } finally {
            if (dataService) await dataService.close()
        }
    }

    // 用户获取预览环境某张表下数据
    @OutputJson()
    @ProjectAuthorization({ getId: ctx => ctx.params.projectId, needAuthActions: [IAM_ACTION.develop_app[0]] })
    @Get('/user/projectId/:projectId/tableName/:tableName')
    async getPerviewTableDataWithProjectPath (
        @PathParams({ name: 'tableName', require: true }) tableFileName,
        @PathParams({ name: 'projectId', require: true }) projectId,
        @QueryParams({ name: 'pageSize' }) pageSize,
        @QueryParams({ name: 'page' }) page,
        @HeaderParams({ name: 'x-timezone-offset' }) timezoneOffset
    ) {
        let dataService
        try {
            dataService = await getPreviewDataService(projectId)
            const result = await dataService.get({
                tableFileName,
                page,
                pageSize,
                order: {
                    id: 'DESC'
                },
                query: {}
            })
            const { columns } = dataService.getTableMetadata(tableFileName)
            result.list = transferTimeByTimezoneOffset(columns, result.list, timezoneOffset)
            return result
        } catch (error) {
            throw new global.BusinessError(error.message || error, -1, 500, error.stack)
        } finally {
            if (dataService) await dataService.close()
        }
    }

    // 用户获取预览环境某张表下数据
    @OutputJson()
    @ProjectAuthorization({ getId: ctx => ctx.request.headers['x-project-id'], needAuthActions: [IAM_ACTION.develop_app[0]] })
    @Get('/user/tableName/:tableName')
    getPerviewTableData (
        @PathParams({ name: 'tableName', require: true }) tableFileName,
        @HeaderParams({ name: 'x-project-id', require: true }) projectId,
        @HeaderParams({ name: 'x-timezone-offset' }) timezoneOffset,
        @CookieParams({ name: global.AUTH_NAME }) bkTicket,
        @QueryParams({ name: 'bkDataSourceType', default: 'preview' }) bkDataSourceType,
        @QueryParams() queryData
    ) {
        const getTableDataMap = {
            'preview': () => getTableDatasInPreview(projectId, queryData, tableFileName, timezoneOffset),
            'bk-base': () => getTableDatasInBkBase(projectId, queryData, tableFileName, bkTicket)
        }
        return getTableDataMap[bkDataSourceType]()
    }

    // 用户在预览环境新增数据，已有接口依然保留
    @OutputJson()
    @ProjectAuthorization({ getId: ctx => ctx.params.projectId, needAuthActions: [IAM_ACTION.develop_app[0]] })
    @Post('/user/projectId/:projectId/tableName/:tableName')
    async addPerviewTableDataWithProjectPath (
        @PathParams({ name: 'tableName', require: true }) tableName,
        @PathParams({ name: 'projectId', require: true }) projectId,
        @QueryParams({ name: 'formId' }) formId,
        @BodyParams() data
    ) {
        // 入参校验
        await validate(formId, data)
        // 执行入库
        let dataService
        try {
            dataService = await getPreviewDataService(projectId)
            const result = await dataService.add(tableName, transferData(formId, data))
            return result
        } catch (error) {
            throw new global.BusinessError(error.message || error, -1, 500, error.stack)
        } finally {
            if (dataService) await dataService.close()
        }
    }

    // 用户在预览环境新增数据
    @OutputJson()
    @ProjectAuthorization({ getId: ctx => ctx.request.headers['x-project-id'], needAuthActions: [IAM_ACTION.develop_app[0]] })
    @Post('/user/tableName/:tableName')
    async addPerviewTableData (
        @PathParams({ name: 'tableName', require: true }) tableName,
        @HeaderParams({ name: 'x-project-id', require: true }) projectId,
        @QueryParams({ name: 'formId' }) formId,
        @BodyParams() data
    ) {
        // 入参校验
        await validate(formId, data)
        // 执行入库
        let dataService
        try {
            dataService = await getPreviewDataService(projectId)
            const result = await dataService.add(tableName, transferData(formId, data))
            return result
        } catch (error) {
            throw new global.BusinessError(error.message || error, -1, 500, error.stack)
        } finally {
            if (dataService) await dataService.close()
        }
    }

    // 用户在预览环境更新数据，已有接口依然保留
    @OutputJson()
    @ProjectAuthorization({ getId: ctx => ctx.params.projectId, needAuthActions: [IAM_ACTION.develop_app[0]] })
    @Put('/user/projectId/:projectId/tableName/:tableName')
    async updatePerviewTableDataWithProjectPath (
        @PathParams({ name: 'tableName', require: true }) tableName,
        @PathParams({ name: 'projectId', require: true }) projectId,
        @QueryParams({ name: 'formId' }) formId,
        @BodyParams() data
    ) {
        // 入参校验
        await validate(formId, data)
        // 执行入库
        let dataService
        try {
            dataService = await getPreviewDataService(projectId)
            const result = await dataService.update(tableName, transferData(formId, data))
            return result
        } catch (error) {
            throw new global.BusinessError(error.message || error, -1, 500, error.stack)
        } finally {
            if (dataService) await dataService.close()
        }
    }

    // 用户在预览环境更新数据
    @OutputJson()
    @ProjectAuthorization({ getId: ctx => ctx.request.headers['x-project-id'], needAuthActions: [IAM_ACTION.develop_app[0]] })
    @Put('/user/tableName/:tableName')
    async updatePerviewTableData (
        @PathParams({ name: 'tableName', require: true }) tableName,
        @HeaderParams({ name: 'x-project-id', require: true }) projectId,
        @QueryParams({ name: 'formId' }) formId,
        @BodyParams() data
    ) {
        // 入参校验
        await validate(formId, data)
        // 执行入库
        let dataService
        try {
            dataService = await getPreviewDataService(projectId)
            const result = await dataService.update(tableName, transferData(formId, data))
            return result
        } catch (error) {
            throw new global.BusinessError(error.message || error, -1, 500, error.stack)
        } finally {
            if (dataService) await dataService.close()
        }
    }

    // 用户在预览环境更新数据，允许用户编写 where 条件
    @OutputJson()
    @ProjectAuthorization({ getId: ctx => ctx.request.headers['x-project-id'], needAuthActions: [IAM_ACTION.develop_app[0]] })
    @Put('/user/tableName/:tableName/update/condition')
    async updatePerviewTableDataWithCondition (
        @PathParams({ name: 'tableName', require: true }) tableName,
        @HeaderParams({ name: 'x-project-id', require: true }) projectId,
        @BodyParams({ name: 'data', require: true }) data,
        @BodyParams({ name: 'where', require: true }) where
    ) {
        // 执行入库
        let dataService
        try {
            dataService = await getPreviewDataService(projectId)
            const result = await dataService.updateWithCondition(tableName, data, where)
            return result
        } catch (error) {
            throw new global.BusinessError(error.message || error, -1, 500, error.stack)
        } finally {
            if (dataService) await dataService.close()
        }
    }

    // 用户在预览环境删除数据，已有接口依然保留
    @OutputJson()
    @ProjectAuthorization({ getId: ctx => ctx.params.projectId, needAuthActions: [IAM_ACTION.develop_app[0]] })
    @Delete('/user/projectId/:projectId/tableName/:tableName')
    async deletePerviewTableDataWithProjectPath (
        @PathParams({ name: 'tableName', require: true }) tableName,
        @PathParams({ name: 'projectId', require: true }) projectId,
        @QueryParams() queryData
    ) {
        let dataService
        try {
            dataService = await getPreviewDataService(projectId)
            const result = await dataService.delete(tableName, queryData)
            return result
        } catch (error) {
            throw new global.BusinessError(error.message || error, -1, 500, error.stack)
        } finally {
            if (dataService) await dataService.close()
        }
    }

    // 用户在预览环境删除数据
    @OutputJson()
    @ProjectAuthorization({ getId: ctx => ctx.request.headers['x-project-id'], needAuthActions: [IAM_ACTION.develop_app[0]] })
    @Delete('/user/tableName/:tableName')
    async deletePerviewTableData (
        @PathParams({ name: 'tableName', require: true }) tableName,
        @HeaderParams({ name: 'x-project-id', require: true }) projectId,
        @QueryParams() queryData
    ) {
        let dataService
        try {
            dataService = await getPreviewDataService(projectId)
            const result = await dataService.delete(tableName, queryData)
            return result
        } catch (error) {
            throw new global.BusinessError(error.message || error, -1, 500, error.stack)
        } finally {
            if (dataService) await dataService.close()
        }
    }

    // 用户在预览环境获取表结构
    @OutputJson()
    @ProjectAuthorization({ getId: ctx => ctx.request.headers['x-project-id'], needAuthActions: [IAM_ACTION.develop_app[0]] })
    @Get('/user/tableName/:tableName/columns')
    async getTableMetaData (
        @PathParams({ name: 'tableName', require: true }) tableName,
        @HeaderParams({ name: 'x-project-id', require: true }) projectId
    ) {
        let dataService
        try {
            dataService = await getPreviewDataService(projectId)
            const { columns } = dataService.getTableMetadata(tableName)
            return columns.map(({ entityMetadata, ...others }) => {
                return others
            })
        } catch (error) {
            throw new global.BusinessError(error.message || error, -1, 500, error.stack)
        } finally {
            if (dataService) await dataService.close()
        }
    }

    // 用户在预览环境查询数据
    @OutputJson()
    @ProjectAuthorization({ getId: ctx => ctx.request.headers['x-project-id'], needAuthActions: [IAM_ACTION.develop_app[0]] })
    @Post('/user/queryBySql')
    queryBySql (
        @HeaderParams({ name: 'x-project-id', require: true }) projectId,
        @BodyParams({ name: 'sql', require: true }) sql,
        @BodyParams({ name: 'dataSourceType', default: 'preview' }) dataSourceType,
        @CookieParams({ name: global.AUTH_NAME }) bkTicket
    ) {
        // 只能是查询语句
        querySqlCheck(sql)
        const querySqlMap = {
            'preview': () => execSqlInPreview(projectId, sql),
            'bk-base': () => execSqlInBkBase(projectId, sql, bkTicket)
        }
        return querySqlMap[dataSourceType]()
    }

    // 用户在预览环境查询数据，同时返回时间
    @OutputJson()
    @ProjectAuthorization({ getId: ctx => ctx.request.headers['x-project-id'], needAuthActions: [IAM_ACTION.develop_app[0]] })
    @Post('/user/queryBySql/time')
    async queryBySqlWithTime (
        @HeaderParams({ name: 'x-project-id', require: true }) projectId,
        @BodyParams({ name: 'sql', require: true }) sql,
        @BodyParams({ name: 'dataSourceType', default: 'preview' }) type,
        @CookieParams({ name: global.AUTH_NAME }) bkTicket
    ) {
        // 只能是查询语句
        querySqlCheck(sql)
        const querySqlMap = {
            'preview': () => execSqlInPreview(projectId, sql),
            'bk-base': () => execSqlInBkBase(projectId, sql, bkTicket)
        }
        const startTime = new Date().getTime()
        const data = await querySqlMap[type]()
        const endTime = new Date().getTime()
        return {
            data,
            spendTime: endTime - startTime
        }
    }

    // 插入查询历史
    @OutputJson()
    @ProjectAuthorization({ getId: ctx => ctx.request.headers['x-project-id'], needAuthActions: [IAM_ACTION.develop_app[0]] })
    @Post('/user/queryHistory')
    addQueryHistory (
        @BodyParams() data
    ) {
        return LCDataService.add(TABLE_FILE_NAME.QUERY_RECORD, data)
    }

    // 获取查询历史
    @OutputJson()
    @ProjectAuthorization({ getId: ctx => ctx.request.headers['x-project-id'], needAuthActions: [IAM_ACTION.develop_app[0]] })
    @Get('/user/queryHistory')
    getQueryHistory (
        @HeaderParams({ name: 'x-project-id', require: true }) projectId,
        @QueryParams({ name: 'page' }) page,
        @QueryParams({ name: 'pageSize' }) pageSize
    ) {
        return LCDataService.get({
            tableFileName: TABLE_FILE_NAME.QUERY_RECORD,
            query: {
                projectId
            },
            page,
            pageSize
        })
    }

    // 导出项目下所有表结构
    @OutputZip()
    @ProjectAuthorization({ getId: ctx => ctx.params.projectId, needAuthActions: [IAM_ACTION.develop_app[0]] })
    @Get('/exportStruct/projectId/:projectId/fileType/:fileType')
    async exportStruct (
        @PathParams({ name: 'projectId', require: true }) projectId,
        @PathParams({ name: 'fileType', require: true }) fileType
    ) {
        const { list = [] } = await LCDataService.get({
            tableFileName: TABLE_FILE_NAME.DATA_TABLE,
            query: {
                projectId,
                deleteFlag: 0
            }
        })
        if (list.length <= 0) {
            // 未查询到数据提示
            throw new Error(global.i18n.t('暂无表结构'))
        }
        const tables = list.map((table) => {
            return {
                ...table,
                columns: JSON.parse(table.columns || '[]')
            }
        })
        const fileName = fileType === 'sql' ? `lesscode-struct-${projectId}.sql` : ''
        const zipName = `lesscode-struct-${projectId}`
        const fileList = generateExportStruct(tables, fileType, fileName)
        return { fileList, zipName }
    }

    // 导出项目下所有表数据
    @OutputZip()
    @ProjectAuthorization({ getId: ctx => ctx.params.projectId, needAuthActions: [IAM_ACTION.develop_app[0]] })
    @Get('/exportDatas/projectId/:projectId/fileType/:fileType/tableName/:tableName/environment/:environment')
    async exportDatas (
        @PathParams({ name: 'projectId', require: true }) projectId,
        @PathParams({ name: 'fileType', require: true }) fileType,
        @PathParams({ name: 'tableName', require: true }) tableName,
        @PathParams({ name: 'environment', require: true }) environment,
        @QueryParams({ name: 'x-timezone-offset' }) timezoneOffset
    ) {
        const getDbConfig = environment === 'preview'
            ? getPreviewDbConfig
            : getOnlineDbConfig
        const previewDbConfig = await getDbConfig(projectId, environment)
        const dbEngine = new DBEngineService(previewDbConfig)
        const onlineDBService = new OnlineDBService(dbEngine)
        const { list } = await onlineDBService.getTableAllData(tableName)
        if (list.length <= 0) {
            // 未查询到数据提示
            throw new Error(global.i18n.t('{{n}} 表暂无数据', { n: tableName }))
        }
        // 导出数据过滤掉 id
        const [{ columns }] = await onlineDBService.describeTables([tableName])
        const datas = [{
            tableName,
            list: transferTimeByTimezoneOffset(
                columns,
                list.map(item => {
                    if (fileType === DATA_FILE_TYPE.SQL) {
                        const { id, ...rest } = item
                        return rest
                    }
                    return item
                }),
                timezoneOffset
            )
        }]

        const fileName = fileType === DATA_FILE_TYPE.SQL ? `lesscode-data-${projectId}.sql` : ''
        const zipName = `lesscode-data-${projectId}`
        const fileList = generateExportDatas(datas, fileType, fileName)
        return { fileList, zipName }
    }
}
