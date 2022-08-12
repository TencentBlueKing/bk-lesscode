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
    Post,
    Ctx,
    PathParams,
    BodyParams,
    OutputJson
} from '../decorator'
import dataService from '../service/data-service'
import tokenConf from '../conf/token'
import {
    parseConditions,
    filterTableDataWithConditions,
    filterTableDataWithKeys
} from '../service/form'

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
    @OutputJson()
    @Post('/executeApi')
    async executeApi (
        @Ctx() ctx,
        @BodyParams() body
    ) {
        try {
            const { url, method: type, data: apiData } = body
            console.log('-----------> bodyData: ', body)
            const axiosParam = []
            axiosParam.push(url)
            const methodsWithData = ['post', 'put', 'patch']
            if (methodsWithData.includes(type)) {
                axiosParam.push(apiData)
            } else {
                const urlObj = new URL(url)
                const keys = Object.keys(apiData)
                keys.forEach((key) => {
                    urlObj.searchParams.delete(key)
                    urlObj.searchParams.append(key, apiData[key])
                })
                axiosParam[0] = urlObj.href
            }
            // 携带 cookie
            ctx.http.defaults.withCredentials = true
            if (ctx.cookies.request.headers.cookie) ctx.http.defaults.headers.Cookie = ctx.cookies.request.headers.cookie
            const options = {}
            const bkTicket = ctx.cookies.get(global.AUTH_NAME)
            const token = {
                ...tokenConf,
                [global.AUTH_NAME]: bkTicket
            }
            options.headers = {
                'X-BKAPI-AUTHORIZATION': JSON.stringify(token)
            }
            const timezoneOffset = ctx.request.headers['x-timezone-offset']
            if (timezoneOffset) {
                if (!options.headers) options.headers = {}
                options.headers['X-TIMEZONE-OFFSET'] = timezoneOffset
            }
            axiosParam.push(options)
            console.log('-------------->type: ', type)
            console.log('-------------->axiosParams', axiosParam)
            const re = await ctx.http[type](...axiosParam)
            console.log('-------------->response: ', re)
            return re.data
        } catch (error) {
            throw new global.BusinessError(error.message || error, -1, 500, error.stack)
        }
    }
}
