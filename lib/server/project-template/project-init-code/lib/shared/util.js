import {
    DATA_TYPES
} from './constant'

/**
 * 将version转换为数组，方便对比
 * @param {*} version 版本，比如 0.0.0
 * @returns 返回版本数字
 */
export const transformVersionToNum = (version) => {
    const versionNums = version.split('.')
    return versionNums.reverse().reduce((acc, cur, index) => {
        return acc + Number(cur) * 10 ** index
    }, 0)
}

/**
 * 通过值获取类型
 * @param {*} value 值
 * @returns 类型
 */
export const getTypeByValue = (value) => {
    const valueTypeMap = {
        '[object String]': DATA_TYPES.STRING.VAL,
        '[object Array]': DATA_TYPES.ARRAY.VAL,
        '[object Object]': DATA_TYPES.OBJECT.VAL,
        '[object Boolean]': DATA_TYPES.BOOLEAN.VAL,
        '[object Number]': DATA_TYPES.NUMBER.VAL,
        '[object Null]': DATA_TYPES.NULL.VAL,
        '[object Undefined]': DATA_TYPES.UNDEFINED.VAL,
        '[object Symbol]': DATA_TYPES.SYMBOL.VAL,
        '[object Function]': DATA_TYPES.FUNCTION.VAL
    }
    const type = Object.prototype.toString.apply(value)
    if (valueTypeMap.hasOwnProperty(type)) {
        return valueTypeMap[type]
    }
    return ''
}

/**
 * 判断值是否为空
 * @param { string | array | object | null | undefined } value 值
 * @returns boolean
 */
export const isEmpty = value => {
    if (value === ''
        || value === null
        || value === undefined) {
        return true
    }
    if (Array.isArray(value) && value.length < 1) {
        return true
    }
    if (Object.prototype.toString.call(value) === '[object Object]'
        && Object.keys(value).length < 1) {
        return true
    }
    return false
}
