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
import projectModel from '../model/project'
import { IAM_HOST, IAM_APP_ID, IAM_APP_SECRET } from '../conf/iam'
import { IAM_ACTION, IAM_RESOURCE_TYPE_ID } from '../utils/constant'
import { logger } from '../logger'

const iamController = {
    // 用户所拥有的项目，包含在权限中心申请 develop_app 操作权限的项目，用于项目下拉与列表选择
    async myProject (ctx) {
        try {
            const userInfo = ctx.session.userInfo
            const query = {
                condition: [],
                params: {},
                select: ['project.id', 'project.projectCode', 'project.projectName', 'project.isEnableDataSource']
            }
            query.params.username = userInfo.username
            query.condition.push('1 = 1')
            query.condition = query.condition.join(' AND ')
            const projectList = await iamModel.queryAllProjectByCreator(query)

            const authedAppRet = await iamController.fetchAllAppHasActionsPerm(ctx, [IAM_ACTION.develop_app[0]])
            const authedAppIdList = authedAppRet[IAM_ACTION.develop_app[0]] || []

            const where = { id: In(authedAppIdList) }
            const authedAppList = await projectModel.findProjects({ where })
            const uniqueResult = _.orderBy(_.uniqBy(projectList.concat(authedAppList || []), 'id'), 'id', 'desc')

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
     * 查询当前用户具有某个操作权限的所有应用列表
     *
     * @param {Object} ctx 请求上下文
     * @param {Array} actions 操作 id 集合
     */
    async fetchAllAppHasActionsPerm (ctx, actions = [
        IAM_ACTION.develop_app[0],
        IAM_ACTION.deploy_app[0],
        IAM_ACTION.manage_perms_in_app[0],
        IAM_ACTION.manage_app[0],
        IAM_ACTION.create_app[0]
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
            const data = res.data
            data.forEach(item => {
                ret[item.action.id] = item.condition.value || []
            })

            return ret
        } catch (e) {
            ctx.throw(e)
        }
    },

    /**
     * 生成无权限申请 URL
     */
    async createApplyUrl (ctx, actions = [], system = IAM_APP_ID) {
        try {
            const params = {
                system: IAM_APP_ID,
                actions
            }

            logger.info(`createApplyUrl params: ${JSON.stringify(params)}`)

            const res = await http.post(`${IAM_HOST}/api/v1/open/application/`, params, {
                headers: {
                    'X-Bkapi-Authorization': JSON.stringify({
                        bk_app_code: IAM_APP_ID,
                        bk_app_secret: IAM_APP_SECRET
                    })
                }
            })
            console.error('createApplyUrl res', res)
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
     * 权限中心鉴权
     */
    async check (ctx) {
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

            console.error('res', res)

            const data = {}
            data.pass = !!(res.data || {}).allowed
            data.applyUrl = await iamController.createApplyUrl(ctx, [
                {
                    id: action,
                    related_resource_types: relatedResourceTypes
                }
            ])

            const relatedResources = []
            if (params.resources.length) {
                const queryResult = await LCDataService.get({
                    tableFileName: TABLE_FILE_NAME.PROJECT,
                    query: { deleteFlag: 0, id: resourceId }
                })
                if (queryResult.list && queryResult.list[0]) {
                    relatedResources.push({
                        resourceTypeName: '应用',
                        resourceName: queryResult.list[0].projectName
                    })
                }
            }
            data.requiredPermissions = [
                {
                    actionName: IAM_ACTION[action][1],
                    relatedResources
                }
            ]
            ctx.send({ code: 0, message: '', data })
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

                console.error('resresresres', res)

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
                console.error('resultsresults', results)

                // if (needApprover) {
                //     const list = res.list || []
                //     list.forEach(item => {
                //         item._bk_iam_approver_ = [item.createUser]
                //     })
                // }
                // const results = []
                // res.list.forEach(item => {
                //     if (needApprover) {
                //         item._bk_iam_approver_ = [item.createUser]
                //     }
                //     results.push({ ...item })
                // })
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
