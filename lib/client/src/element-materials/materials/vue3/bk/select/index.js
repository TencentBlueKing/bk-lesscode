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
            name: 'selected',
            tips: '选择列表时调用该事件函数，多选时，回调参数均为数组(value: String | Number | Array, option: Object | Array)'
        },
        {
            name: 'toggle',
            tips: '下拉框展开或收起时调用该事件函数，回调参数(status: Boolean)'
        },
        {
            name: 'change',
            tips: '选项发生变化时调用该事件函数，回调参数(newValue: String | Number | Array, oldValue: String | Number | Array)'
        },
        {
            name: 'clear',
            tips: '清空已选项时调用该事件函数，回调参数(oldValue: String | Number | Array)'
        },
        {
            name: 'tab-remove',
            tips: '删除tab时调用该事件函数，回调参数(options: Array)'
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
    props: {
        modelValue: {
            type: ['string', 'array', 'number'],
            // defaultValList: ['sss', [1, 2, 3], 3],
            val: '',
            tips: '当前被选中的值',
            directive: 'v-model'
        },
        multiple: {
            type: 'boolean',
            val: false,
            tips: '是否多选'
        },
        disabled: {
            type: 'boolean',
            val: false
        },
        szie: {
            type: 'string',
            options: ['small', 'large', 'default'],
            val: 'default'
        },
        clearable: {
            type: 'boolean',
            val: true,
            tips: '是否允许清空'
        },
        loading: {
            type: 'boolean',
            val: false,
            tips: '是否加载中'
        },
        filterable: {
            type: 'boolean',
            val: false,
            tips: '是否支持搜索'
        },
        remoteMethod: {
            type: 'function',
            val: '',
            tips: '远程函数'
        },
        scrollHeight: {
            type: 'number',
            val: 200,
            tips: '下拉列表滚动高度'
        },
        showSelectAll: {
            type: 'boolean',
            val: false,
            tips: '是否显示全选选项，仅当开启multiple时生效'
        },
        popoverMinWidth: {
            type: 'number',
            val: 0,
            tips: '设置下拉列表的最小宽度, 默认的列表宽度跟组件保持一致'
        },
        showOnInit: {
            type: 'boolean',
            val: false,
            tips: '是否默认显示popover'
        },
        multipleMode: {
            type: 'string',
            val: 'default',
            options: ['default', 'tag'],
            tips: '多选展示方式'
        },
        tagTheme: {
            type: 'string',
            val: 'info',
            options: ['success', 'info', 'warning', 'danger'],
            tips: '标签主题'
        },
        behavior: {
            type: 'string',
            options: ['normal', 'simplicity'],
            val: 'normal',
            tips: '设置simplicity为简约风格'
        },
        collapseTags: {
            type: 'boolean',
            val: false,
            tips: '当以标签形式显示选择结果时，是否合并溢出的结果以数字显示'
        },
        autoHeight: {
            type: 'boolean',
            val: true,
            tips: 'collapseTags模式下，聚焦时自动展开所有Tag'
        },
        noDataText: {
            type: 'string',
            val: '暂无数据',
            tips: '空数据展示'
        },
        noMatchText: {
            type: 'string',
            val: '',
            tips: ''
        },
        loadingText: {
            type: 'string',
            val: '正在加载...',
            tips: '正在加载文案'
        },
        placeholder: {
            type: 'string',
            val: '请选择',
            tips: '未选择数据时的空白提示'
        },
        searchPlaceholder: {
            type: 'string',
            val: '',
            tips: '搜索框的空白提示'
        },
        selectAllText: {
            type: 'string',
            val: '',
            tips: ''
        },
        scrollLoading: {
            type: 'boolean',
            val: false
        },
        allowCreate: {
            type: 'boolean',
            val: false,
            tips: '是否运行创建自定义选项'
        },
        popoverOptions: {
            type: 'object',
            val: {},
            tips: 'popover属性'
        },
        customContent: {
            type: 'boolean',
            val: false,
            tips: '是否自定义content内容'
        },
        withValidate: {
            type: 'boolean',
            val: true
        },
        showSelectedIcon: {
            type: 'boolean',
            val: true,
            tips: '多选时是否显示勾选ICON'
        },
        inputSearch: {
            type: 'boolean',
            val: true,
            tips: '是否采用输入框支持搜索的方式'
        },
        allowEmptyValues: {
            type: 'array',
            val: [],
            tips: '允许的空值作为options选项'
        },
        autoFocus: {
            type: 'boolean',
            val: false,
            tips: '挂载的时候是否自动聚焦输入框'
        },
        keepSearchValue: {
            type: 'boolean',
            val: false,
            tips: '隐藏popover时是否保留搜索内容'
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
