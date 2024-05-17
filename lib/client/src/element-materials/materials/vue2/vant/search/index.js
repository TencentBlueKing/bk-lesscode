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
    name: 'van-search',
    type: 'van-search',
    displayName: '搜索',
    icon: 'bk-drag-search-2',
    group: '表单',
    order: 1,
    document: 'https://youzan.github.io/vant/v2/#/zh-CN/search',
    events: [
        {
            name: 'input',
            tips: '输入框内容变化时触发，事件回调参数 (value: string (当前输入的值))'
        },
        {
            name: 'search',
            tips: '确定搜索时触发，事件回调参数 (value: string (当前输入的值))'
        },
        {
            name: 'focus',
            tips: '输入框获得焦点时触发，事件回调参数 (event: Event)'
        },
        {
            name: 'blue',
            tips: '输入框失去焦点时触发，事件回调参数 (event: Event)'
        },
        {
            name: 'clear',
            tips: '点击清除按钮后触发，事件回调参数 (event: Event)'
        },
        {
            name: 'cancel',
            tips: '点击取消按钮后触发'
        }
    ],
    styles: ['position', 'size', 'margin', 'opacity'],
    directives: [
        {
            type: 'v-model',
            prop: 'value'
        }
    ],
    props: {
        value: {
            type: 'string',
            displayName: '输入关键字搜索'
        },
        label: {
            type: 'string',
            displayName: '设置左侧文本',
            tips: '搜索框左侧文本'
        },
        shape: {
            type: 'string',
            options: ['round', 'square'],
            val: 'square',
            displayName: '设置搜索框形状',
            tips: '搜索框左侧文本'
        },
        background: {
            type: 'color',
            val: '#f2f2f2',
            displayName: '设置搜索框外部背景色',
            tips: '搜索框外部背景色'
        },
        'max-length': {
            type: ['string', 'number'],
            displayName: '输入最大字符数',
            tips: '输入框最大字符'
        },
        placeholder: {
            type: 'string',
            displayName: '设置占位文本',
            tips: '输入框占位提示文字'
        },
        clearable: {
            type: 'boolean',
            default: true,
            displayName: '是否显示清除图标',
            tips: '是否启用清除图标，点击清除图标后会清空输入框'
        },
        'clear-trigger': {
            type: 'string',
            options: ['always', 'focus'],
            val: 'focus',
            displayName: '触发显示清除图标行为',
            tips: '显示清除图标的时机，always 表示输入框不为空时展示，focus 表示输入框聚焦且不为空时展示'
        },
        'autofocus': {
            type: 'boolean',
            default: false,
            displayName: '是否自动聚焦',
            tips: '是否自动聚焦，iOS 系统不支持该属性'
        },
        'show-action': {
            type: 'boolean',
            default: false,
            displayName: '右侧是否显示取消按钮',
            tips: '是否在搜索框右侧显示取消按钮'
        },
        'action-text': {
            type: 'string',
            val: '取消',
            displayName: '设置取消按钮文字',
            tips: '取消按钮文字'
        },
        disabled: {
            type: 'boolean',
            default: false,
            displayName: '是否禁用',
            tips: '是否禁用'
        },
        'readonly': {
            type: 'boolean',
            default: false,
            displayName: '是否只读',
            tips: '是否将输入框设为只读'
        },
        'error': {
            type: 'boolean',
            default: false,
            displayName: '输入内容是否标红',
            tips: '是否将输入内容标红'
        },
        'input-align': {
            type: 'string',
            options: ['center', 'left', 'right'],
            val: 'left',
            displayName: '设置输入内容的对齐方式',
            tips: '输入框内容对齐方式'
        },
        'left-icon': {
            type: 'van-icon',
            val: 'search',
            displayName: '设置左侧图标或图片',
            tips: '输入框左侧图标名称或图片链接'
        },
        'right-icon': {
            type: 'van-icon',
            displayName: '设置右侧图标或图片',
            tips: '输入框右侧图标名称或图片链接'
        }
    }
}
