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
    name: 'button',
    type: 'bk-button',
    displayName: '基础按钮',
    icon: 'bk-drag-button',
    group: '基础',
    order: 1,
    document: 'https://magicbox.bk.tencent.com/magicbox/3.0/button',
    events: [
        {
            displayName: '点击',
            name: 'click',
            tips: '点击组件时调用该事件函数，事件回调参数 (event: Event)'
        },
        {
            displayName: '鼠标移到组件上',
            name: 'mouseover',
            tips: '鼠标移到组件上时调用该事件函数，事件回调参数 (event: Event)'
        }
    ],
    styles: [
        'position',
        {
            name: 'size',
            exclude: ['height', 'maxHeight', 'minHeight']
        },
        'margin',
        'pointer',
        'opacity'
    ],
    renderStyles: {
        display: 'inline-flex',
        verticalAlign: 'middle'
    },
    groups: [
        { label: '文本', value: 'text' },
        { label: '状态', value: 'state' },
        { label: '加载', value: 'load' },
        { label: '提示', value: 'tooltip' },
        { label: '样式', value: 'style' }
    ],
    props: {
        theme: {
            type: 'string',
            val: '',
            options: ['primary', 'success', 'warning', 'danger'],
            displayName: '按钮主题',
            tips: '按钮类型、主题',
            belongGroup: 'style'
        },
        'hover-theme': {
            type: 'string',
            val: '',
            options: ['primary', 'success', 'warning', 'danger'],
            displayName: 'hover时按钮主题',
            tips: 'mouseHover按钮样式, 当设置了此属性时，theme和text失效',
            belongGroup: 'style'
        },
        size: {
            type: 'string',
            val: '',
            options: ['small', 'large'],
            displayName: '按钮尺寸',
            tips: '按钮尺寸',
            belongGroup: 'style'
        },
        title: {
            type: 'string',
            val: '',
            displayName: 'hover时标题',
            tips: '原生 html title 属性',
            belongGroup: 'tooltip'
        },
        disabled: {
            type: 'boolean',
            val: false,
            displayName: '是否禁用',
            belongGroup: 'state'
        },
        loading: {
            type: 'boolean',
            val: false,
            displayName: '是否加载中状态',
            belongGroup: 'load'
        },
        'loading-mode': {
            type: 'string',
            val: 'default',
            options: ['default', 'spin'],
            displayName: '设置加载中显示样式',
            belongGroup: 'load'
        },
        outline: {
            type: 'boolean',
            val: false,
            displayName: '是否为反色按钮',
            tips: '是否为反色按钮',
            belongGroup: 'style'
        },
        text: {
            type: 'boolean',
            val: false,
            displayName: '是否为文字按钮',
            tips: '是否为文字按钮',
            belongGroup: 'text'
        }
        // icon: {
        //     type: 'icon'
        // },
        // iconRight: {
        //     type: 'icon'
        // }
    },
    slots: {
        default: {
            name: ['text'],
            type: ['text'],
            displayName: '文本',
            val: '基础按钮'
        }
    }
}
