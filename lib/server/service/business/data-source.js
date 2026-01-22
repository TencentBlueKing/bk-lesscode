import {
    validateData
} from '../../../shared/no-code/validate'
import {
    isEmpty,
    decodeBase64
} from '../../../shared/util'
import {
    LCDataService,
    TABLE_FILE_NAME
} from '../common/data-service'
import {
    generateSqlByCondition
} from '../../../shared/data-source'
import {
    splitSql
} from '../../util'
import dayjs from 'dayjs'
import DayJSUtcPlugin from 'dayjs/plugin/utc'
import { getPreviewDataService } from './preview-db-service'

dayjs.extend(DayJSUtcPlugin)

// 数据源入库校验
export const validate = async (formId, data) => {
    // 如果有 formId，执行 nocode 校验
    if (formId) {
        const formData = await LCDataService.findOne(
            TABLE_FILE_NAME.FORM,
            {
                id: formId,
                deleteFlag: 0
            }
        )
        if (!formData) {
            throw new global.BusinessError(global.i18n.t('暂未查询到【ID: {{n}}】的 Form 数据，请修改后再试', { n: formId }), 404, 404)
        }
        if (!formData.componentId) {
            const dataService = await getPreviewDataService(formData.projectId)
            const validateResult = await validateData(
                JSON.parse(formData.content),
                data,
                formData,
                dataService
            )
            if (!validateResult.result) {
                throw new global.BusinessError(global.i18n.t('数据入库校验失败：【{{n}}】，请修改后再试', { n: validateResult.errorMsg }), 400, 400)
            }
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
        const name = column.propertyName || column.name
        if (column.type === 'datetime') {
            transferList.forEach((transferItem) => {
                // null 时间不进行转换
                if (transferItem[name] && timezoneOffset !== undefined) {
                    transferItem[name] = dayjs(transferItem[name])
                        .utcOffset(-timezoneOffset)
                        .format('YYYY-MM-DD HH:mm:ss')
                }
            })
        }
        if (column.type === 'date') {
            transferList.forEach((transferItem) => {
                if (transferItem[name]) {
                    transferItem[name] = dayjs(transferItem[name])
                        .format('YYYY-MM-DD')
                }
            })
        }
    })
    return Array.isArray(data) ? transferList : transferList[0]
}

// 通过查询条件转换成sql
export const getSqlByCondition = async (projectId, condition) => {
    const { list } = await LCDataService.get({
        tableFileName: TABLE_FILE_NAME.DATA_TABLE,
        query: {
            projectId
        }
    })
    list.forEach((table) => {
        table.columns = JSON.parse(table.columns)
    })
    return generateSqlByCondition(condition, list)
}

// 只能是查询语句检查 - 增强版本
export const querySqlCheck = (sql) => {
    if (!sql || typeof sql !== 'string') {
        throw new Error('SQL语句不能为空')
    }

    const trimmedSql = sql.trim()
    
    if (!/;$/.test(trimmedSql)) {
        throw new Error(global.i18n.t('Sql 语句不完整，需要是【;】号结尾'))
    }

    // 基础检查列表（保持原有逻辑）
    const checkList = [
        { check: (val) => !/^select/.test(val), message: global.i18n.t('仅支持 SELECT 查询语句，请修改后再试') },
        { check: (val) => /database\(\)/i.test(val), message: global.i18n.t('不允许出现 database() 函数') },
        { check: (val) => /user\(\)/i.test(val), message: global.i18n.t('不允许出现 user() 函数') },
        { check: (val) => /version\(\)/i.test(val), message: global.i18n.t('不允许出现 version() 函数') },
        { check: (val) => /INFORMATION_SCHEMA/i.test(val), message: global.i18n.t('不允许查询 INFORMATION_SCHEMA 相关数据') },
        { check: (val) => /PERFORMANCE_SCHEMA/i.test(val), message: global.i18n.t('不允许查询 PERFORMANCE_SCHEMA 相关数据') },
        { check: (val) => /MYSQL\./i.test(val), message: global.i18n.t('不允许查询 MYSQL 内置表相关数据') },
        { check: (val) => /\@\@/i.test(val), message: global.i18n.t('不允许出现@@符号') }
    ]

    // 增强的安全检查列表
    const enhancedCheckList = [
        { check: (val) => /union\s+select/i.test(val), message: global.i18n.t('不允许使用 UNION SELECT 语句') },
        { check: (val) => /;\s*(drop|delete|update|insert|alter|create|grant|revoke)/i.test(val), message: global.i18n.t('检测到多语句注入尝试') },
        { check: (val) => /--/.test(val), message: global.i18n.t('不允许使用 SQL 注释符号 --') },
        { check: (val) => /\/\*/.test(val), message: global.i18n.t('不允许使用多行注释 /*') },
        { check: (val) => /\*\//.test(val), message: global.i18n.t('不允许使用多行注释 */') },
        { check: (val) => /xp_cmdshell/i.test(val), message: global.i18n.t('不允许使用 xp_cmdshell 函数') },
        { check: (val) => /sp_executesql/i.test(val), message: global.i18n.t('不允许使用 sp_executesql 函数') },
        { check: (val) => /exec\s*\(/i.test(val), message: global.i18n.t('不允许使用 EXEC 函数') },
        { check: (val) => /execute\s*\(/i.test(val), message: global.i18n.t('不允许使用 EXECUTE 函数') },
        { check: (val) => /load_file\s*\(/i.test(val), message: global.i18n.t('不允许使用 LOAD_FILE 函数') },
        { check: (val) => /into\s+outfile/i.test(val), message: global.i18n.t('不允许使用 INTO OUTFILE 语句') },
        { check: (val) => /into\s+dumpfile/i.test(val), message: global.i18n.t('不允许使用 INTO DUMPFILE 语句') },
        { check: (val) => /benchmark\s*\(/i.test(val), message: global.i18n.t('不允许使用 BENCHMARK 函数') },
        { check: (val) => /sleep\s*\(/i.test(val), message: global.i18n.t('不允许使用 SLEEP 函数') },
        { check: (val) => /waitfor\s+delay/i.test(val), message: global.i18n.t('不允许使用 WAITFOR DELAY 语句') },
        { check: (val) => /pg_sleep\s*\(/i.test(val), message: global.i18n.t('不允许使用 PG_SLEEP 函数') },
        { check: (val) => /extractvalue\s*\(/i.test(val), message: global.i18n.t('不允许使用 EXTRACTVALUE 函数') },
        { check: (val) => /updatexml\s*\(/i.test(val), message: global.i18n.t('不允许使用 UPDATEXML 函数') },
        { check: (val) => /name_const\s*\(/i.test(val), message: global.i18n.t('不允许使用 NAME_CONST 函数') },
        { check: (val) => /multipoint\s*\(/i.test(val), message: global.i18n.t('不允许使用 MULTIPOINT 函数') },
        { check: (val) => /polygon\s*\(/i.test(val), message: global.i18n.t('不允许使用 POLYGON 函数') },
        { check: (val) => /multipolygon\s*\(/i.test(val), message: global.i18n.t('不允许使用 MULTIPOLYGON 函数') },
        { check: (val) => /linestring\s*\(/i.test(val), message: global.i18n.t('不允许使用 LINESTRING 函数') },
        { check: (val) => /multilinestring\s*\(/i.test(val), message: global.i18n.t('不允许使用 MULTILINESTRING 函数') }
    ]

    const sqlArr = splitSql(sql)
    sqlArr.forEach((sqlStr) => {
        const lowerCaseSql = sqlStr.trim().toLowerCase()
        if (lowerCaseSql) {
            // 执行原有检查
            checkList.forEach((checkItem) => {
                if (checkItem.check(lowerCaseSql)) {
                    throw new Error(checkItem.message)
                }
            })

            // 执行增强检查
            enhancedCheckList.forEach((checkItem) => {
                if (checkItem.check(lowerCaseSql)) {
                    throw new Error(checkItem.message)
                }
            })
        }
    })
}

// sql 解码
export const decodeSql = (sql, params) => {
    try {
        let decodedSql = decodeBase64(sql)
        
        // 验证解码后的SQL
        if (!decodedSql || typeof decodedSql !== 'string') {
            throw new Error('无效的SQL语句')
        }
        
        const paramKeys = Object.keys(params || {})
        if (paramKeys.length > 0) {
            paramKeys.forEach((paramKey) => {
            const reg = new RegExp(`\\$\\{${paramKey}\\}`, 'g')
            decodedSql = decodedSql.replace(reg, params[paramKey])
            })
        }
        return decodedSql
    } catch (error) {
        throw new Error(`SQL解码失败: ${error.message}`)
    }
}
