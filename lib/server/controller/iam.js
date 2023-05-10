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

import { In } from 'typeorm'
import _ from 'lodash'

import { LCDataService, TABLE_FILE_NAME } from '../service/common/data-service'

import http from '../utils/http'
import iamModel from '../model/iam'
import iamAppPermModel from '../model/iam-app-perm'
import projectModel from '../model/project'
import pageModel from '../model/page'
import { IAM_HOST, IAM_APP_ID, IAM_APP_SECRET } from '../conf/iam'
import { IAM_ACTION, IAM_RESOURCE_TYPE_ID, IAM_APP_PERM_BUILDIN_ACTION } from '../../shared/constant.js'
import { logger } from '../logger'
import { uuid } from '../util'
import { sendReq } from './iam-migration-helper'

const iamController = {
    async officalProject (ctx) {
        try {
            const officalProjectList = await projectModel.findProjects({ where: { isOffcial: 1 } }) || []
            return officalProjectList
        } catch (err) {
            ctx.throwError({
                message: err.message
            })
        }
    },

    async fetchIamAppPerm (ctx) {
        const { projectId } = ctx.query
        try {
            const ret = await iamAppPermModel.getIamAppPerm(projectId) || {}
            ctx.send({
                code: 0,
                message: 'OK',
                data: ret
            })
        } catch (err) {
            ctx.throwError({
                message: err.message
            })
        }
    },

    async fetchIamAppPermAction (ctx) {
        const { projectId } = ctx.query
        try {
            const iamAppPermActionList = await iamAppPermModel.getIamAppPermActions(projectId) || []

            const len = iamAppPermActionList.length
            for (let i = 0; i < len; i++) {
                const item = iamAppPermActionList[i]
                const pageList = await pageModel.findPages({
                    select: ['id', 'pageName', 'pageCode'],
                    where: {
                        id: In(item.actionRelatedResourceId)
                    }
                })
                item.actionRelatedResourceList = pageList
            }

            ctx.send({
                code: 0,
                message: 'OK',
                data: iamAppPermActionList
            })
        } catch (err) {
            ctx.throwError({
                message: err.message
            })
        }
    },

    async updateIamAppPermAction (ctx) {
        try {
            const { actionId, fields } = ctx.request.body
            const { affected } = await iamAppPermModel.updateIamAppPermAction(actionId, fields)
            ctx.send({
                code: 0,
                message: 'OK',
                data: affected
            })
        } catch (e) {
            ctx.throw(e)
        }
    },

    async addIamAppPermAction (ctx) {
        try {
            // const newIamAppPermAction = await iamAppPermModel.addIamAppPermAction(ctx.request.body)
            const newIamAppPermAction = await LCDataService.add(
                TABLE_FILE_NAME.IAM_APP_PERM_ACTION,
                ctx.request.body
            )
            ctx.send({
                code: 0,
                message: 'OK',
                data: newIamAppPermAction
            })
        } catch (e) {
            ctx.throw(e)
        }
    },

    async deleteIamAppPermAction (ctx) {
        try {
            const ret = await LCDataService.delete(TABLE_FILE_NAME.IAM_APP_PERM_ACTION, ctx.query.actionId)
            ctx.send({
                code: 0,
                message: 'OK',
                data: ret
            })
        } catch (e) {
            ctx.throw(e)
        }
    },

    async checkIamAppPermActionId (ctx) {
        const { projectId, actionId } = ctx.request.body
        try {
            const iamAppPermActionList = await iamAppPermModel.getIamAppPermActions(projectId) || []
            const existAction = iamAppPermActionList.find(item => item.actionId === actionId)

            ctx.send({
                code: 0,
                message: 'OK',
                data: {
                    exist: !!existAction
                }
            })
        } catch (err) {
            ctx.throwError({
                message: err.message
            })
        }
    },

    async iamAppPermRegistry (ctx, iamAppPerm) {
        // system
        const systemRes = await sendReq(
            `${IAM_HOST}/api/v1/model/systems`,
            {
                id: iamAppPerm.systemId,
                name: iamAppPerm.systemName,
                name_en: iamAppPerm.systemNameEn,
                description: iamAppPerm.systemDesc,
                description_en: iamAppPerm.systemDescEn,
                clients: iamAppPerm.systemClients,
                provider_config: iamAppPerm.systemProviderConfig
            },
            'post',
            'AppPermSystem'
        )
        if (systemRes.code !== 0) {
            ctx.throw({
                message: global.i18n.t('注册系统失败：{{0}}: {{1}}', [systemRes.code, systemRes.message])
            })
        }

        // system manager
        logger.info(`Registry AppPermSystemManager: ${iamAppPerm.systemId}-${iamAppPerm.createUser}`)
        const systemManagerRes = await sendReq(
            `${IAM_HOST}/api/v1/model/systems/${iamAppPerm.systemId}/configs/system_managers`,
            [iamAppPerm.createUser],
            'post',
            'AppPermSystemManager'
        )
        if (systemManagerRes.code !== 0) {
            ctx.throw({
                message: global.i18n.t('设置系统管理员失败：{{0}}: {{1}}', [systemManagerRes.code, systemManagerRes.message])
            })
        }

        // resourceType
        const resourceTypeRes = await sendReq(
            `${IAM_HOST}/api/v1/model/systems/${iamAppPerm.systemId}/resource-types`,
            [
                {
                    id: iamAppPerm.resourceTypeId,
                    name: iamAppPerm.resourceTypeName,
                    name_en: iamAppPerm.resourceTypeNameEn,
                    description: iamAppPerm.resourceTypeDesc,
                    description_en: iamAppPerm.resourceTypeDescEn,
                    parents: [],
                    provider_config: iamAppPerm.resourceTypeProviderConfig
                }
            ],
            'post',
            'AppPermResourceType'
        )
        if (resourceTypeRes.code !== 0) {
            ctx.throw({
                message: global.i18n.t('注册资源类型失败：${resourceTypeRes.code}: ${resourceTypeRes.message}', resourceTypeRes.code, resourceTypeRes.message)
            })
        }

        // instanceSelection
        const instanceSelectionRes = await sendReq(
            `${IAM_HOST}/api/v1/model/systems/${iamAppPerm.systemId}/instance-selections`,
            [
                {
                    id: iamAppPerm.instanceSelectionId,
                    name: iamAppPerm.instanceSelectionName,
                    name_en: iamAppPerm.instanceSelectionNameEn,
                    resource_type_chain: iamAppPerm.instanceSelectionResourceTypeChain
                }
            ],
            'post',
            'AppPermInstanceSelection'
        )
        if (instanceSelectionRes.code !== 0) {
            ctx.throw({
                message: global.i18n.t('注册实例视图失败：{{0}}: {{1}}', [instanceSelectionRes.code, instanceSelectionRes.message])
            })
        }

        const resourceTypes = [
            {
                system_id: iamAppPerm.systemId,
                id: iamAppPerm.resourceTypeId,
                name_alias: iamAppPerm.resourceTypeName,
                name_alias_en: iamAppPerm.resourceTypeNameEn,
                related_instance_selections: [
                    {
                        system_id: iamAppPerm.systemId,
                        id: iamAppPerm.instanceSelectionId
                    }
                ]
            }
        ]

        const addActionIds = []
        const actionParams = []
        const iamAppPermActionList = await iamAppPermModel.getIamAppPermActions(iamAppPerm.projectId) || []
        iamAppPermActionList.forEach(action => {
            const obj = {
                id: action.actionId,
                name: action.actionName,
                name_en: action.actionNameEn,
                description: action.actionDesc,
                description_en: action.actionDescEn,
                type: action.actionType
            }
            if (action.actionId === IAM_APP_PERM_BUILDIN_ACTION) {
                if (action.actionRelatedResourceId.length) {
                    obj.related_resource_types = resourceTypes
                } else {
                    obj.related_resource_types = []
                }
            }
            actionParams.push(obj)
            addActionIds.push(action.id)
        })

        // action
        const actionRes = await sendReq(
            `${IAM_HOST}/api/v1/model/systems/${iamAppPerm.systemId}/actions`,
            actionParams,
            'post',
            'AppPermActionAdd'
        )
        if (actionRes.code !== 0) {
            ctx.throw({
                message: global.i18n.t('注册操作失败：{{0}}: {{1}}', [actionRes.code, actionRes.message])
            })
        }

        // 修改 iam_app_perm 表 deployed 字段
        await iamAppPermModel.updateIamAppPerm(iamAppPerm.projectId, {
            deployed: 1
        })

        for (let i = 0; i < addActionIds.length; i++) {
            // 修改 iam_app_perm_action 表 registeredStatus 字段
            await iamAppPermModel.updateIamAppPermAction(addActionIds[i], {
                registeredStatus: 1
            })
        }
    },

    async iamAppPermUpdate (ctx, iamAppPerm) {
        const resourceTypes = [
            {
                system_id: iamAppPerm.systemId,
                id: iamAppPerm.resourceTypeId,
                name_alias: iamAppPerm.resourceTypeName,
                name_alias_en: iamAppPerm.resourceTypeNameEn,
                related_instance_selections: [
                    {
                        system_id: iamAppPerm.systemId,
                        id: iamAppPerm.instanceSelectionId
                    }
                ]
            }
        ]

        const promises = []
        const iamAppPermActionList = await iamAppPermModel.getIamAppPermActions(iamAppPerm.projectId) || []

        const deleteActions = []
        const addActionParams = []

        // 需要修 iam_app_perm_action 表 registeredStatus 字段的 action id 集合
        const updateRegisteredStatusIds = []

        iamAppPermActionList.forEach(action => {
            const actionParams = {
                id: action.actionId,
                name: action.actionName,
                name_en: action.actionNameEn,
                description: action.actionDesc,
                description_en: action.actionDescEn,
                type: action.actionType
            }
            if (action.actionId === IAM_APP_PERM_BUILDIN_ACTION) {
                if (action.actionRelatedResourceId.length) {
                    actionParams.related_resource_types = resourceTypes
                } else {
                    actionParams.related_resource_types = []
                }
            }
            // add to iam
            if (action.registeredStatus === 0) {
                // 添加操作到权限中心时，需要修改 registeredStatus 为 1
                updateRegisteredStatusIds.push(action.id)
                addActionParams.push(actionParams)
            } else if (action.deleteFlag === 1) {
                // delete in iam
                deleteActions.push({
                    id: action.id,
                    actionId: action.actionId
                })
            } else {
                // update to iam

                // 修改的操作同步到权限中心时，需要修改 registeredStatus 为 1
                updateRegisteredStatusIds.push(action.id)
                promises.push(
                    sendReq(
                        `${IAM_HOST}/api/v1/model/systems/${iamAppPerm.systemId}/actions/${action.actionId}`,
                        actionParams,
                        'put',
                        'AppPermActionUpdate'
                    )
                )
            }
        })

        if (addActionParams.length) {
            promises.push(
                sendReq(
                    `${IAM_HOST}/api/v1/model/systems/${iamAppPerm.systemId}/actions`,
                    addActionParams,
                    'post',
                    'AppPermActionAdd'
                )
            )
        }

        if (deleteActions.length) {
            promises.push(
                sendReq(
                    `${IAM_HOST}/api/v1/model/systems/${iamAppPerm.systemId}/actions`,
                    deleteActions.map(item => {
                        return {
                            id: item.actionId
                        }
                    }),
                    'delete',
                    'AppPermActionDelete'
                )
            )
        }

        const resList = await Promise.all(promises)
        const failedList = []
        resList.forEach(item => {
            if (item.code !== 0) {
                failedList.push(item)
            }
        })

        if (failedList.length) {
            ctx.throw({
                message: global.i18n.t('修改操作失败：: {{n}}', { n: JSON.stringify(failedList) })
            })
        }

        for (let i = 0; i < updateRegisteredStatusIds.length; i++) {
            // 修改 iam_app_perm_action 表 registeredStatus 字段
            await iamAppPermModel.updateIamAppPermAction(updateRegisteredStatusIds[i], {
                registeredStatus: 1
            })
        }
    },

    async iamAppPermOperate (ctx, project) {
        const iamAppPerm = await iamAppPermModel.getIamAppPerm(project.id) || {}
        await iamController[String(iamAppPerm.deployed) === '0' ? 'iamAppPermRegistry' : 'iamAppPermUpdate'](
            ctx,
            iamAppPerm
        )
    },

    /**
     * 本地开发时，本功能去掉
     * 前端 /iam/auth-subject 接口调用
     *
     * 批量检索有权限的 subject 列表，https://bk.tencent.com/docs/document/6.0/160/14041
     * 本接口可能是不准的, 或者说不是绝对准确, 只能作为参考使用
     *
     * 如需更精确的数据时，需要使用如下接口
     * policy list 拉取系统下某个操作的策略列表 https://bk.tencent.com/docs/document/6.0/160/8454
     * 此接口一次只能查询一个操作，多个操作需要多次请求权限中心，而且返回数据结构较为复杂，需要解析表达式
     */
    async fetchAuthSubject (ctx) {
        const { actions } = ctx.request.body

        try {
            const params = []
            actions.forEach(item => {
                const obj = {
                    system: IAM_APP_ID,
                    subject_type: 'all',
                    action: {
                        id: item.actionId
                    },
                    resource: [],
                    limit: 1000
                }
                if (item.resourceId !== '' && item.resourceId !== null && item.resourceId !== undefined) {
                    obj.resource.push({
                        system: IAM_APP_ID,
                        type: IAM_RESOURCE_TYPE_ID,
                        id: String(item.resourceId),
                        attribute: {}
                    })
                }
                params.push(obj)
            })

            const res = await http.post(`${IAM_HOST}/api/v1/engine/batch-search`, params, {
                headers: {
                    'X-Bkapi-Authorization': JSON.stringify({
                        bk_app_code: IAM_APP_ID,
                        bk_app_secret: IAM_APP_SECRET
                    })
                }
            })

            // res.data.results 的 length 与参数 actions 的 length 一致，顺序也一致
            const ret = {}
            ;(res.data.results || []).forEach((item, index) => {
                const key = actions[index].actionId
                ret[key] = {
                    actionName: (IAM_ACTION[key] ? IAM_ACTION[key][1] : key),
                    actionDesc: (IAM_ACTION[key] ? IAM_ACTION[key][2] : key),
                    subject: item
                }
            })

            if (res.code !== 0) {
                ctx.throw({
                    message: `${res.code}: ${res.message}`
                })
            }

            ctx.send({ code: 0, message: 'OK', data: ret })
        } catch (e) {
            ctx.throw(e)
        }
    },

    /**
     * 主动授权
     */
    async batchAuth (ctx, actions, resources, username) {
        // const username = ctx.session.userInfo.username
        const uname = username || ctx.session.userInfo.username
        try {
            const params = {
                asynchronous: false,
                operate: 'grant',
                system: IAM_APP_ID,
                actions: actions.map(item => {
                    return { id: item }
                }),
                subject: {
                    type: 'user',
                    id: uname
                },
                resources: resources
            }

            const res = await http.post(`${IAM_HOST}/api/v1/open/authorization/batch_path/`, params, {
                headers: {
                    'X-Bkapi-Authorization': JSON.stringify({
                        bk_app_code: IAM_APP_ID,
                        bk_app_secret: IAM_APP_SECRET
                    })
                }
            })

            return res
        } catch (e) {
            ctx.throw(e)
        }
    },

    /**
     * 新建应用时在权限中心创建应用对应的分级管理员
     */
    async createRatingManager (ctx, projectId, projectCode, projectName) {
        const username = ctx.session.userInfo.username
        try {
            const params = {
                system: IAM_APP_ID,
                // 分级管理员名称, 权限中心里全局唯一
                name: global.i18n.t('{{0}}[{{1}}]分级管理员', [projectCode, uuid(6)]),
                description: global.i18n.t('LessCode 平台 {{n}} 应用的分级管理员', { n: projectName }),
                members: [username],
                authorization_scopes: [
                    {
                        system: IAM_APP_ID,
                        actions: [
                            { id: IAM_ACTION.develop_app[0] },
                            { id: IAM_ACTION.deploy_app[0] },
                            { id: IAM_ACTION.manage_perms_in_app[0] },
                            { id: IAM_ACTION.manage_app[0] }
                        ],
                        resources: [
                            {
                                system: IAM_APP_ID,
                                type: IAM_RESOURCE_TYPE_ID,
                                paths: [
                                    [
                                        {
                                            system: IAM_APP_ID,
                                            type: IAM_RESOURCE_TYPE_ID,
                                            id: projectId,
                                            name: `${projectCode}_${projectId}`
                                        }
                                    ]
                                ]
                            }
                        ]
                    }
                ],
                // 可授权范围为所有
                subject_scopes: [
                    {
                        type: '*',
                        id: '*'
                    }
                ]
            }

            const res = await http.post(`${IAM_HOST}/api/v1/open/management/grade_managers/`, params, {
                headers: {
                    'X-Bkapi-Authorization': JSON.stringify({
                        bk_app_code: IAM_APP_ID,
                        bk_app_secret: IAM_APP_SECRET
                    })
                }
            })

            // {"data":{"id":295},"result":true,"code":0,"message":"OK"}%
            // {"result":false,"code":1902403,"message":"No access: system[hiei-test] does not operate system[hiei-twwest]'s permission data (FORBIDDEN)","data":null}%
            return res
        } catch (e) {
            ctx.throw(e)
        }
    },

    /**
     * 用户所拥有的项目，包含在拥有 develop_app 操作权限的项目，用于项目下拉与列表选择
     * IAM_ENALBE 为 false 时使用 project/my 接口
     */
    async myProject (ctx) {
        try {
            const userInfo = ctx.session.userInfo
            const query = {
                condition: [],
                params: {},
                select: [
                    'project.id', 'project.projectCode', 'project.projectName',
                    'project.isEnableDataSource', 'project.createUser'
                ]
            }
            query.params.username = userInfo.username
            query.condition.push('1 = 1')
            query.condition = query.condition.join(' AND ')
            const projectList = await iamModel.queryAllProjectInPlatform(query)
            const projectIdList = projectList.map(item => item.id)

            // 权限中心申请权限选择无限制时，返回结构如下
            // {"develop_app":true,"deploy_app":true,"manage_perms_in_app":true,"manage_app":true}
            const authedRet = await iamController.fetchActionsPerm(ctx)

            const developAppIdList = (authedRet[IAM_ACTION.develop_app[0]] === true) ? projectIdList : (authedRet[IAM_ACTION.develop_app[0]] || [])
            const deployAppIdList = (authedRet[IAM_ACTION.deploy_app[0]] === true) ? projectIdList : (authedRet[IAM_ACTION.deploy_app[0]] || [])
            const managePermsInAppIdList = (authedRet[IAM_ACTION.manage_perms_in_app[0]] === true) ? projectIdList : (authedRet[IAM_ACTION.manage_perms_in_app[0]] || [])
            const manageAppIdList = (authedRet[IAM_ACTION.manage_app[0]] === true) ? projectIdList : (authedRet[IAM_ACTION.manage_app[0]] || [])

            const authedIdList = developAppIdList.concat(deployAppIdList).concat(managePermsInAppIdList).concat(manageAppIdList)

            const where = { id: In(_.uniq(authedIdList)) }
            const authedList = await projectModel.findProjects({ where })
            authedList.forEach(item => {
                // 不需要判断 item.createUser === userInfo.username，权限控制全由权限中心来管理
                item.canDevelop = (authedRet[IAM_ACTION.develop_app[0]] === true) || (authedRet[IAM_ACTION.develop_app[0]].indexOf(String(item.id)) > -1)
                item.canDeploy = (authedRet[IAM_ACTION.deploy_app[0]] === true) || (authedRet[IAM_ACTION.deploy_app[0]].indexOf(String(item.id)) > -1)
                item.canManagePerms = (authedRet[IAM_ACTION.manage_perms_in_app[0]] === true) || (authedRet[IAM_ACTION.manage_perms_in_app[0]].indexOf(String(item.id)) > -1)
                item.canManage = (authedRet[IAM_ACTION.manage_app[0]] === true) || (authedRet[IAM_ACTION.manage_app[0]].indexOf(String(item.id)) > -1)
            })

            const uniqueResult = _.orderBy(authedList, 'id', 'desc')

            // const myCreateAndAuthedAppList = projectList.concat(authedList || [])
            // myCreateAndAuthedAppList.forEach(item => {
            //     // 不需要判断 item.createUser === userInfo.username，权限控制全由权限中心来管理
            //     item.canDevelop = (authedRet[IAM_ACTION.develop_app[0]] === true) || (authedRet[IAM_ACTION.develop_app[0]].indexOf(String(item.id)) > -1)
            //     item.canDeploy = (authedRet[IAM_ACTION.deploy_app[0]] === true) || (authedRet[IAM_ACTION.deploy_app[0]].indexOf(String(item.id)) > -1)
            //     item.canManagePerms = (authedRet[IAM_ACTION.manage_perms_in_app[0]] === true) || (authedRet[IAM_ACTION.manage_perms_in_app[0]].indexOf(String(item.id)) > -1)
            //     item.canManage = (authedRet[IAM_ACTION.manage_app[0]] === true) || (authedRet[IAM_ACTION.manage_app[0]].indexOf(String(item.id)) > -1)
            // })

            // const uniqueResult = _.orderBy(_.uniqBy(myCreateAndAuthedAppList, 'id'), 'id', 'desc')

            ctx.send({
                code: 0,
                message: 'OK',
                data: uniqueResult
            })
        } catch (err) {
            ctx.throwError({
                message: err.message
            })
        }
    },

    /**
     * 拉取一批操作的权限策略
     *
     * @param {Object} ctx 请求上下文
     * @param {Array} actions 操作 id 集合
     */
    async fetchActionsPerm (ctx, actions = [
        IAM_ACTION.develop_app[0],
        IAM_ACTION.deploy_app[0],
        IAM_ACTION.manage_perms_in_app[0],
        IAM_ACTION.manage_app[0]
    ]) {
        const userInfo = ctx.session.userInfo
        try {
            const params = {
                system: IAM_APP_ID,
                subject: {
                    type: 'user',
                    id: userInfo.username
                },
                actions: actions.map(item => {
                    return { id: item }
                }),
                resources: []
            }
            const res = await http.post(`${IAM_HOST}/api/v1/policy/query_by_actions`, params, {
                headers: {
                    'X-Bkapi-Authorization': JSON.stringify({
                        bk_app_code: IAM_APP_ID,
                        bk_app_secret: IAM_APP_SECRET
                    })
                }
            })
            const ret = {}
            const hasRelatResourceActions = {
                [IAM_ACTION.develop_app[0]]: true,
                [IAM_ACTION.deploy_app[0]]: true,
                [IAM_ACTION.manage_perms_in_app[0]]: true,
                [IAM_ACTION.manage_app[0]]: true
            }

            const data = res.data
            data.forEach(item => {
                const condition = item.condition || {}
                const action = item.action.id
                const value = condition.value
                if (condition.op !== 'any') {
                    if (hasRelatResourceActions[action]) {
                        if (Array.isArray(value)) {
                            ret[action] = value || []
                        } else {
                            if (value === undefined || value === null || value === '') {
                                ret[action] = []
                            } else {
                                ret[action] = [value]
                            }
                        }
                    } else {
                        ret[action] = false
                    }
                } else {
                    ret[action] = true
                }
            })

            return ret
        } catch (e) {
            ctx.throw(e)
        }
    },

    /**
     * 生成无权限申请 URL
     */
    async createApplyUrl (ctx, actions = []) {
        try {
            const params = {
                system: IAM_APP_ID,
                actions
            }

            // logger.info(`createApplyUrl params: ${JSON.stringify(params)}`)

            const res = await http.post(`${IAM_HOST}/api/v1/open/application/`, params, {
                headers: {
                    'X-Bkapi-Authorization': JSON.stringify({
                        bk_app_code: IAM_APP_ID,
                        bk_app_secret: IAM_APP_SECRET
                    })
                }
            })

            if (!res.result) {
                ctx.throw({
                    message: `${res.code}: ${res.message}`
                })
            }

            const data = res.data || {}
            return data.url || ''
        } catch (e) {
            ctx.throw(e)
        }
    },

    /**
     * 权限中心鉴权，前端 /iam/check-no-resources 接口调用
     * 无资源依赖的操作权限不用弹框引导申请权限，由平台管理员在用户组主动添加人员名单或用户自己去权限中心自定义申请
     */
    async checkNoResources (ctx) {
        if (!global.IAM_ENABLE) {
            ctx.send({
                code: 0,
                message: '',
                data: {
                    [IAM_ACTION.manage_platform[0]]: true,
                    [IAM_ACTION.manage_function[0]]: true,
                    [IAM_ACTION.manage_template[0]]: true,
                    [IAM_ACTION.view_operation_data[0]]: true,
                    [IAM_ACTION.create_app[0]]: true,
                    [IAM_ACTION.create_app_with_template[0]]: true,
                    [IAM_ACTION.preview_app_template[0]]: true,
                    [IAM_ACTION.download_app_template_source[0]]: true,
                    [IAM_ACTION.create_page_with_template[0]]: true,
                    [IAM_ACTION.preview_page_template[0]]: true,
                    [IAM_ACTION.download_page_template_source[0]]: true
                }
            })
            return
        }

        try {
            // 权限中心申请权限选择无限制时，返回结构如下
            // {"develop_app":true,"deploy_app":true,"manage_perms_in_app":true,"manage_app":true}
            const authedRet = await iamController.fetchActionsPerm(ctx, [
                IAM_ACTION.manage_platform[0],
                IAM_ACTION.manage_function[0],
                IAM_ACTION.manage_template[0],
                IAM_ACTION.view_operation_data[0],
                IAM_ACTION.create_app[0],
                IAM_ACTION.create_app_with_template[0],
                IAM_ACTION.preview_app_template[0],
                IAM_ACTION.download_app_template_source[0],
                IAM_ACTION.create_page_with_template[0],
                IAM_ACTION.preview_page_template[0],
                IAM_ACTION.download_page_template_source[0]
            ])

            ctx.send({ code: 0, message: '', data: authedRet })
        } catch (e) {
            ctx.throw(e)
        }
    },

    /**
     * 权限中心鉴权，前端 /iam/check 接口调用
     */
    async check (ctx) {
        if (!global.IAM_ENABLE) {
            ctx.send({ code: 0, message: 'OK', data: { allowed: true, pass: true } })
            return
        }

        const { action = '', resourceId = '' } = ctx.request.body
        if (action === '' || action === null || action === undefined) {
            ctx.throw({
                message: global.i18n.t('权限中心鉴权: 需要 action 参数')
            })
        }
        if (!IAM_ACTION[action]) {
            ctx.throw({
                message: global.i18n.t('权限中心鉴权: action 参数错误，该操作不存在')
            })
        }
        const userInfo = ctx.session.userInfo
        try {
            const params = {
                system: IAM_APP_ID,
                subject: {
                    type: 'user',
                    id: userInfo.username
                },
                action: {
                    id: action
                },
                resources: []
            }

            // 后面生成无权限申请 URL 要用到
            const relatedResourceTypes = []

            if (resourceId !== '' && resourceId !== null && resourceId !== undefined) {
                params.resources.push({
                    system: IAM_APP_ID,
                    type: IAM_RESOURCE_TYPE_ID,
                    id: String(resourceId)
                })

                relatedResourceTypes.push({
                    system: IAM_APP_ID,
                    type: IAM_RESOURCE_TYPE_ID,
                    instances: [
                        [{ type: IAM_RESOURCE_TYPE_ID, id: String(resourceId) }]
                    ]
                })
            }

            const res = await http.post(`${IAM_HOST}/api/v1/policy/auth`, params, {
                headers: {
                    'X-Bkapi-Authorization': JSON.stringify({
                        bk_app_code: IAM_APP_ID,
                        bk_app_secret: IAM_APP_SECRET
                    })
                }
            })

            if (res.code !== 0) {
                ctx.throw({
                    message: `${res.code}: ${res.message}`
                })
            }

            const data = {}
            data.pass = !!((res.data || {}).allowed)

            if (data.pass) {
                ctx.send({ code: 0, message: '', data })
                return
            }

            const relatedResources = []
            const queryResult = await LCDataService.get({
                tableFileName: TABLE_FILE_NAME.PROJECT,
                query: { deleteFlag: 0, id: resourceId }
            })

            if (queryResult.list && queryResult.list[0]) {
                // if (queryResult.list[0].createUser === userInfo.username) {
                //     ctx.send({ code: 0, message: '', data: { pass: true } })
                //     return
                // }

                relatedResources.push({
                    resourceTypeName: global.i18n.t('应用'),
                    resourceName: queryResult.list[0].projectName
                })
            }

            data.applyUrl = await iamController.createApplyUrl(ctx, [
                {
                    id: action,
                    related_resource_types: relatedResourceTypes
                }
            ])

            data.requiredPermissions = [
                {
                    actionName: IAM_ACTION[action][1],
                    relatedResources
                }
            ]
            ctx.send({ code: 403, message: global.i18n.t('没有权限，请去权限中心申请权限'), data })
        } catch (e) {
            ctx.throw(e)
        }
    },

    /**
     * 权限中心鉴权，server 里调用，仅用于有资源依赖的操作
     */
    async checkInServer (ctx, resourceId, actions = [
        IAM_ACTION.develop_app[0],
        IAM_ACTION.deploy_app[0],
        IAM_ACTION.manage_perms_in_app[0],
        IAM_ACTION.manage_app[0]
    ]) {
        if (!global.IAM_ENABLE) {
            return {
                [IAM_ACTION.develop_app[0]]: true,
                [IAM_ACTION.deploy_app[0]]: true,
                [IAM_ACTION.manage_perms_in_app[0]]: true,
                [IAM_ACTION.manage_app[0]]: true
            }
        }

        try {
            const userInfo = ctx.session.userInfo
            const params = {
                system: IAM_APP_ID,
                subject: {
                    type: 'user',
                    id: userInfo.username
                },
                actions: actions.map(item => {
                    return { id: item }
                }),
                resources: [{
                    system: IAM_APP_ID,
                    type: IAM_RESOURCE_TYPE_ID,
                    id: String(resourceId)
                }]
            }

            // 后面生成无权限申请 URL 要用到
            const relatedResourceTypes = []

            relatedResourceTypes.push({
                system: IAM_APP_ID,
                type: IAM_RESOURCE_TYPE_ID,
                instances: [
                    [{ type: IAM_RESOURCE_TYPE_ID, id: String(resourceId) }]
                ]
            })

            const res = await http.post(`${IAM_HOST}/api/v1/policy/auth_by_actions`, params, {
                headers: {
                    'X-Bkapi-Authorization': JSON.stringify({
                        bk_app_code: IAM_APP_ID,
                        bk_app_secret: IAM_APP_SECRET
                    })
                }
            })
            // 正常情况返回如下
            // {
            //     code: 0,
            //     message: 'ok',
            //     data: {
            //       deploy_app: true,
            //       develop_app: false,
            //       manage_app: false,
            //       manage_perms_in_app: false
            //     }
            // }

            if (res.code !== 0) {
                ctx.throw({
                    message: `${res.code}: ${res.message}`
                })
            }

            const data = res.data || {}
            const notPassedActions = actions.filter(item => !data[item]) || []

            // 所有操作都有权限
            if (notPassedActions.length === 0) {
                return res.data || {}
            }

            data.applyUrl = await iamController.createApplyUrl(ctx, notPassedActions.map(action => {
                return {
                    id: action,
                    related_resource_types: relatedResourceTypes
                }
            }))

            const relatedResources = []
            const queryResult = await LCDataService.get({
                tableFileName: TABLE_FILE_NAME.PROJECT,
                query: { deleteFlag: 0, id: resourceId }
            })
            if (queryResult.list && queryResult.list[0]) {
                // if (queryResult.list[0].createUser === userInfo.username) {
                //     const ret = {}
                //     actions.forEach(act => {
                //         ret[act] = true
                //     })
                //     return ret
                // }

                relatedResources.push({
                    resourceTypeName: global.i18n.t('应用'),
                    resourceName: queryResult.list[0].projectName
                })
            }
            data.requiredPermissions = notPassedActions.map(action => {
                return {
                    actionName: IAM_ACTION[action][1],
                    relatedResources
                }
            })

            return data
        } catch (e) {
            ctx.throw(e)
        }
    },

    /**
     * 权限中心反向拉取接口 for lesscode
     */
    async fetchResource (ctx) {
        // {
        //     type: 'app',
        //     method: 'list_instance',
        //     filter: {},
        //     page: { page_size: 100, page: 1, limit: 100, offset: 0 }
        //     page: { page_size: 100, page: 2, limit: 100, offset: 100 }
        // }

        // 搜索
        // {
        //     type: 'app',
        //     method: 'search_instance',
        //     filter: { keyword: '27' },
        //     page: { page_size: 100, page: 1, limit: 100, offset: 0 }
        // }

        // 申请权限提交
        // 审批流程里有实例审批人审批时 attrs 里就包含 _bk_iam_approver_
        // {
        //     type: 'app',
        //     method: 'fetch_instance_info',
        //     filter: { ids: [ '193', '154' ], attrs: [ '_bk_iam_approver_' ] }
        // }
        const body = ctx.request.body || {}
        const pageData = body.page || { page_size: 100, page: 1, limit: 100, offset: 0 }
        logger.info(`body: ${JSON.stringify(body)}`)
        try {
            let res = {}
            const method = body.method
            // 获取资源实例详情
            if (method === 'fetch_instance_info') {
                const filter = body.filter || {}
                const ids = filter.ids || []
                const attrs = filter.attrs || []

                const needApprover = attrs.indexOf('_bk_iam_approver_') > -1

                const query = { deleteFlag: 0, id: [] }
                ids.forEach(id => {
                    query.id.push(id)
                })
                res = await LCDataService.get({
                    tableFileName: TABLE_FILE_NAME.PROJECT,
                    page: pageData.page,
                    pageSize: pageData.page_size,
                    query
                })

                const results = []
                const list = res.list || []
                list.forEach(item => {
                    if (needApprover) {
                        item._bk_iam_approver_ = [item.createUser]
                    }
                    // list_instance 与 search_instance 会返回 display_name 属性供权限中心使用，这里也需要加上
                    item.display_name = `${item.projectCode}_${item.id}`
                    results.push({ ...item })
                })

                ctx.send({ code: 0, message: '', data: results })
            } else {
                // 拉取列表
                if (method === 'list_instance') {
                    res = await LCDataService.get({
                        tableFileName: TABLE_FILE_NAME.PROJECT,
                        page: pageData.page,
                        pageSize: pageData.page_size,
                        query: { deleteFlag: 0 }
                    })
                } else if (method === 'search_instance') {
                    // 列表搜索
                    const filter = body.filter || {}
                    const query = filter.keyword || ''
                    res = await LCDataService.get({
                        tableFileName: TABLE_FILE_NAME.PROJECT,
                        page: pageData.page,
                        pageSize: pageData.page_size,
                        query: [{ deleteFlag: 0, projectCode: `%${query}%` }, { deleteFlag: 0, id: `%${query}%` }]
                    })
                }
                logger.info(`res.list.length: ${res.list.length}--res.count: ${res.count}`)
                const results = []
                res.list.forEach(item => {
                    results.push({
                        id: item.id,
                        display_name: `${item.projectCode}_${item.id}`
                    })
                })
                ctx.send({ code: 0, message: '', data: { count: res.count, results } })
            }
        } catch (e) {
            ctx.throw(e)
        }
    },

    /**
     * 权限中心反向拉取接口 for in lesscode app
     */
    async fetchResourceAppPerm (ctx) {
        // {
        //     type: 'app',
        //     method: 'list_instance',
        //     filter: {},
        //     page: { page_size: 100, page: 1, limit: 100, offset: 0 }
        //     page: { page_size: 100, page: 2, limit: 100, offset: 100 }
        // }

        // 搜索
        // {
        //     type: 'app',
        //     method: 'search_instance',
        //     filter: { keyword: '27' },
        //     page: { page_size: 100, page: 1, limit: 100, offset: 0 }
        // }

        // 申请权限提交
        // 审批流程里有实例审批人审批时 attrs 里就包含 _bk_iam_approver_
        // {
        //     type: 'app',
        //     method: 'fetch_instance_info',
        //     filter: { ids: [ '193', '154' ], attrs: [ '_bk_iam_approver_' ] }
        // }
        const { projectId } = ctx.request.query
        if (projectId === '' || projectId === undefined || projectId === null) {
            ctx.throw(global.i18n.t('权限中心回调错误: projectId 不存在'))
        }

        const body = ctx.request.body || {}
        logger.info(`body: ${JSON.stringify(body)}`)
        try {
            let res = {}
            const method = body.method
            console.error(method)
            // 获取资源实例详情
            if (method === 'fetch_instance_info') {
                const filter = body.filter || {}
                const ids = (filter.ids || []).map(item => String(item))
                const attrs = filter.attrs || []

                const needApprover = attrs.indexOf('_bk_iam_approver_') > -1

                const allPageList = await pageModel.getProjectPages(projectId)
                const pageList = allPageList.filter(item => ids.indexOf(String(item.id) > -1)) || []
                const iamAppPermActions = await iamAppPermModel.getIamAppPermActions(projectId) || []
                // 每个项目只有一个内置操作
                const buildinAction = iamAppPermActions.find(
                    item => item.actionId === IAM_APP_PERM_BUILDIN_ACTION
                ) || {}
                const validPageList = pageList.filter(
                    item => buildinAction.actionRelatedResourceId.indexOf(item.id) > -1
                )

                const results = []

                validPageList.forEach(item => {
                    if (needApprover) {
                        item._bk_iam_approver_ = [item.createUser]
                    }
                    // list_instance 与 search_instance 会返回 display_name 属性供权限中心使用，这里也需要加上
                    item.display_name = `${item.pageCode}_${item.id}`
                    results.push({ ...item })
                })

                ctx.send({ code: 0, message: '', data: results })
            } else {
                // 拉取列表
                if (method === 'list_instance') {
                    const pageList = await pageModel.getProjectPages(projectId)
                    const iamAppPermActions = await iamAppPermModel.getIamAppPermActions(projectId) || []
                    // 每个项目只有一个内置操作
                    const buildinAction = iamAppPermActions.find(
                        item => item.actionId === IAM_APP_PERM_BUILDIN_ACTION
                    ) || {}
                    const validPageList = pageList.filter(
                        item => buildinAction.actionRelatedResourceId.indexOf(item.id) > -1
                    )

                    res = {
                        count: validPageList.length,
                        list: validPageList
                    }
                } else if (method === 'search_instance') {
                    // 列表搜索
                    const pageList = await pageModel.getProjectPages(projectId)
                    const iamAppPermActions = await iamAppPermModel.getIamAppPermActions(projectId) || []
                    // 每个项目只有一个内置操作
                    const buildinAction = iamAppPermActions.find(
                        item => item.actionId === IAM_APP_PERM_BUILDIN_ACTION
                    ) || {}
                    const validPageList = pageList.filter(
                        item => buildinAction.actionRelatedResourceId.indexOf(item.id) > -1
                    )

                    const filter = body.filter || {}
                    const query = filter.keyword || ''

                    const ret = validPageList.filter(
                        item => item.pageCode.indexOf(query) > -1 || String(item.id).indexOf(query) > -1
                    )

                    res = {
                        count: ret.length,
                        list: ret
                    }
                }
                logger.info(`res.list.length: ${res.list.length}--res.count: ${res.count}`)
                const results = []
                res.list.forEach(item => {
                    results.push({
                        id: item.id,
                        display_name: `${item.pageCode}_${item.id}`
                    })
                })
                ctx.send({ code: 0, message: '', data: { count: res.count, results } })
            }
        } catch (e) {
            ctx.throw(e)
        }
    }
}

module.exports = iamController
