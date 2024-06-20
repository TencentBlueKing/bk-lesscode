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

import { pathToRegexp } from 'path-to-regexp'
import {
    Controller,
    OutputJson,
    All,
    Get,
    Post,
    Put,
    Delete,
    BodyParams,
    QueryParams,
    PathParams,
    HeaderParams,
    Ctx,
    CookieParams,
    ProjectAuthorization,
    ProjectResAuthorization
} from '../decorator'
import httpConf from '../conf/http'
import { LCDataService, TABLE_FILE_NAME, Between } from '../service/common/data-service'
import { createNocodeForm, updateNocodeForm } from '../service/business/nocode-form'
import { getFlowList, parseConditions } from '../service/business/no-code'
import { getPreviewDataService } from '../service/business/preview-db-service'
import dataSourceController from './data-source'
import { execApiGateWay } from '@bkui/apigateway-nodejs-sdk'
import v3Conf from '../conf/v3'
import { METHODS_WITHOUT_DATA } from '../../shared/api'
import { IAM_ACTION } from '../../shared/constant.js'

const authorization = {
    bk_app_code: v3Conf.APP_ID,
    bk_app_secret: v3Conf.APP_SECRET
}

@Controller('/api/nocode')
export default class NoCodeController {
    @OutputJson()
    @All('/(workflow|state|field|service|transition|role_type|ticket|v2/itsm|postman)/*')
    async proxyApi (
        @Ctx({ name: 'method' }) method,
        @Ctx({ name: 'captures' }) captures,
        @BodyParams() body,
        @QueryParams() query,
        @CookieParams({ name: global.AUTH_NAME }) bkToken
    ) {
        const methodLowerCase = method.toLowerCase()
        const { result, data, message } = await execApiGateWay({
            apiName: 'bk-itsm',
            path: '/' + captures.join('/'),
            method: methodLowerCase,
            authorization: {
                ...authorization,
                [global.AUTH_NAME]: bkToken
            },
            data: METHODS_WITHOUT_DATA.includes(methodLowerCase) ? query : body,
            apiUrlTemp: httpConf.apiGateWayUrlTmpl,
            stageName: httpConf.stageName
        })
        if (!result) {
            throw new global.BusinessError(message, -1)
        }
        return data
    }

    // 获取已有服务列表
    @OutputJson()
    @ProjectAuthorization({})
    @Get('/service')
    async getService (
        @HeaderParams({ name: 'x-project-id', require: true }) projectId,
        @QueryParams({ name: 'page' }) page,
        @QueryParams({ name: 'pageSize' }) pageSize,
        @QueryParams({ name: 'deleteFlag', default: 0 }) deleteFlag,
        @QueryParams({ name: 'flowName' }) flowName
    ) {
        const query = Object.assign({
            projectId,
            deleteFlag
        }, (flowName ? { flowName: `%${flowName}%` } : {}))
        const { list, count } = await getFlowList({ page, pageSize, query, projectId })
        return { list, count }
    }

    // 新建流程，在itsm是叫服务
    @OutputJson()
    @ProjectAuthorization({})
    @Post('/service')
    async createService (
        @HeaderParams({ name: 'x-project-id', require: true }) projectId,
        @BodyParams({ name: 'flowName' }) flowName,
        @BodyParams({ name: 'summary' }) summary,
        @BodyParams({ name: 'meta' }) meta,
        @CookieParams({ name: global.AUTH_NAME }) bkToken
    ) {
        // 调用 itsm 新增接口
        const { result, data, message } = await execApiGateWay({
            apiName: 'bk-itsm',
            path: '/service',
            method: 'post',
            authorization: {
                ...authorization,
                [global.AUTH_NAME]: bkToken
            },
            apiUrlTemp: httpConf.apiGateWayUrlTmpl,
            stageName: httpConf.stageName,
            data: {
                project_key: 'lesscode',
                name: flowName,
                desc: summary,
                workflow_meta: meta
            }
        })
        if (!result) {
            throw new global.BusinessError(message, -1)
        }
        // 获取新建流程的节点列表
        const { data: statesData } = await execApiGateWay({
            apiName: 'bk-itsm',
            path: '/state/',
            method: 'get',
            authorization: {
                ...authorization,
                [global.AUTH_NAME]: bkToken
            },
            apiUrlTemp: httpConf.apiGateWayUrlTmpl,
            stageName: httpConf.stageName,
            data: { workflow: data.workflow_id, page_size: 1000 }
        })
        const dataProcNode = statesData.items.find(item => item.type === 'WEBHOOK')
        // 把提单节点的id存到第一个数据处理节点，建立引用联系
        if (dataProcNode) {
            await execApiGateWay({
                apiName: 'bk-itsm',
                path: `/state/${dataProcNode.id}/update_attrs/`,
                method: 'post',
                authorization: {
                    ...authorization,
                    [global.AUTH_NAME]: bkToken
                },
                apiUrlTemp: httpConf.apiGateWayUrlTmpl,
                stageName: httpConf.stageName,
                data: {
                    attrs: [
                        {
                            key: 'extras',
                            value: {
                                ...dataProcNode.extras,
                                data_source_id: data.first_state_id
                            }
                        }
                    ]
                }
            })
        }
        // 存储 lesscode flow 表的数据
        const flowData = await LCDataService.add(
            TABLE_FILE_NAME.FLOW,
            {
                projectId,
                summary,
                flowName,
                itsmId: data.id
            }
        )
        return flowData
    }

    @OutputJson()
    @ProjectAuthorization({})
    @Put('/service')
    async editService (
        @Ctx() ctx,
        @CookieParams({ name: global.AUTH_NAME }) bkToken
    ) {
        const params = ctx.request.body || {}
        // 如果参数里含有itsmId， 并且含有flowName或summary， 调用 itsm 编辑接口
        if (params.itsmId && (params.flowName || params.summary)) {
            const { result, message } = await await execApiGateWay({
                apiName: 'bk-itsm',
                path: '/service',
                method: 'put',
                authorization: {
                    ...authorization,
                    [global.AUTH_NAME]: bkToken
                },
                apiUrlTemp: httpConf.apiGateWayUrlTmpl,
                stageName: httpConf.stageName,
                data: {
                    id: params.itsmId,
                    project_key: 'lesscode',
                    desc: params.summary,
                    name: params.flowName
                }
            })
            if (!result) {
                throw new global.BusinessError(message, -1)
            }
        }
        // 存储 lesscode flow 表的数据
        const flowData = await LCDataService.update(
            TABLE_FILE_NAME.FLOW,
            params
        )
        return flowData
    }

    // 部署服务
    @OutputJson()
    @ProjectAuthorization({})
    @Post('/serviceDeploy')
    async deployService (
        @BodyParams({ name: 'id' }) id
    ) {
        const { result, message, data } = await execApiGateWay({
            apiName: 'bk-itsm',
            apiUrlTemp: httpConf.apiGateWayUrlTmpl,
            path: `/service/${id}/deploy/`,
            method: 'post',
            authorization: {
                ...authorization

            },
            stageName: httpConf.stageName
        })
        if (!result) {
            throw new global.BusinessError(message, -1)
        }
        return data
    }

    // 编辑保存单个数据节点
    @OutputJson()
    @ProjectResAuthorization({ tableName: 'FLOW' })
    @Put('/serviceNode')
    async editServiceNode (
        @BodyParams({ name: 'id' }) id,
        @HeaderParams({ name: 'x-project-id', require: true }) projectId,
        @BodyParams({ name: 'versionId' }) versionId,
        @BodyParams({ name: 'pageId' }) pageId,
        @BodyParams({ name: 'nodeId' }) nodeId,
        @BodyParams({ name: 'formData' }) formData
    ) {
        const flowDetail = await LCDataService.findOne(TABLE_FILE_NAME.FLOW, { id })
        let formId = formData.id || ''
        // 如果不是直接复用表，则需要同步创建或更新db表结构
        if (formData.type !== 'USE_FORM') {
            if (formData.id) {
                await updateNocodeForm({
                    id: formData.id,
                    content: formData.content,
                    tableName: formData.code,
                    projectId: projectId
                })
            } else {
                const resData = await createNocodeForm({
                    content: formData.content,
                    tableName: formData.code,
                    formName: formData.formName,
                    projectId: projectId,
                    versionId: versionId
                })
                formId = resData.id
            }
        }
        // 更新flow表的formIds字段
        const curNodeFormMap = { [nodeId]: formId }
        const formIds = JSON.parse((flowDetail.formIds || '{}'))
        Object.assign(formIds, curNodeFormMap)

        const flowData = {
            id,
            pageId,
            formIds: JSON.stringify(formIds)
        }
        await LCDataService.update(TABLE_FILE_NAME.FLOW, flowData)
        return { formId }
    }

    // 删除服务
    @OutputJson()
    @ProjectResAuthorization({ tableName: 'FLOW' })
    @Delete('/service')
    deleteService (
        @QueryParams({ name: 'id' }) id
    ) {
        return LCDataService.softDelete(
            TABLE_FILE_NAME.FLOW,
            id
        )
    }

    // 获取服务详情
    @OutputJson()
    @ProjectResAuthorization({ tableName: 'FLOW' })
    @Get('/flow')
    async getServiceDetail (
        @QueryParams({ name: 'id' }) id
    ) {
        const flowDetail = await LCDataService.findOne(
            TABLE_FILE_NAME.FLOW,
            {
                id
            }
        )
        // 查询流程提单页code
        if (flowDetail.pageId) {
            const pageDetail = await LCDataService.findOne(
                TABLE_FILE_NAME.PAGE,
                {
                    id: flowDetail.pageId
                }
            )
            if (pageDetail) {
                flowDetail.pageCode = pageDetail.pageCode
            }
        }
        // 查询数据管理页id、code
        if (flowDetail.managePageIds) {
            const pageDetail = await LCDataService.findOne(
                TABLE_FILE_NAME.PAGE,
                {
                    id: flowDetail.managePageIds
                }
            )
            if (pageDetail) {
                flowDetail.managePageNames = pageDetail.pageName
                flowDetail.managePageCodes = pageDetail.pageCode
            }
        }
        return flowDetail
    }

    // 归档or恢复流程
    @OutputJson()
    @ProjectResAuthorization({ tableName: 'FLOW' })
    @Put('/archiveservice')
    async archiveService (
        @BodyParams({ name: 'id' }) flowId,
        @BodyParams({ name: 'deleteFlag' }) deleteFlag
    ) {
        // 归档流程，同时删除提单页和流程数据管理页， 恢复流程，同时恢复提单页和数据管理页
        const flowDetail = await LCDataService.findOne(
            TABLE_FILE_NAME.FLOW,
            { id: flowId }
        )
        if (!flowDetail.id) {
            throw new global.BusinessError(global.i18n.t('流程id不存在'), -1)
        }
        await LCDataService.update(TABLE_FILE_NAME.FLOW, {
            id: flowId, deleteFlag
        })
        if (flowDetail?.pageId) {
            const pageData = { id: flowDetail?.pageId, deleteFlag }
            await LCDataService.update(TABLE_FILE_NAME.PAGE, pageData)
        }
        if (flowDetail?.managePageIds) {
            const managePageData = { id: flowDetail?.managePageIds, deleteFlag }
            await LCDataService.update(TABLE_FILE_NAME.PAGE, managePageData)
        }
        return flowDetail
    }

    // 数据筛选接口
    @OutputJson()
    @ProjectAuthorization({})
    @Post('/filterTableData/keys/tableName/:tableName')
    async filterTableDataWithKeys (
        @HeaderParams({ name: 'x-project-id', require: true }) projectId,
        @PathParams({ name: 'tableName', require: true }) tableName,
        @BodyParams({ name: 'page' }) page,
        @BodyParams({ name: 'pageSize' }) pageSize,
        @BodyParams({ name: 'query', default: {} }) query,
        @BodyParams({ name: 'fields' }) fields
    ) {
        let dataService
        try {
            dataService = await getPreviewDataService(projectId)
            // 时间类型的转换为区间
            const { columns } = dataService.getTableMetadata(tableName)
            Object.keys(query).forEach((key) => {
                const column = columns.find(column => column.propertyName === key)
                const val = query[key]
                if (Array.isArray(val) && val.length === 2 && column?.type === 'datetime') {
                    query[key] = Between(val[0], val[1])
                }
            })
            const result = await dataService.get({
                tableFileName: tableName,
                page,
                pageSize,
                query
            })
            // 过滤
            if (fields && fields.length) {
                result.list = result.list.map((item) => {
                    return fields.reduce((acc, cur) => {
                        acc[cur] = item[cur]
                        return acc
                    }, {})
                })
            }
            return result
        } catch (error) {
            throw new global.BusinessError(error.message || error, -1, 500, error.stack)
        } finally {
            if (dataService) await dataService.close()
        }
    }

    // 表单数据源
    @OutputJson()
    @ProjectAuthorization({})
    @Post('/filterTableData/conditions/tableName/:tableName')
    async filterTableDataWithConditions (
        @HeaderParams({ name: 'x-project-id', require: true }) projectId,
        @PathParams({ name: 'tableName', require: true }) tableName,
        @BodyParams({ name: 'conditions' }) conditions,
        @BodyParams({ name: 'field' }) field,
        @BodyParams({ name: 'group' }) group
    ) {
        let dataService
        try {
            dataService = await getPreviewDataService(projectId)
            const query = parseConditions(conditions)
            let { list } = await dataService.get({
                tableFileName: tableName,
                query
            })
            // 聚合
            if (group) {
                const groupList = []
                list.forEach((item) => {
                    const index = groupList.findIndex((x) => (x[group] === item[group]))
                    if (index < 0) {
                        groupList.push(item)
                    }
                })
                list = groupList
            }
            return list.map((item) => ({
                id: item.id,
                [field]: item[field]
            }))
        } catch (error) {
            throw new global.BusinessError(error.message || error, -1, 500, error.stack)
        } finally {
            if (dataService) await dataService.close()
        }
    }

    // itsm 回写接口
    @OutputJson()
    @ProjectAuthorization({})
    @Post('/dataManage')
    async dataManage (
        @HeaderParams({ name: 'x-project-id', require: true }) projectId,
        @BodyParams() data
    ) {
        let dataService
        try {
            dataService = await getPreviewDataService(projectId)
            const {
                creator,
                action,
                conditions,
                mapping,
                tableName
            } = data
            let result
            const getDatasByConditions = async () => {
                const query = parseConditions(conditions)
                const result = await dataService.get({
                    tableFileName: tableName,
                    query
                })
                return result
            }
            switch (action) {
                case 'EDIT':
                    const editDatas = await getDatasByConditions()
                    editDatas.forEach((editData) => {
                        mapping.forEach((dataMap) => {
                            editData[dataMap.key] = dataMap.value
                        })
                    })
                    result = await dataService.update(tableName, {
                        ...editDatas,
                        updateUser: creator
                    })
                    break
                case 'ADD':
                    const newData = mapping.reduce((acc, cur) => {
                        acc[cur.key] = cur.value
                        return acc
                    }, {})
                    result = await dataService.add(tableName, {
                        ...newData,
                        createUser: creator,
                        updateUser: creator
                    })
                    break
                case 'DELETE':
                    const deleteDatas = await getDatasByConditions()
                    result = await dataService.bulkDelete(tableName, deleteDatas.map(data => data.id))
                    break
            }
            return result
        } catch (error) {
            throw new global.BusinessError(error.message || error, -1, 500, error.stack)
        } finally {
            if (dataService) await dataService.close()
        }
    }

    // api节点在itsm回调
    @ProjectAuthorization({})
    @Post('/executeApi')
    async executeApi (
        @Ctx() ctx,
        @HeaderParams({ name: 'x-project-id', require: true }) projectId,
        @BodyParams() body
    ) {
        try {
            const dataTableOperatePaths = ['/user/tableName/:tableName/detail', '/user/tableName/:tableName']
            const { url, method = 'get', data: apiData, creatorUsername = '' } = body
            const basePath = Reflect.getMetadata('basePath', dataSourceController)
            const controllerRoutes = Reflect.getMetadata('routes', dataSourceController.prototype)
            const dataTableOperateRoutes = controllerRoutes.filter(route => dataTableOperatePaths.includes(route.path))

            let tableNameParam, tableOperateHandler
            dataTableOperateRoutes.some(item => {
                const matchedPath = pathToRegexp(item.path).exec(url.replace(basePath, ''))
                if (matchedPath && matchedPath.length > 0 && item.method === method) {
                    tableNameParam = matchedPath[1]
                    tableOperateHandler = item.propertyKey
                    return true
                }
            })
            if (tableNameParam && tableOperateHandler) {
                ctx.params = { tableName: tableNameParam }
                if (METHODS_WITHOUT_DATA.includes(method)) {
                    ctx.request.query = apiData
                } else {
                    ctx.request.body = apiData
                }
                ctx.request.headers = { ...ctx.request.headers, 'x-project-id': projectId }
                ctx.session.userInfo = { username: creatorUsername }
                console.log('before')
                await dataSourceController.prototype[tableOperateHandler](ctx)
            } else {
                throw new global.BusinessError(global.i18n.t('api调用失败'), -1, 500)
            }
        } catch (error) {
            throw new global.BusinessError(error.message || error, -1, 500, error.stack)
        }
    }

    // 获取用户管理
    @OutputJson()
    @Get('/userManageUrl')
    getUserManageUrl () {
        return httpConf.userManageUrl
    }
}
