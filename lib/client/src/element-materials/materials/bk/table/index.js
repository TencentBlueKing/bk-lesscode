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
    document: 'https://magicbox.bk.tencent.com/static_api/v3/components_vue/2.0/example/index.html#/table',
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
            name: 'cell-mouse-enter',
            tips: '当单元格 hover 进入时调用该事件函数，事件回调参数 (row: Object, column: Object, cell: Object, event: Event)'
        },
        {
            name: 'cell-mouse-leave',
            tips: '当单元格 hover 退出时调用该事件函数，事件回调参数 (row: Object, column: Object, cell: Object, event: Event)'
        },
        {
            name: 'row-mouse-enter',
            tips: '当表格行 hover 进入时调用该事件函数，事件回调参数 (index: Number, row: Object, event: Event)'
        },
        {
            name: 'row-mouse-leave',
            tips: '当表格行 hover 退出时调用该事件函数，事件回调参数 (index: Number, row: Object, event: Event)'
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
            name: 'row-contextmenu',
            tips: '当某一行被鼠标右键点击时调用该事件函数，事件回调参数 (row: Object, event: Event)'
        },
        {
            name: 'row-dblclick',
            tips: '当某一行被双击时调用该事件函数，事件回调参数 (row: Object, event: Event)'
        },
        {
            name: 'header-click',
            tips: '当某一列的表头被点击时调用该事件函数，事件回调参数 (column: Object, event: Event)'
        },
        {
            name: 'header-contextmenu',
            tips: '当某一列的表头被鼠标右键点击时调用该事件函数，事件回调参数 (column: Object, event: Event)'
        },
        {
            name: 'sort-change',
            tips: '当表格的排序条件发生变化时调用该事件函数，事件回调参数 (data: { column, prop, order })'
        },
        {
            name: 'filter-change',
            tips: '当表格的筛选条件发生变化时调用该事件函数，事件回调参数 (filters: { key, value })。参数对象的 key 是 column 的 columnKey，对应的 value 为用户选择的筛选条件的数组。'
        },
        {
            name: 'current-change',
            tips: '当表格的当前行发生变化时调用该事件函数，如果要高亮当前行，请打开表格的 highlight-current-row 属性，事件回调参数 (currentRow: Object, oldCurrentRow: Object)'
        },
        {
            name: 'header-dragend',
            tips: '当拖动表头改变了列的宽度时调用该事件函数，事件回调参数 (newWidth: Number, oldWidth: Number, column: Object, event: Event)'
        },
        {
            name: 'expand-change',
            tips: '当用户对某一行展开或者关闭时调用该事件函数，事件回调参数 (row: Object, expandedRows: Array)'
        },
        {
            name: 'page-change',
            tips: '当用户切换表格分页时调用该事件函数，事件回调参数 (newPage: Number)',
            functionTemplates: [
                {
                    funcName: 'handlePageChange',
                    funcParams: ['newPage'],
                    funcBody: '// 先记录当前页码。下面的 lesscode[\'${prop:tablePagination}\'] 可以替换为绑定在分页属性上的变量\n'
                    + 'lesscode[\'${prop:tablePagination}\'].current = newPage\n'
                    + '// 请求接口获取最新的分页数据。下面的 url 替换为接口地址，参数根据接口进行修改\n'
                    + 'this.$http.get(\'url\', { params: { page: lesscode[\'${prop:tablePagination}\'].current, pageSize: lesscode[\'${prop:tablePagination}\'].limit } }).then((data) => {\n'
                    + '    // 将接口返回的数据，赋值给绑定在 table 组件 data 属性的变量上，table 就会自动展示新一页的数据\n'
                    + '    lesscode[\'${prop:tableData}\'] = data.list\n'
                    + '    // 记录总数，分页组件内部计算页码和总页数使用\n'
                    + '    lesscode[\'${prop:tablePagination}\'].count = data.count\n'
                    + '})\n'
                }
            ]
        },
        {
            name: 'page-limit-change',
            tips: '当用户切换表格每页显示条数时调用该事件函数，事件回调参数 (limit: Number)',
            functionTemplates: [
                {
                    funcName: 'handlePageLimitChange',
                    funcParams: ['limit'],
                    funcBody: '// 先记录当前展示的数量。下面的 lesscode[\'${prop:tablePagination}\'] 可以替换为绑定在分页属性上的变量\n'
                    + 'lesscode[\'${prop:tablePagination}\'].limit = limit\n'
                    + '// 请求接口获取最新的分页数据。下面的 url 替换为接口地址，参数根据接口进行修改\n'
                    + 'this.$http.get(\'url\', { params: { page: lesscode[\'${prop:tablePagination}\'].current, pageSize: lesscode[\'${prop:tablePagination}\'].limit } }).then((data) => {\n'
                    + '    // 将接口返回的数据，赋值给绑定在 table 组件 data 属性的变量上，table 就会自动展示新一页的数据\n'
                    + '    lesscode[\'${prop:tableData}\'] = data\n'
                    + '    // 记录总数，分页组件内部计算页码和总页数使用\n'
                    + '    lesscode[\'${prop:tablePagination}\'].count = data.count\n'
                    + '})\n'
                }
            ]
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
        // {
        //     type: 'v-bind',
        //     prop: 'data',
        //     format: 'variable',
        //     valueTypeInclude: ['array']
        // }
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
            tips: '显示的数据',
            operation: {
                title: '操作',
                name: '更新表头',
                tips: '使用值覆盖表头的默认列，请确认后再操作',
                click (formData, syncSlot) {
                    syncSlot(formData)
                }
            }
        },
        'pagination': {
            type: 'pagination',
            val: {
                current: 1,
                count: 3,
                limit: 10,
                'show-limit': true,
                'show-total-count': true
            },
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
            tips: 'Table 的高度，默认为自动高度。如果 height 为 Number 类型，单位 px；如果 height 为 String 类型，则这个高度会设置为 Table 的 style.height 的值，Table 的高度会受控于外部样式。'
        },
        'max-height': {
            type: ['string', 'number']
        },
        stripe: {
            type: 'boolean',
            val: false,
            tips: '是否为斑马纹 Table'
        },
        border: {
            type: 'boolean',
            val: false,
            tips: '是否带有边框'
        },
        'outer-border': {
            type: 'boolean',
            val: false,
            tips: '是否带有外边框'
        },
        'row-border': {
            type: 'boolean',
            val: true,
            tips: '是否带有横向边框, 当 border 为 true 时，此属性设置无效'
        },
        'col-border': {
            type: 'boolean',
            val: false,
            tips: '是否带有纵向边框, 当 border 为 true 时，此属性设置无效'
        },
        size: {
            type: 'string',
            val: 'medium',
            options: ['small', 'medium', 'large']
        },
        fit: {
            type: 'boolean',
            val: true,
            tips: '列的宽度是否自动撑开'
        },
        'row-auto-height': {
            type: 'boolean',
            val: false,
            tips: '行的高度是否自动撑开'
        },
        'show-header': {
            type: 'boolean',
            val: true,
            tips: '是否显示表头'
        },
        'empty-text': {
            type: 'string',
            val: '暂无数据',
            tips: '空数据时显示的文本内容，也可以通过 slot="empty" 设置'
        },
        'header-border': {
            type: 'boolean',
            val: false,
            tips: '表头是否带有边框分割'
        },
        'auto-scroll-to-top': {
            type: 'boolean',
            val: false,
            tips: 'Table 分页变化时，表格是否自动滚动到顶部'
        },
        'highlight-current-row': {
            type: 'boolean',
            val: false,
            tips: '是否高亮当前行'
        }
    },
    slots: {
        default: {
            name: ['bk-table-column'],
            type: ['table-list', 'remote'],
            displayName: '表头',
            keys: [
                { id: 'label', label: '名称', tips: '从数据中获取名称的字段key，不填取 label 字段' },
                { id: 'prop', label: '字段名', tips: '从数据中获取字段名的字段key，不填取 prop 字段' },
                { id: 'sortable', label: '是否排序', tips: '从数据中获取是否排序的字段key，不填取 sortable 字段' },
                { id: 'filterable', label: '是否过滤', tips: '从数据中获取是否过滤的字段key，不填取 filterable 字段' }
            ],
            val: [
                { label: '第一列', prop: 'prop1', sortable: false, type: '' },
                { label: '第二列', prop: 'prop2', sortable: false, type: '' },
                { label: '第三列', prop: 'prop3', sortable: false, type: '' }
            ]
        }
    }
}
