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
    type: 'bk-cascader',
    displayName: '级联选框',
    icon: 'bk-drag-cascade-jilianxuankuang',
    group: '表单',
    order: 1,
    document: 'https://magicbox.bk.tencent.com/magicbox/3.0/cascader',
    events: [
        {
            name: 'toggle',
            tips: '下拉框展开或收起时调用该事件函数，参数为(isOpen: Boolean)'
        },
        {
            name: 'change',
            tips: '选项发生变化时调用该事件函数，参数为(newValue: String | Number, oldValue: String | Number, selectList: Array)'
        },
        {
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
    props: {
        'model-value': {
            type: 'array',
            val: [],
            displayName: '当前被选中值',
            tips: '当前被选中的值，支持v-model，多选时配置一个二维数组',
            directive: 'v-model'
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
            tips: '可选项数据源'
        },
        'id-key': {
            type: 'value-key-item',
            dataOrigin: 'list',
            val: 'id',
            displayName: '节点唯一id对应字段',
            tips: '列表id指定的key值，默认为id,若需要改为其他key值，在这里传入即可'
        },
        'name-key': {
            type: 'value-key-item',
            dataOrigin: 'list',
            val: 'name',
            displayName: '节点展示名称对应字段',
            tips: '列表name指定的key值，默认为name,若需要改为其他key值，在这里传入即可'
        },
        'children-key': {
            type: 'value-key-item',
            dataOrigin: 'list',
            val: 'children',
            displayName: '子节点列表对应字段',
            tips: '列表children子节点了列表指定的key值，默认为children,若需要改为其他key值，在这里传入即可'
        },
        multiple: {
            type: 'boolean',
            val: false,
            displayName: '是否多选',
            tips: '是否多选'
        },
        filterable: {
            type: 'boolean',
            val: false,
            displayName: '是否开启搜索',
            tips: '是否开启搜索'
        },
        
        'scroll-height': {
            type: ['number', 'string'],
            val: 216,
            displayName: '下拉列表滚动高度',
            tips: '下拉列表滚动高度'
        },
        'scroll-width': {
            type: ['number', 'string'],
            val: 200,
            displayName: '下拉列表的宽度',
            tips: '下拉列表的宽度'
        },
        // disabled: {
        //     type: 'boolean',
        //     val: false,
        //     tips: '是否禁用'
        // },
        clearable: {
            type: 'boolean',
            val: true,
            displayName: '是否允许清空',
            tips: '是否允许清空'
        },
        placeholder: {
            type: 'string',
            val: '请选择',
            displayName: '空值时提示文案',
            tips: '未选择数据时的占位'
        },
        'check-any-level': {
            type: 'boolean',
            val: false,
            displayName: '是否允许选择任意一级',
            tips: '是否允许选择任意一级'
        },
        'show-complete-name': {
            type: 'boolean',
            val: true,
            displayName: '是否显示选中值的完整路径',
            tips: '输入框中是否显示选中值的完整路径'
        },
        separator: {
            type: 'string',
            val: '/',
            displayName: '选项分隔符',
            tips: '选项分隔符'
        },
        trigger: {
            type: 'string',
            options: ['click', 'hover'],
            val: 'click',
            displayName: '下拉框触发方式',
            tips: '触发方式'
        },
        'is-remote': {
            type: 'boolean',
            val: false,
            displayName: '动态加载list下拉项',
            tips: '可以根据所选的值动态获取下级菜单项'
        },
        'remote-method': {
            type: 'function',
            val: '',
            displayName: '获取下拉项的方法',
            tips: '跟is-remote搭配使用， 注意返回数据格式要遵循list要求'
        },
        'limit-one-line': {
            type: 'boolean',
            val: false,
            displayName: '是否行内显示',
            tips: '当为ture时，选择的内容将会以Text的形式显示在一行'
        }
    }
}
