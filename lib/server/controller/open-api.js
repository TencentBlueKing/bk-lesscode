/**
 * Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
 * Copyright (C) 2025 Tencent. All rights reserved.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://opensource.org/licenses/MITgetPreviewDbConfig
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

import { getRepository } from 'typeorm'
import Project from '../model/entities/project'
import ProjectModel from '../model/project'
import ReleaseVersion from '../model/entities/release-version'
import { myProject } from './iam'

import { getPreviewDbConfig, getTables, getTableDetail } from '../service/business/preview-db-service'
import DBEngineService from '../service/common/db-engine-service'
import { logger } from '../logger'

const { createDemoProject } = require('./project')

export const ERROR_CODES = () => {
    return {
        INVAILD_USER: [30001, global.i18n.t('无效的用户')],
        NOT_FOUND_USER: [30002, global.i18n.t('未找到用户')],
        MISSING_PARAMS_PROJECT_ID: [30003, global.i18n.t('缺少参数 projectId')],
        MISSING_PARAMS_VERSION: [30004, global.i18n.t('缺少参数 version')],
        MISSING_PARAMS_APPCODE: [30005, global.i18n.t('缺少参数 appCode')],
        MISSING_PARAMS_MODULECODE: [30006, global.i18n.t('缺少参数 moduleCode')],
        MISSING_PARAMS_APPNAME: [30007, global.i18n.t('缺少参数 appName')],
        APPCODE_MODULECODE_NOT_EXSIT: [30008, global.i18n.t('查询不到该appCode和moduleCode绑定的lesscode应用')]
    }
}

const success = function (ctx, data = null) {
    ctx.send({
        code: 0,
        message: 'OK',
        data
    })
}

export const ping = async (ctx) => {
    try {
        const { app = {}, user = {} } = ctx.state.jwt

        ctx.send({
            code: 0,
            message: 'OK',
            data: {
                app_code: app.app_code,
                username: user
            }
        })
    } catch (err) {
        ctx.throwError({
            message: err.message
        })
    }
}

/**
 * 获取用户有权限的项目列表及项目版本号列表
 * @returns {Array.<{projectId: Number, projectCode: String, projectName: String, versionList: Array}>}
 */
export const getProjectReleases = async (ctx) => {
    try {
        const { user } = ctx.state.jwt || {}

        const result = await getRepository(Project)
            .createQueryBuilder('project')
            .innerJoinAndSelect('r_user_project_role', 'user_project_role', 'user_project_role.projectId = project.id')
            .leftJoinAndSelect('release_version', 'release_version', 'release_version.projectId = project.id')
            .select(['project.id as projectId', 'project.projectCode as projectCode', 'project.projectName as projectName', 'release_version.version as version'])
            .where('project.deleteFlag != 1 AND user_project_role.deleteFlag != 1 AND user_project_role.userId = :userId', { userId: user.id })
            .orderBy('project.id', 'DESC')
            .getRawMany()

        const list = []
        result.forEach(resultItem => {
            const { version, ...project } = resultItem
            const inserted = list.find(item => item.projectId === project.projectId)
            if (inserted) {
                inserted.versionList.push(version)
            } else {
                list.push({
                    ...project,
                    versionList: version ? [version] : []
                })
            }
        })

        success(ctx, list)
    } catch (e) {
        ctx.throw(e)
    }
}

/**
 * 根据项目id+版本号获取项目源码包
 * @returns {Object} 发布记录的部分字段
 */
export const getProjectReleasePackage = async (ctx) => {
    // const { projectId, version } = ctx.request.query

    // if (!version) {
    //     ctx.throw(400, ERROR_CODES()['MISSING_PARAMS_VERSION'][1], { code: ERROR_CODES()['MISSING_PARAMS_VERSION'][0] })
    // }

    // const result = await getRepository(ReleaseVersion).findOne({
    //     select: ['env', 'version', 'status', 'codeUrl'],
    //     where: {
    //         projectId,
    //         version
    //     }
    // })
    success(ctx, [])
}

/**
 * 根据 appCode 和 moduleCode 获取项目id和名称
 * @returns {Object}
 */
export const getProjectByBindApp = async (ctx) => {
    const { appCode, moduleCode } = ctx.request.query

    if (!appCode) {
        ctx.throw(400, ERROR_CODES()['MISSING_PARAMS_APPCODE'][1], { code: ERROR_CODES()['MISSING_PARAMS_APPCODE'][0] })
    }

    if (!moduleCode) {
        ctx.throw(400, ERROR_CODES()['MISSING_PARAMS_MODULECODE'][1], { code: ERROR_CODES()['MISSING_PARAMS_MODULECODE'][0] })
    }

    const result = await getRepository(Project).findOne({
        select: ['id', 'projectCode', 'projectName'],
        where: {
            appCode,
            moduleCode
        }
    })

    if (result?.id) {
        Object.assign(result, { linkUrl: `/project/${result.id}/pages` })
    } else {
        ctx.throw(400, ERROR_CODES()['APPCODE_MODULECODE_NOT_EXSIT'][1], { code: ERROR_CODES()['APPCODE_MODULECODE_NOT_EXSIT'][0] })
    }

    success(ctx, result)
}

export const createProjectByBindApp = async (ctx) => {
    try {
        const { appCode, appName, moduleCode } = ctx.request.body
        const { user } = ctx.state.jwt || {}
        ctx.session.userInfo = user

        if (!appCode) {
            ctx.throw(400, ERROR_CODES()['MISSING_PARAMS_APPCODE'][1], { code: ERROR_CODES()['MISSING_PARAMS_APPCODE'][0] })
        }

        if (!appName) {
            ctx.throw(400, ERROR_CODES()['MISSING_PARAMS_APPNAME'][1], { code: ERROR_CODES()['MISSING_PARAMS_APPNAME'][0] })
        }

        if (!moduleCode) {
            ctx.throw(400, ERROR_CODES()['MISSING_PARAMS_MODULECODE'][1], { code: ERROR_CODES()['MISSING_PARAMS_MODULECODE'][0] })
        }

        // 检验appcode、appName是否已经存在及合法性
        const checkRes = await ProjectModel.validProject({ projectCode: appCode + moduleCode, projectName: appName + moduleCode, fromOpenApi: true })
        if (checkRes.status > 0) {
            ctx.throw(checkRes.status, checkRes.errMsg, { code: checkRes.code })
        }

        await createDemoProject(ctx, {
            bkTicket: '',
            userInfo: {
                username: user.username,
                id: user.id
            },
            projectData: {
                copyFrom: null,
                projectCode: appCode + moduleCode,
                projectName: appName + moduleCode,
                projectDesc: '',
                appCode,
                moduleCode,
                createUser: user.username,
                updateUser: user.username
            }
        })
        const result = { projectCode: appCode + moduleCode, projectName: appName }
        success(ctx, result)
    } catch (err) {
        ctx.throwError({
            message: err.message
        })
    }
}

// 获取用户有应用开发权限的应用列表
export const getMyProjectList = async (ctx) => {
    const { user = {} } = ctx.state.jwt
    let projectList = []
    if (global.IAM_ENABLE) {
        // 查询当前用户具有应用开发权限的应用列表
        ctx.session.userInfo = user
        projectList = await myProject(ctx)
    } else {
        projectList = await getRepository(Project)
            .createQueryBuilder('project')
            .select(['project.id', 'project.projectCode', 'project.projectName', 'project.appCode', 'project.moduleCode', 'project.createUser'])
            .where('project.createUser = :user', { user: user.username })
            .andWhere('project.deleteFlag = 0')
            .getMany()
    }

    // 增加apiName属性
    projectList = projectList.map(project => ({
        ...project,
        apiName: `lesscode-${project.id}${project.projectCode}`.slice(0, 30)
    }))
    success(ctx, projectList)
}

// 根据projectId获取应用下的数据表及表字段
export const getProjectTables = async (ctx) => {
    const query = ctx.request.query
    const { projectId } = query
    const res = await getTables(projectId, 1, 200)
    const data = (res?.list || []).map(item => ({
        id: item.id,
        tableName: item.tableName,
        createUser: item.createUser,
        projectId: item.projectId,
        columns: (item.columns || []).map(col => ({
            name: col.name,
            type: col.type,
            default: col.default
        }))
    }))
    success(ctx, data)
}

export const getProjectTableCols = async (ctx) => {
    const query = ctx.request.query
    const { projectId, tableName } = query
    const table = await getTableDetail(projectId, tableName)
    if (table?.id && table.columns) {
        const data = (table.columns || []).map(col => ({
            name: col.name,
            type: col.type,
            default: col.default
        }))
        success(ctx, data)
    } else {
        ctx.throw(500, '未找到对应表结构', { code: 500 })
    }
}

/**
 * 增强的SQL安全检查函数
 * @param {string} sql SQL语句
 * @throws {Error} 如果检测到危险模式
 */
const enhancedSqlSecurityCheck = (sql) => {
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
        /UNION\s+SELECT/i,           // UNION注入
        /;\s*(DROP|DELETE|UPDATE|INSERT|ALTER|CREATE|GRANT|REVOKE)/i, // 多语句注入
        /--/,                       // SQL注释
        /\/\*/,                     // 多行注释开始
        /\*\//,                     // 多行注释结束
        /XP_CMDSHELL/i,            // SQL Server命令执行
        /SP_EXECUTESQL/i,          // SQL Server动态SQL
        /EXEC\s*\(/i,              // 执行函数
        /EXECUTE\s*\(/i,           // 执行函数
        /INFORMATION_SCHEMA/i,      // 信息模式
        /PERFORMANCE_SCHEMA/i,      // 性能模式
        /MYSQL\./i,                // MySQL系统表
        /\@\@/,                    // 系统变量
        /DATABASE\(\)/i,           // 数据库函数
        /USER\(\)/i,               // 用户函数
        /VERSION\(\)/i,            // 版本函数
        /BENCHMARK\s*\(/i,         // 基准测试函数
        /SLEEP\s*\(/i,             // 延时函数
        /WAITFOR\s+DELAY/i,        // SQL Server延时
        /PG_SLEEP\s*\(/i,          // PostgreSQL延时
        /DBMS_PIPE\.RECEIVE_MESSAGE/i, // Oracle延时
        /INTO\s+OUTFILE/i,         // 文件写入
        /INTO\s+DUMPFILE/i,        // 文件转储
        /LOAD_FILE\s*\(/i,         // 文件读取
        /CHAR\s*\(/i,              // 字符编码绕过
        /ASCII\s*\(/i,             // ASCII编码绕过
        /HEX\s*\(/i,               // 十六进制编码绕过
        /UNHEX\s*\(/i,             // 反十六进制编码
        /CONCAT\s*\(/i,            // 字符串拼接（可能用于绕过）
        /SUBSTRING\s*\(/i,         // 子字符串（可能用于盲注）
        /MID\s*\(/i,               // 中间字符串
        /LEFT\s*\(/i,              // 左侧字符串
        /RIGHT\s*\(/i,             // 右侧字符串
        /IF\s*\(/i,                // 条件函数（可能用于盲注）
        /CASE\s+WHEN/i,            // CASE语句（可能用于盲注）
        /EXTRACTVALUE\s*\(/i,      // XML函数（可能用于报错注入）
        /UPDATEXML\s*\(/i,         // XML更新函数
        /NAME_CONST\s*\(/i,        // 名称常量函数
        /MULTIPOINT\s*\(/i,        // 几何函数
        /POLYGON\s*\(/i,           // 多边形函数
        /MULTIPOLYGON\s*\(/i,      // 多多边形函数
        /LINESTRING\s*\(/i,        // 线字符串函数
        /MULTILINESTRING\s*\(/i    // 多线字符串函数
    ]

    for (const pattern of dangerousPatterns) {
        if (pattern.test(sql)) {
            throw new Error(`检测到危险的SQL模式: ${pattern.source}`)
        }
    }
}

// 执行sql查询，获取预览环境用户db表下数据（当前仅会开放给bk-vision）
export const execQuerySql = async (ctx) => {
    const post = ctx.request.body
    const { projectId, sql } = post

    // 参数验证
    if (!projectId) {
        ctx.throw(400, '缺少必要参数 projectId', { code: 400 })
    }

    if (!sql || typeof sql !== 'string') {
        ctx.throw(400, 'SQL语句不能为空且必须为字符串类型', { code: 400 })
    }

    try {
        // 增强的安全检查
        enhancedSqlSecurityCheck(sql)

        const previewDbConfig = await getPreviewDbConfig(projectId)
        const dbEngine = new DBEngineService(previewDbConfig)
        const res = await dbEngine.execSql(sql)
        success(ctx, res)
    } catch (err) {
        // 记录详细的错误日志
        logger.error({
            message: 'SQL查询执行失败',
            projectId,
            sql: sql.substring(0, 200), // 只记录前200个字符，避免日志过长
            error: err.message,
            stack: err.stack,
            timestamp: new Date().toISOString()
        })

        // 不暴露具体的SQL错误信息给客户端
        const safeErrorMessage = err.message.includes('检测到危险') || 
                                err.message.includes('SQL语句') ||
                                err.message.includes('仅支持SELECT') 
                                ? err.message 
                                : '查询执行失败，请检查SQL语句'

        ctx.throw(400, safeErrorMessage, { code: 400 })
    }
}
