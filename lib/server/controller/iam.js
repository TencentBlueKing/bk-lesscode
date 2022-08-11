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

import { LCDataService, TABLE_FILE_NAME } from '../service/common/data-service'

import { logger } from '../logger'

module.exports = {
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
            if (method === 'fetch_instance_info') {
                // 获取资源实例详情
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
                if (needApprover) {
                    const list = res.list || []
                    list.forEach(item => {
                        item._bk_iam_approver_ = [item.createUser]
                    })
                }
                const results = []
                res.list.forEach(item => {
                    if (needApprover) {
                        item._bk_iam_approver_ = [item.createUser]
                    }
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
