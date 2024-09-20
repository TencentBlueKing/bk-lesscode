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
    name: 'sideslider',
    type: 'bk-sideslider',
    displayName: '侧栏',
    icon: 'bk-drag-dialog',
    group: '反馈',
    order: 5,
    interactiveShow: true,
    document: 'https://magicbox.bk.tencent.com/magicbox/3.0/sideslider',
    events: [
        {
            displayName: '显示',
            name: 'show',
            tips: '显示组件后调用该事件函数，暂无事件回调参数'
        },
        {
            displayName: '关闭',
            name: 'hidden',
            tips: '关闭组件后调用该事件函数，暂无事件回调参数'
        },
        {
            displayName: '关闭',
            name: 'closed',
            tips: '关闭组件后的回调函数，暂无事件回调参数'
        },
        {
            displayName: '关闭后动画结束',
            name: 'animation-end',
            tips: '关闭组件后动画结束时调用该事件函数，暂无事件回调参数'
        }
    ],
    renderStyles: {
        display: 'inline-block'
    },
    groups: [
        { label: '可见性', value: 'visibility' },
        { label: 'header区域', value: 'header' },
        { label: '交互', value: 'interaction' },
        { label: '位置', value: 'position' },
        { label: '样式', value: 'style' },
        { label: '其他', value: 'other' }
    ],
    props: {
        'is-show': {
            type: 'boolean',
            displayName: '是否显示侧栏',
            tips: '是否显示组件，支持v-model写法',
            val: true,
            staticValue: true, // 静态值，表示只是代码和UI改变，画布内的值不变
            directive: 'v-model',
            disableVariableType: ['expression'],
            belongGroup: 'visibility' // 可见性
        },
        title: {
            type: 'string',
            val: '自定义组件标题',
            displayName: '标题内容',
            belongGroup: 'header'
        },
        'quick-close': {
            type: 'boolean',
            val: false,
            displayName: '是否可点击遮罩关闭侧栏',
            tips: '是否支持点击遮罩关闭组件',
            belongGroup: 'interaction'
        },
        'show-mask': {
            type: 'boolean',
            val: true,
            staticValue: false,
            displayName: '遮罩是否出现',
            tips: '是否允许出现遮罩',
            belongGroup: 'visibility'
        },
        width: {
            type: 'number',
            val: 400,
            displayName: '侧栏宽度',
            tips: '组件的宽度',
            belongGroup: 'style'
        },
        direction: {
            type: 'string',
            options: ['left', 'right'],
            val: 'right',
            displayName: '侧栏出现方向',
            belongGroup: 'position'
        },
        transfer: {
            type: 'boolean',
            val: true,
            staticValue: false,
            displayName: '控制 sidslider 是否出现在 body 内',
            belongGroup: 'position'
        },
        escClose: {
            type: 'boolean',
            val: true,
            displayName: '是否允许esc按键关闭弹框',
            tips: '是否允许esc按键关闭弹框',
            belongGroup: 'interaction'
        },
        zIndex: {
            type: 'number',
            displayName: '侧栏的zIndex值',
            tips: '设置侧栏的z-index值，在transfer为true的情况下，改值会自动+1',
            belongGroup: 'style'
        },
        backgroundColor: {
            type: 'color',
            displayName: '内容区背景颜色',
            tips: '内容区背景颜色',
            belongGroup: 'style'
        },
        beforeClose: {
            type: 'function',
            displayName: '关闭前的钩子函数',
            tips: '关闭前的钩子函数',
            belongGroup: 'other'
        }
    },
    slots: {
        default: {
            name: ['layout'],
            type: ['render-block']
        }
    }
}
