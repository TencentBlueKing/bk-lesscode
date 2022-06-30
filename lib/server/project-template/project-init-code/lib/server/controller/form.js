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
import {
    Controller,
    Ctx,
    Post,
    BodyParams,
    PathParams,
    QueryParams,
    OutputJson
} from '../decorator'
import dataService, { Between } from '../service/data-service'
import http from '../util/http/index'
import {
    METHODS_WITHOUT_DATA
} from '../../shared/constant'
import {
    parseConditions
} from '../service/form'
 
@Controller('/api/nocode')
export default class NoCodeController {
    @OutputJson()
    @Post('/proxy/itsm/*')
    async itsmProxyApi (
        @Ctx({ name: 'method' }) method,
        @Ctx({ name: 'captures' }) captures,
        @BodyParams() body,
        @QueryParams() query
    ) {
        const httpMethod = method.toLowerCase()
        const httpUrl = captures.join('/')
        const httpParams = [httpUrl]
        if (METHODS_WITHOUT_DATA.includes(httpMethod)) {
            httpParams.push({ params: query })
        } else {
            httpParams.push(body)
        }
        const { result, data, message } = await http[httpMethod](...httpParams)
        if (result) {
            return data
        } else {
            throw new global.BusinessError(message, -1)
        }
    }

    // 回写接口
    @OutputJson()
    @Post('/user/dataManage')
    async dataManage (
        @BodyParams() data
    ) {
        const {
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
                result = await dataService.update(tableName, editDatas)
                break
            case 'ADD':
                const newData = mapping.reduce((acc, cur) => {
                    acc[cur.key] = cur.value
                    return acc
                }, {})
                result = await dataService.add(tableName, newData)
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
    }
}
