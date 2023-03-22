/* eslint-disable no-unused-vars */
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
import { getExportProjectData, importProject } from '../service/business/project'
import projectModel from '../model/project'
import iamModel from '../model/iam'
import iamAppPermModel from '../model/iam-app-perm'
import { pages } from '../system-conf/demo-page-code'
import { createDemoPage, createDefaultPage } from './page'
import LayoutModel from '../model/layout'
import { fetchActionsPerm, checkInServer, batchAuth, createRatingManager } from './iam'
import { IAM_APP_ID } from '../conf/iam'
import { IAM_ACTION, IAM_RESOURCE_TYPE_ID } from '../../shared/constant'
import { logger } from '../logger'

const { CODE } = require('../util')

const fse = require('fs-extra')
const path = require('path')
const send = require('koa-send')
const STATIC_URL = './lib/server/project-template/'

const handlePerms = async (ctx, projectId, projectData) => {
    const res = {}
    const { projectName, projectCode } = projectData

    res.data = projectId

    if (global.IAM_ENABLE) {
        // 主动授权，刷数据
        const batchAuthRes = await batchAuth(
            ctx,
            [
                IAM_ACTION.develop_app[0], IAM_ACTION.deploy_app[0],
                IAM_ACTION.manage_perms_in_app[0], IAM_ACTION.manage_app[0]
            ],
            [
                {
                    system: IAM_APP_ID,
                    type: IAM_RESOURCE_TYPE_ID,
                    paths: [
                        [
                            {
                                type: IAM_RESOURCE_TYPE_ID,
                                id: projectId,
                                name: `${projectCode}_${projectId}`
                            }
                        ]
                    ]
                }
            ]
        )

        if (!batchAuthRes.result) {
            res.code = batchAuthRes.code
            res.message = batchAuthRes.message
            res.data = null
        }

        // TODO: 调用权限中心创建应用分级管理员失败，但 lesscode 中项目还是创建了
        const createRatingManagerRes = await createRatingManager(ctx, projectId, projectCode, projectName)
        if (!createRatingManagerRes.result) {
            res.code = createRatingManagerRes.code
            res.message = createRatingManagerRes.message
            res.data = null
        }
    }

    // 没有开启 IAM_ENABLE 时，也把 iam-app-perm 的数据初始化
    iamAppPermModel.insertIamAppPermData(projectId, projectData)
    return res
}

module.exports = {
    async createProject (ctx) {
        const { layouts: layoutData, ...projectData } = ctx.request.body
        const userInfo = ctx.session.userInfo
        projectData.createUser = userInfo.username
        const userProjectRoleData = {
            userId: userInfo.id,
            roleId: 1
        }

        try {
            const res = {
                code: 0,
                message: 'OK',
                data: null
            }

            const { projectName, projectCode } = projectData

            // 校验projectCode和projectName
            const checkRes = await projectModel.validProject({ projectCode, projectName })
            if (checkRes.status > 0) {
                ctx.throw(checkRes.status, checkRes.errMsg, { code: checkRes.code })
            }

            const { projectId } = await projectModel.createProject(projectData, userProjectRoleData, layoutData, ctx.cookies.get(global.AUTH_NAME))

            // 创建默认home页面，复制时不创建
            if (!projectData.copyFrom) {
                await createDefaultPage(projectId)
            }

            res.data = projectId

            const permRes = await handlePerms(ctx, projectId, projectData)
            Object.assign(res, permRes)
            ctx.send(res)
        } catch (e) {
            ctx.throw(e)
        }
    },

    // 导入应用
    async importProject (ctx) {
        const { importProjectData, projectName, projectCode, projectDesc } = ctx.request.body
        // 校验projectCode和projectName
        const checkRes = await projectModel.validProject({ projectCode, projectName })
        if (checkRes.status > 0) {
            ctx.throw(checkRes.status, checkRes.errMsg, { code: checkRes.code })
        }
        const userInfo = ctx.session.userInfo

        const projectData = {
            projectName,
            projectCode,
            projectDesc,
            createUser: userInfo?.username,
            isEnableDataSource: importProjectData?.dataTable?.length > 0 ? 1 : 0
        }
        const userProjectRoleData = {
            userId: userInfo?.id,
            roleId: 1
        }
        try {
            const res = {
                code: 0,
                message: 'OK',
                data: null
            }
            // 执行导入逻辑
            const projectId = await importProject(projectData, userProjectRoleData, importProjectData, ctx.cookies.get(global.AUTH_NAME))
            const permRes = await handlePerms(ctx, projectId, projectData)
            Object.assign(res, permRes)
            ctx.send(res)
        } catch (e) {
            console.log('导入应用失败', e)
            ctx.throw('导入应用失败:' + (e.message || e))
        }
    },

    // 导出应用
    async exportProject (ctx) {
        const projectId = ctx.request.query?.projectId
        const versionId = null

        const pathName = `lesscode-project-${projectId}.json`
        const targetPath = path.join(STATIC_URL, pathName)
        
        const exportData = await getExportProjectData(projectId, versionId)
        const exportDataStr = JSON.stringify(exportData)

        await fse.ensureFile(targetPath).then(async () => {
            fse.writeFileSync(targetPath, exportDataStr, 'utf8')
            ctx.attachment(targetPath)
            await send(ctx, targetPath)
            fse.remove(targetPath)
        }).catch(err => {
            console.log('导出应用失败err', err)
            ctx.throw('导出应用失败')
        })
    },

    async queryProject (ctx) {
        const userInfo = ctx.session.userInfo
        const { filter = '', q, officialType } = ctx.request.query
        const query = {
            condition: [],
            params: {}
        }

        if (q) {
            query.condition.push('(project.projectName LIKE :q OR project.projectDesc LIKE :q)')
            query.params = { q: `%${q}%` }
        }

        let projectList = []
        switch (filter) {
            case 'my':
                query.condition.push('project.createUser = :user')
                query.params.user = userInfo.username
                query.condition = query.condition.join(' AND ')
                projectList = await projectModel.queryMyCreateProject(query)
                break
            case 'favorite':
                query.condition.push('favourite.userId = :userId')
                query.params.userId = userInfo.id
                query.condition = query.condition.join(' AND ')
                projectList = await projectModel.queryMyFavoriteProject(query)
                break
            case 'official':
                const params = { where: { isOffcial: 1 }, order: { id: 'DESC' } }
                if (officialType !== '') {
                    params.where.offcialType = officialType
                }
                projectList = await projectModel.findProjects(params)
                break
            default:
                query.condition.push('1 = 1')
                query.condition = query.condition.join(' AND ')
                if (global.IAM_ENABLE) {
                    projectList = await iamModel.queryAllProjectInPlatform(query)
                } else {
                    projectList = await projectModel.queryAllProject(query)
                }
                break
        }

        if (global.IAM_ENABLE) {
            if (filter !== 'official') {
                // 查询当前用户具有 应用相关操作权限的所有应用操作集合数据
                // 权限中心申请权限选择无限制时，返回结构如下
                // {"develop_app":true,"deploy_app":true,"manage_perms_in_app":true,"manage_app":true}
                const authedRet = await fetchActionsPerm(ctx)

                // 有 develop_app 或者 deploy_app 操作权限的项目
                const authedProjectList = []

                projectList.forEach(item => {
                    // 不需要判断 item.createUser === userInfo.username，权限控制全由权限中心来管理
                    item.canDevelop = (authedRet[IAM_ACTION.develop_app[0]] === true) || (authedRet[IAM_ACTION.develop_app[0]].indexOf(String(item.id)) > -1)
                    item.canDeploy = (authedRet[IAM_ACTION.deploy_app[0]] === true) || (authedRet[IAM_ACTION.deploy_app[0]].indexOf(String(item.id)) > -1)
                    item.canManagePerms = (authedRet[IAM_ACTION.manage_perms_in_app[0]] === true) || (authedRet[IAM_ACTION.manage_perms_in_app[0]].indexOf(String(item.id)) > -1)
                    item.canManage = (authedRet[IAM_ACTION.manage_app[0]] === true) || (authedRet[IAM_ACTION.manage_app[0]].indexOf(String(item.id)) > -1)

                    // 页面上，全部应用仅显示有权限的应用
                    if (item.canDevelop || item.canDeploy) {
                        authedProjectList.push(item)
                    }
                })

                projectList.splice(0, projectList.length, ...authedProjectList)
            }
        } else {
            projectList.forEach(item => {
                item.canDevelop = true
                item.canDeploy = true
                item.canManagePerms = true
                item.canManage = true
            })
        }

        // 获取项目下的页面
        let pageList = []
        if (projectList.length) {
            const projectIds = projectList.map(project => project.id)
            pageList = await projectModel.queryProjectPage({
                condition: 'project_page.projectId IN (:...projectIds)',
                params: { projectIds }
            })
        }

        // 获取已收藏的项目
        const favoritetList = await projectModel.queryMyFavoriteProject({
            condition: 'favourite.userId = :userId',
            params: { userId: userInfo.id },
            select: ['project.id']
        })

        // 按projectId分组，只取最新的一条
        const pageMap = {}
        pageList.forEach((page) => {
            if (!pageMap[page.projectId]) {
                pageMap[page.projectId] = [page]
            }
        })

        // 设置项目收藏状态
        projectList.forEach(project => {
            const projectId = project.id
            project['favorite'] = favoritetList.find(item => item.id === projectId) ? 1 : 0
        })

        ctx.send({
            code: 0,
            message: '',
            data: {
                projectList,
                pageMap
            }
        })
    },

    async updateProject (ctx) {
        try {
            const { id, fields } = ctx.request.body
            const { affected } = await projectModel.updateProject(id, fields)
            ctx.send({
                code: 0,
                message: 'OK',
                data: affected
            })
        } catch (e) {
            ctx.throw(e)
        }
    },

    async deleteProject (ctx) {
        try {
            const { id } = ctx.request.body

            const fields = { deleteFlag: 1 }
            const { affected } = await projectModel.updateProject(id, fields)
            ctx.send({
                code: 0,
                message: 'OK',
                data: affected
            })
        } catch (e) {
            ctx.throw(e)
        }
    },

    async favorite (ctx) {
        const { id, favorite } = ctx.request.body
        const userInfo = ctx.session.userInfo
        const data = {
            userId: userInfo.id,
            projectId: id
        }

        try {
            if (favorite) {
                await projectModel.addFavorite(data)
            } else {
                await projectModel.removeFavorite(data)
            }
            ctx.send({
                code: 0,
                message: 'OK',
                data: null
            })
        } catch (e) {
            ctx.throw(e)
        }
    },

    async checkname (ctx) {
        const { name } = ctx.request.body
        const res = {
            code: 0,
            message: 'OK',
            data: null
        }
        try {
            const foundNameProject = await projectModel.findProjectDetail({ projectName: name })
            if (foundNameProject && foundNameProject.id) {
                ctx.throw(200, '应用名称已经存在', { code: CODE.BIZ.PROJECT_NAME_EXISTED })
            }
            ctx.send(res)
        } catch (e) {
            ctx.throw(e)
        }
    },

    async projectDetail (ctx) {
        try {
            const { projectId } = ctx.request.query

            const detail = await projectModel.findProjectDetail({ id: projectId })
            const iamRes = await checkInServer(ctx, String(projectId))

            // 不需要判断 detail.createUser === userInfo.username，权限控制全由权限中心来管理
            detail.canDevelop = iamRes[IAM_ACTION.develop_app[0]]
            detail.canDeploy = iamRes[IAM_ACTION.deploy_app[0]]
            detail.canManagePerms = iamRes[IAM_ACTION.manage_perms_in_app[0]]
            detail.canManage = iamRes[IAM_ACTION.manage_app[0]]

            ctx.send({
                code: 0,
                message: 'OK',
                data: detail
            })
        } catch (err) {
            ctx.throwError({
                message: err.message
            })
        }
    },

    async getTemplateIds (ctx) {
        try {
            const params = { where: { isOffcial: 1 }, order: { id: 'DESC' } }
            const projectList = await projectModel.findProjects(params)
            const data = projectList.map(item => item.id)
            ctx.send({
                code: 0,
                message: 'OK',
                data
            })
        } catch (err) {
            ctx.throwError({
                message: err.message
            })
        }
    },

    /**
     * 本地开发使用这个接口
     * 用户所拥有的项目，包含通过添加成员共享的项目，用于项目下拉与列表选择
     */
    async my (ctx) {
        try {
            const userInfo = ctx.session.userInfo
            const query = {
                condition: [],
                params: {},
                select: ['project.id', 'project.projectCode', 'project.projectName', 'project.isEnableDataSource']
            }
            query.condition.push('user_project_role.userId = :userId')
            query.params.userId = userInfo.id
            query.condition = query.condition.join(' AND ')
            const projectList = await projectModel.queryAllProject(query)
            projectList.forEach(item => {
                item.canDevelop = true
                item.canDeploy = true
                item.canManagePerms = true
                item.canManage = true
            })

            ctx.send({
                code: 0,
                message: 'OK',
                data: projectList
            })
        } catch (err) {
            ctx.throwError({
                message: err.message
            })
        }
    },

    async createDemoProject (ctx, data) {
        const { userInfo, projectData, bkTicket } = data
        projectData.createUser = userInfo.username
        const userProjectRoleData = {
            userId: userInfo.id,
            roleId: 1
        }

        try {
            const layoutData = await LayoutModel.getDefaultList()
            const layoutList = layoutData.reduce((pre, cur) => {
                if (!cur.layoutType) {
                    cur.layoutType = cur.defaultCode?.startsWith('mobile') ? 'MOBILE' : 'PC'
                }
                pre.push({
                    layoutId: cur.id,
                    content: cur.defaultContent,
                    routePath: cur.defaultPath,
                    showName: cur.defaultName,
                    layoutCode: cur.defaultCode,
                    layoutType: cur.layoutType,
                    isDefault: cur.type === 'top-bottom'
                })
                return pre
            }, [])

            const { projectId } = await projectModel.createProject(projectData, userProjectRoleData, layoutList, bkTicket)
            Promise.all(pages.map(page => createDemoPage({
                projectId: projectId,
                pageData: page.pageConfig,
                pageContent: {
                    content: page.content,
                    previewImg: page.preview
                }
            })))

            if (global.IAM_ENABLE && ctx.session) {
                const batchAuthRes = await batchAuth(
                    ctx,
                    [
                        IAM_ACTION.develop_app[0], IAM_ACTION.deploy_app[0],
                        IAM_ACTION.manage_perms_in_app[0], IAM_ACTION.manage_app[0]
                    ],
                    [
                        {
                            system: IAM_APP_ID,
                            type: IAM_RESOURCE_TYPE_ID,
                            paths: [
                                [
                                    {
                                        type: IAM_RESOURCE_TYPE_ID,
                                        id: projectId,
                                        name: `${projectData.projectCode}_${projectId}`
                                    }
                                ]
                            ]
                        }
                    ]
                )

                if (!batchAuthRes.result) {
                    const msg = `demo 项目在权限中心授权失败: ${batchAuthRes.code}: ${batchAuthRes.message}`
                    logger.info(msg)
                }

                // TODO: 调用权限中心创建应用分级管理员失败，但 lesscode 中项目还是创建了
                const createRatingManagerRes = await createRatingManager(
                    ctx, projectId, projectData.projectCode, projectData.projectName
                )
                if (!createRatingManagerRes.result) {
                    const msg = `demo 项目在权限中心创建分级管理员失败: ${createRatingManagerRes.code}: ${createRatingManagerRes.message}`
                    logger.info(msg)
                }
            }
            return projectId
        } catch (e) {
            console.error(e)
        }
    },

    async getPreviewImg (ctx) {
        const { id } = ctx.request.query
        let { previewImg } = await projectModel.findProjectPreviewImg(id) || {}

        const dataUriPrefix = 'data:image/png;base64,'

        if (!previewImg || !previewImg.startsWith(dataUriPrefix)) {
            // 返回 1×1 px 透明png，用于在前台标记为空区别于加载失败
            previewImg = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
        }

        const imgBase64 = previewImg.replace(dataUriPrefix, '')
        const buf = Buffer.from(imgBase64, 'base64')
        ctx.type = 'image/png'
        ctx.body = buf
    }
}
