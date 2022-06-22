import { normalizeJson } from '../data-source/helper'
import { API_PARAM_VALUE_TYPES, API_PARAM_TYPES } from '../api/constant'

/**
 * 把 nocode 数据源 json 转换为 lesscode 数据源 json
 * @param {[]Object} jsonData no code json
 * @returns lesscode json
 */
export const transformNCJson2LCJson = (ncJson) => {
    const typeMap = {
        STRING: 'varchar',
        TEXT: 'text',
        INT: 'int',
        DATE: 'date',
        DATETIME: 'datetime',
        LINK: 'varchar',
        SELECT: 'varchar',
        INPUTSELECT: 'varchar',
        MULTISELECT: 'varchar',
        CHECKBOX: 'varchar',
        RADIO: 'varchar',
        MEMBER: 'varchar',
        MEMBERS: 'varchar',
        RICHTEXT: 'text',
        FILE: 'json',
        TABLE: 'json',
        DESC: 'varchar',
        IMAGE: 'varchar'
    }

    return ncJson.reduce((acc, cur) => {
        if (cur.type !== 'DIVIDER') {
            const json = {
                name: cur.key,
                type: typeMap[cur.type],
                default: cur.default,
                comment: cur.desc,
                length: 255,
                columnId: cur.columnId
            }
            acc.push(normalizeJson(json))
        }
        return acc
    }, [])
}

// 获取表单中值
export const transGetParamVal = (variableList) => {
    return (param) => {
        let result
        if (API_PARAM_VALUE_TYPES.VALUE === param.valueType) {
            result = param.value
        } else {
            const variable = variableList.find(variable => variable.key === param.code)
            result = variable.key
        }
        return result
    }
}

// 获取api响应字段默认值
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

export const parseResponseToVariables = (schema, path = '') => {
    let val = []
    const refPath = `${path}${path ? '.' : ''}${schema.name}`
    if (schema.hooked && schema.name && schema.code) {
        val.push({
            name: schema.code,
            ref_path: refPath,
            source: 'global',
            type: schema.type
        })
        return val
    }
    if (API_PARAM_TYPES.OBJECT.VAL === schema.type) {
        schema.children.forEach((item) => {
            if (item.name) {
                const variable = parseResponseToVariables(item, refPath)
                if (variable.length > 0) {
                    val = val.concat(variable)
                }
            }
        })
    }
    if (API_PARAM_TYPES.ARRAY.VAL === schema.type) {
        schema.children.forEach((item, index) => {
            if (item.name) {
                const variable = parseResponseToVariables(item, `${refPath}.${index}`)
                if (variable.length > 0) {
                    val = val.concat(variable)
                }
            }
        })
    }
    return val
}

export const getWebhookDefaultConfig = () => {
    return {
        url: '',
        method: 'GET',
        query_params: [],
        auth: '',
        headers: {},
        body: {
            type: 'json',
            raw_type: 'json',
            content: {}
        },
        timeout: '',
        success_exp: ''
    }
}

// query schema 转换为 webhook 值
export const parseQuerySchemaToWebhookVal = (schema) => {
    return schema.map(item => {
        const { name, code, value, valueType } = item
        const val = valueType === 'variable' ? code : value
        return { key: name, value: val }
    })
}

// body schema 转换为 webhook 值
export const parseBodySchemaToWebhookVal = (schema) => {
    let val = schema.valueType === 'variable' ? schema.code : schema.value
    if (API_PARAM_TYPES.OBJECT.VAL === schema.type) {
        val = {}
        schema.children.forEach((item) => {
            if (item.name) {
                val[item.name] = parseBodySchemaToWebhookVal(item)
            }
        })
    }
    if (API_PARAM_TYPES.ARRAY.VAL === schema.type) {
        val = []
        schema.children.forEach((item) => {
            if (item.name) {
                val.push(parseBodySchemaToWebhookVal(item))
            }
        })
    }
    return val
}

export const transApiToWebhook = (api) => {
    const { url, method, query, body } = api
    const config = getWebhookDefaultConfig()
    config.url = url
    config.method = method.toUpperCase() // http方法大写
    config.query_params = parseQuerySchemaToWebhookVal(query)
    config.body.content = parseBodySchemaToWebhookVal(body)
    return config
}
