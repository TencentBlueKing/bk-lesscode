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
            name: 'selected',
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
            displayName: '清空选项',
            name: 'clear',
            tips: '清空已选项时调用该事件函数，回调参数(oldValue: String | Number | Array)'
        },
        {
            displayName: '多选时移除选中的tag',
            name: 'tab-remove',
            tips: '删除tab时调用该事件函数，回调参数(options: Array)'
        },
        {
            displayName: '滚动到底部时触发',
            name: 'scroll-end',
            tips: '下拉列表滚动到底部时触发（需enable-scroll-load为true）'
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
            prop: 'value'
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
        { label: '图标', value: 'icon' },
        { label: '搜索', value: 'search' },
        { label: '虚拟滚动', value: 'virtualScroll' },
        { label: '滚动加载', value: 'scrollLoad' },
        { label: '异步操作', value: 'remote' },
        { label: '样式', value: 'style' },
        { label: '其他', value: 'other' }
    ],
    props: {
        value: {
            type (renderProps) {
                return renderProps?.multiple?.renderValue ? 'array' : ['string', 'number']
            },
            // defaultValList: ['sss', [1, 2, 3], 3],
            displayName: '选中的值',
            tips: '当前被选中的值',
            belongGroup: 'value'
        },
        multiple: {
            type: 'boolean',
            val: false,
            displayName: '是否多选',
            tips: '是否多选',
            belongGroup: 'selection'
        },
        'show-select-all': {
            type: 'boolean',
            val: true,
            displayName: '是否显示全选选项',
            tips: '是否显示全选选项，仅当开启multiple时生效',
            belongGroup: 'selection'
        },
        'selected-style': {
            type: 'string',
            options: ['check', 'checkbox'],
            val: 'check',
            displayName: '勾选样式',
            tips: '多选时勾选样式',
            belongGroup: 'selection'
        },
        'scroll-height': {
            type: 'number',
            val: 216,
            displayName: '下拉列表滚动高度',
            tips: '下拉列表滚动高度',
            belongGroup: 'style'
        },
        placeholder: {
            type: 'string',
            val: '',
            displayName: '空值时提示文案',
            tips: '未选择数据时的空白提示',
            belongGroup: 'tip'
        },
        disabled: {
            type: 'boolean',
            val: false,
            displayName: '是否禁用',
            belongGroup: 'state'
        },
        readonly: {
            type: 'boolean',
            val: false,
            displayName: '是否只读',
            belongGroup: 'state'
        },
        loading: {
            type: 'boolean',
            val: false,
            displayName: '是否加载中状态',
            tips: '是否加载中',
            belongGroup: 'state'
        },
        clearable: {
            type: 'boolean',
            val: false,
            displayName: '是否允许清空',
            tips: '是否允许清空',
            belongGroup: 'state'
        },
        searchable: {
            type: 'boolean',
            val: false,
            displayName: '是否显示搜索框',
            tips: '是否显示搜索框',
            belongGroup: 'search'
        },
        behavior: {
            type: 'string',
            options: ['normal', 'simplicity'],
            val: 'normal',
            displayName: '显示风格设置',
            tips: '设置simplicity为简约风格',
            belongGroup: 'style'
        },
        'search-ignore-case': {
            type: 'boolean',
            val: false,
            displayName: '搜索时忽略大小写',
            tips: '搜索选项时是否忽略大小写',
            belongGroup: 'search'
        },
        'popover-min-width': {
            type: 'number',
            val: 0,
            displayName: '下拉列表最小宽度',
            tips: '设置下拉列表的最小宽度, 默认的列表宽度跟组件保持一致',
            belongGroup: 'style'
        },
        'popover-width': {
            type: 'number',
            val: 0,
            displayName: '下拉列表宽度',
            tips: '设置下拉列表的宽度, 默认的列表宽度跟组件保持一致',
            belongGroup: 'style'
        },
        'popover-options': {
            type: 'object',
            val: {},
            displayName: '透传popover属性',
            belongGroup: 'other'
        },
        'font-size': {
            type: 'string',
            val: '',
            displayName: '设置字体大小',
            tips: '设置下拉已选择及列表的字体大小',
            belongGroup: 'style'
        },
        'z-index': {
            type: 'number',
            val: 2500,
            displayName: 'zindex层级',
            tips: '弹出层的 z-index',
            belongGroup: 'style'
        },
        displayTag: {
            type: 'boolean',
            val: false,
            displayName: '是否值以标签的形式显示',
            tips: '是否将选择的结果以标签的形式显示，仅当开启multiple时生效',
            belongGroup: 'tag'
        },
        autoHeight: {
            type: 'boolean',
            val: true,
            displayName: '下拉框高度是否自动撑开',
            tips: '下拉框高度是否自动撑开，当开启display-tag时生效',
            belongGroup: 'tag'
        },
        isTagWidthLimit: {
            type: 'boolean',
            val: true,
            displayName: '是否对标签进行宽度限制',
            tips: '是否对标签进行宽度限制，超出显示...',
            belongGroup: 'tag'
        },
        collapseTag: {
            type: 'boolean',
            val: true,
            displayName: '是否合并溢出的结果以数字显示',
            tips: '当以标签形式显示选择结果时，是否合并溢出的结果以数字显示',
            belongGroup: 'tag'
        },
        allowCreate: {
            type: 'boolean',
            val: false,
            displayName: '是否允许自定义标签输入',
            tips: '是否允许自定义标签输入',
            belongGroup: 'tag'
        },
        allowEnter: {
            type: 'boolean',
            val: true,
            displayName: '是否允许按enter键',
            tips: '是否允许按enter键，根据搜索结果确定选择值',
            belongGroup: 'other'
        },
        size: {
            type: 'string',
            options: ['large', 'small'],
            displayName: '尺寸',
            tips: '尺寸',
            belongGroup: 'style'
        },
        searchableMinCount: {
            type: 'number',
            val: 0,
            displayName: '下拉列表数量大于等于该值时才显示搜索框',
            tips: '在显示搜索框的情况下，下拉列表数量大于等于该值时才显示搜索框',
            belongGroup: 'search'
        },
        remoteMethod: {
            type: 'function',
            displayName: '远程搜索方法',
            tips: '远程搜索方法（可返回Promise或者直接返回数据），函数的参数为搜索关键字',
            belongGroup: 'remote'
        },
        extCls: {
            type: 'string',
            displayName: '最外层元素的类名',
            tips: '配置自定义样式类名，传入的类会被加在组件最外层的DOM.bk-select上',
            belongGroup: 'style'
        },
        extPopoverCls: {
            type: 'string',
            displayName: '下拉框最外层元素的类名',
            tips: '配置自定义样式类名，传入的类会被加在下拉菜单的DOM.bk-select-dropdown-content上',
            belongGroup: 'style'
        },
        prefixIcon: {
            type: 'icon',
            displayName: '下拉选框前面的icon类名',
            tips: '配置在下拉选框前面的icon类名',
            belongGroup: 'icon'
        },
        searchPlaceholder: {
            type: 'string',
            val: '输入关键字搜索',
            displayName: '搜索框占位',
            tips: '搜索框占位',
            belongGroup: 'tip'
        },
        searchWithPinyin: {
            type: 'boolean',
            val: false,
            displayName: '搜索时是否中文转换为拼音搜索',
            tips: '搜索的时候是否加入中文转换为拼音搜索',
            belongGroup: 'search'
        },
        enableVirtualScroll: {
            type: 'boolean',
            val: false,
            displayName: '是否开启虚拟滚动',
            tips: '是否开启虚拟滚动',
            belongGroup: 'virtualScroll'
        },
        virtualScrollRender: {
            type: 'function',
            displayName: '虚拟渲染回调函数',
            tips: '虚拟滚动内容的render,参数分别为数据和createElement函数',
            belongGroup: 'virtualScroll'
        },
        list: {
            type: 'array',
            displayName: '数据列表',
            tips: '开启虚拟滚动的时候需要传入的数据列表',
            belongGroup: 'dataSource'
        },
        idKey: {
            type: 'string',
            val: 'id',
            displayName: '虚拟滚动数据id值',
            tips: '虚拟滚动数据，值的key值',
            belongGroup: 'dataSource'
        },
        displayKey: {
            type: 'string',
            val: 'name',
            displayName: '虚拟滚动数据key值',
            tips: '虚拟滚动数据，显示字段的key值',
            belongGroup: 'dataSource'
        },
        itemHeight: {
            type: 'number',
            val: 32,
            displayName: '虚拟滚动单行元素的高度',
            tips: '虚拟滚动单行元素的高度',
            belongGroup: 'virtualScroll'
        },
        showEmpty: {
            type: 'boolean',
            val: true,
            displayName: '是否展示空数据的提示',
            tips: '是否展示空数据的提示',
            belongGroup: 'display'
        },
        showOnInit: {
            type: 'boolean',
            val: false,
            displayName: '是否在初始化的时候展示下拉列表',
            tips: '是否在初始化的时候展示下拉列表',
            belongGroup: 'display'
        },
        enableScrollLoad: {
            type: 'boolean',
            val: false,
            displayName: '下拉列表是否支持滚动分页加载',
            tips: '下拉列表是否支持滚动分页加载，配合scroll-end事件使用',
            belongGroup: 'scrollLoad'
        },
        scrollLoading: {
            type: 'object',
            displayName: '配置滚动分页loading状态',
            tips: '滚动分页loading状态，同spin组件的配置一样',
            belongGroup: 'scrollLoad'
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
