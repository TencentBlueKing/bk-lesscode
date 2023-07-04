/**
 * Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company. All rights reserved.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

export default {
    name: 'code-diff',
    type: 'bk-code-diff',
    displayName: '差异对比',
    icon: 'bk-drag-diff',
    group: '数据',
    order: 1,
    document: 'https://magicbox.bk.tencent.com/magicbox/3.0/code-diff',
    styles: [
        'position',
        'size',
        'margin',
        'pointer',
        'opacity'
    ],
    renderStyles: {
        display: 'block'
    },
    props: {
        oldContent: {
            type: 'string',
            val: 'auth.requestCurrentUser().then(user => {})'
        },
        newContent: {
            type: 'string',
            val: 'auth.requestCurrentUser().then(user => { return 223 })'
        },
        theme: {
            type: 'string',
            options: ['light', 'dark'],
            val: 'light',
            tips: '主题风格'
        },
        diffFormat: {
            type: 'string',
            options: ['line-by-line', 'side-by-side'],
            val: 'line-by-line',
            tips: '展示方式'
        },
        diffContext: {
            type: 'number',
            val: 5,
            tips: '差异间隔多少行不隐藏'
        },
        language: {
            type: 'string',
            options: ['javascript', 'python', 'java', 'c'],
            val: 'javascript'
        },
        hljs: {
            type: 'object',
            options: ['javascript', 'python', 'java', 'c'],
            val: 'javascript',
            tips: 'highlight 对象'
        }
    }
}
