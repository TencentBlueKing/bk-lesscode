import {
    API_VALIDATE_TYPES,
    getVariableReg
} from 'shared/api'
import {
    isEmpty
} from 'shared/util'
import {
    messageError
} from '@/common/bkmagic'
import {
    evalWithSandBox
} from 'shared/function'
import Vue from 'vue'
import store from '@/store'
import http from '@/api/pureAxios'

// 自定义校验
export default () => {
    const customValidate = async (val, validate, variableList, functionList, apiList) => {
        // 未开启或者变量格式不需校验
        if (!validate?.enable || getVariableReg().test(val)) return true

        return Promise
            .all(
                validate.rules.map(async (rule) => {
                    let result
                    switch (rule.type) {
                        case API_VALIDATE_TYPES.REQUIRE:
                            result = !isEmpty(val)
                            break
                        case API_VALIDATE_TYPES.MAX_LENGTH:
                            result = String(val).length <= +rule.value
                            break
                        case API_VALIDATE_TYPES.MIN_LENGTH:
                            result = String(val).length >= +rule.value
                            break
                        case API_VALIDATE_TYPES.REGEXP:
                            result = new RegExp(rule.value).test(val)
                            break
                        case API_VALIDATE_TYPES.FUNCTION:
                            result = await evalWithSandBox(
                                rule.value,
                                [{ format: 'value', value: val }],
                                functionList,
                                variableList,
                                apiList,
                                {
                                    $store: store,
                                    $http: http,
                                    $bkMessage: Vue.prototype.$bkMessage
                                }
                            )
                            break
                    }
    
                    // 存在不满足需求的
                    if (!result) {
                        messageError(rule.message)
                    }
    
                    return result
                })
            )
            .then((result) => {
                return result.every(item => item)
            })
    }

    return {
        customValidate
    }
}
