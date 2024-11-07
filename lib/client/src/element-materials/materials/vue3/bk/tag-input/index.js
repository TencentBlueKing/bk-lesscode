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
    name: 'tag-input',
    type: 'bk-tag-input',
    displayName: '标签输入',
    icon: 'bk-drag-tag',
    group: '表单',
    order: 1,
    document: 'https://magicbox.bk.tencent.com/magicbox/3.0/tag-input',
    events: [
        {
            displayName: '数据发生变化',
            name: 'change',
            tips: '数据发生变化时调用该事件函数，事件回调参数 (tags: Array)'
        },
        {
            displayName: '输入内容',
            name: 'input',
            tips: '输入时调用该事件函数，事件回调参数 (tags: Array)'
        },
        {
            displayName: '选择数据',
            name: 'select',
            tips: '选择数据后调用该事件函数，暂无事件回调参数'
        },
        {
            displayName: '删除数据',
            name: 'remove',
            tips: '删除数据后调用该事件函数，暂无事件回调参数'
        },
        {
            displayName: '一键清空数据',
            name: 'remove-all',
            tips: '一键清空数据后调用该事件函数，暂无事件回调参数'
        },
        {
            displayName: '输入框失焦',
            name: 'blur',
            tips: '输入状态时失焦时调用该事件函数，事件回调参数 (inputStr: String, tags: Array)'
        },
        {
            displayName: '输入框聚焦',
            name: 'focus',
            tips: '输入状态时聚焦时调用该事件函数，事件回调参数 (inputStr: String, tags: Array)'
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
        width: '300px',
        verticalAlign: 'middle'
    },
    groups: [
        { label: '输入值', value: 'input' },
        { label: '数据', value: 'data' },
        { label: '状态', value: 'state' },
        { label: '提示', value: 'tip' },
        { label: 'hover时提示', value: 'tooltip' },
        { label: '显示', value: 'display' },
        { label: '限制数量', value: 'limitNum' },
        { label: '模板', value: 'template' },
        { label: '校验', value: 'validation' },
        { label: '样式', value: 'style' },
        { label: '其他', value: 'other' }
    ],
    props: {
        'model-value': {
            type: ['string', 'array'],
            val: '',
            tips: '空白提示',
            directive: 'v-model',
            displayName: '标签输入值',
            belongGroup: 'input'
        },
        list: {
            type: ['array', 'remote'],
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
                { id: 'chongqing', name: '重庆' },
                { id: 'taibei', name: '台北' },
                { id: 'haikou', name: '海口' }
            ],
            displayName: '下拉数据列表',
            tips: '下拉菜单所需的数据列表',
            belongGroup: 'data'
        },
        'save-key': {
            type: 'value-key-item',
            dataOrigin: 'list',
            val: 'id',
            displayName: '保存字段',
            tips: '循环 list 时，保存字段的 key 值',
            belongGroup: 'data'
        },
        'display-key': {
            type: 'value-key-item',
            dataOrigin: 'list',
            val: 'name',
            displayName: '框内显示字段',
            tips: '循环 list 时，显示字段的 key 值',
            belongGroup: 'data'
        },
        'search-key': {
            type: 'value-key-item',
            dataOrigin: 'list',
            val: 'name',
            displayName: '框内搜索字段',
            tips: '输入时，搜索的 key 值',
            belongGroup: 'data'
        },
        placeholder: {
            type: 'string',
            displayName: '空值时提示文案',
            tips: '空白提示',
            belongGroup: 'tip'
        },
        disabled: {
            type: 'boolean',
            val: false,
            displayName: '是否禁用',
            belongGroup: 'state'
        },
        'tooltip-key': {
            type: 'string',
            val: '',
            displayName: 'hover时提示文案',
            belongGroup: 'tooltip'
        },
        'has-delete-icon': {
            type: 'boolean',
            val: true,
            displayName: '是否显示删除按钮',
            tips: '是否显示删除按钮',
            belongGroup: 'display'
        },
        clearable: {
            type: 'boolean',
            val: true,
            displayName: '是否允许清空',
            tips: '是否允许清空',
            belongGroup: 'state'
        },
        trigger: {
            type: 'string',
            val: 'search',
            options: ['focus', 'search'],
            displayName: '列表展示触发方式',
            belongGroup: 'other'
        },
        'allow-create': {
            type: 'boolean',
            val: false,
            displayName: '是否允许自定义标签输入',
            tips: '是否允许自定义标签输入',
            belongGroup: 'other'
        },
        'max-data': {
            type: 'number',
            val: -1,
            displayName: '是否限制可选个数',
            tips: '是否限制可选个数，-1为不限制',
            belongGroup: 'limitNum'
        },
        'use-group': {
            type: 'boolean',
            val: false,
            displayName: '是否要分组',
            tips: '是否显示分组',
            belongGroup: 'other'
        },
        'max-result': {
            type: 'number',
            val: 10,
            displayName: '搜索结果显示个数',
            tips: '下拉列表搜索结果显示个数，默认为 10',
            belongGroup: 'limitNum'
        },
        'content-width': {
            type: 'number',
            val: 190,
            displayName: '下拉框宽度',
            tips: '自定义设置下拉弹框的宽度，单选会撑满因此失效',
            belongGroup: 'style'
        },
        'content-max-height': {
            type: 'number',
            val: 300,
            displayName: '下拉框高度',
            tips: '自定义设置下拉弹框的长度',
            belongGroup: 'style'
        },
        separator: {
            type: 'string',
            displayName: '输入分隔符号',
            tips: '输入分隔符号，支持批量输入',
            belongGroup: 'other'
        },
        'left-space': {
            type: 'number',
            val: 0,
            displayName: '文字与左边框距离',
            tips: '文字与左边框距离',
            belongGroup: 'style'
        },
        'allow-next-focus': {
            type: 'boolean',
            val: true,
            displayName: '选中后是否展示下拉框',
            belongGroup: 'display'
        },
        'allow-auto-match': {
            type: 'boolean',
            val: false,
            displayName: '是否自动匹配选中',
            belongGroup: 'other'
        },
        'show-clear-only-hover': {
            type: 'boolean',
            val: false,
            displayName: '是否hover时显示清空按钮',
            belongGroup: 'display'
        },
        'create-tag-validator': {
            type: 'boolean',
            val: false,
            displayName: '自定义标签校验',
            belongGroup: 'validation'
        },
        'filter-callback': {
            type: 'array',
            val: [],
            displayName: '过滤函数',
            belongGroup: 'other'
        },
        'tag-tpl': {
            type: 'string',
            val: '',
            displayName: '自定义标签模板',
            belongGroup: 'template'
        },
        tpl: {
            type: 'string',
            val: '',
            displayName: '下拉列表模板',
            belongGroup: 'template'
        },
        'paste-fn': {
            type: 'array',
            val: [],
            displayName: '粘贴文本显示格式',
            belongGroup: 'other'
        },
        'with-validate': {
            type: 'boolean',
            val: true,
            displayName: '值改变时触发字段校验规则',
            belongGroup: 'validation'
        },
        'popover-props': {
            type: 'object',
            val: {},
            belongGroup: 'other'
        },
        'collapse-tags': {
            type: 'boolean',
            val: false,
            displayName: '失焦时是否折叠标签',
            belongGroup: 'other'
        },
        'tag-overflow-tips': {
            type: 'object',
            val: {},
            displayName: '是否hover时展示标签',
            belongGroup: 'tooltip'
        }
    }
}
