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
    name: 'cascade',
    type: 'bk-cascade',
    displayName: '级联选框',
    icon: 'bk-drag-cascade-jilianxuankuang',
    group: '表单',
    order: 1,
    document: 'https://magicbox.bk.tencent.com/static_api/v3/components_vue/2.0/example/index.html#/cascade',
    events: [
        {
            displayName: '下拉框展开或收起',
            name: 'toggle',
            tips: '下拉框展开或收起时调用该事件函数，参数为(isOpen: Boolean)'
        },
        {
            displayName: '选项发生变化',
            name: 'change',
            tips: '选项发生变化时调用该事件函数，参数为(newValue: String | Number, oldValue: String | Number, selectList: Array)'
        },
        {
            displayName: '清空选项',
            name: 'clear',
            tips: '清空选项时调用该事件函数，参数为(oldValue: String | Number)'
        },
        {
            displayName: '搜索输入',
            name: 'search',
            tips: '搜索输入时调用该事件函数，参数为(search: String, event: Event)'
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
        { label: '数据源', value: 'data' },
        { label: '选择', value: 'selection' },
        { label: '提示', value: 'tip' },
        { label: '交互', value: 'interaction' },
        { label: '状态', value: 'state' },
        { label: '显示', value: 'display' },
        { label: '搜索', value: 'search' },
        { label: '远程', value: 'remote' },
        { label: '样式', value: 'style' },
        { label: '其他', value: 'other' }
    ],
    props: {
        value: {
            type: 'array',
            val: [{
                id: 'hunan',
                name: '湖南',
                children: [
                    {
                        id: 'changsha',
                        name: '长沙'
                    },
                    {
                        id: 'yueyang',
                        name: '岳阳'
                    }
                ]
            }, {
                id: 'guangxi',
                name: '广西'
            }, {
                id: 'yunnan',
                name: '云南',
                children: [
                    {
                        id: 'kunming',
                        name: '昆明',
                        children: [
                            {
                                id: 'wuhuaqu',
                                name: '五华区'
                            },
                            {
                                id: 'guanduqu',
                                name: '官渡区'
                            },
                            {
                                id: 'xishanqu',
                                name: '西山区'
                            }
                        ]
                    },
                    {
                        id: 'dali',
                        name: '大理'
                    }
                ]
            }],
            displayName: '当前被选中值',
            tips: '当前被选中的值，多选时配置一个二维数组，支持v-model双向绑定，v-model优先级更高',
            belongGroup: 'selection'
        },
        list: {
            type: ['array', 'remote'],
            remoteValidate (data) {
                if (!Array.isArray(data)) return '返回值需要是数组'
            },
            val: [{
                id: 'hunan',
                name: '湖南',
                children: [
                    {
                        id: 'changsha',
                        name: '长沙'
                    },
                    {
                        id: 'yueyang',
                        name: '岳阳'
                    }
                ]
            }, {
                id: 'guangxi',
                name: '广西'
            }, {
                id: 'yunnan',
                name: '云南',
                children: [
                    {
                        id: 'kunming',
                        name: '昆明',
                        children: [
                            {
                                id: 'wuhuaqu',
                                name: '五华区'
                            },
                            {
                                id: 'guanduqu',
                                name: '官渡区'
                            },
                            {
                                id: 'xishanqu',
                                name: '西山区'
                            }
                        ]
                    },
                    {
                        id: 'dali',
                        name: '大理'
                    }
                ]
            }],
            displayName: '可选项数据源',
            tips: '可选项数据源',
            belongGroup: 'data'
        },
        options: {
            type: 'value-key-options',
            dataOrigin: 'list',
            keys: [
                { id: 'id', label: 'idKey', type: 'tag-input', tips: '选项的id取值，不填取 id 字段' },
                { id: 'name', label: 'nameKey', type: 'tag-input', tips: '选项的name取值,不填取 name 字段' },
                { id: 'children', label: 'childrenKey', type: 'tag-input', tips: '选项的children取值,不填取 children 字段' }
            ],
            val: {
                idKey: 'id',
                nameKey: 'name',
                childrenKey: 'children'
            },
            displayName: '配置项',
            tips: '配置项',
            belongGroup: 'data'
        },
        multiple: {
            type: 'boolean',
            val: false,
            displayName: '是否多选',
            tips: '是否多选',
            belongGroup: 'selection'
        },
        'scroll-height': {
            type: 'number',
            val: 216,
            displayName: '下拉列表滚动高度',
            tips: '下拉列表滚动高度',
            belongGroup: 'style'
        },
        'scroll-width': {
            type: 'number',
            val: 160,
            displayName: '下拉列表的宽度',
            tips: '下拉列表的宽度',
            belongGroup: 'style'
        },
        disabled: {
            type: 'boolean',
            val: false,
            displayName: '是否禁用',
            tips: '是否禁用',
            belongGroup: 'state'
        },
        clearable: {
            type: 'boolean',
            val: false,
            displayName: '是否允许清空',
            tips: '是否允许清空',
            belongGroup: 'state'
        },
        'check-any-level': {
            type: 'boolean',
            val: false,
            displayName: '是否允许选择任意一级',
            tips: '是否允许选择任意一级',
            belongGroup: 'selection'
        },
        filterable: {
            type: 'boolean',
            val: false,
            displayName: '是否允许快捷搜索',
            tips: '是否允许快捷搜索',
            belongGroup: 'search'
        },
        'show-complete-name': {
            type: 'boolean',
            val: true,
            displayName: '是否显示选中值的完整路径',
            tips: '输入框中是否显示选中值的完整路径',
            belongGroup: 'display'
        },
        'separator': {
            type: 'string',
            val: '/',
            displayName: '选项分隔符',
            tips: '选项分隔符',
            belongGroup: 'display'
        },
        'trigger': {
            type: 'string',
            options: ['click', 'hover'],
            val: 'click',
            displayName: '下拉框触发方式',
            tips: '触发子菜单模式',
            belongGroup: 'interaction'
        },
        placeholder: {
            type: 'string',
            val: '请选择',
            displayName: '未选择数据时的占位',
            tips: '未选择数据时的占位',
            belongGroup: 'tip'
        },
        limitOneLine: {
            type: 'boolean',
            val: false,
            displayName: '限制是否只显示一行',
            tips: '限制是否只显示一行，当显示为一行时，单个选项不允许删除。（仅当multiple为true时生效）',
            belongGroup: 'display'
        },
        remoteMethod: {
            type: 'function',
            displayName: '远程搜索方法',
            tips: '远程搜索方法，具体配置看样例使用',
            belongGroup: 'remote'
        },
        isRemote: {
            type: 'boolean',
            val: false,
            displayName: '是否开启远程加载',
            tips: '开启远程加载，搭配remote-method一起使用',
            belongGroup: 'remote'
        },
        popoverOptions: {
            type: 'object',
            displayName: '配置popover组件的tippyOptions选项',
            tips: '透传至下拉列表所在的popover组件的tippyOptions选项',
            belongGroup: 'other'
        },
        extPopoverCls: {
            type: 'string',
            displayName: '最外层元素的类名',
            tips: '配置自定义样式类名，传入的类会被加在下拉菜单的DOM.bk-cascade-dropdown-content上',
            belongGroup: 'style'
        },
        maxWidth: {
            type: 'number',
            displayName: '弹出框最大宽度',
            tips: '可以通过max-width设置弹出框最大宽度，通过弹出层滚动，避免弹出层级太多导致的样式问题',
            belongGroup: 'style'
        }
    }
}
