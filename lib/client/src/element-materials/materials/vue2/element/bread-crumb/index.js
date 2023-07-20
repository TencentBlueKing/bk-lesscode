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
    name: 'el-bread-crumb',
    type: 'el-breadcrumb',
    displayName: '面包屑',
    icon: 'bk-drag-breadcrumb',
    group: '导航',
    order: 4,
    document: 'https://element.eleme.cn/#/zh-CN/component/breadcrumb',
    styles: ['position', 'size', 'margin', 'pointer', 'opacity'],
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
        }
    },
    slots: {
        default: {
            name: ['el-breadcrumb-item'],
            type: ['list', 'remote'],
            displayName: '层级',
            remoteValidate (data) {
                if (!Array.isArray(data)) return '返回值需要是数组'
            },
            keys: [
                { id: 'label', label: '名称', tips: '从数据中获取名称的字段key，不填取 label 字段' },
                { id: 'to', label: '跳转地址', tips: '从数据中获取跳转地址的字段key，不填取 to 字段' }
            ],
            val: [
                { label: '首页', to: '/' },
                { label: '使用指引', to: '/help' },
                { label: '面包屑', to: null }
            ]
        }
    }
}
