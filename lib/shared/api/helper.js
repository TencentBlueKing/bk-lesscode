import {
    METHODS_WITHOUT_DATA,
    API_METHOD,
    API_PARAM_TYPES,
    API_PARAM_VALUE_TYPES
} from './constant'
import {
    USE_API_TYPE
} from '../function'
import {
    VARIABLE_VALUE_TYPE
} from '../variable'

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
        header: {},
        query: [],
        body: {},
        response: {},
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
        ...options
    }
}

// 把编辑态的 scheme array 转换为真实的值，展示使用
export const parseQueryScheme2QueryString = (querySchemes, getVal) => {
    const queryList = querySchemes.reduce((acc, cur) => {
        if (cur.name) {
            const value = getVal(cur)
            acc.push(`${cur.name}=${value}`)
        }
        return acc
    }, [])
    return `?${queryList.join('&')}`
}

// 编辑态 scheme 转换为值
export const parseScheme2Value = (scheme, getVal) => {
    let val = getVal(scheme)
    if (API_PARAM_TYPES.OBJECT.VAL === scheme.type) {
        val = {}
        scheme.children.forEach((item) => {
            if (item.name) {
                val[item.name] = parseScheme2Value(item, getVal)
            }
        })
    }
    if (API_PARAM_TYPES.ARRAY.VAL === scheme.type) {
        val = []
        scheme.children.forEach((item) => {
            if (item.name) {
                val.push(parseScheme2Value(item), getVal)
            }
        })
    }
    return val
}

// 把值转换为 scheme
export const parseValue2Scheme = (val, name = 'root') => {
    const scheme = getDefaultApiEditScheme({
        name,
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

// 把 scheme 转换为使用态模型
export const parseScheme2UseScheme = (scheme) => {
    const useScheme = getDefaultApiUseScheme({
        value: scheme.value,
        name: scheme.name,
        type: scheme.type,
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
export const LCGetParamsVal = (param, variableList) => {
    let result
    if (API_PARAM_VALUE_TYPES.VALUE === param.valueType) {
        result = param.value
    } else {
        const variable = variableList.find(variable => variable.variableCode === param.code)
        result = VARIABLE_VALUE_TYPE.SAME === variable.defaultValueType ? variable.defaultValue?.all : variable.defaultValue?.stag
    }
    return result
}

/**
 * 获取 api 中使用到的变量和使用api的源码
 * @param {*} api api
 * @param {*} remoteParams 远程参数变量名
 * @param {*} origin 前端 origin
 * @param {*} httpData 接口调用传递的数据
 * @param {*} funcBody 接口调用后执行的函数体
 * @returns 调用 api 源码
 */
export const getApiSource = ({
    api,
    remoteParams,
    origin,
    apiQuery = {},
    apiBody = {},
    funcBody
}) => {
    const variableCodes = []

    let httpData = {}
    if (METHODS_WITHOUT_DATA.includes(api.method)) {
        httpData = Object.keys(apiQuery).reduce((acc, cur) => {
            const query = apiQuery[cur]
            if (query.type === USE_API_TYPE.VARIABLE) {
                variableCodes.push(query.code)
                acc[cur] = `this.${query.code}`
            } else {
                acc[cur] = query.val
            }
            return acc
        }, {})
    }
    // tofix post

    const code = `this
        .$http
        .post('${origin}/api/execute/project/${api.projectId}/code/${api.code}', ${JSON.stringify(httpData)})
        .then((${remoteParams.join(', ')}) => {
            ${funcBody}
        })
        .catch((err) => {
            console.error(err)
        })
    `

    return {
        variableCodes,
        code
    }
}
