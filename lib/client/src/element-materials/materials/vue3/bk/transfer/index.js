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
    name: 'transfer',
    type: 'bk-transfer',
    displayName: '穿梭框',
    icon: 'bk-drag-transfer',
    group: '表单',
    order: 1,
    document: 'https://magicbox.bk.tencent.com/magicbox/3.0/transfer',
    events: [
        {
            displayName: '数据源改变',
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
    directives: [
        {
            type: 'v-model',
            prop: 'target-list'
        }
    ],
    groups: [
        { label: '数据', value: 'data' },
        { label: '文本', value: 'text' },
        { label: 'hover时提示', value: 'tooltip' },
        { label: '搜索', value: 'search' },
        { label: '样式', value: 'style' },
        { label: '其他', value: 'other' }
    ],
    props: {
        title: {
            type: 'array',
            val: [],
            displayName: '顶部标题',
            belongGroup: 'text'
        },
        'empty-content': {
            type: 'array',
            val: [],
            displayName: '无数据时显示文案',
            tips: '无数据时显示文案',
            belongGroup: 'text'
        },
        'source-list': {
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
            displayName: '穿梭框数据源',
            tips: '穿梭框数据源',
            belongGroup: 'data'
        },
        'display-key': {
            type: 'value-key-item',
            dataOrigin: 'source-list',
            val: 'name',
            displayName: '框内显示字段',
            tips: '循环 list 时，显示字段的 key 值',
            belongGroup: 'data'
        },
        'setting-key': {
            type: 'value-key-item',
            dataOrigin: 'source-list',
            val: 'id',
            displayName: '唯一标识字段',
            tips: '具有唯一标识的 key 值',
            belongGroup: 'data'
        },
        'sort-key': {
            type: 'value-key-item',
            dataOrigin: 'source-list',
            val: '',
            displayName: '依据某字段排序',
            tips: '排序所依据的 key',
            belongGroup: 'data'
        },
        'target-list': {
            type: 'array',
            val: [],
            displayName: '已选择数据',
            tips: '已选择数据，数据格式[\'shenzhen\', \'guangzhou\']，支持v-model双向绑定，v-model优先级更高',
            directive: 'v-model',
            belongGroup: 'data'
        },
        searchable: {
            type: 'boolean',
            val: false,
            displayName: '是否运行左侧搜索',
            tips: '是否允许左侧搜索（以display-key来匹配）',
            belongGroup: 'search'
        },
        sortable: {
            type: 'boolean',
            val: false,
            displayName: '是否设置排序',
            tips: '是否设置排序',
            belongGroup: 'other'
        },
        'search-placeholder': {
            type: 'string',
            val: '',
            displayName: '搜索框空值时提示文案',
            tips: '搜索框占位文案',
            belongGroup: 'search'
        },
        'show-overflow-tips': {
            type: 'boolean',
            val: false,
            displayName: '文本过长时是否悬浮完整显示',
            tips: '超出是否显示tooltip',
            belongGroup: 'tooltip'
        },
        extCls: {
            type: 'string',
            displayName: '最外层元素样式类名',
            tips: '配置自定义样式类名，传入的类会被加在组件最外层的DOM.bk-transfer上',
            belongGroup: 'style'
        },
        multiple: {
            type: 'boolean',
            displayName: '是否支持多选',
            tips: '勾选模式，支持多个内容同时穿梭',
            belongGroup: 'other'
        }
    }
}
