import {
    validateData
} from '../../../shared/no-code/validate'
import {
    isEmpty
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
                if (transferItem[name] && timezoneOffset) {
                    transferItem[name] = dayjs(transferItem[name])
                        .utcOffset(-timezoneOffset)
                        .format('YYYY-MM-DD HH:mm:ss')
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

// 只能是查询语句检查
export const querySqlCheck = (sql) => {
    if (!/;$/.test(sql.trim())) {
        throw new Error(global.i18n.t('Sql 语句不完整，需要是【;】号结尾'))
    }
    const sqlArr = splitSql(sql)
    sqlArr.forEach((sqlStr) => {
        if (sqlStr && !/^select/.test(sqlStr.trim().toLowerCase())) {
            throw new Error(global.i18n.t('仅支持 SELECT 查询语句，请修改后再试'))
        }
    })
}
