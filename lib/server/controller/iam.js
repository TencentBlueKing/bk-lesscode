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
import iamAppPermModelModel from '../model/iam-app-perm-model'
import projectModel from '../model/project'
import { IAM_HOST, IAM_APP_ID, IAM_APP_SECRET } from '../conf/iam'
import { IAM_ACTION, IAM_RESOURCE_TYPE_ID } from '../../shared/constant.js'
import { logger } from '../logger'
import { uuid } from '../util'

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

    async fetchIamAppPermModel (ctx) {
        const { projectId } = ctx.query
        try {
            const iamAppPermModelList = await iamAppPermModelModel.getIamAppPermModels(projectId) || []
            ctx.send({
                code: 0,
                message: 'OK',
                data: iamAppPermModelList
            })
        } catch (err) {
            ctx.throwError({
                message: err.message
            })
        }
    },

    async updateIamAppPermModel (ctx) {
        try {
            const { projectId, fields } = ctx.request.body
            const { affected } = await iamAppPermModelModel.update(projectId, fields)
            ctx.send({
                code: 0,
                message: 'OK',
                data: affected
            })
        } catch (e) {
            ctx.throw(e)
        }
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
                name: `${projectCode}[${uuid(6)}]分级管理员`,
                description: `lesscode 平台 ${projectName} 应用的分级管理员`,
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
     * 本地开发使用 project/my 接口
     */
    async myProject (ctx) {
        try {
            const userInfo = ctx.session.userInfo
            const query = {
                condition: [],
                params: {},
                select: [
                    'project.id', 'project.projectCode', 'project.projectName',
                    'project.isEnableDataSource', 'project.isRegistryInIam', 'project.createUser'
                ]
            }
            query.params.username = userInfo.username
            query.condition.push('1 = 1')
            query.condition = query.condition.join(' AND ')
            const projectList = await iamModel.queryAllProjectByCreator(query)

            const authedRet = await iamController.fetchActionsPerm(ctx)

            const developAppIdList = authedRet[IAM_ACTION.develop_app[0]] || []
            const deployAppIdList = authedRet[IAM_ACTION.deploy_app[0]] || []
            const managePermsInAppIdList = authedRet[IAM_ACTION.manage_perms_in_app[0]] || []
            const manageAppIdList = authedRet[IAM_ACTION.manage_app[0]] || []

            const authedIdList = developAppIdList.concat(deployAppIdList).concat(managePermsInAppIdList).concat(manageAppIdList)

            const where = { id: In(authedIdList) }
            const authedList = await projectModel.findProjects({ where })

            const myCreateAndAuthedAppList = projectList.concat(authedList || [])
            myCreateAndAuthedAppList.forEach(item => {
                // 不需要判断 item.createUser === userInfo.username，权限控制全由权限中心来管理
                item.canDevelop = authedRet['develop_app'].indexOf(String(item.id)) > -1
                item.canDeploy = authedRet['deploy_app'].indexOf(String(item.id)) > -1
                item.canManagePerms = authedRet['manage_perms_in_app'].indexOf(String(item.id)) > -1
                item.canManage = authedRet['manage_app'].indexOf(String(item.id)) > -1
            })

            const uniqueResult = _.orderBy(_.uniqBy(myCreateAndAuthedAppList, 'id'), 'id', 'desc')

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
                    ret[action] = (condition.op === 'any')
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
            ctx.send({ code: 0, message: 'OK', data: { allowed: true } })
            return
        }

        const { action = '', resourceId = '' } = ctx.request.body
        if (action === '' || action === null || action === undefined) {
            ctx.throw({
                message: '权限中心鉴权: 需要 action 参数'
            })
        }
        if (!IAM_ACTION[action]) {
            ctx.throw({
                message: '权限中心鉴权: action 参数错误，该操作不存在'
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
            data.pass = !!(res.data || {}).allowed

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
                    resourceTypeName: '应用',
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
            ctx.send({ code: 403, message: '没有权限，请去权限中心申请权限', data })
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
                    resourceTypeName: '应用',
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
     * 权限中心反向拉取接口
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
        console.log('ctx.request.body', body)
        console.log('pageData', pageData)
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
    }
}

module.exports = iamController
