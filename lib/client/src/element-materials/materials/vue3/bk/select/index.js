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
    name: 'select',
    type: 'bk-select',
    displayName: '下拉选框',
    icon: 'bk-drag-select',
    group: '表单',
    order: 1,
    document: 'https://magicbox.bk.tencent.com/static_api/v3/components_vue/2.0/example/index.html#/select',
    events: [
        {
            displayName: '选择列表',
            name: 'select',
            tips: '选择列表时调用该事件函数，多选时，回调参数均为数组(value: String | Number | Array, option: Object | Array)'
        },
        {
            displayName: '下拉框展开或收起',
            name: 'toggle',
            tips: '下拉框展开或收起时调用该事件函数，回调参数(status: Boolean)'
        },
        {
            displayName: '选项发生变化',
            name: 'change',
            tips: '选项发生变化时调用该事件函数，回调参数(newValue: String | Number | Array, oldValue: String | Number | Array)'
        },
        {
            displayName: '点击清空图标',
            name: 'clear',
            tips: '清空已选项时调用该事件函数，回调参数(oldValue: String | Number | Array)'
        },
        {
            displayName: '多选时移除选中的tag',
            name: 'tag-remove',
            tips: '删除tab时调用该事件函数，回调参数(options: Array)'
        },
        {
            displayName: '滚动到底部时',
            name: 'scroll-end',
            tips: '列表滚动到底部时触发'
        },
        {
            displayName: '搜索框聚焦',
            name: 'focus',
            tips: '当 input 获得焦点时触发'
        },
        {
            displayName: '搜索框失焦',
            name: 'input',
            tips: '当 input 失去焦点时触发'
        },
        {
            displayName: '取消选中',
            name: 'deselect',
            tips: '取消选中时调用'
        },
        {
            displayName: '自定义搜索',
            name: 'search-change',
            tips: '自定义搜索回调'
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
        verticalAlign: 'middle',
        background: '#fff'
    },
    directives: [
        {
            type: 'v-model',
            prop: 'model-value'
        }
    ],
    groups: [
        { label: '数据源', value: 'dataSource' },
        { label: '数值', value: 'value' },
        { label: '选择', value: 'selection' },
        { label: '显示标签', value: 'tag' },
        { label: '状态', value: 'state' },
        { label: '提示', value: 'tip' },
        { label: '显示', value: 'display' },
        { label: '聚焦', value: 'focus' },
        { label: '搜索', value: 'search' },
        { label: '虚拟滚动', value: 'virtualScroll' },
        { label: '滚动加载', value: 'scrollLoad' },
        { label: '异步操作', value: 'remote' },
        { label: '样式', value: 'style' },
        { label: '其他', value: 'other' }
    ],
    props: {
        'model-value': {
            type (renderProps) {
                return renderProps?.multiple?.renderValue ? 'array' : ['string', 'number']
            },
            // defaultValList: ['sss', [1, 2, 3], 3],
            val: '',
            displayName: '选中的值',
            tips: '当前被选中的值，支持v-model双向绑定，v-model优先级更高',
            directive: 'v-model',
            belongGroup: 'value'
        },
        multiple: {
            type: 'boolean',
            val: false,
            displayName: '是否多选',
            tips: '是否多选',
            belongGroup: 'selection'
        },
        disabled: {
            type: 'boolean',
            val: false,
            displayName: '是否禁用',
            belongGroup: 'state'
        },
        size: {
            type: 'string',
            options: ['small', 'large', 'default'],
            val: 'default',
            displayName: '尺寸',
            belongGroup: 'style'
        },
        clearable: {
            type: 'boolean',
            val: true,
            displayName: '是否允许清空',
            tips: '是否允许清空',
            belongGroup: 'state'
        },
        loading: {
            type: 'boolean',
            val: false,
            displayName: '是否加载中状态',
            tips: '是否加载中',
            belongGroup: 'state'
        },
        filterable: {
            type: 'boolean',
            val: false,
            displayName: '是否支持搜索',
            tips: '是否支持搜索',
            belongGroup: 'search'
        },
        'remote-method': {
            type: 'function',
            val: '',
            displayName: '远程搜索方法',
            tips: '远程函数',
            belongGroup: 'search'
        },
        'scroll-height': {
            type: 'number',
            val: 200,
            displayName: '下拉框滚动高度',
            tips: '下拉列表滚动高度',
            belongGroup: 'style'
        },
        'show-select-all': {
            type: 'boolean',
            val: false,
            displayName: '是否展示全选项',
            tips: '是否显示全选选项，仅当开启multiple时生效',
            belongGroup: 'selection'
        },
        'popover-min-width': {
            type: 'number',
            val: 0,
            displayName: '下拉框最小宽度',
            tips: '设置下拉列表的最小宽度, 默认的列表宽度跟组件保持一致',
            belongGroup: 'style'
        },
        'show-on-init': {
            type: 'boolean',
            val: false,
            displayName: '是否初始展示下拉框',
            tips: '是否默认显示popover',
            belongGroup: 'display'
        },
        'multiple-mode': {
            type: 'string',
            val: 'default',
            options: ['default', 'tag'],
            displayName: '多选展示方式',
            tips: '多选展示方式',
            belongGroup: 'selection'
        },
        'tag-theme': {
            type: 'string',
            val: 'info',
            options: ['success', 'info', 'warning', 'danger'],
            displayName: '多选标签主题',
            tips: '标签主题',
            belongGroup: 'tag'
        },
        behavior: {
            type: 'string',
            options: ['normal', 'simplicity'],
            val: 'normal',
            displayName: '设置简约风格式',
            tips: '设置simplicity为简约风格',
            belongGroup: 'style'
        },
        'collapse-tags': {
            type: 'boolean',
            val: false,
            displayName: '选中值是否文字展示',
            tips: '当以标签形式显示选择结果时，是否合并溢出的结果以数字显示',
            belongGroup: 'tag'
        },
        'auto-height': {
            type: 'boolean',
            val: true,
            displayName: '下拉时是否自动展开所有标签',
            tips: 'collapseTags模式下，聚焦时自动展开所有Tag',
            belongGroup: 'tag'
        },
        'no-data-text': {
            type: 'string',
            val: '暂无数据',
            displayName: '无数据时提示文案',
            tips: '空数据展示',
            belongGroup: 'tip'
        },
        'no-match-text': {
            type: 'string',
            val: '',
            displayName: '无匹配数据时提示文案',
            tips: '',
            belongGroup: 'tip'
        },
        'loading-text': {
            type: 'string',
            val: '正在加载...',
            displayName: '加载时提示文案',
            tips: '正在加载文案',
            belongGroup: 'tip'
        },
        placeholder: {
            type: 'string',
            val: '请选择',
            displayName: '空白时提示文案',
            tips: '未选择数据时的空白提示',
            belongGroup: 'tip'
        },
        'search-placeholder': {
            type: 'string',
            val: '',
            displayName: '搜索时空白提示文案',
            tips: '搜索框的空白提示',
            belongGroup: 'tip'
        },
        'select-all-text': {
            type: 'string',
            val: '',
            displayName: '全选文案',
            tips: '',
            belongGroup: 'tip'
        },
        'scroll-loading': {
            type: 'boolean',
            val: false,
            displayName: '是否滚动加载',
            belongGroup: 'scrollLoad'
        },
        'allow-create': {
            type: 'boolean',
            val: false,
            displayName: '是否用自定义选项',
            tips: '是否运行创建自定义选项',
            belongGroup: 'other'
        },
        'popover-options': {
            type: 'object',
            val: {},
            displayName: '透传popover属性',
            tips: 'popover属性',
            belongGroup: 'other'
        },
        'custom-content': {
            type: 'boolean',
            val: false,
            displayName: '是否自定义下列内容',
            tips: '是否自定义content内容',
            belongGroup: 'other'
        },
        'with-validate': {
            type: 'boolean',
            val: true,
            displayName: '值改变时触发字段校验规则',
            belongGroup: 'other'
        },
        'show-selected-icon': {
            type: 'boolean',
            val: true,
            displayName: '是否隐藏勾选的样式',
            tips: '多选时是否显示勾选ICON',
            belongGroup: 'style'
        },
        'input-search': {
            type: 'boolean',
            val: true,
            displayName: '搜索框跟下拉框是否共用',
            tips: '是否采用输入框支持搜索的方式',
            belongGroup: 'other'
        },
        'allow-empty-values': {
            type: 'array',
            val: [],
            displayName: 'options选项值是否允许为空',
            tips: '允许的空值作为options选项',
            belongGroup: 'other'
        },
        'auto-focus': {
            type: 'boolean',
            val: false,
            displayName: '是否自动聚焦下拉框',
            tips: '挂载的时候是否自动聚焦输入框',
            belongGroup: 'focus'
        },
        'keep-search-value': {
            type: 'boolean',
            val: false,
            displayName: '是否保留搜索内容',
            tips: '隐藏popover时是否保留搜索内容',
            belongGroup: 'other'
        },
        minHeight: {
            type: 'number',
            displayName: '下拉框最小高度',
            tips: '下拉框最小高度',
            belongGroup: 'style'
        },
        showAll: {
            type: 'boolean',
            val: false,
            displayName: '是否展示全部',
            tips: '是否展示全部',
            belongGroup: 'display'
        },
        allOptionId: {
            type: ['string', 'number'],
            displayName: '选项的ID',
            tips: 'showAll为true时，全部选项的ID',
            belongGroup: 'selection'
        },
        enableVirtualRender: {
            type: 'boolean',
            val: false,
            displayName: '是否启用虚拟滚动',
            tips: '是否启用虚拟滚动（只支持List模式，如果scrollHeight高度大于list数目，则不会开启）',
            belongGroup: 'virtualScroll'
        },
        disableFocusBehavior: {
            type: 'boolean',
            val: false,
            displayName: '是否禁用自动聚焦行为',
            tips: '是否禁用自动聚焦行为（每次点击options或者展示select会自动聚焦到搜索框，可关闭此属性禁用聚焦）',
            belongGroup: 'focus'
        },
        prefix: {
            type: 'string',
            displayName: '前缀',
            tips: '前缀',
            belongGroup: 'style'
        },
        selectedStyle: {
            type: 'string',
            options: ['checkbox', 'check'],
            val: 'check',
            displayName: '多选时ICON样式',
            tips: '多选时ICON样式',
            belongGroup: 'style'
        },
        filterOption: {
            type: ['boolean', 'function'],
            val: true,
            displayName: '是否根据输入项进行筛选',
            tips: '是否根据输入项进行筛选。当其为一个函数时，会接收searchValue和option两个参数，当option符合筛选条件时，应返回true，反之则返回false',
            belongGroup: 'search'
        },
        searchWithPinyin: {
            type: 'boolean',
            val: true,
            displayName: '是否开启拼音搜索',
            tips: '是否开启拼音搜索',
            belongGroup: 'search'
        },
        highlightKeyword: {
            type: 'boolean',
            val: false,
            displayName: '是否高亮搜索关键字',
            tips: '高亮搜索关键字',
            belongGroup: 'search'
        }
    },
    slots: {
        default: {
            name: ['bk-option'],
            type: ['list', 'select-remote', 'select-data-source'],
            displayName: '可选项',
            tips: '默认插槽，填写的数据需要是数组且每个元素需包含id和name字段',
            remoteValidate (data) {
                if (!Array.isArray(data)) return '返回值需要是数组'
            },
            keys: [
                { id: 'id', label: '值', tips: '选项的值，不填取 id 字段' },
                { id: 'name', label: '名称', tips: '选项展示的名称，不填取 name 字段' }
            ],
            val: [
                { id: 'option1', name: '爬山' },
                { id: 'option2', name: '跑步' },
                { id: 'option3', name: '打球' },
                { id: 'option4', name: '跳舞' },
                { id: 'option5', name: '健身' },
                { id: 'option6', name: '骑车' }
            ]
        }
    }
}
