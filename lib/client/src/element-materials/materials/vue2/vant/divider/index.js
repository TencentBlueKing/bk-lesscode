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
    name: 'van-divider',
    type: 'van-divider',
    // bk-drag-custom-comp-default
    icon: 'bk-drag-divider',
    displayName: '分割线',
    group: '数据',
    styles: ['padding', 'margin'],
    renderStyles: {
    },
    groups: [
        { label: '布局', value: 'layout' },
        { label: '样式', value: 'style' },
        { label: '分割线文本', value: 'text' }
    ],
    props: {
        'content-position': {
            type: 'string',
            val: 'center',
            options: ['left', 'right', 'center'],
            displayName: '内容位置',
            tips: '内容位置',
            belongGroup: 'layout'
        },
        'dashed': {
            type: 'boolean',
            val: false,
            displayName: '是否使用虚线',
            tips: '是否使用虚线',
            belongGroup: 'style'
        },
        'hairline': {
            type: 'boolean',
            val: false,
            displayName: '是否使用0.5px线',
            tips: '是否使用 0.5px 线',
            belongGroup: 'style'
        }
    },
    slots: {
        default: {
            name: ['html'],
            type: ['text'],
            displayName: '内容',
            val: '分割线内容',
            belongGroup: '分割线文本'
        }
    }
}
