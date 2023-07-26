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
    BodyParams
} from '../decorator'
import {
    prompt,
    isInWhiteList
} from '../service/common/ai'

@Controller('/api/ai')
export default class AiManageController {
    // 通过 openai 生产画布
    @OutputJson()
    @Post('/generate-page')
    async generatePageByAi (
        @SessionParams({ name: 'userInfo' }) userInfo,
        @CookieParams({ name: global.AUTH_NAME }) bkToken,
        @BodyParams({ name: 'content' }) content
    ) {
        const message = await prompt(
            bkToken,
            userInfo.username,
            [
                {
                    role: 'system',
                    content: '- You are a master AI JSON Generator. \n'
                    + '- You operate in "Strict" mode. Definition of "Strict" mode: \n'
                    + '  - Your responses always contain exactly one (1) JSON array and no other text. \n'
                    + '  - The JSON array _must_: \n'
                    + '    - be a complete & correct JSON string \n'
                    + '    - validate according to responseJsonSchema \n'
                    + '    - only include the properties mentioned in both the user input and the provided example. \n'
                    + '- Your mission is simple: generate valid JSON for an API. You will: \n'
                    + '  - Generate a JSON based on the provided example and user input, without adding any extra information. \n'
                    + '  - Transform messages with silent internal judgment. Please think quietly to avoid breaking parsers. \n'
                    + '  - Load strict valid JSON into one (1) JSON array with no other text. \n'
                },
                {
                    role: 'user',
                    content: '新增一个bk-table组件'
                },
                {
                    role: 'assistant',
                    content: `
                        [{
                            "type": "create",
                            "target": "",
                            "content": {
                                "type": "bk-table"
                            }
                        }]
                    `
                },
                // 样式
                {
                    role: 'user',
                    content: '修改table-9c893组件的样式display为block,color为红色'
                },
                {
                    role: 'assistant',
                    content: `
                        [{
                            "type": "edit",
                            "target": "table-9c893",
                            "content": {
                                "renderStyles": {
                                    "display": "block",
                                    "color": "red"
                                }
                            }
                        }]
                    `
                },
                // 属性
                {
                    role: 'user',
                    content: '修改button-9c893组件的 title 属性为 你好，AI'
                },
                {
                    role: 'assistant',
                    content: `
                        [{
                            "type": "edit",
                            "target": "button-9c893",
                            "content": {
                                "renderProps": {
                                    "title": {
                                        "format": "value",
                                        "code": "你好，AI",
                                        "renderValue": "你好，AI",
                                        "valueType": "string",
                                        "payload": {}
                                    }
                                }
                            }
                        }]
                    `
                },
                {
                    role: 'user',
                    content: '修改button-9c893组件的title属性为dd变量'
                },
                {
                    role: 'assistant',
                    content: `
                        [{
                            "type": "edit",
                            "target": "button-9c893",
                            "content": {
                                "renderProps": {
                                    "title": {
                                        "format": "variable",
                                        "code": "dd",
                                        "renderValue": "你好，AI",
                                        "valueType": "string",
                                        "payload": {}
                                    }
                                }
                            }
                        }]
                    `
                },
                // 事件
                {
                    role: 'user',
                    content: '设置table-9c893组件的select事件为alert函数'
                },
                {
                    role: 'assistant',
                    content: `
                        [{
                            "type": "edit",
                            "target": "table-9c893",
                            "content": {
                                "renderEvents": {
                                    "select": {
                                        "enable": true,
                                        "methodCode": "alert",
                                        "params": []
                                    }
                                }
                            }
                        }]
                    `
                },
                // 指令
                {
                    role: 'user',
                    content: '设置table-9c893组件的v-for指令为qq变量'
                },
                {
                    role: 'assistant',
                    content: `
                        [{
                            "type": "edit",
                            "target": "table-9c893",
                            "content": {
                                "renderDirectives": [
                                    {
                                        "type": "v-for",
                                        "prop": "",
                                        "format": "variable",
                                        "code": "qq",
                                        "renderValue": [
                                            "Jack",
                                            "Lucy",
                                            "Lily"
                                        ]
                                    }
                                ]
                            }
                        }]
                    `
                },
                {
                    role: 'user',
                    content: '设置table-9c893组件的v-for指令为page表'
                },
                {
                    role: 'assistant',
                    content: `
                        [{
                            "type": "edit",
                            "target": "table-9c893",
                            "content": {
                                "renderDirectives": [
                                    {
                                        "type": "v-for",
                                        "prop": "",
                                        "format": "dataSource",
                                        "code": "page",
                                        "renderValue": [],
                                        "dataSourceType": "preview"
                                    }
                                ]
                            }
                        }]
                    `
                },
                // 函数
                {
                    role: 'user',
                    content: '修改table-9c893组件的数据源为 alert 函数'
                },
                {
                    role: 'assistant',
                    content: `
                        [{
                            "type": "edit",
                            "target": "table-9c893",
                            "content": {
                                "renderProps": {
                                    "data": {
                                        "format": "value",
                                        "code": [
                                            1,
                                            23
                                        ],
                                        "valueType": "remote",
                                        "payload": {
                                            "methodCode": "alert",
                                            "params": []
                                        }
                                    }
                                }
                            }
                        }]
                    `
                },
                // 数据源
                {
                    role: 'user',
                    content: '修改table-9c893组件的数据源为page表'
                },
                {
                    role: 'assistant',
                    content: `
                        [{
                            "type": "edit",
                            "target": "table-9c893",
                            "content": {
                                "renderProps": {
                                    "data": {
                                        "format": "value",
                                        "code": [],
                                        "valueType": "table-data-source",
                                        "payload": {
                                            "sourceData": {
                                                "tableName": "page",
                                                "dataSourceType": "preview",
                                                "showOperationColumn": true
                                            }
                                        }
                                    }
                                }
                            }
                        }]
                    `
                },
                {
                    role: 'user',
                    content: '修改table-9c893组件关联page表'
                },
                {
                    role: 'assistant',
                    content: `
                        [{
                            "type": "edit",
                            "target": "table-9c893",
                            "content": {
                                "renderProps": {
                                    "data": {
                                        "format": "value",
                                        "code": [],
                                        "valueType": "table-data-source",
                                        "payload": {
                                            "sourceData": {
                                                "tableName": "page",
                                                "dataSourceType": "preview",
                                                "showOperationColumn": true
                                            }
                                        }
                                    }
                                }
                            }
                        }]
                    `
                },
                {
                    role: 'user',
                    content
                }
            ]
        )
        return JSON.parse(message?.output?.[0]?.output || '{}').choices?.[0]?.message?.content || ''
    }

    @OutputJson()
    @Get('/ai-available')
    async isInWhiteList (
        @SessionParams({ name: 'userInfo' }) userInfo
    ) {
        return isInWhiteList(userInfo.username)
    }
}
