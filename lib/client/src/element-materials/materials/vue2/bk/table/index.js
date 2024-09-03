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
            displayName: '表格数据',
            tips: '显示的数据'
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
            displayName: '表格容器高度',
            tips: 'Table 的高度，默认为自动高度。如果 height 为 Number 类型，单位 px；如果 height 为 String 类型，则这个高度会设置为 Table 的 style.height 的值，Table 的高度会受控于外部样式。'
        },
        'max-height': {
            type: ['string', 'number'],
            displayName: '表格容器最大高度'
        },
        stripe: {
            type: 'boolean',
            val: false,
            displayName: '是否为斑马纹表格',
            tips: '是否为斑马纹 Table'
        },
        border: {
            type: 'boolean',
            val: false,
            displayName: '是否有边框',
            tips: '是否带有边框'
        },
        'outer-border': {
            type: 'boolean',
            val: false,
            displayName: '是否有外边框',
            tips: '是否带有外边框'
        },
        'row-border': {
            type: 'boolean',
            val: true,
            displayName: '是否有横向边框',
            tips: '是否带有横向边框, 当 border 为 true 时，此属性设置无效'
        },
        'col-border': {
            type: 'boolean',
            val: false,
            displayName: '是否有纵向边框',
            tips: '是否带有纵向边框, 当 border 为 true 时，此属性设置无效'
        },
        size: {
            type: 'string',
            val: 'medium',
            options: ['small', 'medium', 'large'],
            displayName: '表格大小'
        },
        fit: {
            type: 'boolean',
            val: true,
            displayName: '是否自动撑开列宽',
            tips: '列的宽度是否自动撑开'
        },
        'row-auto-height': {
            type: 'boolean',
            val: false,
            displayName: '是否自动撑开行高',
            tips: '行的高度是否自动撑开'
        },
        'show-header': {
            type: 'boolean',
            val: true,
            displayName: '是否显示表头',
            tips: '是否显示表头'
        },
        'empty-text': {
            type: 'string',
            val: '暂无数据',
            displayName: '表格为空时提示文案',
            tips: '空数据时显示的文本内容，也可以通过 slot="empty" 设置'
        },
        'header-border': {
            type: 'boolean',
            val: false,
            displayName: '表头是否带有边框分割',
            tips: '表头是否带有边框分割'
        },
        'auto-scroll-to-top': {
            type: 'boolean',
            val: false,
            displayName: '表格是否自动滚动到顶部',
            tips: 'Table 分页变化时，表格是否自动滚动到顶部'
        },
        'highlight-current-row': {
            type: 'boolean',
            val: false,
            displayName: '是否高亮当前行',
            tips: '是否高亮当前行'
        },
        darkHeader: {
            type: 'boolean',
            val: false,
            displayName: '是否是深色表头模式',
            tips: '是否是深色表头模式'
        },
        customHeaderColor: {
            type: 'color',
            displayName: '自定义表头颜色',
            tips: '自定义表头颜色，设置了此选项后，dark-header将会失效'
        },
        customHeaderColorHover: {
            type: 'color',
            displayName: '自定义表头Hover的颜色',
            tips: '自定义表头Hover的颜色，设置了此选项后，dark-header将会失效'
        },
        rowClassName: {
            type: ['function', 'string'],
            displayName: '行的类名',
            tips: '行的className的回调方法，也可以使用字符串为所有行设置一个固定的className'
        },
        rowStyle: {
            type: ['function', 'object'],
            displayName: '行样式',
            tips: '行的style的回调方法，也可以使用一个固定的Object为所有行设置一样的Style'
        },
        cellClassName: {
            type: ['function', 'string'],
            displayName: '单元格的类名',
            tips: '单元格的className的回调方法，也可以使用字符串为所有单元格设置一个固定的className'
        },
        cellStyle: {
            type: ['function', 'object'],
            displayName: '单元格样式',
            tips: '单元格的style的回调方法，也可以使用一个固定的Object为所有单元格设置一样的Style'
        },
        cellAttributes: {
            type: ['function', 'object'],
            displayName: '单元格的DOM原生属性',
            tips: '单元格的DOM原生属性'
        },
        headerRowClassName: {
            type: ['function', 'string'],
            displayName: '表头行的类名',
            tips: '表头行的className的回调方法，也可以使用字符串为所有表头行设置一个固定的className'
        },
        headerRowStyle: {
            type: ['function', 'object'],
            displayName: '表头行样式',
            tips: '表头行的style的回调方法，也可以使用一个固定的Object为所有表头行设置一样的Style'
        },
        headerCellClassName: {
            type: ['function', 'string'],
            displayName: '表头单元格的类名',
            tips: '表头单元格的className的回调方法，也可以使用字符串为所有表头单元格设置一个固定的className'
        },
        headerCellStyle: {
            type: ['function', 'object'],
            displayName: '表头单元格样式',
            tips: '表头单元格的style的回调方法，也可以使用一个固定的Object为所有表头单元格设置一样的Style'
        },
        headerCellAttributes: {
            type: ['function', 'object'],
            displayName: '表头单元格的DOM原生属性',
            tips: '表头单元格的DOM原生属性'
        },
        rowKey: {
            type: ['function', 'string'],
            displayName: '行数据的Key',
            tips: '行数据的Key，用来优化Table的渲染；在使用reserve-selection功能的情况下，该属性是必填的。类型为String时，支持多层访问：user.info.id，但不支持user.info[0].id，此种情况请使用Function'
        },
        defaultExpandAll: {
            type: 'boolean',
            val: false,
            displayName: '是否默认展开所有行',
            tips: '是否默认展开所有行，当Table中存在type="expand"的Column的时候有效'
        },
        expandRowKeys: {
            type: 'array',
            displayName: '展开行的keys数组',
            tips: '可以通过该属性设置Table目前的展开行，需要设置row-key属性才能使用，该属性为展开行的keys数组'
        },
        defaultSort: {
            type: 'object',
            displayName: '默认的排序列的prop和顺序',
            tips: '默认的排序列的prop和顺序。它的prop属性指定默认的排序的列，order指定默认排序的顺序'
        },
        showSummary: {
            type: 'boolean',
            val: false,
            displayName: '是否在表尾显示合计行',
            tips: '是否在表尾显示合计行'
        },
        sumText: {
            type: 'string',
            displayName: '合计行第一列的文本',
            tips: '合计行第一列的文本'
        },
        summaryMethod: {
            type: 'function',
            displayName: '自定义的合计计算方法',
            tips: '自定义的合计计算方法'
        },
        spanMethod: {
            type: 'function',
            displayName: '合并行或列的计算方法',
            tips: '合并行或列的计算方法'
        },
        selectOnIndeterminate: {
            type: 'boolean',
            val: true,
            displayName: '是否选中所有行',
            tips: '在多选表格中，当仅有部分行被选中时，点击表头的多选框时的行为。若为true，则选中所有行；若为false，则取消选择所有行'
        },
        popoverOptions: {
            type: 'object',
            displayName: '配置tippyOptions选项',
            tips: '透传至翻页下拉列表所在的popover组件的tippyOptions选项'
        },
        scrollLoading: {
            type: 'object',
            val: { isLoading: false, size: 'mini', theme: 'info', icon: 'circle-2-1', placement: 'right' },
            displayName: '表格底部loading加载效果',
            tips: '表格底部loading加载效果，可以配合表格scroll-end事件使用，isLoading属性控制底部加载显隐。其余属性可参考spin组件'
        },
        extCls: {
            type: 'string',
            displayName: '最外层元素的类名',
            tips: '配置自定义样式类名，传入的类会被加在组件最外层的DOM.bk-table上'
        },
        virtualRender: {
            type: 'boolean',
            val: false,
            displayName: '是否开启虚拟滚动',
            tips: '内置的虚拟滚动配置，启用时需同时配置height属性'
        }
    },
    slots: {
        default: {
            name: ['bk-table-column'],
            type: ['table-list', 'remote'],
            displayName: '表头',
            keys: [
                { id: 'label', label: '名称', tips: '从函数返回数据中获取作为表头名称的字段key，不填则取key为label的字段' },
                { id: 'prop', label: '字段名', tips: '从函数返回数据中获取作为表头字段名的字段key，不填则取key为prop的字段' },
                { id: 'sortable', label: '全局排序', tips: '从函数返回数据中获取作为全局排序的字段key，不填则取key为sortable的字段' },
                { id: 'filterable', label: '全局过滤', tips: '从函数返回数据中获取作为全局过滤的字段key，不填则取key为filterable的字段' }
            ],
            val: [
                { label: '第一列', prop: 'prop1', sortable: false, filterable: false, type: '' },
                { label: '第二列', prop: 'prop2', sortable: false, filterable: false, type: '' },
                { label: '第三列', prop: 'prop3', sortable: false, filterable: true, type: '' }
            ]
        }
    }
}
