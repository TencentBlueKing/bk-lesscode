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
    name: 'tag-input',
    type: 'bk-tag-input',
    displayName: '标签输入',
    icon: 'bk-drag-tag',
    group: '表单',
    order: 1,
    document: 'https://magicbox.bk.tencent.com/static_api/v3/components_vue/2.0/example/index.html#/tag-input',
    events: [
        {
            displayName: '数据发生变化',
            name: 'change',
            tips: '数据发生变化时调用该事件函数，事件回调参数 (tags: Array)'
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
            tips: '输入获取焦点的回调函数'
        },
        {
            displayName: '框中内容输入',
            name: 'inputchange',
            tips: '输入框input事件的回调函数'
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
    directives: [
        {
            type: 'v-model',
            prop: 'value'
        }
        // {
        //     type: 'v-bind',
        //     prop: 'list',
        //     format: 'variable',
        //     valueTypeInclude: ['array']
        // }
    ],
    groups: [
        { label: '数据', value: 'data' },
        { label: '状态', value: 'state' },
        { label: '显示', value: 'display' },
        { label: '文本', value: 'text' },
        { label: '数量', value: 'amount' },
        { label: '模板', value: 'template' },
        { label: '粘贴', value: 'paste' },
        { label: '过滤', value: 'filter' },
        { label: '样式', value: 'style' },
        { label: '其他', value: 'other' }
    ],
    props: {
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
                { id: 'chognqing', name: '重庆' },
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
        'tooltip-key': {
            type: 'value-key-item',
            dataOrigin: 'list',
            val: 'name',
            displayName: '标签上hover时提示文案',
            tips: '让选中的标签在鼠标移上去时显示提示文案',
            belongGroup: 'data'
        },
        disabled: {
            type: 'boolean',
            val: false,
            displayName: '是否禁用',
            belongGroup: 'state'
        },
        placeholder: {
            type: 'string',
            displayName: '空值时提示文案',
            tips: '空白提示',
            belongGroup: 'text'
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
            displayName: '是否清空',
            tips: '是否允许清空',
            belongGroup: 'state'
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
            belongGroup: 'amount'
        },
        'use-group': {
            type: 'boolean',
            val: false,
            displayName: '是否显示分组',
            tips: '是否显示分组',
            belongGroup: 'display'
        },
        'max-result': {
            type: 'number',
            val: 10,
            displayName: '搜索结果显示个数',
            tips: '下拉列表搜索结果显示个数，默认为 10',
            belongGroup: 'amount'
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
            displayName: '是否选中后继续操作',
            tips: '多选时，是否允许选中后继续操作',
            belongGroup: 'other'
        },
        tpl: {
            type: 'function',
            displayName: '自定义下拉列表模板',
            tips: '自定义下拉列表模板',
            belongGroup: 'template'
        },
        'tag-tpl': {
            type: 'function',
            displayName: '自定义标签模板',
            tips: '自定义标签模板',
            belongGroup: 'template'
        },
        'paste-fn': {
            type: 'function',
            displayName: '粘贴后文本格式',
            tips: '批量粘贴处理文本返回格式',
            belongGroup: 'paste'
        },
        'free-paste': {
            type: 'boolean',
            val: true,
            displayName: '是否支持粘贴',
            tips: '是否支持粘贴。配置此属性后，可随意粘贴内容至 tag-input，粘贴后输入回车，粘贴的内容会自动生成标签',
            belongGroup: 'paste'
        },
        trigger: {
            type: 'string',
            options: ['search', 'focus'],
            val: 'search',
            displayName: '搜索列表触发展示方式',
            tips: '搜索列表触发展示方式，默认是输入关键字搜索时展示，也可以获取焦点是展示（用在数据量少的时候）',
            belongGroup: 'other'
        },
        'filter-callback': {
            type: 'function',
            displayName: '过滤函数',
            tips: '过滤函数，参数 (filterVal, filterKey, data)，分别表示当前过滤的文本、当前数据使用的 key、所有数据，方便使用者根据自己的逻辑来筛选数据',
            belongGroup: 'filter'
        },
        'ext-cls': {
            type: 'string',
            displayName: '最外层元素的类名',
            tips: '配置自定义样式类名，传入的类会被加在组件最外层的 DOM .bk-tag-selector 上',
            belongGroup: 'style'
        },
        'allow-auto-match': {
            type: 'boolean',
            val: false,
            displayName: '是否失焦后自动匹配',
            tips: '配置输入时失焦点后，如果完全匹配则自动选中，如果自定义则自动输入',
            belongGroup: 'other'
        },
        'create-tag-validator': {
            type: 'function',
            displayName: '自定义标签校验函数',
            tips: '自定义标签校验函数，返回 boolean，参数(tag)，tag表示当前输入值，在自定义标签时，可以自定义添加标签的校验',
            belongGroup: 'other'
        },
        'show-clear-only-hover': {
            type: 'boolean',
            val: false,
            displayName: '是否hover时显示清除按钮',
            tips: '是否在只有 hover 的时候才显示 clear 清除按钮',
            belongGroup: 'display'
        },
        'collapse-tags': {
            type: 'boolean',
            val: false,
            displayName: '失焦是否折叠标签',
            tips: '失焦是否折叠 tags',
            belongGroup: 'other'
        }
    }
}
