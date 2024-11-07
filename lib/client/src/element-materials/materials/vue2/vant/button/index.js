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
    name: 'van-button',
    type: 'van-button',
    // bk-drag-custom-comp-default
    icon: 'bk-drag-button',
    displayName: '按钮',
    group: '基础',
    document: 'https://vant-contrib.gitee.io/vant/v2/#/zh-CN/button',
    events: [
        {
            name: 'click',
            tips: '点击时调用该事件函数，事件回调参数 (e: Event)'
        },
        {
            name: 'touchstart',
            tips: '开始触摸按钮时触发，事件回调参数 (e: TouchEvent)'
        }
    ],
    styles: [
        'position',
        'size',
        'margin',
        'pointer',
        'opacity'
    ],
    renderStyles: {
        display: 'inline-block'
    },
    groups: [
        { label: '状态', value: 'state' },
        { label: '加载中', value: 'loading' },
        { label: '样式', value: 'style' },
        { label: '其他', value: 'other' },
        { label: '按钮文本', value: 'text' }
    ],
    props: {
        size: {
            type: 'string',
            val: 'normal',
            options: ['normal', 'large', 'small', 'mini'],
            displayName: '尺寸',
            tips: '尺寸',
            belongGroup: 'style'
        },
        type: {
            type: 'string',
            val: 'default',
            options: ['primary', 'warning', 'danger', 'info', 'default'],
            displayName: '按钮类型',
            tips: '类型',
            belongGroup: 'style'
        },
        plain: {
            type: 'boolean',
            val: false,
            displayName: '是否朴素按钮',
            tips: '是否朴素按钮',
            belongGroup: 'style'
        },
        round: {
            type: 'boolean',
            val: false,
            displayName: '是否圆角按钮',
            tips: '是否圆角按钮',
            belongGroup: 'style'
        },
        loading: {
            type: 'boolean',
            val: false,
            'v-bind': '',
            displayName: '是否加载中状态',
            tips: '是否加载中状态',
            belongGroup: 'loading'
        },
        'loading-text': {
            type: 'string',
            val: '',
            displayName: '加载时文字提示',
            tips: '加载状态提示文字',
            belongGroup: 'loading'
        },
        'loading-type': {
            type: 'string',
            default: 'circular',
            options: ['circular', 'spinner'],
            displayName: '加载图标类型',
            tips: '加载图标类型',
            belongGroup: 'loading'
        },
        disabled: {
            type: 'boolean',
            val: false,
            'v-bind': '',
            displayName: '是否禁用',
            tips: '是否禁用状态',
            belongGroup: 'state'
        },
        'native-type': {
            type: 'string',
            val: '',
            options: ['button', 'submit', 'reset'],
            displayName: '按钮行为类型',
            tips: '原生 type 属性',
            belongGroup: 'other'
        }
    },
    slots: {
        default: {
            name: ['text'],
            type: ['text'],
            displayName: '文本',
            val: '默认按钮',
            belongGroup: 'text'
        }
    }
}
