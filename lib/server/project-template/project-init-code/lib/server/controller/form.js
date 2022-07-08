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
    OutputJson
} from '../decorator'
import {
    filterTableDataWithKeys,
    filterTableDataWithConditions
} from '../service/form'
import {
    execApiGateWay
} from '@bkui/apigateway-nodejs-sdk'
import token from '../conf/token'
 
@Controller('/api/nocode')
export default class NoCodeController {
    // 数据筛选接口
    @OutputJson()
    @Post('/filterTableData/keys/tableName/:tableName')
    filterTableDataWithKeys (
        @PathParams({ name: 'tableName', require: true }) tableName,
        @BodyParams({ name: 'page' }) page,
        @BodyParams({ name: 'pageSize' }) pageSize,
        @BodyParams({ name: 'query', default: {} }) query,
        @BodyParams({ name: 'fields' }) fields
    ) {
        return filterTableDataWithKeys(tableName, query, page, pageSize, fields)
    }

    // 表单数据源
    @OutputJson()
    @Post('/filterTableData/conditions/tableName/:tableName')
    filterTableDataWithConditions (
        @PathParams({ name: 'tableName', require: true }) tableName,
        @BodyParams({ name: 'conditions' }) conditions,
        @BodyParams({ name: 'field' }) field,
        @BodyParams({ name: 'group' }) group
    ) {
        return filterTableDataWithConditions(conditions, tableName, group, field)
    }

    // 代理执行 itsm apigateway 接口
    @OutputJson()
    @Post('/v2/itsm/*')
    proxyItsm (
        @Ctx({ name: 'method' }) method,
        @Ctx({ name: 'captures' }) captures,
        @BodyParams() body
    ) {
        return execApiGateWay({
            apiName: 'bk-itsm',
            path: captures.join('/'),
            method: method.toLowerCase(),
            authorization: token,
            data: body
        })
    }
}
