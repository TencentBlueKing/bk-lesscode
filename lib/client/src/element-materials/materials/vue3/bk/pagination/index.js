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
    name: 'pagination',
    type: 'bk-pagination',
    displayName: '分页',
    icon: 'bk-drag-pagination',
    group: '数据',
    order: 1,
    document: 'https://magicbox.bk.tencent.com/magicbox/3.0/pagination',
    events: [
        {
            name: 'change',
            tips: '当前页码变化时调用该事件函数，事件回调参数 (current: Number)',
            functionTemplates: [
                {
                    funcName: 'handlePageChange',
                    funcParams: ['current'],
                    funcBody: '// 先记录当前页码。下面的 lesscode[\'${prop:current}\'] 可以替换为绑定在分页组件 current 属性上的变量\n'
                    + 'lesscode[\'${prop:current}\'] = current\n'
                    + '// 请求接口获取最新的分页数据。下面的 url 替换为接口地址，参数根据接口进行修改\n'
                    + 'this.$http.get(\'url\', { params: { page: lesscode[\'${prop:current}\'], pageSize: lesscode[\'${prop:limit}\'] } }).then((data) => {\n'
                    + '    // 将接口返回的数据，赋值给绑定在 table 组件 data 属性的变量，table 就会自动展示新一页的数据。lesscode[\'${prop:tableData}\'] 为绑定在 data 属性上的变量\n'
                    + '    lesscode[\'${prop:tableData}\'] = data.list\n'
                    + '    // 记录总数，分页组件内部计算页码和总页数使用。lesscode[\'${prop:count}\'] 为绑定在 count 属性上的变量\n'
                    + '    lesscode[\'${prop:count}\'] = data.count\n'
                    + '})\n'
                }
            ]
        },
        {
            name: 'limit-change',
            tips: '当前分页尺寸变化时调用该事件函数，事件回调参数 (limit: Number)',
            functionTemplates: [
                {
                    funcName: 'handleLimitChange',
                    funcParams: ['limit'],
                    funcBody: '// 先记录当前页码。下面的 lesscode[\'${prop:limit}\'] 可以替换为绑定在分页组件 limit 属性上的变量\n'
                    + 'lesscode[\'${prop:limit}\'] = limit\n'
                    + '// 请求接口获取最新的分页数据。下面的 url 替换为接口地址，参数根据接口进行修改\n'
                    + 'this.$http.get(\'url\', { params: { page: lesscode[\'${prop:current}\'], pageSize: lesscode[\'${prop:limit}\'] } }).then((data) => {\n'
                    + '    // 将接口返回的数据，赋值给绑定在 table 组件 data 属性的变量，table 就会自动展示新一页的数据。lesscode[\'${prop:tableData}\'] 为绑定在 data 属性上的变量\n'
                    + '    lesscode[\'${prop:tableData}\'] = data.list\n'
                    + '    // 记录总数，分页组件内部计算页码和总页数使用。lesscode[\'${prop:count}\'] 为绑定在 count 属性上的变量\n'
                    + '    lesscode[\'${prop:count}\'] = data.count\n'
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
    renderStyles: {
    },
    directives: [
        {
            type: 'v-model',
            prop: 'modelValue'
        }
    ],
    props: {
        modelValue: {
            type: 'number',
            val: 1,
            tips: '当前页码'
        },
        count: {
            type: 'number',
            val: 0,
            tips: '总数据量'
        },
        // current: {
        //     // 添加 vModel 配置之后，表示此属性需要写入 data 中，然后在模板中通过 data 中的变量来引用
        //     type: 'number',
        //     val: 1,
        //     tips: '当前页码，正整数，支持.sync修饰符',
        //     modifiers: ['sync']
        // },
        limit: {
            type: 'number',
            val: 10,
            tips: '每页显示条数(须存在于limit-list中)'
        },
        limitList: {
            type: 'array',
            val: [10, 20, 50, 100],
            tips: '每页显示条数可选项列表'
        },
        showLimit: {
            type: 'boolean',
            val: true,
            tips: '是否显示每页显示条数控件'
        },
        showTotalCount: {
            type: 'boolean',
            val: false,
            tips: '是否显示总计'
        },
        prevText: {
            type: 'string',
            val: '上一页',
            tips: '上一页按钮文案'
        },
        nextText: {
            type: 'string',
            val: '下一页',
            tips: '下一页按钮文案'
        },
        disabled: {
            type: 'boolean',
            val: false,
            tips: '是否禁用'
        },
        location: {
            type: 'string',
            options: ['left', 'right'],
            val: 'right',
            tips: '每页显示条数控件位置'
        },
        align: {
            type: 'string',
            options: ['left', 'center', 'right'],
            val: 'left',
            tips: '分页控件位置，优先级高于location'
        },
        beforeChange: {
            type: 'function',
            val: () => {},
            tips: '值改变时的回调函数'
        },
        layout: {
            type: 'array',
            val: ['total', 'list', 'limit']
        },
        type: {
            type: 'string',
            options: ['default', 'compact'],
            val: 'default',
            tips: '组件外观类型'
        },
        size: {
            type: 'string',
            options: ['small', 'default', 'large'],
            val: 'default',
            tips: '页码尺寸大小'
        },
        small: {
            type: 'boolean',
            val: false,
            tips: '小型分页'
        }
    }
}