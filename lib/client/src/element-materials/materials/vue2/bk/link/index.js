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
    name: 'link',
    type: 'bk-link',
    displayName: '文字链接',
    icon: 'bk-drag-link1',
    group: '基础',
    order: 1,
    document: 'https://magicbox.bk.tencent.com/static_api/v3/components_vue/2.0/example/index.html#/link',
    events: [
        {
            displayName: '点击',
            name: 'click',
            tips: '文字链接点击时调用该事件函数，事件回调参数 (event: Event)'
        }
    ],
    styles: [
        'position',
        {
            name: 'size',
            exclude: ['height', 'maxHeight', 'minHeight']
        },
        'margin',
        'padding',
        'border',
        'pointer',
        {
            name: 'background',
            include: ['backgroundColor']
        },
        'opacity',
        'font'
    ],
    renderStyles: {
        display: 'inline-block',
        textAlign: 'center',
        verticalAlign: 'middle'
    },
    groups: [
        { label: '链接地址', value: 'link' },
        { label: '打开方式', value: 'openMethod' },
        { label: '状态', value: 'state' },
        { label: '图标', value: 'icon' },
        { label: '样式', value: 'style' },
        { label: '链接文本', value: 'text' }
    ],
    props: {
        theme: {
            type: 'string',
            val: 'primary',
            options: ['default', 'primary', 'success', 'warning', 'danger'],
            displayName: '主题色',
            tips: '链接类型、主题',
            belongGroup: 'style'
        },
        href: {
            type: 'src',
            val: '',
            displayName: '跳转地址',
            tips: '链接跳转地址',
            belongGroup: 'link'
        },
        target: {
            type: 'string',
            val: '_self',
            options: ['_self', '_blank', '_parent', '_top'],
            displayName: '打开方式',
            tips: '链接打开方式，常用为_blank:新窗口打开, _self:当前窗口打开',
            belongGroup: 'openMethod'
        },
        disabled: {
            type: 'boolean',
            val: false,
            displayName: '是否禁用',
            tips: '是否禁用',
            belongGroup: 'state'
        },
        underline: {
            type: 'boolean',
            val: false,
            displayName: '是否显示下划线',
            tips: '是否显示下划线',
            belongGroup: 'style'
        },
        icon: {
            type: 'icon',
            val: '',
            displayName: '图标',
            tips: '图标类名',
            belongGroup: 'icon'
        },
        'icon-placement': {
            type: 'string',
            val: 'left',
            options: ['left', 'right'],
            displayName: '图标位置',
            tips: '图标位置',
            belongGroup: 'icon'
        }
    },
    slots: {
        default: {
            name: ['html'],
            type: ['text'],
            displayName: '文本',
            val: '文字链接',
            belongGroup: 'text'
        }
    }
}
