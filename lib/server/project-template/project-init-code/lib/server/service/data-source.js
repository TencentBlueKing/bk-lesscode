import {
    validateData
} from '../../shared/form/validate'
import {
    formMap
} from '../../shared/form/index'

// 数据源入库校验
export const validate = (formId, data) => {
    // 如果有 formId，执行 nocode 校验
    if (formId) {
        const formContent = formMap[formId]
        if (!formContent) {
            throw new global.BusinessError(`暂未查询到【ID: ${formId}】的 Form 数据，请修改后再试`, 404, 404)
        }
        const validateResult = validateData(
            formContent,
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
