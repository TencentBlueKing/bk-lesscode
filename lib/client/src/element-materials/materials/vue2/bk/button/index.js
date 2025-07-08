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
    name: 'button',
    type: 'bk-button',
    displayName: '基础按钮',
    icon: 'bk-drag-button',
    group: '基础',
    order: 1,
    document: 'https://magicbox.bk.tencent.com/static_api/v3/components_vue/2.0/example/index.html#/button',
    events: [
        {
            displayName: '点击',
            name: 'click',
            tips: '点击组件时调用该事件函数，事件回调参数 (event: Event)'
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
        display: 'inline-block',
        verticalAlign: 'middle'
    },
    groups: [
        { label: '展示类型', value: 'showType' },
        { label: '状态', value: 'state' },
        { label: '图标', value: 'icon' },
        { label: '提示', value: 'tooltip' },
        { label: '样式', value: 'style' },
        { label: '按钮文本', value: 'text' }
    ],
    props: {
        title: {
            type: 'string',
            val: 'hello world',
            displayName: 'hover时标题',
            tips: '原生 html title 属性',
            belongGroup: 'tooltip'
        },
        size: {
            type: 'string',
            val: 'normal',
            options: ['small', 'normal', 'large'],
            displayName: '按钮尺寸',
            tips: '按钮尺寸',
            belongGroup: 'style'
        },
        theme: {
            type: 'string',
            val: 'default',
            options: ['default', 'primary', 'success', 'warning', 'danger'],
            displayName: '按钮主题',
            tips: '按钮类型、主题',
            belongGroup: 'style'
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
            belongGroup: 'state'
        },
        icon: {
            type: 'icon',
            displayName: '左侧图标',
            belongGroup: 'icon'
        },
        'icon-right': {
            type: 'icon',
            displayName: '右侧图标',
            belongGroup: 'icon'
        },
        hoverTheme: {
            type: 'string',
            options: ['primary', 'success', 'warning', 'danger'],
            displayName: 'mouseover按钮类型',
            tips: 'mouseover按钮类型，当设置了此属性时，theme和text失效',
            belongGroup: 'style'
        },
        outline: {
            type: 'boolean',
            val: false,
            displayName: '是否显示反色按钮',
            tips: '是否显示反色按钮',
            belongGroup: 'style'
        },
        text: {
            type: 'boolean',
            val: false,
            displayName: '是否是文字按钮',
            tips: '是否是文字按钮',
            belongGroup: 'showType'
        },
        extCls: {
            type: 'string',
            displayName: '最外层元素的类名',
            tips: '配置自定义样式类名，传入的类会被加在组件最外层的DOMbutton上',
            belongGroup: 'style'
        }
    },
    slots: {
        default: {
            name: ['text'],
            type: ['text'],
            displayName: '文本',
            val: '基础按钮',
            belongGroup: 'text'
        }
    }
}
