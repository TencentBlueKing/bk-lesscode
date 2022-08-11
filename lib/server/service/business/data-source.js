import {
    validateData
} from '../../../shared/no-code/validate'
import {
    LCDataService,
    TABLE_FILE_NAME
} from '../common/data-service'
import {
    generateSqlByCondition
} from '../../../shared/data-source'

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
