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
    name: 'cascade',
    type: 'bk-cascader',
    displayName: '级联选框',
    icon: 'bk-drag-cascade-jilianxuankuang',
    group: '表单',
    order: 1,
    document: 'https://magicbox.bk.tencent.com/magicbox/3.0/cascader',
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
        { label: '数据源', value: 'data' },
        { label: '选中值', value: 'selectVal' },
        { label: '提示', value: 'tip' },
        { label: '交互', value: 'interaction' },
        { label: '多选', value: 'mulSelect' },
        { label: '状态', value: 'state' },
        { label: '显示', value: 'display' },
        { label: '搜索', value: 'search' },
        { label: '远程', value: 'remote' },
        { label: '样式', value: 'style' },
        { label: '其他', value: 'other' }
    ],
    props: {
        'model-value': {
            type: 'array',
            val: [],
            displayName: '当前被选中值',
            tips: '当前被选中的值，多选时配置一个二维数组，支持v-model双向绑定，v-model优先级更高',
            directive: 'v-model',
            belongGroup: 'selectVal'
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
        'id-key': {
            type: 'value-key-item',
            dataOrigin: 'list',
            val: 'id',
            displayName: '节点唯一id对应字段',
            tips: '列表id指定的key值，默认为id,若需要改为其他key值，在这里传入即可',
            belongGroup: 'data'
        },
        'name-key': {
            type: 'value-key-item',
            dataOrigin: 'list',
            val: 'name',
            displayName: '节点展示名称对应字段',
            tips: '列表name指定的key值，默认为name,若需要改为其他key值，在这里传入即可',
            belongGroup: 'data'
        },
        'children-key': {
            type: 'value-key-item',
            dataOrigin: 'list',
            val: 'children',
            displayName: '子节点列表对应字段',
            tips: '列表children子节点了列表指定的key值，默认为children,若需要改为其他key值，在这里传入即可',
            belongGroup: 'data'
        },
        multiple: {
            type: 'boolean',
            val: false,
            displayName: '是否多选',
            tips: '是否多选',
            belongGroup: 'mulSelect'
        },
        filterable: {
            type: 'boolean',
            val: false,
            displayName: '是否开启搜索',
            tips: '是否开启搜索',
            belongGroup: 'search'
        },
        'scroll-height': {
            type: ['number', 'string'],
            val: 216,
            displayName: '下拉列表滚动高度',
            tips: '下拉列表滚动高度',
            belongGroup: 'style'
        },
        'scroll-width': {
            type: ['number', 'string'],
            val: 200,
            displayName: '下拉列表的宽度',
            tips: '下拉列表的宽度',
            belongGroup: 'style'
        },
        clearable: {
            type: 'boolean',
            val: true,
            displayName: '是否允许清空',
            tips: '是否允许清空',
            belongGroup: 'state'
        },
        placeholder: {
            type: 'string',
            val: '请选择',
            displayName: '空值时提示文案',
            tips: '未选择数据时的占位',
            belongGroup: 'tip'
        },
        'check-any-level': {
            type: 'boolean',
            val: false,
            displayName: '是否允许选择任意一级',
            tips: '是否允许选择任意一级',
            belongGroup: 'other'
        },
        'show-complete-name': {
            type: 'boolean',
            val: true,
            displayName: '是否显示选中值的完整路径',
            tips: '输入框中是否显示选中值的完整路径',
            belongGroup: 'display'
        },
        separator: {
            type: 'string',
            val: '/',
            displayName: '选项分隔符',
            tips: '选项分隔符',
            belongGroup: 'display'
        },
        trigger: {
            type: 'string',
            options: ['click', 'hover'],
            val: 'click',
            displayName: '下拉框触发方式',
            tips: '触发方式',
            belongGroup: 'interaction'
        },
        'is-remote': {
            type: 'boolean',
            val: false,
            displayName: '动态加载list下拉项',
            tips: '可以根据所选的值动态获取下级菜单项',
            belongGroup: 'remote'
        },
        'remote-method': {
            type: 'function',
            val: '',
            displayName: '获取下拉项的方法',
            tips: '跟is-remote搭配使用， 注意返回数据格式要遵循list要求',
            belongGroup: 'remote'
        },
        'limit-one-line': {
            type: 'boolean',
            val: false,
            displayName: '是否行内显示',
            tips: '当为true时，选择的内容将会以Text的形式显示在一行',
            belongGroup: 'display'
        },
        filterMethod: {
            type: 'function',
            displayName: '搜索函数',
            tips: '自定义搜索函数，其中第一个参数是node，第二个参数是搜索的key，返回true则会命中搜索节点',
            belongGroup: 'search'
        },
        behavior: {
            type: 'string',
            options: ['simplicity', 'normal'],
            val: 'normal',
            displayName: '组件样式',
            tips: '组件样式，simplicity为简约样式，默认为normal',
            belongGroup: 'style'
        },
        collapseTags: {
            type: 'boolean',
            val: true,
            displayName: '多选是否折叠面板',
            tips: '多选是否折叠面板',
            belongGroup: 'mulSelect'
        },
        floatMode: {
            type: 'boolean',
            val: true,
            displayName: '多选是否开启漂浮模式',
            tips: '多选开启漂浮模式，开启漂浮模式展开选择框不会挤占下方空间',
            belongGroup: 'mulSelect'
        },
        customTextFillback: {
            type: 'function',
            displayName: '自定义text填充回调',
            tips: '自定义text填充回调,参数为{modelValue,nodes}返回自定义填充后的文本,返回值必须为string',
            belongGroup: 'other'
        },
        customTagsFillback: {
            type: 'function',
            displayName: '自定义多选时tags填充回调',
            tips: '自定义多选时tags填充回调,参数为{modelValue,nodes}返回自定义填充后的tag数据,返回值必须为数组string[]',
            belongGroup: 'mulSelect'
        },
        extCls: {
            type: 'string',
            displayName: '最外层元素样式类名',
            tips: '自定义样式',
            belongGroup: 'style'
        }
    }
}
