/**
 * Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
 * Copyright (C) 2017-2018 THL A29 Limited, a Tencent company. All rights reserved.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

import {
    DATA_TYPES
} from './constant'

// 是否是一致的框架
export const isMatchFramework = (f1, f2) => {
    return (f1 || 'vue2') === (f2 || 'vue2')
}

export const generatorMenu = (() => {
    let i = 0
    return (icon = 'icon-block-shape') => ({
        name: sharedI18n().t('默认导航') + `${++i}`,
        id: uuid(16),
        icon,
        pageCode: '',
        link: '',
        children: []
    })
})()

/**
 * 生成 uuid
 *
 * @param {Number} len 长度
 * @param {Number} radix 基数
 *
 * @return {string} uuid
 */
export function uuid (len = 8, radix = 16) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
    const uuid = []
    radix = radix || chars.length

    if (len) {
        let i
        // Compact form
        for (i = 0; i < len; i++) {
            uuid[i] = chars[0 | Math.random() * radix]
        }
    } else {
        // rfc4122, version 4 form
        let r

        // rfc4122 requires these characters
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-'
        uuid[14] = '4'

        let i
        // Fill in random data.  At i==19 set the high bits of clock sequence as
        // per rfc4122, sec. 4.1.5
        for (i = 0; i < 36; i++) {
            if (!uuid[i]) {
                r = 0 | Math.random() * 16
                uuid[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r]
            }
        }
    }

    return uuid.join('')
}

/**
 * 防抖，延迟一段时间执行
 * @param {*} fn 需要执行的函数
 * @param {*} delay 延迟时间，默认200
 * @returns
 */
export function debounce (fn, delay = 200) {
    let timer = null
    return function (params) {
        if (timer) {
            clearTimeout(timer)
        }
        timer = setTimeout(() => fn(params), delay)
    }
}

/**
 * 节流，每隔一段时间执行
 * @param {*} fn 需要执行的函数
 * @param {*} delay 延迟时间，默认200
 * @returns
 */
export function throttle (fn, delay = 200) {
    let valid = true
    return function (params) {
        if (!valid) {
            return false
        }
        valid = false
        setTimeout(() => {
            fn(params)
            valid = true
        }, delay)
    }
}

/**
 * 用于代码生成的单位过滤与转换，
 * 如果是rpx转为rem，否则直接输出
 * 此处将屏幕分为20份， 即20rem = 750rpx = 100%屏幕宽度
 * @param {String} value 需要过滤的值
 * @returns
 */
export function unitFilter (value) {
    if (/\d+rpx$/.test(value)) {
        const sizeNumber = (/(\d+)rpx$/.exec(value)[1] / 750 * 20).toFixed(2)
        const result = sizeNumber + 'rem'
        return result
    }
    return value
}

/**
 * 生成指定长度的小写字符随机字符串
 * @param {number} len 长度
 * @returns
 */
export const randomString = (len) => {
    const chars = 'abcdefhijklmnprstwxyz'
    const tempLen = chars.length
    let tempStr = ''
    for (let i = 0; i < len; ++i) {
        tempStr += chars.charAt(Math.floor(Math.random() * tempLen))
    }
    return tempStr
}

/**
 * 通过类型获取默认值
 */
export const getDefaultValueByType = (type) => {
    const typeValueMap = {
        'string': '',
        'array': [],
        'object': {},
        'boolean': false,
        'number': 0,
        'json': {}
    }
    if (typeValueMap.hasOwnProperty(type)) {
        return typeValueMap[type]
    }
    return ''
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

/**
 * 将字符串的 /[-_]\w/ 转换为大写字母
 * @param {*} str 待转换字符串
 * @returns 转换后的字符串
 */
export const toPascal = (str) => {
    return str.toLocaleLowerCase().split(/[-_]/).reduce((result, word) => {
        return result + word.replace(/^\w/, letter => letter.toLocaleUpperCase())
    }, '')
}

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

export const miniLimited = (value, limit) => {
    return parseInt(value) < parseInt(limit) ? parseInt(limit) : parseInt(value)
}

/**
 * 毫秒转换成时间对象
 * @param {} s 毫秒
 * @returns 时间对象
 */
export const transMs2Time = (time) => {
    const ms = time % 1000
    time = (time - ms) / 1000
    const s = time % 60
    time = (time - s) / 60
    const m = time % 60
    const h = (time - m) / 60
    return {
        h,
        m,
        s,
        ms
    }
}

/**
 * 将数组分组
 *
 * @param {Array} 待分组数组
 * @param {String} 分组的属性
 */
export function arrayGroupBy (list, groupId) {
    const groupedBy = {}
    for (const item of list) {
        if (groupedBy[item[groupId]]) {
            groupedBy[item[groupId]].push(item)
        } else {
            groupedBy[item[groupId]] = [item]
        }
    }
    return groupedBy
}

/**
 * 将多条sql拆分成sql数组
 * @param {*} sqlString sql语句
 * @returns sql数组
 */
export const splitSql = (sqlString) => {
    const sqlArr = []
    let strCharNum = 0
    let lastCharIndex = 0
    for (let charIndex in sqlString) {
        charIndex = +charIndex
        const sqlChar = sqlString[charIndex]
        if (sqlChar === ';' && sqlString.slice(charIndex + 1, charIndex + 8) !== 'base64,' && (strCharNum & 1) === 0) {
            const currentStr = sqlString.slice(lastCharIndex, charIndex + 1)
            sqlArr.push(currentStr)
            lastCharIndex = charIndex + 1
        }
        if (/'|"|`/.test(sqlChar) && sqlString[charIndex - 1] !== '\\') strCharNum++
    }
    return sqlArr
}

/**
 * 前后端共用国际化
 */
export const sharedI18n = () => {
    try {
        return window ? window.i18n : global.i18n
    } catch (error) {
        return global.i18n
    }
}
