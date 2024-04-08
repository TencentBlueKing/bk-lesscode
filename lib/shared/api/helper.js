import {
    API_METHOD,
    API_PARAM_TYPES,
    API_PARAM_VALUE_TYPES
} from './constant'
import {
    getVariableValue
} from '../variable'
import { uuid } from '../util'

/**
 * 获取默认 API 所有字段
 * @param {*} options 覆盖字段使用
 * @returns 返回一个 API 初始化数据
 */
export const getDefaultApi = (options = {}) => {
    return {
        id: undefined,
        name: '',
        code: '',
        categoryId: undefined,
        systemApiId: undefined,
        method: API_METHOD.GET,
        url: '',
        projectId: undefined,
        versionId: undefined,
        summary: '',
        header: [],
        query: [],
        body: {},
        response: {},
        description: '',
        ...options
    }
}

/**
 * 获取 api 编辑态 scheme
 * @param {*} options 覆盖字段使用
 * @returns 返回编辑态 scheme
 */
export const getDefaultApiEditScheme = (options = {}) => {
    return {
        id: uuid(),
        required: false,
        name: '',
        value: API_PARAM_TYPES.STRING.DEFAULT,
        description: '',
        type: API_PARAM_TYPES.STRING.VAL,
        children: [],
        showChildren: true,
        ...options
    }
}

/**
 * 获取 api 使用态 scheme
 * @param {*} options 覆盖字段使用
 * @returns 返回使用态 scheme
 */
export const getDefaultApiUseScheme = (options = {}) => {
    return {
        name: '',
        type: API_PARAM_TYPES.STRING.VAL,
        valueType: API_PARAM_VALUE_TYPES.VALUE,
        value: API_PARAM_TYPES.STRING.DEFAULT,
        code: '',
        children: [],
        showChildren: true,
        description: '',
        ...options
    }
}

// 把编辑态的 query scheme 转换为真实的值，展示使用
export const parseQueryScheme2QueryString = (querySchemes, getVal) => {
    const queryList = querySchemes.reduce((acc, cur) => {
        if (cur.name) {
            const value = getVal ? getVal(cur) : cur.value
            acc.push(`${cur.name}=${value}`)
        }
        return acc
    }, [])
    return queryList.join('&')
}

// 把编辑态的 header scheme 转换为真实的值，展示使用
export const parseHeaderScheme2HeaderString = (schemes, getVal) => {
    const valList = schemes.reduce((acc, cur) => {
        if (cur.name) {
            const value = getVal ? getVal(cur) : cur.value
            acc.push(`${cur.name}: ${value}`)
        }
        return acc
    }, [])
    return valList.join('\n')
}

// 编辑态 scheme 转换为值
export const parseScheme2Value = (scheme, getVal) => {
    let val = getVal ? getVal(scheme) : scheme.value
    if (API_PARAM_TYPES.OBJECT.VAL === scheme.type && scheme.valueType !== API_PARAM_VALUE_TYPES.VARIABLE) {
        val = {}
        scheme.children.forEach((item) => {
            if (item.name) {
                val[item.name] = parseScheme2Value(item, getVal)
            }
        })
    }
    if (API_PARAM_TYPES.ARRAY.VAL === scheme.type && scheme.valueType !== API_PARAM_VALUE_TYPES.VARIABLE) {
        val = []
        scheme.children.forEach((item) => {
            val.push(parseScheme2Value(item, getVal))
        })
    }
    return val
}

// 把值转换为 scheme
export const parseValue2Scheme = (val, name = 'root', description = '') => {
    const scheme = getDefaultApiEditScheme({
        name,
        description,
        value: val
    })
    const type = Object.prototype.toString.apply(val)

    if (API_PARAM_TYPES.OBJECT.TYPE === type) {
        scheme.value = ''
        Object.keys(val).forEach((key) => {
            scheme.children.push(parseValue2Scheme(val[key], key))
        })
    }

    if (API_PARAM_TYPES.ARRAY.TYPE === type) {
        scheme.value = ''
        val.forEach((item) => {
            scheme.children.push(parseValue2Scheme(item, `${name}-item`))
        })
    }

    // set type
    Object.keys(API_PARAM_TYPES).forEach((paramTypeKey) => {
        const paramType = API_PARAM_TYPES[paramTypeKey]
        if (paramType.TYPE === type) {
            scheme.type = paramType.VAL
        }
    })

    return scheme
}

// 把值转换为使用态 scheme
export const parseValue2UseScheme = (val, name = 'root') => {
    const scheme = getDefaultApiUseScheme({
        name,
        value: val,
        valueType: API_PARAM_VALUE_TYPES.VALUE
    })
    const type = Object.prototype.toString.apply(val)

    if (API_PARAM_TYPES.OBJECT.TYPE === type) {
        scheme.value = ''
        Object.keys(val).forEach((key) => {
            scheme.children.push(parseValue2UseScheme(val[key], key))
        })
    }

    if (API_PARAM_TYPES.ARRAY.TYPE === type) {
        scheme.value = ''
        val.forEach((item) => {
            scheme.children.push(parseValue2UseScheme(item, `${name}-item`))
        })
    }

    // set type
    Object.keys(API_PARAM_TYPES).forEach((paramTypeKey) => {
        const paramType = API_PARAM_TYPES[paramTypeKey]
        if (paramType.TYPE === type) {
            scheme.type = paramType.VAL
        }
    })

    // 变量
    if (scheme.type === API_PARAM_TYPES.STRING.VAL && /^\{\{([^\{\}]+)\}\}$/.test(val)) {
        const code = /^\{\{([^\{\}]+)\}\}$/.exec(val)[1]
        scheme.value = ''
        scheme.code = code
        scheme.valueType = API_PARAM_VALUE_TYPES.VARIABLE
    }

    return scheme
}

// 把 scheme 转换为使用态模型
export const parseScheme2UseScheme = (scheme) => {
    const useScheme = getDefaultApiUseScheme({
        value: scheme.value,
        name: scheme.name,
        type: scheme.type,
        required: scheme.required,
        validate: scheme.validate,
        description: scheme.description,
        valueType: API_PARAM_VALUE_TYPES.VALUE
    })

    if ([API_PARAM_TYPES.OBJECT.VAL, API_PARAM_TYPES.ARRAY.VAL].includes(scheme.type)) {
        scheme.children.forEach((childScheme) => {
            useScheme.children.push(parseScheme2UseScheme(childScheme))
        })
    }

    return useScheme
}

// 获取 lesscode 中使用态 scheme 的值
export const LCGetParamsVal = (variableList) => {
    return (param) => {
        let result
        if (API_PARAM_VALUE_TYPES.VALUE === param.valueType) {
            result = param.value
        } else {
            const variable = variableList.find(variable => variable.variableCode === param.code) || {}
            result = getVariableValue(variable)
        }
        return result
    }
}

// 分析 api 中使用到的变量，将其设置成函数参数
export const getParamFromApi = (apiQuery, apiBody, method) => {
    const params = []
    // 添加参数
    const addParam = ({ value, valueType }) => {
        if (valueType === API_PARAM_VALUE_TYPES.VALUE) {
            let regResult
            const variableReg = getVariableReg()
            do {
                regResult = variableReg.exec(value)
                if (regResult?.[1]) {
                    params.push(regResult[1])
                }
            } while (regResult)
        }
    }
    // 递归解析 body 参数
    const parseBodyParam = (apiBody) => {
        addParam(apiBody)
        apiBody?.children?.forEach(parseBodyParam)
    }
    if (method === API_METHOD.GET) {
        apiQuery?.forEach(addParam)
    } else {
        parseBodyParam(apiBody)
    }
    return params
}

// 获取变量正则
export const getVariableReg = () => {
    return /\$\{([^\}]+)\}/g
}

// 获取仅变量正则
export const getOnlyVariableReg = () => {
    return /^\$\{([^\}]+)\}$/g
}
