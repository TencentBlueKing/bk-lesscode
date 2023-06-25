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
    name: 'transfer',
    type: 'bk-transfer',
    displayName: '穿梭框',
    icon: 'bk-drag-transfer',
    group: '表单',
    order: 1,
    document: 'https://magicbox.bk.tencent.com/magicbox/3.0/transfer',
    events: [
        {
            name: 'change',
            tips: '数据源改变时调用该事件函数，事件回调参数 (sourceList: Array, targetList: Array, targetValueList: Array)'
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
    props: {
        title: {
            type: 'array',
            val: []
        },
        emptyContent: {
            type: 'array',
            val: [],
            tips: '无数据时显示文案'
        },
        displayKey: {
            type: 'string',
            val: 'name',
            tips: '循环 list 时，显示字段的 key 值'
        },
        settingKey: {
            type: 'string',
            val: 'id',
            tips: '具有唯一标识的 key 值'
        },
        sortKey: {
            type: 'string',
            val: '',
            tips: '排序所依据的 key'
        },
        sourceList: {
            type: ['array', 'remote', 'data-source'],
            remoteValidate (data) {
                if (!Array.isArray(data)) return '返回值需要是数组'
            },
            val: [
                { id: 'shenzhen', name: '深圳' },
                { id: 'guangzhou', name: '广州' },
                { id: 'beijing', name: '北京' },
                { id: 'shanghai', name: '上海' },
                { id: 'hangzhou', name: '杭州' },
                { id: 'nanjing', name: '南京' },
                { id: 'chognqing', name: '重庆' },
                { id: 'taibei', name: '台北' },
                { id: 'haikou', name: '海口' }
            ],
            tips: '穿梭框数据源'
        },
        targetList: {
            type: 'array',
            val: [],
            tips: '已选择数据，数据格式[\'shenzhen\', \'guangzhou\']',
            directive: 'v-model'
        },
        searchable: {
            type: 'boolean',
            val: false,
            tips: '是否允许左侧搜索（以display-key来匹配）'
        },
        sortable: {
            type: 'boolean',
            val: false,
            tips: '是否设置排序'
        },
        searchPlaceholder: {
            type: 'string',
            val: '',
            tips: '搜索框占位文案'
        },
        showOverflowTips: {
            type: 'boolean',
            val: false,
            tips: '超出是否显示tooltip'
        }
    }
}
