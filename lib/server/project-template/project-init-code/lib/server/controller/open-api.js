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
    Post,
    Ctx,
    PathParams,
    BodyParams,
    OutputJson
} from '../decorator'
import dataService from '../service/data-service'
import {
    parseConditions,
    filterTableDataWithConditions,
    filterTableDataWithKeys
} from '../service/form'
import dataSourceController from './data-source'
import { METHODS_WITHOUT_DATA } from '../../shared/constant'

@Controller('/api/open-api')
export default class OpenApiController {
    // 回写接口
    @OutputJson()
    @Post('/dataManage')
    async dataManage (
        @BodyParams() data
    ) {
        console.log(data, '===================dataManage')
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
    }

    // 数据筛选接口
    @OutputJson()
    @Post('/filterTableData/keys/tableName/:tableName')
    async filterTableDataWithKeys (
        @PathParams({ name: 'tableName', require: true }) tableName,
        @BodyParams({ name: 'page' }) page,
        @BodyParams({ name: 'pageSize' }) pageSize,
        @BodyParams({ name: 'query', default: {} }) query,
        @BodyParams({ name: 'fields' }) fields
    ) {
        // 获取数据
        return filterTableDataWithKeys(tableName, query, page, pageSize, fields)
    }

    // 表单数据源
    @OutputJson()
    @Post('/filterTableData/conditions/tableName/:tableName')
    async filterTableDataWithConditions (
        @PathParams({ name: 'tableName', require: true }) tableName,
        @BodyParams({ name: 'conditions' }) conditions,
        @BodyParams({ name: 'field' }) field,
        @BodyParams({ name: 'group' }) group
    ) {
        // 获取数据
        return filterTableDataWithConditions(conditions, tableName, group, field)
    }

    // api节点在itsm回调
    @Post('/executeApi')
    async executeApi (
        @Ctx() ctx,
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
                ctx.session.userInfo = { username: creatorUsername }
                await dataSourceController.prototype[tableOperateHandler](ctx)
            } else {
                throw new global.BusinessError('api调用失败', -1, 500)
            }
        } catch (e) {
            throw new global.BusinessError('api调用失败', -1, 500)
        }
    }

    // 获取某张表下数据
    @OutputJson()
    @Get('/getTableData/tableName/:tableName')
    getTableData (
        @PathParams({ name: 'tableName', require: true }) tableFileName,
        @QueryParams() queryData
    ) {
        return dataService.getTableDatas(queryData, tableFileName, '')
    }
}
