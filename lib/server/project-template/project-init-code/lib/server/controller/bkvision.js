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
    Get,
    All,
    BodyParams,
    QueryParams,
    Ctx
} from '../decorator'
import { getAuthQuerySubfix, getAuthPostParams } from '../service/open-api'

@Controller('/api/bkvision')
export default class bkVisionController {
    @Get('/api/v1/(panel|meta)/*')
    async proxyApi (
        @Ctx() ctx,
        @Ctx({ name: 'captures' }) captures,
        @QueryParams() query
    ) {
        // 鉴权信息
        const authSubfix = getAuthQuerySubfix(ctx.cookies)
        let queryStr = ''
        for (const key in query) {
            queryStr += `${key}=${query[key]}&`
        }
        queryStr += authSubfix

        const url = process.env.BK_VISION_API_URL + '/api/v1/' + captures.join('/') + '?' + queryStr
        
        console.log(url, 'url', captures)

        const res = await ctx.http.get(url)
        ctx.body = res.data
    }

    @All('/api/v1/(variable|datasource)/*')
    async proxyPostApi (
        @Ctx() ctx,
        @Ctx({ name: 'captures' }) captures,
        @QueryParams() query,
        @BodyParams() body
    ) {
        // 鉴权信息
        const authParams = getAuthPostParams(ctx.cookies)

        // 需要处理替换body里面的env信息，使bkvision去找对应环境的数据
        if (body.queries && process.env.BKPAAS_ENVIRONMENT) {
            (body.queries || []).forEach(item => {
                item.env = process.env.BKPAAS_ENVIRONMENT
            })
        }

        const data = Object.assign({}, body, authParams)

        let queryStr = ''
        for (const key in query) {
            queryStr += `${key}=${query[key]}&`
        }
        const url = process.env.BK_VISION_API_URL + '/api/v1/' + captures.join('/') + '?' + queryStr
        
        console.log(url, 'url', data)

        const res = await ctx.http.post(url, data)
        ctx.body = res.data
    }
}
