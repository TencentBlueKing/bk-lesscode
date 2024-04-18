import {
    validateData
} from '../../shared/form/validate'
import {
    formMap
} from '../../shared/form/index'
import {
    isEmpty
} from '../../shared/util'
import {
    NO_LENGTH_ORM_KEY
} from '../../shared/data-source/constant'
import {
    splitSql,
    uuid
} from '../util'
import dataService, {
    Like,
    getDataService as getThirdPartDataService
} from './data-service'
import dayjs from 'dayjs'
import DayJSUtcPlugin from 'dayjs/plugin/utc'
import thirdPartDBConfs from '../conf/third-part-db'
import { EntitySchema, createConnection, EventSubscriber } from 'typeorm'
import { RequestContext } from '../middleware/request-context'

dayjs.extend(DayJSUtcPlugin)

// 数据源入库校验
export const validate = async (formId, data) => {
    // 如果有 formId，执行 nocode 校验
    if (formId) {
        const formData = formMap[formId]
        if (!formData) {
            throw new global.BusinessError(`暂未查询到【ID: ${formId}】的 Form 数据，请修改后再试`, 404, 404)
        }
        const validateResult = await validateData(
            formData.content,
            data,
            formData,
            dataService
        )
        if (!validateResult.result) {
            throw new global.BusinessError(`数据入库校验失败：【${validateResult.errorMsg}】，请修改后再试`, 400, 400)
        }
    }
}

// 数据在入库前进行转换
export const transferData = (formId, data) => {
    let result = data
    // 如果有 formId，执行 nocode 转换
    if (formId) {
        result = {}
        data.forEach(({ key, value }) => {
            result[key] = value
        })
    }

    return result
}

// 根据时区转换时间
export const transferTimeByTimezoneOffset = (columns, data, timezoneOffset) => {
    if (isEmpty(data)) {
        return data
    }
    const transferList = Array.isArray(data) ? data : [data]
    columns.forEach((column) => {
        if (column.type === 'datetime') {
            transferList.forEach((transferItem) => {
                if (transferItem[column.propertyName] && timezoneOffset) {
                    transferItem[column.propertyName] = dayjs(transferItem[column.propertyName])
                        .utcOffset(-timezoneOffset)
                        .format('YYYY-MM-DD HH:mm:ss')
                }
            })
        }
    })
    return Array.isArray(data) ? transferList : transferList[0]
}

// 只能是查询语句检查
export const querySqlCheck = (sql) => {
    if (!/;$/.test(sql.trim())) {
        throw new Error('Sql 语句不完整，需要是【;】号结尾')
    }
    const checkList = [
        { check: (val) => !/^select/.test(val), message: '仅支持 SELECT 查询语句，请修改后再试' },
        { check: (val) => /database\(\)/i.test(val), message: '不允许出现 database() 函数' },
        { check: (val) => /user\(\)/i.test(val), message: '不允许出现 user() 函数' },
        { check: (val) => /version\(\)/i.test(val), message: '不允许出现 version() 函数' },
        { check: (val) => /INFORMATION_SCHEMA/i.test(val), message: '不允许查询 INFORMATION_SCHEMA 相关数据' },
        { check: (val) => /PERFORMANCE_SCHEMA/i.test(val), message: '不允许查询 PERFORMANCE_SCHEMA 相关数据' },
        { check: (val) => /MYSQL\./i.test(val), message: '不允许查询 MYSQL 内置表相关数据' },
        { check: (val) => /\@\@/i.test(val), message: '不允许出现@@符号' }
    ]
    const sqlArr = splitSql(sql)
    sqlArr.forEach((sqlStr) => {
        const lowerCaseSql = sqlStr.trim().toLowerCase()
        if (lowerCaseSql) {
            checkList.forEach((checkItem) => {
                if (checkItem.check(lowerCaseSql)) {
                    throw new Error(checkItem.message)
                }
            })
        }
    })
}
// sql 解码
export const decodeSql = (sql) => {
    try {
        const sqlBuffer = Buffer.from(sql, 'base64')
        if (sqlBuffer.toString('base64') === sql) {
            return sqlBuffer.toString('utf8')
        } else {
            return sql
        }
    } catch (error) {
        return sql
    }
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
 * 获取 dataservice
 * @param {*} thirdPartDBName 第三方db name
 * @returns dataService
 */
export const getDataService = async (thirdPartDBName) => {
    if (thirdPartDBName) {
        const thirdPartDB = thirdPartDBConfs[thirdPartDBName]
        const { entities, entityMap } = thirdPartDB.tableList.reduce((acc, cur) => {
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
            host: thirdPartDB.host,
            port: thirdPartDB.port,
            username: thirdPartDB.username,
            password: thirdPartDB.password,
            database: thirdPartDB.dbName,
            entities,
            subscribers: [PreviewSubscriber],
            synchronize: false,
            migrationsRun: false,
            extra: {
                connectionLimit: 5
            }
        }
        const con = await createConnection(ormConfig)
        const thirdPartDataService = {
            ...getThirdPartDataService(ormConfig.name, entityMap),
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
        return thirdPartDataService
    }

    return dataService
}

/**
 * 获取有权限的数据
 * @param {*} queryData 查询条件
 * @param {*} tableFileName 表文件名
 * @param {*} timezoneOffset 时区偏移
 * @returns 表数据
 */
export const getTableDatas = async (queryData, tableFileName, timezoneOffset, thirdPartDBName) => {
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
    const query = Object
        .keys(others)
        .reduce((acc, cur) => {
            acc[cur] = Like(`%${others[cur]}%`)
            return acc
        }, {})
    const dataService = await getDataService(thirdPartDBName)
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
