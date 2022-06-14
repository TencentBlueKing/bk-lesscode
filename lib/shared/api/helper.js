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
        query: [],
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
        ...options
    }
}

/**
 * 数据值转换为编辑态需要的scheme
 * 包含一些内置的逻辑，比如 root 和数组的 []
 */
export const parseJsonScheme2EditScheme = (data) => {
    if (Array.isArray(data)) {
        const defaultArrayScheme = [getDefaultApiParamEditScheme()]
        const valueScheme = data.map((item) => {
            return generateEditScheme(item)
        })
        return data.length <= 0 ? defaultArrayScheme : valueScheme
    } else {
        const objectScheme = getDefaultApiParamEditScheme({
            name: 'root',
            type: API_PARAM_TYPES.OBJECT.VAL,
            default: API_PARAM_TYPES.OBJECT.DEFAULT,
            disable: true
        })
        return data && data.name
            ? generateEditScheme(data)
            : objectScheme
    }
}

/**
 * 转换单个元素为编辑态 scheme
 * @param {*} json 数据
 * @param {*} scheme scheme
 * @returns 最终scheme
 */
const generateEditScheme = (jsonScheme) => {
    const scheme = getDefaultApiParamEditScheme({
        name: jsonScheme.name,
        required: jsonScheme.required,
        default: jsonScheme.default,
        description: jsonScheme.description,
        type: jsonScheme.type,
        disable: jsonScheme.disable
    })

    // 根据类型拼装模型
    if (API_PARAM_TYPES.OBJECT.VAL === jsonScheme.type) {
        Object.keys(jsonScheme.properties).forEach((propertyKey) => {
            const val = jsonScheme.properties[propertyKey]
            scheme.properties.push(generateEditScheme(val))
        })
    } else if (API_PARAM_TYPES.ARRAY.VAL === jsonScheme.type) {
        scheme.properties.push(generateEditScheme(jsonScheme.items))
    } else {
        scheme.properties = []
    }
    // 返回当前数据 scheme
    return scheme
}

/**
 * 编辑态scheme转换为json scheme（no code统一格式）
 * 转换过程会对值进行校验
 */
export const parseEditScheme2JsonScheme = (scheme) => {
    const result = {
        required: scheme.required,
        default: scheme.default,
        description: scheme.description,
        type: scheme.type,
        name: scheme.name,
        disable: scheme.disable
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
            result.items = parseEditScheme2JsonScheme(propertyScheme)
        })
    }

    return result
}

// 把编辑态的 scheme array 转换为真实的值，展示使用
export const parseEditArrayScheme2QueryValue = (querySchemes) => {
    const queryList = querySchemes.reduce((acc, cur) => {
        if (cur.name) {
            acc.push(`${cur.name}=${cur.default}`)
        }
        return acc
    }, [])
    return `?${queryList.join('&')}`
}

// 把编辑态的 scheme object 转换为真实的值，展示使用
export const parseEditObjectScheme2JsonValue = (scheme) => {
    let result = scheme.default

    if (scheme.type === API_PARAM_TYPES.OBJECT.VAL) {
        result = {}
        scheme.properties.forEach((propertyScheme) => {
            const childItem = parseEditObjectScheme2JsonValue(propertyScheme)
            if (propertyScheme.name) {
                result[propertyScheme.name] = childItem
            }
        })
    }

    if (scheme.type === API_PARAM_TYPES.ARRAY.VAL) {
        result = []
        scheme.properties.forEach((propertyScheme) => {
            const childItem = parseEditObjectScheme2JsonValue(propertyScheme)
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
