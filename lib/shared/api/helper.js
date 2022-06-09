import {
    API_METHOD,
    API_PARAM_TYPES
} from './constant'

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
        query: {},
        body: {},
        response: {},
        ...options
    }
}

/**
 * 获取 API 参数编辑态模型
 * @param {*} options 覆盖字段使用
 * @returns 返回一个 API 参数模型
 */
export const getDefaultApiParamEditScheme = (options = {}) => {
    return {
        required: false,
        name: '',
        default: API_PARAM_TYPES.STRING.DEFAULT,
        description: '',
        type: API_PARAM_TYPES.STRING.VAL,
        properties: [],
        showProperty: true,
        parent: null,
        ...options
    }
}

/**
 * 数据值转换为编辑态需要的scheme
 */
export const parseObjectValue2EditScheme = (json, scheme) => {
    // 根据类型拼装模型
    const type = Object.prototype.toString.call(json)
    if (API_PARAM_TYPES.OBJECT.TYPE === type) {
        Object.keys(json).forEach((jsonKey) => {
            const val = json[jsonKey]
            const childScheme = parseObjectValue2EditScheme(val, getDefaultApiParamEditScheme({
                name: jsonKey,
                parent: scheme
            }))
            scheme.properties.push(childScheme)
        })
    } else if (API_PARAM_TYPES.ARRAY.TYPE === type) {
        // array 默认每一行数据模型相同
        const val = json[0]
        const childScheme = parseObjectValue2EditScheme(val, getDefaultApiParamEditScheme({
            name: 'array-item',
            description: '数组每个元素的模型',
            type: API_PARAM_TYPES.OBJECT.VAL,
            disable: true,
            parent: scheme
        }))
        scheme.properties.push(childScheme)
    } else {
        scheme.properties = []
    }
    // 设置 scheme type & default
    Object.keys(API_PARAM_TYPES).forEach((paramTypeKey) => {
        const paramType = API_PARAM_TYPES[paramTypeKey]
        if (paramType.TYPE === type) {
            scheme.type = paramType.VAL
            scheme.default = paramType.DEFAULT
        }
    })
    // 返回当前数据 scheme
    return scheme
}

/**
 * 编辑态scheme转换为json scheme（no code统一格式）
 * 转换过程会对值进行校验
 */
export const parseEditScheme2JsonScheme = (scheme) => {
    if ([null, undefined, ''].includes(scheme.name)) {
        throw new Error(`${scheme.parent.name} 存在没有名称的子节点，请修改后再试`)
    }

    const result = {
        required: scheme.required,
        default: scheme.default,
        description: scheme.description,
        type: scheme.type
    }

    if (scheme.type === API_PARAM_TYPES.OBJECT.VAL) {
        result.properties = {}
        scheme.properties.forEach((propertyScheme) => {
            result.properties[propertyScheme.name] = parseEditScheme2JsonScheme(propertyScheme)
        })
    }

    if (scheme.type === API_PARAM_TYPES.ARRAY.VAL) {
        result.items = []
        scheme.properties.forEach((propertyScheme) => {
            result.items.push(parseEditScheme2JsonScheme(propertyScheme))
        })
    }

    return result
}

// 把编辑态的scheme转换为真实的值
export const parseEditScheme2JsonValue = (scheme) => {
    let result = scheme.default

    if (scheme.type === API_PARAM_TYPES.OBJECT.VAL) {
        result = {}
        scheme.properties.forEach((propertyScheme) => {
            const childItem = parseEditScheme2JsonValue(propertyScheme)
            if (propertyScheme.name) {
                result[propertyScheme.name] = childItem
            }
        })
    }

    if (scheme.type === API_PARAM_TYPES.ARRAY.VAL) {
        result = []
        scheme.properties.forEach((propertyScheme) => {
            const childItem = parseEditScheme2JsonValue(propertyScheme)
            if (propertyScheme.name) {
                result.push(childItem)
            }
        })
    }

    return result
}

// json scheme 转换为可视化的 json value
export const parseJsonScheme2JsonValue = (scheme) => {
    let result = scheme.default

    if (scheme.type === API_PARAM_TYPES.OBJECT.VAL) {
        result = {}
        Object.keys(scheme.properties).forEach((propertySchemeName) => {
            const propertyScheme = scheme.properties[propertySchemeName]
            const childItem = parseJsonScheme2JsonValue(propertyScheme)
            if (propertySchemeName) {
                result[propertySchemeName] = childItem
            }
        })
    }

    if (scheme.type === API_PARAM_TYPES.ARRAY.VAL) {
        result = []
        scheme.items.forEach((itemScheme) => {
            const childItem = parseJsonScheme2JsonValue(itemScheme)
            result.push(childItem)
        })
    }

    return result
}
