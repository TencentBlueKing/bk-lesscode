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

import { getRepository } from 'typeorm'
import Project from '../model/entities/project'
import ProjectModel from '../model/project'
import ReleaseVersion from '../model/entities/release-version'
import { myProject } from './iam'

import { getTableDatas } from '../service/business/preview-db-service'

const { createDemoProject } = require('./project')

export const ERROR_CODES = {
    INVAILD_USER: [30001, '无效的用户'],
    NOT_FOUND_USER: [30002, '未找到用户'],
    MISSING_PARAMS_PROJECT_ID: [30003, '缺少参数 projectId'],
    MISSING_PARAMS_VERSION: [30004, '缺少参数 version'],
    MISSING_PARAMS_APPCODE: [30005, '缺少参数 appCode'],
    MISSING_PARAMS_MODULECODE: [30006, '缺少参数 moduleCode'],
    MISSING_PARAMS_APPNAME: [30007, '缺少参数 appName'],
    APPCODE_MODULECODE_NOT_EXSIT: [30008, '查询不到该appCode和moduleCode绑定的lesscode应用']
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
    const { projectId, version } = ctx.request.query

    if (!version) {
        ctx.throw(400, ERROR_CODES['MISSING_PARAMS_VERSION'][1], { code: ERROR_CODES['MISSING_PARAMS_VERSION'][0] })
    }

    const result = await getRepository(ReleaseVersion).findOne({
        select: ['env', 'version', 'status', 'codeUrl'],
        where: {
            projectId,
            version
        }
    })

    success(ctx, result)
}

/**
 * 根据 appCode 和 moduleCode 获取项目id和名称
 * @returns {Object}
 */
export const getProjectByBindApp = async (ctx) => {
    const { appCode, moduleCode } = ctx.request.query

    if (!appCode) {
        ctx.throw(400, ERROR_CODES['MISSING_PARAMS_APPCODE'][1], { code: ERROR_CODES['MISSING_PARAMS_APPCODE'][0] })
    }

    if (!moduleCode) {
        ctx.throw(400, ERROR_CODES['MISSING_PARAMS_MODULECODE'][1], { code: ERROR_CODES['MISSING_PARAMS_MODULECODE'][0] })
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
        ctx.throw(400, ERROR_CODES['APPCODE_MODULECODE_NOT_EXSIT'][1], { code: ERROR_CODES['APPCODE_MODULECODE_NOT_EXSIT'][0] })
    }

    success(ctx, result)
}

export const createProjectByBindApp = async (ctx) => {
    try {
        const { appCode, appName, moduleCode } = ctx.request.body
        const { user } = ctx.state.jwt || {}

        if (!appCode) {
            ctx.throw(400, ERROR_CODES['MISSING_PARAMS_APPCODE'][1], { code: ERROR_CODES['MISSING_PARAMS_APPCODE'][0] })
        }

        if (!appName) {
            ctx.throw(400, ERROR_CODES['MISSING_PARAMS_APPNAME'][1], { code: ERROR_CODES['MISSING_PARAMS_APPNAME'][0] })
        }

        if (!moduleCode) {
            ctx.throw(400, ERROR_CODES['MISSING_PARAMS_MODULECODE'][1], { code: ERROR_CODES['MISSING_PARAMS_MODULECODE'][0] })
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
            .select(['project.id', 'project.projectCode', 'project.projectName', 'project.appCode', 'project.moduleCode'])
            .where('project.createUser = :user', user.username)
            .where('project.deleteFlag != 1')
            .getMany()
    }

    // 增加apiName属性
    projectList = projectList.map(project => ({
        ...project,
        apiName: `lesscode-${project.id}${project.projectCode}`.slice(0, 30)
    }))
    success(ctx, projectList)
}

// 用户获取预览环境某张表下数据
export const getTableData = async (ctx) => {
    const query = ctx.request.query
    const { projectId, tableName, debug, ...queryData } = query
    const { timezoneOffset = '' } = ctx.request.headers
    const res = await getTableDatas(projectId, queryData, tableName, timezoneOffset)
    success(ctx, res)
}
