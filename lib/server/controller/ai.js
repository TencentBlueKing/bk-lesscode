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
    QueryParams,
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
    LCDataService,
    TABLE_FILE_NAME
} from '../service/common/data-service.js'

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
        @SessionParams({ name: 'userInfo' }) userInfo,
        @QueryParams({ name: 'type' }) type
    ) {
        type = type || 'ai'
        return isInWhiteList(userInfo.username, type)
    }

    @OutputJson()
    @Get('/prompt')
    prompts (
        @QueryParams({ name: 'search' }) search
    ) {
        return LCDataService.get({
            tableFileName: TABLE_FILE_NAME.AI_PROMPT,
            query: {
                prompt: `%${search}%`
            }
        })
    }

    @OutputJson()
    @Get('/prompt/add')
    addPrompt (
        @QueryParams({ name: 'prompt', require: true }) prompt
    ) {
        return LCDataService.add(TABLE_FILE_NAME.AI_PROMPT, { prompt })
    }
}
