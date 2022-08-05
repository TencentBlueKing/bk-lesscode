import {
    validateData
} from '../../../shared/no-code/validate'
import {
    LCDataService,
    TABLE_FILE_NAME
} from '../common/data-service'
import dayjs from 'dayjs'
import DayJSUtcPlugin from 'dayjs/plugin/utc'
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
            throw new global.BusinessError(`暂未查询到【ID: ${formId}】的 Form 数据，请修改后再试`, 404, 404)
        }
        const validateResult = validateData(
            JSON.parse(formData.content),
            data
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
    const transferList = Array.isArray(data) ? data : [data]
    columns.forEach((column) => {
        if (column.type === 'datetime') {
            transferList.forEach((transferItem) => {
                // null 时间不进行转换
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
