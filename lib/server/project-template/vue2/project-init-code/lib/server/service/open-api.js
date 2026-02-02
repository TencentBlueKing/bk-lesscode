import bkToken from '../conf/token'
import {
    decodeToken
} from '@bkui/apigateway-nodejs-sdk'

/**
 * 增强的SQL安全检查函数
 * @param {string} sql SQL语句
 * @throws {Error} 如果检测到危险模式
 */
export const enhancedSqlSecurityCheck = (sql) => {
    if (!sql || typeof sql !== 'string') {
        throw new Error('SQL语句不能为空')
    }

    const trimmedSql = sql.trim()
    const upperCaseSql = trimmedSql.toUpperCase()

    // 基本检查：必须以SELECT开头
    if (!upperCaseSql.startsWith('SELECT')) {
        throw new Error('仅支持SELECT查询语句')
    }

    // 危险关键词检查（更全面）
    const dangerousKeywords = [
        'DROP DATABASE', 'TRUNCATE TABLE', 'DROP TABLE', 'CREATE TABLE',
        'DELETE FROM', 'ALTER TABLE', 'INSERT INTO', 'UPDATE SET',
        'GRANT', 'REVOKE', 'CREATE USER', 'DROP USER', 'SET PASSWORD',
        'LOAD DATA', 'OUTFILE', 'DUMPFILE', 'LOAD_FILE'
    ]
    
    for (const keyword of dangerousKeywords) {
        if (upperCaseSql.includes(keyword)) {
            throw new Error(`检测到危险关键词: ${keyword}`)
        }
    }

    // 危险模式检查
    const dangerousPatterns = [
        /UNION\s+SELECT/i, // UNION注入
        /;\s*(DROP|DELETE|UPDATE|INSERT|ALTER|CREATE|GRANT|REVOKE)/i, // 多语句注入
        /XP_CMDSHELL/i, // SQL Server命令执行
        /SP_EXECUTESQL/i, // SQL Server动态SQL
        /EXEC\s*\(/i, // 执行函数
        /EXECUTE\s*\(/i, // 执行函数
        /INFORMATION_SCHEMA/i, // 信息模式
        /PERFORMANCE_SCHEMA/i, // 性能模式
        /MYSQL\./i, // MySQL系统表
        /\@\@/, // 系统变量
        /DATABASE\(\)/i, // 数据库函数
        /USER\(\)/i, // 用户函数
        /VERSION\(\)/i, // 版本函数
        /BENCHMARK\s*\(/i, // 基准测试函数
        /SLEEP\s*\(/i, // 延时函数
        /WAITFOR\s+DELAY/i, // SQL Server延时
        /PG_SLEEP\s*\(/i, // PostgreSQL延时
        /DBMS_PIPE\.RECEIVE_MESSAGE/i, // Oracle延时
        /INTO\s+OUTFILE/i, // 文件写入
        /INTO\s+DUMPFILE/i, // 文件转储
        /LOAD_FILE\s*\(/i, // 文件读取
        /CHAR\s*\(/i, // 字符编码绕过
        /ASCII\s*\(/i, // ASCII编码绕过
        /HEX\s*\(/i, // 十六进制编码绕过
        /UNHEX\s*\(/i, // 反十六进制编码
        /CONCAT\s*\(/i, // 字符串拼接（可能用于绕过）
        /SUBSTRING\s*\(/i, // 子字符串（可能用于盲注）
        /MID\s*\(/i, // 中间字符串
        /LEFT\s*\(/i, // 左侧字符串
        /RIGHT\s*\(/i, // 右侧字符串
        /IF\s*\(/i, // 条件函数（可能用于盲注）
        /CASE\s+WHEN/i, // CASE语句（可能用于盲注）
        /EXTRACTVALUE\s*\(/i, // XML函数（可能用于报错注入）
        /UPDATEXML\s*\(/i, // XML更新函数
        /NAME_CONST\s*\(/i, // 名称常量函数
        /MULTIPOINT\s*\(/i, // 几何函数
        /POLYGON\s*\(/i, // 多边形函数
        /MULTIPOLYGON\s*\(/i, // 多多边形函数
        /LINESTRING\s*\(/i, // 线字符串函数
        /MULTILINESTRING\s*\(/i // 多线字符串函数
    ]

    for (const pattern of dangerousPatterns) {
        if (pattern.test(sql)) {
            throw new Error(`检测到危险的SQL模式: ${pattern.source}`)
        }
    }
}

export const getUserFromApiGW = async (jwt) => {
    const { user } = await decodeToken(jwt, bkToken)
    if (!user) {
        throw new Error('未解析到用户名，请修改后再试')
    }
    return user
}

export const getAuthQuerySubfix = (cookies) => {
    return `bk_app_code=${bkToken?.bk_app_code}&bk_app_secret=${encodeURI(bkToken?.bk_app_secret)}&${global.AUTH_NAME}=${cookies.get(global.AUTH_NAME)}`
}

export const getAuthPostParams = (cookies) => {
    return {
        bk_app_code: bkToken?.bk_app_code,
        bk_app_secret: bkToken?.bk_app_secret,
        [global.AUTH_NAME]: cookies.get(global.AUTH_NAME)
    }
}
