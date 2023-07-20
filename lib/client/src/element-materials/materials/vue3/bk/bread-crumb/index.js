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
    name: 'bread-crumb',
    type: 'bk-breadcrumb',
    displayName: '面包屑',
    icon: 'bk-drag-breadcrumb',
    group: '导航',
    order: 4,
    document: 'https://magicbox.bk.tencent.com/magicbox/3.0/breadcrumb',
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
    props: {
        separator: {
            type: 'string',
            val: '/',
            tips: '分隔符'
        },
        'separator-class': {
            type: 'string',
            val: '',
            tips: '图表分隔符class'
        },
        replace: {
            type: 'boolean',
            val: false,
            tips: '开启backRouter并使用默认的icon跳转时，启用 replace 将不会向 history 添加新记录'
        }
    },
    slots: {
        default: {
            name: ['bk-breadcrumb-item'],
            type: ['list', 'remote'],
            displayName: '层级',
            tips: '默认插槽，填写的数据需要是数组且每个元素需包含replace和to字段',
            remoteValidate (data) {
                if (!Array.isArray(data)) return '返回值需要是数组'
            },
            keys: [
                { id: 'replace', label: '路由跳转方式', tips: '在使用to进行路由跳转时，启用replace将不会向history添加新记录', val: false },
                { id: 'to', label: '跳转地址', tips: '路由跳转对象，同vue-router的to' },
                { id: 'extCls', label: '自定义样式', tips: '自定义样式类' }
            ],
            val: [
                { label: '首页', to: '/' },
                { label: '使用指引', to: '/help' },
                { label: '面包屑', to: null }
            ]
        }
    }
}
