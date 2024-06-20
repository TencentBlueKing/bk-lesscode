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

import DBEngineService from '../common/db-engine-service'
import { LCDataService, TABLE_FILE_NAME, getDataService } from '../common/data-service'
import { EntitySchema, createConnection, EventSubscriber, Like } from 'typeorm'
import { RequestContext } from '../../middleware/request-context'
import { sm4Encrypt, sm4Decrypt, uuid } from '../../util'
import { NO_LENGTH_ORM_KEY, BASE_COLUMNS, ORM_KEYS } from '../../../shared/data-source'
import OnlineDBService from '../common/online-db-service'
import {
    transferTimeByTimezoneOffset
} from './data-source'
const dataBaseConf = require('../../conf/data-source')

/**
 * 开启预览
 * @param {*} projectId 应用id
 */
export const enablePerviewDb = async (projectId, dbName) => {
    const dbInfo = {
        projectId,
        dbName: `bklesscode_${dbName}`,
        userName: uuid(),
        passWord: uuid()
    }

    // 创建用于预览的DB
    const previewDbEngine = await getPreviewDbEngine()
    await previewDbEngine.execCb(async (pool) => {
        // 创建应用对应的预览数据库
        await pool.query(`CREATE DATABASE \`${dbInfo.dbName}\`;`)
        // 创建用户并授权对应的库
        await pool.query(`CREATE USER '${dbInfo.userName}'@'%' IDENTIFIED BY '${dbInfo.passWord}';`)
        await pool.query(`GRANT ALL ON ${dbInfo.dbName}.* TO '${dbInfo.userName}'@'%';`)
        await pool.query('FLUSH PRIVILEGES;')
    })

    // 加密
    dbInfo.userName = sm4Encrypt(dbInfo.userName)
    dbInfo.passWord = sm4Encrypt(dbInfo.passWord)

    // 写入数据库
    await LCDataService.add(TABLE_FILE_NAME.PREVIEW_DB, dbInfo)
}

/**
 * 获取预览环境下的db配置
 * @param {*} projectId 项目id
 * @param {*} environment 环境
 * @param {*} thirdPartDBId 第三方DB id
 */
export const getPreviewDbConfig = async (projectId = null, environment, thirdPartDBId) => {
    const previewDb = await LCDataService.findOne(TABLE_FILE_NAME.PREVIEW_DB, { projectId, deleteFlag: 0 })
    const config = process.env.NODE_ENV === 'production' ? dataBaseConf.prod : dataBaseConf.dev
    const dbConfig = {
        host: config.host,
        port: config.port,
        user: config.username,
        password: config.password
    }
    if (previewDb) {
        Object.assign(dbConfig, {
            user: sm4Decrypt(previewDb.userName),
            password: sm4Decrypt(previewDb.passWord),
            database: previewDb.dbName
        })
    }
    if (thirdPartDBId) {
        const thirdPartDB = await LCDataService.findOne(
            TABLE_FILE_NAME.THIRD_PART_DB,
            {
                projectId,
                deleteFlag: 0,
                id: thirdPartDBId
            }
        )
        Object.assign(dbConfig, {
            host: thirdPartDB.host,
            port: thirdPartDB.port,
            user: sm4Decrypt(thirdPartDB.username),
            password: sm4Decrypt(thirdPartDB.password),
            database: thirdPartDB.dbName
        })
    }
    return dbConfig
}

/**
 * 获取预览环境下的 db，直接操作 mysql
 * @param {*} projectId 项目id
 */
export const getPreviewDbEngine = async (projectId, thirdPartDBName) => {
    let thirdPartDBId
    if (thirdPartDBName) {
        const thirdPartDB = await LCDataService.findOne(
            TABLE_FILE_NAME.THIRD_PART_DB,
            {
                projectId,
                dbName: thirdPartDBName
            }
        )
        thirdPartDBId = thirdPartDB.id
    }
    const dbConfig = await getPreviewDbConfig(projectId, null, thirdPartDBId)
    return new DBEngineService(dbConfig)
}

@EventSubscriber()
class PreviewSubscriber {
    beforeInsert ({ entity }) {
        const currentUser = RequestContext.getCurrentUser() || {}
        entity.createUser = currentUser.username || entity.createUser
        entity.updateUser = currentUser.username || entity.updateUser
        entity.createTime = new Date()
        entity.updateTime = new Date()
    }

    beforeUpdate ({ entity }) {
        const currentUser = RequestContext.getCurrentUser() || {}
        entity.updateUser = currentUser.username || entity.updateUser
        entity.updateTime = new Date()
    }
}

/**
 * 获取预览环境下的 data service
 * 注意：使用完毕后，请在在适合的时机关闭连接（close方法）
 * @param {*} projectId 项目id
 * @param {*} thirdPartDBName 第三方DBId
 */
export const getPreviewDataService = async (projectId, thirdPartDBName) => {
    let thirdPartDBId
    if (thirdPartDBName) {
        const thirdPartDB = await LCDataService.findOne(
            TABLE_FILE_NAME.THIRD_PART_DB,
            {
                projectId,
                dbName: thirdPartDBName
            }
        )
        thirdPartDBId = thirdPartDB.id
    }
    const [{ list: tables }, config] = await Promise.all([
        LCDataService.get({
            tableFileName: TABLE_FILE_NAME.DATA_TABLE,
            query: { projectId, deleteFlag: 0 }
        }),
        getPreviewDbConfig(projectId, null, thirdPartDBId)
    ])

    const { entities, entityMap } = tables.reduce((acc, cur) => {
        const columns = JSON.parse(cur.columns || '[]').reduce((acc, cur) => {
            const { length, ...rest } = cur
            acc[cur.name] = NO_LENGTH_ORM_KEY.includes(cur.type) ? rest : cur
            return acc
        }, {})
        const entity = new EntitySchema({
            name: cur.tableName,
            columns
        })
        acc.entities.push(entity)
        acc.entityMap[cur.tableName] = entity
        return acc
    }, { entities: [], entityMap: {} })
    const ormConfig = {
        name: uuid(),
        type: 'mysql',
        host: config.host,
        port: config.port,
        username: config.user,
        password: config.password,
        database: config.database,
        entities,
        subscribers: [PreviewSubscriber],
        synchronize: false,
        migrationsRun: false,
        extra: {
            connectionLimit: 5
        }
    }
    const con = await createConnection(ormConfig)
    const previewDataService = {
        ...getDataService(ormConfig.name, entityMap),
        close () {
            return new Promise((resolve, reject) => {
                if (con.isConnected) {
                    con.close().then(resolve, reject)
                } else {
                    resolve()
                }
            })
        }
    }
    return previewDataService
}

/**
 * 执行 sql
 * @param {*} projectId 项目id
 * @param {*} sql sql语句
 * @param {*} thirdPartDBName 第三方db名称
 * @returns 执行结果
 */
export const execSQL = async (projectId, sql, thirdPartDBName) => {
    const dbEngine = await getPreviewDbEngine(projectId, thirdPartDBName)
    return dbEngine.execMultSql(sql)
}

/**
 * 获取有权限的表
 * @param {*} projectId 应用 id
 * @param {*} page 分页页码
 * @param {*} pageSize 分页页数
 * @param {*} thirdPartDBId 第三方db id
 * @returns 表列表
 */
export const getTables = async (projectId, page, pageSize, thirdPartDBId = 0) => {
    const result = await LCDataService.get({
        tableFileName: TABLE_FILE_NAME.DATA_TABLE,
        page,
        pageSize,
        query: {
            projectId,
            thirdPartDBId,
            deleteFlag: 0
        }
    })
    result.list.forEach((data) => {
        data.columns = JSON.parse(data.columns)
        return data
    })
    return result
}

/**
 * 同步第三方数据源表结构并且返回表列表
 * @param {*} projectId 应用 id
 * @param {*} page 分页页码
 * @param {*} pageSize 分页页数
 * @param {*} thirdPartDBId 第三方db id
 * @returns 表列表
 */
export const getThirdPartDBTables = async (projectId, page, pageSize, thirdPartDBId = 0) => {
    // 先获取平台创建的表
    const { list: designTables } = await LCDataService.get({
        tableFileName: TABLE_FILE_NAME.DATA_TABLE,
        query: {
            projectId,
            thirdPartDBId,
            deleteFlag: 0
        }
    })
    // 获取第三方数据源所有的表信息
    const previewDbConfig = await getPreviewDbConfig(projectId, null, thirdPartDBId)
    const dbEngine = new DBEngineService(previewDbConfig)
    const onlineDBService = new OnlineDBService(dbEngine)
    const onlineTables = await onlineDBService.showTables()
    const onlineTablesDetail = await onlineDBService.describeTables(onlineTables, previewDbConfig.database)
    // 需要更新的sql
    let updateSql = ''
    // 待更新的 table
    const updateDesignTables = []
    // 其它地方设计的有id的表
    const addDesignTables = []
    onlineTablesDetail.forEach((onlineTableDetail) => {
        // 基于查询的数据反向更新db
        const tableData = {
            tableName: onlineTableDetail.tableName,
            deleteFlag: 0,
            projectId,
            thirdPartDBId,
            columns: JSON.stringify(onlineTableDetail.columns.map((column) => ({
                ...column,
                createDate: column.column === 'createTime',
                updateDate: column.column === 'updateTime' && column.default === 'CURRENT_TIMESTAMP',
                columnId: uuid(8)
            })))
        }
        const designTable = designTables.find(designTable => designTable.tableName === onlineTableDetail.tableName)
        if (designTable) {
            let isColumnChanged
            const checkKeys = ORM_KEYS.filter(key => !['columnId', 'default'].includes(key))
            JSON.parse(tableData.columns).forEach((tableDataColumn) => {
                const tableColumn = JSON.parse(designTable.columns).find((tableColumn) => {
                    return checkKeys.every(key => tableColumn[key] === tableDataColumn[key])
                })
                if (!tableColumn) {
                    isColumnChanged = true
                }
            })
            if (isColumnChanged) {
                updateDesignTables.push({
                    ...designTable,
                    ...tableData
                })
            }
        } else {
            const idColumn = onlineTableDetail.columns.find(column => column.name === 'id')
            const generatedColumn = onlineTableDetail.columns.find(column => column.generated)
            const primaryColumn = onlineTableDetail.columns.find(column => column.primary)
            if (idColumn?.generated) {
                addDesignTables.push(tableData)
            } else if (!generatedColumn && !idColumn && !primaryColumn) {
                addDesignTables.push({
                    ...tableData,
                    columns: JSON.stringify([
                        ...JSON.parse(tableData.columns),
                        BASE_COLUMNS()[0]
                    ])
                })
                updateSql += `ALTER TABLE \`${tableData.tableName}\` ADD COLUMN \`id\` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY;`
            }
        }
    })
    if (updateSql) {
        await dbEngine.execMultSql(updateSql)
    }
    if (updateDesignTables.length) {
        await LCDataService.bulkUpdate(TABLE_FILE_NAME.DATA_TABLE, updateDesignTables)
    }
    if (addDesignTables.length) {
        await LCDataService.bulkAdd(TABLE_FILE_NAME.DATA_TABLE, addDesignTables)
    }
    return getTables(projectId, page, pageSize, thirdPartDBId)
}

export const getTableDetail = async (projectId, tableName) => {
    const result = await LCDataService.findOne(TABLE_FILE_NAME.DATA_TABLE, { projectId, deleteFlag: 0, tableName }) || {}
    if (result.columns) {
        result.columns = JSON.parse(result.columns)
    }
    return result
}

/**
 * 获取有权限的数据
 * @param {*} projectId 项目id
 * @param {*} queryData 查询条件
 * @param {*} tableFileName 表文件名
 * @param {*} timezoneOffset 时区偏移
 * @param {*} thirdPartDBName 第三方 DB name
 * @returns 表数据
 */
export const getTableDatas = async (projectId, queryData, tableFileName, timezoneOffset, thirdPartDBName) => {
    let dataService
    try {
        const {
            page,
            pageSize,
            bkSortKey,
            bkSortValue,
            bkDataSourceType,
            ...others
        } = queryData
        const order = bkSortKey
            ? {
                [bkSortKey]: bkSortValue
            }
            : {
                id: 'DESC'
            }
        dataService = await getPreviewDataService(projectId, thirdPartDBName)
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
    } catch (error) {
        throw new global.BusinessError(error.message || error, -1, 500, error.stack)
    } finally {
        if (dataService) await dataService.close()
    }
}

// 获取数据库中的加密后的dbinfo， 如果不存在则新创建
export const getPreviewDbInfo = async (projectId) => {
    const projectInfo = await LCDataService.findOne(TABLE_FILE_NAME.PROJECT, { id: projectId, deleteFlag: 0 })
    if (projectInfo.isEnableDataSource <= 0) {
        // 如果未开启，则开启
        projectInfo.isEnableDataSource = 1
        await enablePerviewDb(projectId, projectInfo.id + projectInfo.projectCode)
        await LCDataService.update(TABLE_FILE_NAME.PROJECT, projectInfo)
    }
    const dbInfo = await LCDataService.findOne(TABLE_FILE_NAME.PREVIEW_DB, { projectId })
    return dbInfo || {}
}
