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
} from '../decorator';
import {
    prompt,
    isInWhiteList
} from '../service/common/ai';

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
                    content: '你是一个专业的助手，通过lesscode-dsl模板帮助用户生成json数据'
                },
                {
                    role: 'user',
                    content: `
                        请根据我提供的背景回答问题。回答要简单明了，只返回 json 数据。
                        lesscode-dsl:
                        {
                            type: 'create', // 表示用户的行为，值只能是 create,edit,delete,insert-before,insert-after 中的一种
                            target: '', // 组件id，用户没提到，就显示空字符串
                            content: {
                                type: "bk-input", // 表示组件类型
                                renderProps: {}, // 组件的属性
                                renderStyles: {}, // 组件的样式
                                renderDirectives: [], // 组件的指令
                                renderEvents: {} // 组件的事件
                            }
                        }
                        新增一个bk-table组件：
                        {
                            type: 'create',
                            target: '',
                            content: {
                                type: "bk-table"
                            }
                        }
                        修改button-9c893组件的 title 属性为 你好，AI：
                        {
                            type: 'edit',
                            target: 'button-9c893',
                            content: {
                                renderProps: {
                                    title: {
                                        "format": "value", // 类型
                                        "code": "你好，AI",
                                        "renderValue": "你好，AI",// 渲染的值
                                        "valueType": "string", // renderValue 的值类型
                                        "payload": {}
                                    }
                                },
                            }
                        }
                        修改button-9c893组件的title属性为dd变量：
                        {
                            type: 'edit',
                            target: 'button-9c893',
                            content: {
                                renderProps: {
                                    title: {
                                        "format": "variable", // 类型
                                        "code": "dd", // 变量code
                                        "renderValue": "你好，AI", // 渲染的值
                                        "valueType": "string", // 值类型
                                        "payload": {}
                                    }
                                },
                            }
                        }
                        修改table-9c893组件的数据源为 alert 函数：
                        {
                            type: 'edit',
                            target: 'table-9c893',
                            content: {
                                renderProps: {
                                    data: {
                                        "format": "value",
                                        "code": [
                                            1,
                                            23
                                        ],
                                        "valueType": "remote", // 值类型
                                        "payload": {
                                            "methodCode": "alert",
                                            "params": []
                                        }
                                    }
                                },
                            }
                        }
                        修改table-9c893组件的数据源为page表：
                        {
                            type: 'edit',
                            target: 'table-9c893',
                            content: {
                                renderProps: {
                                    data: {
                                        "format": "value",
                                        "code": [],
                                        "valueType": "table-data-source", // 值类型，表
                                        "payload": {
                                            "sourceData": {
                                                "tableName": "page", // 表名
                                                "dataSourceType": "preview",
                                                "showOperationColumn": true
                                            }
                                        }
                                    }
                                },
                            }
                        }
                        修改table-9c893组件的样式display为block：
                        {
                            type: 'edit',
                            target: 'table-9c893',
                            content: {
                                renderStyles: {
                                    display: 'block'
                                },
                            }
                        }
                        设置table-9c893组件的select事件为alert函数：
                        {
                            type: 'edit',
                            target: 'table-9c893',
                            content: {
                                "renderEvents": {
                                    "select": {
                                        "enable": true,
                                        "methodCode": "alert",
                                        "params": []
                                    }
                                }
                            }
                        }
                        设置table-9c893组件的v-for指令为qq变量：
                        {
                            type: 'edit',
                            target: 'table-9c893',
                            content: {
                                "renderDirectives": [
                                    {
                                        "type": "v-for",
                                        "prop": "",
                                        "format": "variable", // 变量
                                        "code": "qq",
                                        "renderValue": [
                                            "Jack",
                                            "Lucy",
                                            "Lily"
                                        ]
                                    }
                                ]
                            }
                        }
                        设置table-9c893组件的v-for指令为page表：
                        {
                            type: 'edit',
                            target: 'table-9c893',
                            content: {
                                "renderDirectives": [
                                    {
                                        "type": "v-for",
                                        "prop": "",
                                        "format": "dataSource", // 表
                                        "code": "page",
                                        "renderValue": [],
                                        "dataSourceType": "preview"
                                    }
                                ]
                            }
                        }
                    `
                },
                {
                    role: 'user',
                    content
                },
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
