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
    name: 'search-select',
    type: 'bk-search-select',
    displayName: '查询选择',
    icon: 'bk-drag-search',
    group: '表单',
    order: 1,
    document: 'https://magicbox.bk.tencent.com/static_api/v3/components_vue/2.0/example/index.html#/search-select',
    events: [
        {
            displayName: '父列表显示',
            name: 'show-menu',
            tips: '父列表显示时调用该事件函数，事件回调参数 (menuInstance: Object)'
        },
        {
            displayName: '输入',
            name: 'input-change',
            tips: '当用户输入时调用该事件函数，事件回调参数 (event: Event)'
        },
        {
            displayName: '剪切内容',
            name: 'input-cut',
            tips: '当用户剪切内容时调用该事件函数，事件回调参数 (event: Event)'
        },
        {
            displayName: '点击文本框',
            name: 'input-click',
            tips: '当用户点击input时调用该事件函数，事件回调参数 (event: Event)'
        },
        {
            displayName: '单元格聚焦',
            name: 'input-focus',
            tips: '当单元格获取焦点时调用该事件函数，事件回调参数 (event: Event)'
        },
        {
            displayName: '选择父列表项',
            name: 'menu-select',
            tips: '当选择父列表项时调用该事件函数，事件回调参数 (item: Object, index: Number)'
        },
        {
            displayName: '选择子列表项',
            name: 'menu-child-select',
            tips: '当选择子列表项时调用该事件函数，事件回调参数 (item: Object, index: Number)'
        },
        {
            displayName: '输入内容发生变化',
            name: 'change',
            tips: '当输入内容发生变化时调用该事件函数，按下回车时调用，事件回调参数 (list: Array)'
        },
        {
            displayName: '按下delete键',
            name: 'key-delete',
            tips: '当用户键入delete删除时会调用该事件函数，事件回调参数 (item: Object)'
        },
        {
            displayName: '按下Enter键',
            name: 'key-enter',
            tips: '当用户键入enter删除时会调用该事件函数，事件回调参数 (event: Event)'
        },
        {
            displayName: '选中子项',
            name: 'child-checked',
            tips: '当用户选中子项时调用该事件函数，事件回调参数 (item: Object, index: Number, checked: Boolean)'
        },
        {
            displayName: '点击清空图标',
            name: 'clear',
            tips: '当用户点击清空时调用该事件函数，事件回调参数 (event: Event)'
        },
        {
            displayName: '点击搜索图标',
            name: 'search',
            tips: '当用户点击搜索图标时调用该事件函数，事件回调参数 (event: Event)'
        },
        {
            displayName: '单元格失焦',
            name: 'input-click-outside',
            tips: '当单元格失去焦点时触发该事件'
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
        display: 'block'
    },
    directives: [
        {
            type: 'v-model',
            prop: 'values'
        }
        // {
        //     type: 'v-bind',
        //     prop: 'data',
        //     format: 'variable',
        //     valueTypeInclude: ['array']
        // }
    ],
    groups: [
        { label: '数据源', value: 'dataSource' },
        { label: '查询条件', value: 'queryCondition' },
        { label: '提示', value: 'tip' },
        { label: '状态', value: 'state' },
        { label: '显示', value: 'display' },
        { label: '异步操作', value: 'remote' },
        { label: '过滤', value: 'filter' },
        { label: '样式', value: 'style' },
        { label: '其他', value: 'other' }
    ],
    props: {
        data: {
            type: ['array', 'remote'],
            remoteValidate (data) {
                if (!Array.isArray(data)) return '返回值需要是数组'
            },
            val: [
                {
                    name: '实例状态',
                    id: '1',
                    multiable: true,
                    children: [
                        { name: '创建中', id: '1-2' },
                        { name: '运行中', id: '1-3' },
                        { name: '已关机', id: '1-4' }
                    ]
                },
                {
                    name: '实例业务',
                    id: '2',
                    children: [
                        { name: '王者荣耀', id: '2-1' },
                        { name: '刺激战场', id: '2-2' },
                        { name: '绝地求生', id: '2-3' }
                    ]
                },
                { name: 'IP地址', id: '3' },
                { name: '实例名', id: '4' },
                { name: '实例地址', id: '5' },
                { name: '测试六', id: '6' }
            ],
            displayName: '显示数据',
            belongGroup: 'dataSource'
        },
        'display-key': {
            type: 'value-key-item',
            dataOrigin: 'data',
            displayName: '框内显示字段',
            tips: '显示的字段名称',
            belongGroup: 'dataSource'
        },
        'primary-key': {
            type: 'value-key-item',
            dataOrigin: 'data',
            displayName: '唯一标识字段',
            tips: '应用的唯一id字段名称',
            belongGroup: 'dataSource'
        },
        values: {
            type: 'array',
            val: [],
            displayName: '查询条件',
            tips: '选择中查询条件，支持v-model双向绑定，v-model优先级更高',
            belongGroup: 'queryCondition'
        },
        'split-code': {
            type: 'string',
            val: '|',
            displayName: '查询条件分隔符',
            tips: '查询条件分隔符',
            belongGroup: 'queryCondition'
        },
        'explain-code': {
            type: 'string',
            val: '|',
            displayName: '查询条件解释符',
            tips: '查询条件解释符',
            belongGroup: 'queryCondition'
        },
        placeholder: {
            type: 'string',
            val: '',
            displayName: '空值时提示文案',
            tips: '输入框空白提示',
            belongGroup: 'tip'
        },
        'empty-text': {
            type: 'string',
            val: '',
            displayName: '查询结果空白提示',
            tips: '包含键值得过滤查询查询时为空的提示',
            belongGroup: 'tip'
        },
        'max-height': {
            type: 'number',
            val: 120,
            displayName: '最大高度',
            belongGroup: 'style'
        },
        'min-height': {
            type: 'number',
            val: 32,
            displayName: '最小高度',
            belongGroup: 'style'
        },
        strink: {
            type: 'boolean',
            val: true,
            displayName: '是否伸缩input框',
            tips: '当输入条件过多超出input最小值时是否伸缩input框',
            belongGroup: 'other'
        },
        'show-delay': {
            type: 'number',
            val: 100,
            displayName: '列表弹窗动画延时时间',
            tips: '列表弹窗动画延时时间',
            belongGroup: 'other'
        },
        condition: {
            type: 'object',
            val: {},
            displayName: '查询条件的其他关系值',
            tips: '查询条件的其他关系值',
            belongGroup: 'queryCondition'
        },
        filter: {
            type: 'boolean',
            val: false,
            displayName: '是否过滤',
            tips: '是否过滤',
            belongGroup: 'filter'
        },
        'show-condition': {
            type: 'boolean',
            val: true,
            displayName: '是否显示条件选择',
            tips: '是否显示条件选择 （或）',
            belongGroup: 'display'
        },
        'key-delay': {
            type: 'number',
            val: 300,
            displayName: '输入和过滤的延时间隔',
            tips: '监听输入和过滤的延时间隔',
            belongGroup: 'filter'
        },
        readonly: {
            type: 'boolean',
            val: false,
            displayName: '是否只读',
            belongGroup: 'state'
        },
        'wrap-zindex': {
            type: 'string',
            val: '9',
            displayName: '搜索框层级高度',
            tips: '设置组件的层级高度',
            belongGroup: 'style'
        },
        'default-focus': {
            type: 'boolean',
            val: false,
            displayName: '是否获取焦点',
            tips: '组件初始化时是否获取焦点',
            belongGroup: 'state'
        },
        'input-type': {
            type: 'string',
            val: 'text',
            displayName: '输入框类型',
            tips: '输入框类型',
            belongGroup: 'other'
        },
        'selected-style': {
            type: 'string',
            options: ['check', 'checkbox'],
            val: 'check',
            displayName: '勾选模式',
            tips: '勾选模式',
            belongGroup: 'other'
        },
        'filter-children-method': {
            type: 'function',
            displayName: '过滤子列表方法',
            tips: '自定义过滤子列表的方法',
            belongGroup: 'filter'
        },
        'filter-menu-method': {
            type: 'function',
            displayName: '过滤父列表方法',
            tips: '自定义过滤父列表的方法',
            belongGroup: 'filter'
        },
        'remote-method': {
            type: 'function',
            displayName: '异步获取子列表的方法',
            tips: '自定义异步获取子列表的方法（必须有返回值，可返回 Promise 或者直接返回数据）',
            belongGroup: 'remote'
        },
        'remote-empty-text': {
            type: 'string',
            val: '暂无数据',
            displayName: '异步空子列表提示文本',
            tips: '自定义异步获取子列表为空显示',
            belongGroup: 'remote'
        },
        'remote-loading-text': {
            type: 'string',
            val: '加载中。。。',
            displayName: '异步加载提示文本',
            tips: '自定义异步获取子列表时loading显示',
            belongGroup: 'remote'
        },
        'popover-zindex': {
            type: 'number',
            val: 999,
            displayName: '下拉列表的层级高度',
            tips: '设置下拉列表的层级高度',
            belongGroup: 'style'
        },
        'show-popover-tag-change': {
            type: 'boolean',
            val: true,
            displayName: '是否显示一级子列表',
            tips: '生成或者删除标签时是否显示一级子列表',
            belongGroup: 'display'
        },
        clearable: {
            type: 'boolean',
            val: false,
            displayName: '是否允许清空',
            tips: '是否允许清空',
            belongGroup: 'state'
        },
        'validate-message': {
            type: 'string',
            displayName: '校验提示文本',
            tips: '校验提示文本',
            belongGroup: 'tip'
        },
        'input-unfocus-clear': {
            type: 'boolean',
            val: false,
            displayName: '失焦时是否清除内容',
            tips: '当单元格失去焦点时是否清除输入框的内容',
            belongGroup: 'state'
        },
        'ext-cls': {
            type: 'string',
            displayName: '最外层元素的类名',
            tips: '配置自定义样式类名，传入的类会被加在组件最外层的 DOM .search-select-wrap 上',
            belongGroup: 'style'
        }
    }
}
