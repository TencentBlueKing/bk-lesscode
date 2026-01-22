/**
 * 安全的SQL标识符转义函数
 * @param {string} identifier 标识符（表名、列名等）
 * @returns {string} 转义后的标识符
 */
export const escapeIdentifier = (identifier) => {
    // 只允许字母、数字、下划线
    if (!/^[a-zA-Z0-9_-]+$/.test(identifier)) {
        throw new Error('标识符格式错误：只允许字母、数字、下划线和连字符')
    }
    return `\`${identifier}\``
}
