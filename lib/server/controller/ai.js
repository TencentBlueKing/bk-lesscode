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
    Get,
    CookieParams,
    SessionParams,
    OutputJson,
    OutputStream,
    BodyParams,
    HeaderParams,
    AIAuthorization
} from '../decorator'
import {
    prompt,
    streamPrompt,
    code,
    isInWhiteList
} from '../service/common/ai'
import {
    layoutPrompt,
    eventPrompt
} from '../service/business/ai'
import {
    execApiGateWay
} from '@bkui/apigateway-nodejs-sdk'
import v3Conf from '../conf/v3'
import httpConf from '../conf/http'

const authorization = {
    bk_app_code: v3Conf.APP_ID,
    bk_app_secret: v3Conf.APP_SECRET
}

@Controller('/api/ai')
export default class AiManageController {
    @OutputStream()
    @AIAuthorization()
    @Post('/chat/stream')
    chatStream (
        @CookieParams({ name: global.AUTH_NAME }) bkToken,
        @BodyParams({ name: 'inputs' }) inputs,
        @BodyParams({ name: 'type' }) type
    ) {
        if (type === 'layout') {
            // 添加布局相关 prompt
            inputs.splice(1, 0, ...layoutPrompt())
        }
        return streamPrompt(
            bkToken,
            inputs
        )
    }

    @OutputJson(false)
    @AIAuthorization()
    @Post('/chat')
    chat (
        @CookieParams({ name: global.AUTH_NAME }) bkToken,
        @BodyParams({ name: 'inputs' }) inputs,
        @BodyParams({ name: 'type' }) type
    ) {
        if (type === 'event') {
            // 添加事件相关 prompt
            inputs.splice(1, 0, ...eventPrompt())
        }
        return prompt(
            bkToken,
            inputs
        )
    }

    @OutputJson(false)
    @AIAuthorization()
    @Post('/code')
    code (
        @CookieParams({ name: global.AUTH_NAME }) bkToken,
        @BodyParams({ name: 'prompt' }) prompt,
        @BodyParams({ name: 'promptSuffix' }) promptSuffix,
        @BodyParams({ name: 'lang' }) lang
    ) {
        return code(bkToken, prompt, promptSuffix, lang)
    }

    @OutputJson()
    @Get('/available')
    isInWhiteList (
        @SessionParams({ name: 'userInfo' }) userInfo
    ) {
        return isInWhiteList(userInfo.username)
    }

    @OutputJson()
    @Get('/prompts')
    async prompts (
        @CookieParams({ name: global.AUTH_NAME }) bkToken,
        @HeaderParams() header
    ) {
        const response = await execApiGateWay({
            authorization: {
                ...authorization,
                [global.AUTH_NAME]: bkToken
            },
            apiUrlTemp: httpConf.apiGateWayUrlTmpl,
            stageName: 'prod',
            apiName: 'bk-data',
            path: '/v3/aiops/llm/prompt/',
            method: 'get',
            data: header
        })
        if (!response?.result) {
            throw new global.BusinessError(response?.message, response?.code, 200, (new Error()).stack)
        }
        return response?.data
    }
}
