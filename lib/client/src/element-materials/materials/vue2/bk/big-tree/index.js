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
    name: 'big-tree',
    type: 'bk-big-tree',
    displayName: '大树',
    icon: 'bk-drag-bigtree',
    group: '数据',
    order: 1,
    document: 'https://magicbox.bk.tencent.com/static_api/v3/components_vue/2.0/example/index.html#/big-tree',
    events: [
        {
            displayName: '选中节点发生变化',
            name: 'select-change',
            tips: '选中的节点发生变化时调用该事件函数，事件回调参数 (treeNode: Object)'
        },
        {
            displayName: '复选节点发生变化',
            name: 'check-change',
            tips: '复选节点发生变化时调用该事件函数，事件回调参数 (id: String | Number | Array, checked: Boolean)'
        },
        {
            displayName: '展开/折叠节点',
            name: 'expand-change',
            tips: '展开/折叠节点时调用该事件函数，事件回调参数 (treeNode: Object)'
        },
        {
            displayName: '禁用/启用节点',
            name: 'disable-change',
            tips: '禁用/启用节点'
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
            type: ['array', 'remote'],
            remoteValidate (data) {
                if (!Array.isArray(data)) return '返回值需要是数组'
            },
            val: [
                {
                    id: 1,
                    name: 'tree node1',
                    children: [
                        {
                            id: 11,
                            name: 'tree node11'
                        },
                        {
                            id: 12,
                            name: 'tree node12'
                        }
                    ]
                },
                {
                    id: 2,
                    name: 'tree node2',
                    children: [
                        {
                            id: 21,
                            name: 'tree node21'
                        },
                        {
                            id: 22,
                            name: 'tree node22'
                        }
                    ]
                }
            ],
            displayName: '数据列表',
            tips: 'tree 数据源'
        },
        options: {
            type: 'value-key-options',
            dataOrigin: 'data',
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
            displayName: '内容配置项',
            tips: '配置项'
        },
        'show-checkbox': {
            type: 'boolean',
            val: false,
            displayName: '是否显示节点复选框',
            tips: '是否显示节点复选框'
        },
        'selectable': {
            type: 'boolean',
            val: true,
            displayName: '节点是否可以选中',
            tips: '节点是否可以选中'
        },
        'show-link-line': {
            type: 'boolean',
            val: false,
            displayName: '是否显示层级连线',
            tips: '是否显示层级连线'
        },
        size: {
            type: 'string',
            options: ['normal', 'small'],
            val: 'normal',
            displayName: '树的尺寸',
            tips: '树的尺寸'
        },
        checkStrictly: {
            type: 'boolean',
            val: true,
            displayName: '是否严格的遵循父子互相关联',
            tips: '在显示复选框的情况下，是否严格的遵循父子互相关联的做法'
        },
        checkOnlyAvailableStrictly: {
            type: 'boolean',
            val: false,
            displayName: '是否仅关联可用节点',
            tips: '在显示复选框且严格的遵循父子互相关联的情况下，是否仅关联可用节点(可用指非禁用且仍能在树结构中呈现)'
        },
        disableStrictly: {
            type: 'boolean',
            val: true,
            displayName: '是否严格的遵循子节点跟随当前节点一同变化',
            tips: '禁用/启用节点时，是否严格的遵循子节点跟随当前节点一同变化的做法'
        },
        expandIcon: {
            type: 'icon',
            displayName: '展开时的图标',
            tips: '展开时的图标'
        },
        collapseIcon: {
            type: 'icon',
            displayName: '折叠时的图标',
            tips: '折叠时的图标'
        },
        nodeIcon: {
            type: ['icon', 'function'],
            displayName: '节点的图标',
            tips: '节点的图标'
        },
        defaultExpandAll: {
            type: 'boolean',
            val: false,
            displayName: '默认展开全部节点',
            tips: '默认展开全部节点'
        },
        defaultExpandedNodes: {
            type: 'array',
            displayName: '默认展开的节点id集合',
            tips: '默认展开的节点id集合'
        },
        defaultCheckedNodes: {
            type: 'array',
            displayName: '默认勾选的节点id集合',
            tips: '默认勾选的节点id集合'
        },
        defaultSelectedNode: {
            type: ['string', 'number'],
            displayName: '默认选中的节点id',
            tips: '默认选中的节点id，selectable为false时无效'
        },
        beforeSelect: {
            type: 'function',
            displayName: '选中节点前的回调函数',
            tips: '选中节点前的回调函数，返回false时将终止后续的选中动作'
        },
        beforeCheck: {
            type: 'function',
            displayName: '复选节点前的回调函数',
            tips: '复选节点前的回调函数，返回false时将终止后续的复选动作'
        },
        expandOnClick: {
            type: 'boolean',
            val: true,
            displayName: '是否点击节点时展开/折叠',
            tips: '点击节点时展开/折叠'
        },
        checkOnClick: {
            type: 'boolean',
            val: false,
            displayName: '是否点击节点时复选/取消复选',
            tips: '点击节点时复选/取消复选'
        },
        filterMethod: {
            type: 'function',
            displayName: '筛选节点的方法',
            tips: '筛选节点的方法,默认按节点的名称进行筛选'
        },
        displayMatchedNodeDescendants: {
            type: 'boolean',
            val: false,
            displayName: '是否显示后代节点',
            tips: '筛选时，节点命中后，是否显示后代节点'
        },
        lazyMethod: {
            type: 'function',
            displayName: '异步加载子节点的方法',
            tips: '异步加载子节点的方法，返回的数据格式为{data:childData/[childData],leaf:[childId]}，仅支持加载一层，如果需要手动阻止继续加载下一层级，可在leaf字段中写入不继续加载的节点的id'
        },
        lazyDisabled: {
            type: ['function', 'boolean'],
            displayName: '是否禁用异步加载节点',
            tips: '是否禁用异步加载节点，当配置了lazy-method后如果一些节点明确不需要进行异步加载可通过此属性配置'
        },
        loadingClass: {
            type: 'string',
            val: 'node-loading',
            displayName: '节点处于异步加载子节点时的类名',
            tips: '节点处于异步加载子节点时的类名'
        },
        nodeWidth: {
            type: ['string', 'number'],
            displayName: '节点宽度',
            tips: '节点宽度(px)，设定该值后，将动态判断是否应用宽度'
        },
        extCls: {
            type: 'string',
            displayName: '最外层元素的类名',
            tips: '配置自定义样式类名，传入的类会被加在组件最外层的DOM.bk-big-tree上'
        },
        useDefaultEmpty: {
            type: 'boolean',
            val: false,
            displayName: '是否显示默认的无结果UI',
            tips: '无搜索结果时，是否显示默认的无结果UI,使用了empty插槽后此配置无效'
        },
        height: {
            type: 'number',
            displayName: '容器高度',
            tips: '容器高度，设置此属性可开启虚拟滚动，支持渲染大量数据'
        },
        nodeHeight: {
            type: 'number',
            val: 32,
            displayName: '单个节点的高度',
            tips: '单个节点的高度，用于虚拟滚动的数据计算'
        },
        configurable: {
            type: 'boolean',
            val: true,
            displayName: '数据是否不会响应',
            tips: '仅作为数据展示用时，可将此属性配置为false，从而节省渲染开销，但会导致数据失去响应式的能力'
        },
        padding: {
            type: 'number',
            val: 16,
            displayName: '节点左侧缩进的距离',
            tips: '节点左侧缩进的距离，默认为16'
        },
        enableTitleTip: {
            type: 'boolean',
            val: false,
            displayName: '是否开启节点tip提示',
            tips: '是否开启节点tip提示'
        }
    }
}
