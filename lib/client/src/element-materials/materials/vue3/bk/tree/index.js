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
    name: 'tree',
    type: 'bk-tree',
    displayName: '树',
    icon: 'bk-drag-tree',
    group: '数据',
    order: 1,
    document: 'https://magicbox.bk.tencent.com/magicbox/3.0/tree',
    events: [
        {
            name: 'node-click',
            tips: '节点点击时调用该事件函数，事件回调参数 (node: Object)'
        },
        {
            name: 'node-collapse',
            tips: '节点收起事件'
        },
        {
            name: 'node-expand',
            tips: '节点展开事件'
        },
        {
            name: 'node-drag-start',
            tips: '节点拖拽开始事件'
        },
        {
            name: 'node-drag-over',
            tips: '节点拖拽经过事件'
        },
        {
            name: 'node-drag-leave',
            tips: '节点拖拽离开事件'
        },
        {
            name: 'node-drop',
            tips: '节点拖拽释放事件'
        },
        {
            name: 'node-checked',
            tips: '多选框 chang 时调用该事件函数（单选时不生效），事件回调参数 (node: Object)'
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
            type: ['array', 'remote'],
            remoteValidate (data) {
                if (!Array.isArray(data)) return '返回值需要是数组'
            },
            val: [
                {
                    name: 'tree node1',
                    title: 'tree node1',
                    expanded: true,
                    children: [
                        {
                            name: 'tree node 1-1',
                            title: 'tree node 1-1'
                        },
                        {
                            name: 'tree node 1-2',
                            title: 'tree node 1-2'
                        }
                    ]
                }, {
                    name: 'tree node2',
                    title: 'tree node2'
                }
            ],
            tips: 'tree 数据源'
        },
        label: {
            type: 'string',
            val: 'name',
            tips: '指定节点标签为节点对象的某个属性值'
        },
        children: {
            type: 'string',
            val: 'children',
            tips: '子节点 Key, 用于读取子节点'
        },
        indent: {
            type: 'number',
            val: 18,
            tips: '相邻级节点间的水平缩进，单位为像素'
        },
        lineHeight: {
            type: 'number',
            val: 32,
            tips: '设置行高'
        },
        levelLine: {
            type: ['boolean', 'function', 'string'],
            val: false,
            tips: '设置层级连线, 可通过true|false设置默认开启|关闭，也可以直接设置`1px dashed #c3cdd7`自定义样式，或者设置为回调函数，动态设置'
        },
        virtualRender: {
            type: 'boolean',
            val: false,
            tips: '是否开启虚拟滚动, 默认虚拟滚动是开启的，数据量大的情况下有利于性能优化，可以通过设置 virtualRender = false 关闭虚拟滚动'
        },
        prefixIcon: {
            type: ['boolean', 'function', 'string'],
            val: true,
            tips: '当前节点标识图标, 通过 true | false，设置是否显示，如果需要自定义则配置为函数，返回VNode'
        },
        async: {
            type: 'object',
            val: {
                callback: undefined,
                cache: true,
                deepAutoOpen: 'once'
            },
            tips: '异步加载节点数据配置,详情请参考 IAsync配置'
        },
        offsetLeft: {
            type: 'number',
            val: 5,
            tips: '每个节点偏移左侧距离'
        },
        search: {
            type: ['boolean', 'function', 'string'],
            val: '',
            tips: '搜索配置,可以为一个配置项 SearchOption, 或者直接为一个字符串|数值|布尔值，如此则模糊匹配此值'
        },
        emptyText: {
            type: 'string',
            val: '暂无数据',
            tips: '空数据展示'
        },
        draggable: {
            type: 'boolean',
            val: false,
            tips: '是否允许节点拖拽'
        },
        disableDrag: {
            type: 'function',
            val: () => {},
            tips: '节点是否禁用作为拖拽开启元素'
        },
        disableDrop: {
            type: 'function',
            val: () => {},
            tips: '节点是否禁用作为拖拽结束位置元素'
        },
        dragSort: {
            type: 'boolean',
            val: false,
            tips: '节点拖拽时可交换位置（开启拖拽可交换位置后将不支持改变层级）'
        },
        selectable: {
            type: ['boolean', 'function'],
            val: true,
            tips: '节点是否可以选中'
        },
        disabledFolderSelectable: {
            type: 'boolean',
            val: false,
            tips: '是否禁用非最后叶子节点的可选择配置'
        },
        showCheckbox: {
            type: 'boolean',
            val: false,
            tips: '是否支持多选'
        },
        showNodeTypeIcon: {
            type: 'boolean',
            val: true,
            tips: '是否显示节点类型Icon'
        },
        selected: {
            type: 'object',
            val: '',
            tips: '默认选中的节点id(如果设置了node-key)或者节点对象，selectable为false时无效'
        },
        autoCheckChildren: {
            type: 'boolean',
            val: true,
            tips: '仅对 type=selection 的列有效，类型为 Boolean，为 true 则会在数据更新之后保留之前选中的展开收起操作（需指定 row-是否自动检查当前节点是否有子节点, 节点前面的展开收起Icon会根据判定值做改变.如果需要自已控制，请设置为false'
        },
        autoOpenParentNode: {
            type: 'boolean',
            val: true,
            tips: '如果设置了某一个叶子节点状态为展开，是否自动展开所有父级节点,默认为true，如果设置为false，则每层状态需要自己控制'
        },
        expandAll: {
            type: 'boolean',
            val: false,
            tips: '默认是否展开所有节点'
        },
        nodeContentAction: {
            type: 'array',
            options: ['click', 'selected', 'expand', 'collapse'],
            val: ['selected', 'expand', 'click'],
            tips: '节点内容点击行为，此处配置每个节点除了展开收起箭头之外的内容块时的行为.默认为 [\'selected\', \'expand\', \'click\']，点击内容块为选中当前节点, 如果要禁用所有行为，请设置为空数组 []'
        }
    }
}
