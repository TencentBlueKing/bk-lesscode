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
    name: 'table',
    type: 'widget-bk-table',
    displayName: '表格',
    icon: 'bk-drag-table',
    group: '数据',
    order: 1,
    document: 'https://magicbox.bk.tencent.com/magicbox/3.0/table',
    events: [
        {
            name: 'select',
            tips: '当用户手动勾选数据行的 Checkbox 时调用该事件函数，事件回调参数 (selection: Array, row: Object)',
            functionTemplates: [
                {
                    funcName: 'handleSelect',
                    funcParams: ['selection', 'row'],
                    funcBody: '// 可以使用 selection 和 row 进行业务操作\nconsole.log(selection, row)\n'
                }
            ]
        },
        {
            name: 'select-all',
            tips: '当用户手动勾选全选 Checkbox 时调用该事件函数，事件回调参数 (selection: Array)'
        },
        {
            name: 'selection-change',
            tips: '当选择项发生变化时调用该事件函数，事件回调参数 (selection: Array)'
        },
        
        {
            name: 'cell-click',
            tips: '当某个单元格被点击时调用该事件函数，事件回调参数 (row: Object, column: Object, cell: Object, event: Event)'
        },
        {
            name: 'cell-dblclick',
            tips: '当某个单元格被双击击时调用该事件函数，事件回调参数 (row: Object, column: Object, cell: Object, event: Event)'
        },
        {
            name: 'row-click',
            tips: '当某一行被点击时调用该事件函数，事件回调参数 (row: Object, event: Event, column: Object)'
        },
        {
            name: 'row-dblclick',
            tips: '当某一行被双击时调用该事件函数，事件回调参数 (row: Object, event: Event)'
        },
        {
            name: 'column-pick',
            tips: '当表格的选中一列的时候会触发该事件,(prop column-pick启用)'
        },
        {
            name: 'column-sort',
            tips: '当表格的排序条件发生变化的时候会触发该事件，回调参数（{ column, index, type }）'
        },
        {
            name: 'column-filter',
            tips: '当表格的筛选条件发生变化的时候会触发该事件'
        },
        {
            name: 'col-filter-save'
        },
        {
            name: 'row-expand',
            tips: '当用户对某一行展开或者关闭的时候会触发该事件，回调参数（{ row, column, index, rows, e }）'
        },
        {
            name: 'page-limit-change',
            tips: '当用户切换表格每页显示条数时会出发的事件'
        },
        {
            name: 'page-value-change',
            tips: '当用户切换表格分页时会触发的事件'
        },
        {
            name: 'setting-change',
            tips: '表格设置发生变化时的事件'
        },
        {
            name: 'scroll-bottom',
            tips: '滚动到底部触发事件'
        },
        {
            name: 'click',
            tips: '当被点击时会触发该事件'
        },
        {
            name: 'dblclick'
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
        data: {
            type: ['array', 'remote', 'table-data-source'],
            remoteValidate (data) {
                if (!Array.isArray(data)) return '返回值需要是数组'
            },
            val: [
                { prop1: '1-1', prop2: '1-2', prop3: '1-3' },
                { prop1: '2-1', prop2: '2-2', prop3: '2-3' },
                { prop1: '3-1', prop2: '3-2', prop3: '3-3' }
            ],
            displayName: '表格数据',
            tips: '显示的数据'
        },
        'column-pick': {
            type: 'string',
            options: ['multi', 'single', 'disabled'],
            val: 'disabled',
            displayName: '列选中方式',
            tips: '表格列选中方式,支持'
        },
        pagination: {
            type: 'pagination',
            val: {
                current: 1,
                count: 3,
                limit: 10,
                'show-limit': true,
                'show-total-count': true
            },
            displayName: '表格数据分页',
            tips: ''
                + '设置分页信息<br>'
                + 'show-total-count: 是否展示总数<br>'
                + 'count: 总数据量<br>'
                + 'showLimit: 是否显示每页显示条数控件<br>'
                + 'limit: 每页显示条数<br>'
                + 'current: 当前页码，正整数<br>'
        },
        height: {
            type: ['string', 'number'],
            val: 'auto',
            displayName: '表格容器高度',
            tips: '设置表格高度,auto 根据行数自动填充高度, 100%，依赖初始化时父级容器高度'
        },
        'min-height': {
            type: ['string', 'number'],
            val: 'auto',
            displayName: '表格容器最小高度',
            tips: '设置表格最小高度'
        },
        // rowHeight: {
        //     type: ['number', 'function'],
        //     val: 42,
        //     tips: '行高，可以为固定数值类型, 可以是函数，返回当前行的高度，返回值为数值类型'
        // },
        // headHeight: {
        //     type: 'number',
        //     val: 42,
        //     tips: 'Thead行高，可以为固定数值类型'
        // },
        'max-height': {
            type: ['string', 'number'],
            val: 'auto',
            displayName: '表格容器最大高度',
            tips: '设置表格最大高度'
        },
        'virtual-enabled': {
            type: 'boolean',
            val: false,
            displayName: '是否启用虚拟渲染和滚动',
            tips: '是否启用虚拟渲染 & 滚动, 当数据量很大时，启用虚拟渲染可以解决压面卡顿问题'
        },
        border: {
            type: 'array',
            options: ['none', 'row', 'col', 'outer', 'horizontal'],
            val: 'row',
            displayName: '是否有边框',
            tips: '是否带有边框'
        },
        'outer-border': {
            type: 'boolean',
            val: false,
            displayName: '是否有外边框',
            tips: '是否带有外边框'
        },
        settings: {
            type: ['boolean', 'object'],
            val: false,
            displayName: '表格行高、显示列等设置',
            tips: 'bk-table-setting-content,用于设置表格行高、显示列...，详细参考ISettings'
        },
        'row-class': {
            type: ['string', 'object', 'function'],
            val: '',
            displayName: '行样式设置',
            tips: '行的 class 的回调方法，也可以使用一个固定的 Object 为所有行设置一样的 Style'
        },
        'row-style': {
            type: ['string', 'object', 'function'],
            val: '',
            displayName: '行内置样式',
            tips: '行的 style 的回调方法，也可以使用一个固定的 Object 为所有行设置一样的 Style'
        },
        'cell-class': {
            type: ['string', 'object', 'function'],
            val: '',
            displayName: '单元格类样式',
            tips: '单元格的 className 的回调方法，也可以使用字符串为所有单元格设置一个固定的 className'
        },
        'scroll-loading': {
            type: ['boolean', 'object'],
            val: false,
            displayName: '表格底部加载',
            tips: '表格底部loading加载效果，可以配合表格scroll-bottom事件使用, 详细配置可参考bk-loading组件'
        },
        'show-overflow-tooltip': {
            type: 'boolean',
            val: false,
            displayName: '文字过长时鼠标悬浮提示内容',
            tips: '表格cell内容超长时，是否自动展示tooltip，默认值为false，可以通过设置为true开启，如果需要自定义content请设置为对象，具体参考 IOverflowTooltip（此处配置整个table都启用，单个column配置可覆盖）'
        },
        'row-hover': {
            type: 'string',
            options: ['highlight', 'auto'],
            val: 'highlight',
            displayName: '鼠标悬浮时行样式',
            tips: '鼠标划过行样式行为,配置`highlight`会高亮当前行，`auto`自行设置样式'
        },
        'is-row-select-enable': {
            type: ['boolean', 'function'],
            val: true,
            displayName: '勾选框是否可用',
            tips: '配合 column selection 使用用于配置渲染行数据的勾选框是否可用, 可以直接为 true|false，全部启用或者禁用如果是函数，则返回 true|false({ row, index, isCheckAll }) => boolean'
        },
        'resizer-way': {
            type: 'string',
            options: ['debounce', 'throttle'],
            val: 'debounce',
            displayName: '尺寸改变时table重新计算方式',
            tips: '当外层容器尺寸改变时，当前组件用什么方式进行重新计算,默认为 throttle，按照指定频率重新计算,可选值：debounce，在指定时间范围内只执行一次重新计算'
        },
        'observer-resize': {
            type: 'boolean',
            val: true,
            tips: ''
        },
        'show-head': {
            type: 'boolean',
            val: true,
            displayName: '是否显示表头',
            tips: '是否显示表头'
        },
        'empty-text': {
            type: 'string',
            val: '暂无数据',
            displayName: '空数据时提示文案',
            tips: '空数据展示'
        }
    },
    slots: {
        default: {
            name: ['bk-table-column'],
            type: ['table-list', 'remote'],
            displayName: '表头',
            keys: [
                { id: 'label', label: '名称', tips: '从数据中获取名称的字段key，不填取 label 字段' },
                { id: 'field', label: '字段名', tips: '从数据中获取字段名的字段key，不填取 prop 字段' }
            ],
            val: [
                { label: '第一列', prop: 'prop1', sortable: false, type: '' },
                { label: '第二列', prop: 'prop2', sortable: false, type: '' },
                { label: '第三列', prop: 'prop3', sortable: false, type: '' }
            ]
        }
    }
}
