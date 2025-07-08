/**
 * Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
 * Copyright (C) 2025 Tencent. All rights reserved.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

export default {
    name: 'van-tag',
    type: 'van-tag',
    // bk-drag-custom-comp-default
    icon: 'bk-drag-tag',
    displayName: '标签',
    group: '数据',
    document: 'https://vant-contrib.gitee.io/vant/#/zh-CN/tag',
    events: [
        { name: 'click', tips: '点击时触发，回调参数（event: MouseEvent）' },
        { name: 'close', tips: '关闭标签时触发，回调参数（event: MouseEvent）' }
    ],
    styles: ['padding', 'margin'],
    renderStyles: {
    },
    groups: [
        { label: '样式', value: 'style' },
        { label: '其他', value: 'other' },
        { label: '文本', value: 'text' }
    ],
    props: {
        'type': {
            type: 'string',
            val: 'default',
            options: ['primary', 'success', 'danger', 'warning', 'default'],
            displayName: '标签类型',
            tips: '类型',
            belongGroup: 'style'
        },
        'size': {
            type: 'string',
            val: '',
            options: ['large', 'medium'],
            displayName: '标签大小',
            tips: '类型',
            belongGroup: 'style'
        },
        'color': {
            type: 'color',
            val: '',
            displayName: '标签颜色',
            tips: '标签颜色',
            belongGroup: 'style'
        },
        show: {
            type: 'boolean',
            val: true,
            displayName: '是否展示标签',
            tips: '是否展示标签',
            belongGroup: 'other'
        },
        'plain': {
            type: 'boolean',
            val: false,
            displayName: '是否为空心样式',
            tips: '是否为空心样式',
            belongGroup: 'style'
        },
        'round': {
            type: 'boolean',
            val: false,
            displayName: '是否为圆角样式',
            tips: '是否为圆角样式',
            belongGroup: 'style'
        },
        'mark': {
            type: 'boolean',
            val: false,
            displayName: '是否为标记样式',
            tips: '是否为标记样式',
            belongGroup: 'style'
        },
        'text-color': {
            type: 'color',
            val: '',
            displayName: '文本颜色',
            tips: '文本颜色，优先级高于color属性',
            belongGroup: 'style'
        },
        'closeable': {
            type: 'boolean',
            val: false,
            displayName: '是否可关闭标签',
            tips: '是否为可关闭标签',
            belongGroup: 'other'
        }
    },
    slots: {
        default: {
            name: ['html'],
            type: ['text'],
            displayName: '文本',
            val: '文字标记',
            belongGroup: 'text'
        }
    }
}
