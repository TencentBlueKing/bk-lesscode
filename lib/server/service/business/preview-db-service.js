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
import { NO_LENGTH_ORM_KEY } from '../../../shared/data-source'
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
 */
export const getPreviewDbConfig = async (projectId = null) => {
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
    return dbConfig
}

/**
 * 获取预览环境下的 db，直接操作 mysql
 * @param {*} projectId 项目id
 */
export const getPreviewDbEngine = async (projectId) => {
    const dbConfig = await getPreviewDbConfig(projectId)
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
 */
export const getPreviewDataService = async (projectId) => {
    const [{ list: tables }, config] = await Promise.all([
        LCDataService.get({
            tableFileName: TABLE_FILE_NAME.DATA_TABLE,
            query: { projectId, deleteFlag: 0 }
        }),
        getPreviewDbConfig(projectId)
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
 * @returns 执行结果
 */
export const execSQL = async (projectId, sql) => {
    const dbEngine = await getPreviewDbEngine(projectId)
    return dbEngine.execMultSql(sql)
}

/**
 * 获取有权限的表
 * @param {*} projectId 项目id
 * @param {*} page 分页页码
 * @param {*} pageSize 分页页数
 * @returns 表列表
 */
export const getTables = async (projectId, page, pageSize) => {
    const result = await LCDataService.get({
        tableFileName: TABLE_FILE_NAME.DATA_TABLE,
        page,
        pageSize,
        query: {
            projectId,
            deleteFlag: 0
        }
    })
    result.list.forEach((data) => {
        data.columns = JSON.parse(data.columns)
        return data
    })
    return result
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
 * @returns 表数据
 */
export const getTableDatas = async (projectId, queryData, tableFileName, timezoneOffset) => {
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
        dataService = await getPreviewDataService(projectId)
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
