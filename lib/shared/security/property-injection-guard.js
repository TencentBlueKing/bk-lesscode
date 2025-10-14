/**
 * @desc 防止Remote property injection攻击的安全工具函数
 * @author LessCode Security Team
 */

// 禁止的属性名，这些属性可能被用于原型链污染攻击
const FORBIDDEN_KEYS = [
    '__proto__',
    'constructor',
    'prototype',
    'hasOwnProperty',
    'isPrototypeOf',
    'propertyIsEnumerable',
    'toLocaleString',
    'toString',
    'valueOf'
]

// 安全的属性名正则表达式，只允许字母、数字、下划线和连字符
const SAFE_KEY_REGEX = /^[a-zA-Z0-9_-]+$/

/**
 * @desc 检查属性名是否安全
 * @param {string} key 属性名
 * @returns {boolean} 是否安全
 */
export function isSafePropertyKey (key) {
    if (typeof key !== 'string') {
        return false
    }
    
    // 检查是否在禁止列表中
    if (FORBIDDEN_KEYS.includes(key)) {
        return false
    }
    
    // 检查是否符合安全命名规范
    if (!SAFE_KEY_REGEX.test(key)) {
        return false
    }
    
    return true
}

/**
 * @desc 安全地合并对象属性，防止原型链污染
 * @param {Object} target 目标对象
 * @param {Object} source 源对象
 * @param {Object} options 选项
 * @param {boolean} options.deep 是否深度合并
 * @param {boolean} options.strict 是否严格模式（拒绝所有不安全的属性）
 * @returns {Object} 合并后的安全对象
 */
export function safeObjectMerge (target = {}, source = {}, options = {}) {
    const { deep = false, strict = true } = options
    
    // 创建没有原型链的安全对象
    const safeTarget = Object.create(null)
    
    // 先复制目标对象的属性
    if (target && typeof target === 'object') {
        for (const key in target) {
            if (Object.prototype.hasOwnProperty.call(target, key) && isSafePropertyKey(key)) {
                safeTarget[key] = deep ? deepClone(target[key]) : target[key]
            }
        }
    }
    
    // 再合并源对象的属性
    if (source && typeof source === 'object') {
        for (const key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                if (isSafePropertyKey(key)) {
                    if (deep && typeof source[key] === 'object' && source[key] !== null) {
                        safeTarget[key] = safeObjectMerge(safeTarget[key] || {}, source[key], { deep: true, strict })
                    } else {
                        safeTarget[key] = source[key]
                    }
                } else if (strict) {
                    // 严格模式下，记录不安全的属性但拒绝合并
                    console.warn(`[Security] Rejected unsafe property key: ${key}`)
                }
            }
        }
    }
    
    return safeTarget
}

/**
 * @desc 安全地设置对象属性
 * @param {Object} target 目标对象
 * @param {string} key 属性名
 * @param {any} value 属性值
 * @param {boolean} strict 是否严格模式
 * @returns {boolean} 是否设置成功
 */
export function safeSetProperty (target, key, value, strict = true) {
    if (!target || typeof target !== 'object') {
        return false
    }
    
    if (!isSafePropertyKey(key)) {
        if (strict) {
            console.warn(`[Security] Rejected unsafe property key: ${key}`)
            return false
        }
        return false
    }
    
    target[key] = value
    return true
}

/**
 * @desc 安全地遍历对象属性
 * @param {Object} obj 要遍历的对象
 * @param {Function} callback 回调函数
 * @param {boolean} strict 是否严格模式
 */
export function safeForEachProperty (obj, callback, strict = true) {
    if (!obj || typeof obj !== 'object') {
        return
    }
    
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            if (isSafePropertyKey(key)) {
                callback(key, obj[key])
            } else if (strict) {
                console.warn(`[Security] Skipped unsafe property key: ${key}`)
            }
        }
    }
}

/**
 * @desc 深度克隆对象，防止原型链污染
 * @param {any} obj 要克隆的对象
 * @returns {any} 克隆后的对象
 */
export function deepClone (obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj
    }
    
    if (obj instanceof Date) {
        return new Date(obj.getTime())
    }
    
    if (obj instanceof Array) {
        return obj.map(item => deepClone(item))
    }
    
    if (typeof obj === 'object') {
        const cloned = Object.create(null)
        safeForEachProperty(obj, (key, value) => {
            cloned[key] = deepClone(value)
        }, false) // 深度克隆时不严格，但会过滤不安全的key
        return cloned
    }
    
    return obj
}

/**
 * @desc 验证并清理对象，移除不安全的属性
 * @param {Object} obj 要清理的对象
 * @param {boolean} deep 是否深度清理
 * @returns {Object} 清理后的安全对象
 */
export function sanitizeObject (obj, deep = false) {
    if (!obj || typeof obj !== 'object') {
        return obj
    }
    
    const sanitized = Object.create(null)
    
    safeForEachProperty(obj, (key, value) => {
        if (deep && typeof value === 'object' && value !== null) {
            sanitized[key] = sanitizeObject(value, true)
        } else {
            sanitized[key] = value
        }
    }, false) // 清理时不严格，但会过滤不安全的key
    
    return sanitized
}

/**
 * @desc 检查对象是否包含不安全的属性
 * @param {Object} obj 要检查的对象
 * @param {boolean} deep 是否深度检查
 * @returns {Array} 不安全属性的列表
 */
export function findUnsafeProperties (obj, deep = false) {
    const unsafeProperties = []
    
    if (!obj || typeof obj !== 'object') {
        return unsafeProperties
    }
    
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            if (!isSafePropertyKey(key)) {
                unsafeProperties.push(key)
            } else if (deep && typeof obj[key] === 'object' && obj[key] !== null) {
                const nestedUnsafe = findUnsafeProperties(obj[key], true)
                unsafeProperties.push(...nestedUnsafe.map(nestedKey => `${key}.${nestedKey}`))
            }
        }
    }
    
    return unsafeProperties
}
