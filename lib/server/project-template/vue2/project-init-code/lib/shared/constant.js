/**
 * 不携带请求体的方法
 */
export const METHODS_WITHOUT_DATA = ['delete', 'get', 'head', 'options']

/**
 * 数据类型
 */
export const DATA_TYPES = {
    STRING: {
        TYPE: '[object String]',
        VAL: 'string'
    },
    ARRAY: {
        TYPE: '[object Array]',
        VAL: 'array'
    },
    OBJECT: {
        TYPE: '[object Object]',
        VAL: 'object'
    },
    BOOLEAN: {
        TYPE: '[object Boolean]',
        VAL: 'boolean'
    },
    NUMBER: {
        TYPE: '[object Number]',
        VAL: 'number'
    },
    NULL: {
        TYPE: '[object Null]',
        VAL: 'null'
    },
    UNDEFINED: {
        TYPE: '[object Undefined]',
        VAL: 'undefined'
    },
    SYMBOL: {
        TYPE: '[object Symbol]',
        VAL: 'symbol'
    },
    FUNCTION: {
        TYPE: '[object Function]',
        VAL: 'function'
    }
}

// 应用权限模型-内置操作
export const IAM_BUILDIN_ACTION = {
    // 页面访问
    access_page: ['access_page', '页面访问', '访问页面的操作权限']
}

// 应用权限模型-资源类型 id
export const IAM_RESOURCE_TYPE_ID = 'page'
