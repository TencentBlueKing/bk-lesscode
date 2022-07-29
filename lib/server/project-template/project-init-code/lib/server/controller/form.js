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
    All,
    Post,
    Get,
    BodyParams,
    QueryParams,
    PathParams,
    CookieParams,
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
import apiGateWayConfig from '../conf/apigw'
import { METHODS_WITHOUT_DATA } from '../../shared/constant'
 
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
    @All('/v2/itsm/*')
    async proxyItsm (
        @Ctx({ name: 'method' }) method,
        @Ctx({ name: 'captures' }) captures,
        @BodyParams() body,
        @QueryParams() query
    ) {
        const methodLowerCase = method.toLowerCase()
        const { data, result, message } = await execApiGateWay({
            apiName: 'bk-itsm',
            path: '/v2/itsm/' + captures.join('/'),
            method: methodLowerCase,
            authorization: token,
            stageName: apiGateWayConfig.stageName,
            data: METHODS_WITHOUT_DATA.includes(methodLowerCase) ? query : body
        })
        if (!result) {
            throw new global.BusinessError(message, -1)
        }
        return data
    }

    // 获取服务详情
    @OutputJson()
    @Get('/service/*')
    async service (
        @QueryParams() query,
        @Ctx({ name: 'captures' }) captures,
        @CookieParams({ name: global.AUTH_NAME }) bkToken
    ) {
        const { data, result, message } = await execApiGateWay({
            apiName: 'bk-itsm',
            path: '/service/' + captures.join('/'),
            method: 'GET',
            authorization: {
                ...token,
                [global.AUTH_NAME]: bkToken
            },
            stageName: apiGateWayConfig.stageName,
            data: query
        })
        if (!result) {
            throw new global.BusinessError(message, -1)
        }
        return data
    }

    // 获取节点列表
    @OutputJson()
    @Get('/state/')
    async state (
        @QueryParams() query,
        @CookieParams({ name: global.AUTH_NAME }) bkToken
    ) {
        const { data, result, message } = await execApiGateWay({
            apiName: 'bk-itsm',
            path: '/state',
            method: 'get',
            authorization: {
                ...token,
                [global.AUTH_NAME]: bkToken
            },
            stageName: apiGateWayConfig.stageName,
            data: query
        })
        if (!result) {
            throw new global.BusinessError(message, -1)
        }
        return data
    }

    // 带流程版本提单接口
    @OutputJson()
    @Post('/ticket/create_ticket_with_version/')
    async createTicketWithTicket (
        @BodyParams() body,
        @CookieParams({ name: global.AUTH_NAME }) bkToken
    ) {
        const { data, result, message } = await execApiGateWay({
            apiName: 'bk-itsm',
            path: '/ticket/create_ticket_with_version/',
            method: 'post',
            authorization: {
                ...token,
                [global.AUTH_NAME]: bkToken
            },
            stageName: apiGateWayConfig.stageName,
            data: body
        })
        if (!result) {
            throw new global.BusinessError(message, -1)
        }
        return data
    }
}
