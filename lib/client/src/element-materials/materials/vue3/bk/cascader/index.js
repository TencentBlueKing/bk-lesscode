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
            tips: '切换下拉折叠状态时调用, 回调参数为当前是否展开，参数为(isOpen: Boolean)'
        },
        {
            name: 'change',
            tips: '内容改变时触发，回调为当前所选内容，参数为(newValue: String | Number, oldValue: String | Number, selectList: Array)'
        },
        {
            name: 'clear',
            tips: '清空选项时调用, 回调参数为请空前的内容，参数为(oldValue: String | Number)'
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
            prop: 'modelValue'
        }
    ],
    props: {
        modelValue: {
            type: ['array', 'string', 'number'],
            val: [],
            tips: '当前被选中的值，支持v-model，多选时配置一个二维数组'
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
            tips: '可选项数据源'
        },
        multiple: {
            type: 'boolean',
            val: false,
            tips: '是否多选'
        },
        filterable: {
            type: 'boolean',
            val: false,
            tips: '是否开启搜索'
        },
        idKey: {
            type: 'string',
            val: 'id',
            tips: '列表id指定的key值，默认为id,若需要改为其他key值，在这里传入即可'
        },
        nameKey: {
            type: 'string',
            val: 'name',
            tips: '列表name指定的key值，默认为name,若需要改为其他key值，在这里传入即可'
        },
        childrenKey: {
            type: 'string',
            val: 'children',
            tips: '列表children子节点了列表指定的key值，默认为children,若需要改为其他key值，在这里传入即可'
        },
        scrollHeight: {
            type: ['string', 'number'],
            val: '216',
            tips: '下拉列表滚动高度'
        },
        scrollWidth: {
            type: 'number',
            val: 'auto',
            tips: '子版面的宽度'
        },
        disabled: {
            type: 'boolean',
            val: false,
            tips: '是否禁用'
        },
        clearable: {
            type: 'boolean',
            val: true,
            tips: '是否允许清空'
        },
        placeholder: {
            type: 'string',
            val: '请选择',
            tips: '未选择数据时的占位'
        },
        checkAnyLevel: {
            type: 'boolean',
            val: false,
            tips: '是否允许选择任意一级'
        },
        showCompleteName: {
            type: 'boolean',
            val: true,
            tips: '输入框中是否显示选中值的完整路径'
        },
        separator: {
            type: 'string',
            val: '/',
            tips: '选项分隔符'
        },
        trigger: {
            type: 'string',
            options: ['click', 'hover'],
            val: 'click',
            tips: '触发方式'
        },
        isRemote: {
            type: 'boolean',
            val: false,
            tips: '是否设置数据来源'
        },
        remoteMethod: {
            type: 'function',
            val: () => {},
            tips: '获取数据的函数'
        },
        limitOneLine: {
            type: 'boolean',
            val: false,
            tips: '是否限制一行'
        },
        extCls: {
            type: 'string',
            val: '',
            tips: '自定义样式'
        }
    }
}
