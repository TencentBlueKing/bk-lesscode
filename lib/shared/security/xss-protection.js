/**
 * XSS 防护工具函数
 * 提供统一的XSS过滤和防护功能
 **/
/**
 * HTML实体编码映射表
 */
const HTML_ENTITIES = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
}

/**
 * 转义HTML特殊字符，防止XSS攻击
 * @param {string} str 需要转义的字符串
 * @returns {string} 转义后的安全字符串
 */
export function escapeHtml (str) {
    if (typeof str !== 'string') {
        return str
    }
    return str.replace(/[&<>"'/]/g, (match) => HTML_ENTITIES[match])
}

/**
 * 安全的JSON解析
 * @param {string} jsonStr JSON字符串
 * @param {*} defaultValue 默认值
 * @returns {*} 解析后的对象或默认值
 */
export function safeJsonParse (jsonStr, defaultValue = null) {
    try {
        return JSON.parse(jsonStr)
    } catch (e) {
        return defaultValue
    }
}
