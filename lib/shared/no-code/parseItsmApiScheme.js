import { uuid } from 'shared/util'

const itsmApiSchemeParser = (data) => {
    const { path, method, req_headers, req_body, req_params, rsp_data } = data
    return {
        url: path,
        method: method.toLowerCase(),
        headers: req_headers,
        query: parseQuery(req_params),
        body: parseObjScheme(req_body, 'root'),
        response: parseObjScheme(rsp_data, 'root'),
        summary: ''
    }
}
const parseQuery = (query) => {
    return query.map(item => {
        const { name, value, is_necessary, desc } = item
        return { name, value, description: desc, required: is_necessary, type: 'string', children: [], showChildren: true }
    })
}

const parseObjScheme = (scheme, name = '', required = false) => {
    const { description, properties, type, items = {}, required: requiredSubFields = [], default: dftVal = '' } = scheme
    const data = getApiFieldItemFormat({
        name,
        type,
        description,
        required,
        value: dftVal
    })
    // 当前字段为Object类型
    if (type === 'object') {
        Object.keys(properties).forEach(key => {
            const property = properties[key]
            data.children.push(parseObjScheme(property, key, requiredSubFields.includes(key)))
        })
    }
    // 当前字段为Array类型
    if (type === 'array') {
        const requiredArrayItems = items.required || []
        // Array类型的每个元素为Object
        if ('properties' in items) {
            Object.keys(items.properties).forEach(key => {
                const property = items.properties[key]
                data.children.push(parseObjScheme(property, key, requiredArrayItems.includes(key)))
            })
        } else if (Object.keys(items).length > 0) { // Array类型的每个元素为String, Number等基础类型
            const { default: dftVal, description, type } = items
            data.children.push(getApiFieldItemFormat({ description, type, value: dftVal }))
        }
    }
    return data
}

const getApiFieldItemFormat = (config) => {
    return {
        id: uuid(),
        name: '',
        value: '',
        type: '',
        description: '',
        required: false,
        children: [],
        showChildren: true,
        ...config
    }
}

export default itsmApiSchemeParser
