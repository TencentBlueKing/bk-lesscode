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
    name: 'search-select',
    type: 'bk-search-select',
    displayName: '查询选择',
    icon: 'bk-drag-search',
    group: '表单',
    order: 1,
    document: 'https://magicbox.bk.tencent.com/magicbox/3.0/search-select',
    events: [
        {
            displayName: '点击查询图标',
            name: 'search',
            tips: '点击右侧search Icon 时触发'
        },
        {
            displayName: '选择面板',
            name: 'selectKey',
            tips: '选择面板中的Key值时触发'
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
        display: 'block'
    },
    directives: [
        {
            type: 'v-model',
            prop: 'model-value'
        }
    ],
    groups: [
        { label: '数据源', value: 'dataSource' },
        { label: '查询条件', value: 'queryCondition' },
        { label: '提示', value: 'tip' },
        { label: '异步操作', value: 'remote' },
        { label: '样式', value: 'style' },
        { label: '其他', value: 'other' }
    ],
    props: {
        data: {
            type: ['array', 'remote'],
            remoteValidate (data) {
                if (!Array.isArray(data)) return '返回值需要是数组'
            },
            val: [
                {
                    name: '实例状态',
                    id: '1',
                    multiable: true,
                    children: [
                        { name: '创建中', id: '1-2' },
                        { name: '运行中', id: '1-3' },
                        { name: '已关机', id: '1-4' }
                    ]
                },
                {
                    name: '实例业务',
                    id: '2',
                    children: [
                        { name: '王者荣耀', id: '2-1' },
                        { name: '刺激战场', id: '2-2' },
                        { name: '绝地求生', id: '2-3' }
                    ]
                },
                { name: 'IP地址', id: '3' },
                { name: '实例名', id: '4' },
                { name: '实例地址', id: '5' },
                { name: '测试六', id: '6' }
            ],
            displayName: '搜索选择数据',
            tips: '搜索选择数据',
            belongGroup: 'dataSource'
        },
        'model-value': {
            type: 'array',
            val: [],
            displayName: '已选择的数据项',
            tips: '已选择的数据项，支持v-model双向绑定，v-model优先级更高',
            directive: 'v-model',
            belongGroup: 'queryCondition'
        },
        'max-height': {
            type: 'number',
            val: 120,
            displayName: '最大高度',
            tips: '最大高度',
            belongGroup: 'style'
        },
        'min-height': {
            type: 'number',
            val: 26,
            displayName: '最小高度',
            tips: '最小高度',
            belongGroup: 'style'
        },
        conditions: {
            type: 'array',
            val: [],
            displayName: '条件选择列表',
            tips: '条件选择列表',
            belongGroup: 'queryCondition'
        },
        clearable: {
            type: 'boolean',
            val: true,
            displayName: '是否可以清空',
            tips: '是否可以清空',
            belongGroup: 'other'
        },
        strink: {
            type: 'boolean',
            val: true,
            displayName: '是否伸缩input框',
            tips: '当输入条件过多超出input最小值时是否伸缩input框',
            belongGroup: 'other'
        },
        'get-menu-list': {
            type: 'function',
            val: '',
            displayName: '动态获取数据列表',
            tips: '自定义动态获取选择项列表方法',
            belongGroup: 'remote'
        },
        'validate-values': {
            type: 'function',
            val: '',
            displayName: '动态验证选中值',
            tips: '自定义动态验证选择或者输入值 如果返回 校验失败的文本则代表校验失败',
            belongGroup: 'other'
        },
        'value-split-code': {
            type: 'string',
            val: '|',
            displayName: '多选时分隔符',
            tips: '多选的值的链接符号',
            belongGroup: 'queryCondition'
        },
        'unique-select': {
            type: 'boolean',
            default: false,
            displayName: '是否过滤掉已选择项',
            tips: '是否过滤掉已选择项',
            belongGroup: 'other'
        },
        'value-behavior': {
            type: 'string',
            options: ['all', 'need-key'],
            default: 'all',
            displayName: '纯文本是否可以生成value',
            tips: '配置纯文本是否可以生成value (all: 可以，need-key: 需要key值)',
            belongGroup: 'other'
        },
        placeholder: {
            type: 'string',
            val: '请选择',
            displayName: '空白文本提示',
            tips: '空白文本提示',
            belongGroup: 'tip'
        }
    }
}
