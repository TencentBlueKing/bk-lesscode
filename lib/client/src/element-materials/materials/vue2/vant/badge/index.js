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
    name: 'van-badge',
    type: 'van-badge',
    displayName: '徽标',
    icon: 'bk-drag-badge',
    group: '数据',
    order: 1,
    styles: [
        'position',
        'size',
        'margin',
        'opacity'
    ],
    renderStyles: {
        display: 'inline-block'
    },
    groups: [
        { label: '内容', value: 'content' },
        { label: '显示', value: 'display' },
        { label: '样式', value: 'style' },
        { label: '徽标文本', value: 'text' }
    ],
    props: {
        content: {
            type: ['string', 'number'],
            val: '1',
            displayName: '徽标内容',
            tips: '徽标内容',
            belongGroup: 'content'
        },
        color: {
            type: 'color',
            val: '#ee0a24',
            displayName: '徽标背景颜色',
            tips: '徽标背景颜色',
            belongGroup: 'style'
        },
        dot: {
            type: 'boolean',
            val: false,
            displayName: '是否有小红点',
            tips: '是否展示为小红点',
            belongGroup: 'display'
        },
        max: {
            type: ['number', 'string'],
            displayName: '显示的最大值',
            tips: '最大值，超过最大值会显示 {max}+，仅当 content 为数字时有效',
            belongGroup: 'content'
        }
    },
    slots: {
        default: {
            name: ['text'],
            type: ['text'],
            displayName: '文本',
            val: '文字标记',
            belongGroup: 'text'
        }
    }
}
