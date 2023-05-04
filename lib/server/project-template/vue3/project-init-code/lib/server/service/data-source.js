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
    splitSql
} from '../util'
import dataService, { Like } from './data-service'
import dayjs from 'dayjs'
import DayJSUtcPlugin from 'dayjs/plugin/utc'

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
    const sqlArr = splitSql(sql)
    sqlArr.forEach((sqlStr) => {
        if (sqlStr && !/^select/.test(sqlStr.trim().toLowerCase())) {
            throw new Error('仅支持 SELECT 查询语句，请修改后再试')
        }
    })
}

/**
 * 获取有权限的数据
 * @param {*} queryData 查询条件
 * @param {*} tableFileName 表文件名
 * @param {*} timezoneOffset 时区偏移
 * @returns 表数据
 */
export const getTableDatas = async (queryData, tableFileName, timezoneOffset) => {
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
