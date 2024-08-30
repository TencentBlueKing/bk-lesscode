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
        },
        stripe: {
            type: 'boolean',
            val: false,
            displayName: '是否为斑马纹Table',
            tips: '是否为斑马纹Table'
        },
        activeColumn: {
            type: ['number', 'array'],
            displayName: '当前选中列',
            tips: '当前选中列,当设置选中多列时（columnPick=multi），配置为数组[index1,index2,index3]，只能选中单列时，可以为数值或者数组[index]'
        },
        rowHeight: {
            type: ['number', 'function'],
            displayName: '行高',
            tips: '行高，可以为固定数值类型,可以是函数，返回当前行的高度，返回值为数值类型'
        },
        headHeight: {
            type: 'number',
            displayName: 'Thead行高',
            tips: 'Thead行高，可以为固定数值类型'
        },
        thead: {
            type: 'object',
            displayName: '表头配置',
            tips: '表头配置，详细参考IHead，如果同时配置了thead和head-height、show-head，thead优先级最高，会覆盖其他配置'
        },
        remotePagination: {
            type: 'boolean',
            val: false,
            displayName: '是否启用远程分页',
            tips: '是否启用远程分页'
        },
        emptyCellText: {
            type: 'string',
            displayName: '单元格空数据内容',
            tips: '单元格数据为空展示'
        },
        align: {
            type: 'string',
            options: ['left', 'center', 'right'],
            displayName: '单元格对齐方式',
            tips: '表格单元格对齐方式'
        },
        headerAlign: {
            type: 'string',
            options: ['left', 'center', 'right'],
            displayName: '表头对齐方式',
            tips: '表头对齐方式'
        },
        cellStyle: {
            type: ['string', 'object', 'function'],
            displayName: '单元格的style',
            tips: '单元格的style的回调方法，也可以使用一个固定的Object为所有单元格设置一样的Style'
        },
        reserveExpand: {
            type: 'boolean',
            val: false,
            displayName: '是否保留之前展开的状态',
            tips: '仅对type=selection的列有效，类型为Boolean，为true则会在数据更新之后保留之前选中的展开收起操作（需指定row-key）'
        },
        rowKey: {
            type: ['string', 'function'],
            displayName: '行数据的Key',
            tips: '行数据的Key，用来优化Table的渲染。此key用于渲染tablerow的key，便于大数据渲染时的性能优化。在使用reserve-selection,reserve-expand功能的情况下，该属性是必填的。类型为String时，支持多层访问：user.info.id，同时支持user.info[0].id'
        },
        selectionKey: {
            type: 'string',
            displayName: '选中的key',
            tips: '仅对设置了selection的情况下生效,用于初始化或者更新row已选中状态,内部使用逻辑为：row[selectionKey]，可以为多级选择，但是多级选择只支持row.child.child，更多请参考lodash.get'
        },
        checked: {
            type: 'array',
            displayName: '默认选中行',
            tips: '*默认选中行*仅对设置了selection的情况下生效*值可以为[key1,key2,key3,...]或者[row1,row2,row3,...]*如果设置为key，则selectionKey必须设置，内部匹配逻辑为：row[selectionKey]===key'
        },
        isSelectedFn: {
            type: 'function',
            displayName: '判定当前行是否选中',
            tips: '提供自定义判定当前行是否选中,如果设置了此属性，其他判定均不生效,({row,index,isSelectAll})=>bool'
        },
        asyncData: {
            type: 'boolean',
            val: false,
            displayName: '是否修改转入表格的data',
            tips: '为避免不必要的数据修改导致的不可控组件更新,默认组件不会对传入组件的data进行任何修改,设置此属性为true则会对源数据进行同步（如：启用selection，勾选时想要自动同步到源数据）,目前只会对指定了selectionKey的情况下才会对指定的字段数据进行更新，同时需要指定rowKey，保证匹配到的row是正确的目标对象'
        },
        defaultSort: {
            type: 'object',
            displayName: '配置默认的排序顺序',
            tips: '如果只指定了prop,没有指定order,则默认顺序是asc,配置格式：{column:order}'
        },
        paginationHeihgt: {
            type: 'number',
            val: 42,
            displayName: '页组件高度',
            tips: '页组件高度。在设置了分页配置之后才会生效,用于配置分页组件的高度，在不同项目中，分页组件高度会影响表格高度计算,这里设置为可配置项，避免自计算导致的性能问题以及不确定性样式问题'
        },
        // prependStyle: {
        //     type: 'cssproperties',
        //     options: ['--'],
        //     val: '{}',
        //     displayName: '*插入至表格第一行之前的内容容器样式，默认样式为固定在第一行，需要跟随滚动或者其他样式，可以通过此配置进行覆盖',
        //     tips: '*插入至表格第一行之前的内容容器样式，默认样式为固定在第一行，需要跟随滚动或者其他样式，可以通过此配置进行覆盖'
        // },
        colSortBehavior: {
            type: 'string',
            options: ['independent', 'interdependent'],
            val: 'independent',
            displayName: '列排序行为',
            tips: '*列排序行为*independent：列与列之间的排序是独立的，互斥的*interdependent：列排序是相互影响、依赖的'
        },
        rowDraggable: {
            type: ['boolean', 'function', 'object'],
            displayName: '开启行拖拽排序功能',
            tips: '开启行拖拽排序功能；设置true，渲染默认排序样式；设置(row,column,index,rows)=>JSX.Element,自定义拖拽单元格，设置对象，参考IDraggableRowOption，可以设置显示label，fontSize，icon，render'
        },
        sortValFormat: {
            type: 'array',
            displayName: '排序时对需要排序的字符串数值进行格式化',
            tips: '*排序时对需要排序的字符串数值进行格式化*这里需要配置为正则或者回调函数，(str)=>string|number|boolean*如果配置为正则，程序会提取匹配到的第一个结果尝试转换为数值,正则必须包含分组,例如/(d+)%/会提取到第一个结果并尝试转换为数字*如果为多个，程序会顺序执行所有正则表达式，直到转换成功'
        },
        shiftMultiChecked: {
            type: 'boolean',
            val: false,
            displayName: '是否开启shift键多选功能',
            tips: '是否开启shift键多选功能'
        },
        scrollbar: {
            type: 'boolean',
            val: true,
            displayName: '是否启用自定义滚动条',
            tips: '是否启用自定义滚动条，默认开启自定义滚动条，实现不同环境下面一致的用户体验,注意：如果禁用，会自动启用系统默认滚动条，表格会有8px的占位，以防止滚动条出现时内容出现抖动,可以通过样式覆盖设置overflow:auto;实现按需展示'
        }
        // fixedBottom: {
        //     type: 'fixedbottomoption | null',
        //     options: ['{\n          position: 'absolute' | 'relative';\n          height: number;\n          loading?: boolean;\n        }'],
        //     val: 'null',
        //     displayName: '固定在底部的配置项',
        //     tips: '固定在底部的配置项'
        // },
        // isEmptyCell: {
        //     type: '["", undefined, null] | ({ celltext, row, column }) => boolean',
        //     options: ['--'],
        //     val: '["", undefined, null]',
        //     displayName: '/***判定单元格是否为空*支持数组：判定条件为arr.some(item=>item===cellText)*支持函数回调：返回结果为true|false，({cellText,row,column})=>boolean*/',
        //     tips: '/***判定单元格是否为空*支持数组：判定条件为arr.some(item=>item===cellText)*支持函数回调：返回结果为true|false，({cellText,row,column})=>boolean*/'
        // }
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
