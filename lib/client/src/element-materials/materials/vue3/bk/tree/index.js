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
            displayName: 'tree数据源',
            tips: 'tree 数据源'
        },
        label: {
            type: 'value-key-item',
            dataOrigin: 'data',
            val: 'name',
            displayName: '节点展示名称对应字段',
            tips: '指定节点标签为节点对象的某个属性值'
        },
        children: {
            type: 'value-key-item',
            dataOrigin: 'data',
            val: 'children',
            displayName: '子节点列表对应字段',
            tips: '子节点 Key, 用于读取子节点'
        },
        indent: {
            type: 'number',
            val: 18,
            displayName: '相邻级节点间的水平缩进',
            tips: '相邻级节点间的水平缩进，单位为像素'
        },
        'line-height': {
            type: 'number',
            val: 32,
            displayName: '设置行高',
            tips: '设置行高'
        },
        'level-line': {
            type: ['boolean', 'function', 'string'],
            val: false,
            displayName: '设置层级连线',
            tips: '设置层级连线, 可通过true|false设置默认开启|关闭，也可以直接设置`1px dashed #c3cdd7`自定义样式，或者设置为回调函数，动态设置'
        },
        'virtual-render': {
            type: 'boolean',
            val: false,
            displayName: '是否开启虚拟滚动',
            tips: '是否开启虚拟滚动, 默认虚拟滚动是开启的，数据量大的情况下有利于性能优化，可以通过设置 virtualRender = false 关闭虚拟滚动'
        },
        'prefix-icon': {
            type: ['boolean', 'function', 'string'],
            val: true,
            displayName: '节点标识图标',
            tips: '当前节点标识图标, 通过 true | false，设置是否显示，如果需要自定义则配置为函数，返回VNode'
        },
        async: {
            type: 'object',
            val: {
                callback: undefined,
                cache: true,
                deepAutoOpen: 'once'
            },
            displayName: '配置异步加载节点数据',
            tips: '异步加载节点数据配置,详情请参考 IAsync配置'
        },
        'offset-left': {
            type: 'number',
            val: 5,
            displayName: '节点左侧偏移距离',
            tips: '每个节点偏移左侧距离'
        },
        search: {
            type: ['boolean', 'function', 'string'],
            val: '',
            displayName: '配置搜索',
            tips: '搜索配置,可以为一个配置项 SearchOption, 或者直接为一个字符串|数值|布尔值，如此则模糊匹配此值'
        },
        'empty-text': {
            type: 'string',
            val: '暂无数据',
            displayName: '空数据时显示文案',
            tips: '空数据展示'
        },
        draggable: {
            type: 'boolean',
            val: false,
            displayName: '是否可节点拖拽',
            tips: '是否允许节点拖拽'
        },
        'disable-drag': {
            type: 'function',
            val: () => {},
            displayName: '是否禁用节点拖拽',
            tips: '节点是否禁用作为拖拽开启元素'
        },
        'disable-drop': {
            type: 'function',
            val: () => {},
            displayName: '是否禁用节点为拖放位置',
            tips: '节点是否禁用作为拖拽结束位置元素'
        },
        'drag-sort': {
            type: 'boolean',
            val: false,
            displayName: '是否可拖拽排序',
            tips: '节点拖拽时可交换位置（开启拖拽可交换位置后将不支持改变层级）'
        },
        selectable: {
            type: ['boolean', 'function'],
            val: true,
            displayName: '节点是否可选中',
            tips: '节点是否可以选中'
        },
        'disabled-folder-selectable': {
            type: 'boolean',
            val: false,
            displayName: '是否禁用非叶子节点可选择配置',
            tips: '是否禁用非最后叶子节点的可选择配置'
        },
        'show-checkbox': {
            type: 'boolean',
            val: false,
            displayName: '是否可多选',
            tips: '是否支持多选'
        },
        'show-node-type-icon': {
            type: 'boolean',
            val: true,
            displayName: '是否显示节点图标',
            tips: '是否显示节点类型Icon'
        },
        selected: {
            type: 'object',
            val: '',
            displayName: '配置选中节点数据',
            tips: '默认选中的节点id(如果设置了node-key)或者节点对象，selectable为false时无效'
        },
        'auto-check-children': {
            type: 'boolean',
            val: true,
            displayName: '是否检查子节点的存在',
            tips: '是否自动检查是否存在子节点，如果需要自动检查则设置为True，如无需检测，一直保持展开收起状态Icon则设置为False,如若需要自己动态控制，可以设置为回调函数，返回值为布尔类型'
        },
        'auto-open-parent-node': {
            type: 'boolean',
            val: true,
            displayName: '是否自动展开所有父节点',
            tips: '如果设置了某一个叶子节点状态为展开，是否自动展开所有父级节点,默认为true，如果设置为false，则每层状态需要自己控制'
        },
        'expand-all': {
            type: 'boolean',
            val: false,
            displayName: '是否展开所有节点',
            tips: '默认是否展开所有节点'
        },
        'node-content-action': {
            type: 'array',
            options: ['click', 'selected', 'expand', 'collapse'],
            val: ['selected', 'expand', 'click'],
            displayName: '节点内容点击行为',
            tips: '节点内容点击行为，此处配置每个节点除了展开收起箭头之外的内容块时的行为.默认为 [\'selected\', \'expand\', \'click\']，点击内容块为选中当前节点, 如果要禁用所有行为，请设置为空数组 []'
        }
    }
}
