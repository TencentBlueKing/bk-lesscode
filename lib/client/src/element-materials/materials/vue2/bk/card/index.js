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
    name: 'card',
    type: 'bk-card',
    displayName: '卡片',
    icon: 'bk-drag-card',
    group: '反馈',
    order: 1,
    document: 'https://magicbox.bk.tencent.com/static_api/v3/components_vue/2.0/example/index.html#/card',
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
        width: '320px',
        display: 'inline-block',
        verticalAlign: 'middle'
    },
    groups: [
        { label: '标题', value: 'title' },
        { label: '展开状态', value: 'expand' },
        { label: '显示', value: 'display' },
        { label: '编辑', value: 'edit' },
        { label: '图标', value: 'icon' },
        { label: '样式', value: 'style' }
    ],
    props: {
        title: {
            type: 'string',
            val: '卡片标题',
            displayName: '卡片标题',
            tips: '卡片标题',
            belongGroup: 'title'
        },
        'is-collapse': {
            type: 'boolean',
            val: false,
            displayName: '是否支持展开收起',
            tips: '是否支持展开收起',
            belongGroup: 'expand'
        },
        'collapse-status': {
            type: 'boolean',
            val: true,
            displayName: '当前是否展开',
            tips: '默认展开',
            belongGroup: 'expand'
        },
        position: {
            type: 'string',
            val: 'left',
            options: ['left', 'right'],
            displayName: '展开图标显示位置',
            tips: '展开icon的显示位置',
            belongGroup: 'icon'
        },
        'show-head': {
            type: 'boolean',
            val: true,
            displayName: '是否显示头部',
            tips: '是否显示头部',
            belongGroup: 'display'
        },
        'show-foot': {
            type: 'boolean',
            val: false,
            displayName: '是否显示底部',
            tips: '是否显示底部',
            belongGroup: 'display'
        },
        border: {
            type: 'boolean',
            val: true,
            displayName: '是否显示边框',
            tips: '是否显示边框',
            belongGroup: 'display'
        },
        collapseIcons: {
            type: 'array',
            val: ['icon-down-shape', 'icon-up-shape'],
            displayName: '展开&收起的icon',
            tips: '支持自定义展开&收起的icon',
            belongGroup: 'icon'
        },
        isEdit: {
            type: 'boolean',
            val: false,
            displayName: '是否启用编辑标题功能',
            tips: '是否启用编辑标题功能',
            belongGroup: 'edit'
        },
        disableHeaderStyle: {
            type: 'boolean',
            val: false,
            displayName: '是否禁用Header的line-height默认样式',
            tips: '是否禁用Header的line-height默认样式',
            belongGroup: 'style'
        }
    },
    slots: {
        header: {
            name: ['layout'],
            type: ['render-block'],
            children: [
                {
                    name: ['text'],
                    type: ['span']
                }
            ]
        },
        default: {
            name: ['layout'],
            type: ['render-block'],
            renderStyles: {
                'height': '200px'
            }
        },
        footer: {
            name: ['layout'],
            type: ['render-block'],
            renderStyles: {
                'height': '50px'
            }
        }
    }
}
