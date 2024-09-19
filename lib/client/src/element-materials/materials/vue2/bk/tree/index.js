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
    document: 'https://magicbox.bk.tencent.com/static_api/v3/components_vue/2.0/example/index.html#/tree',
    events: [
        {
            displayName: '节点点击',
            name: 'on-click',
            tips: '节点点击时调用该事件函数，事件回调参数 (node: Object)'
        },
        {
            displayName: '多选框变化',
            name: 'on-check',
            tips: '多选框 chang 时调用该事件函数（单选时不生效），事件回调参数 (node: Object)'
        },
        {
            displayName: '节点展开/收起',
            name: 'on-expanded',
            tips: '节点展开/收起时调用该事件函数，事件回调参数 (node: Object, expanded: Boolean)'
        },
        {
            displayName: '节点拖拽结束',
            name: 'on-drag-node',
            tips: '节点拖拽结束时调用该事件函数，事件回调参数 (dragNode: Object, targetNode: Object)'
        },
        {
            displayName: '异步加载节点数据',
            name: 'async-load-nodes',
            tips: '异步加载节点数据时调用该事件函数，事件回调参数 (node: Object)'
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
    groups: [
        { label: '数据', value: 'data' },
        { label: '显示', value: 'display' },
        { label: '拖拽', value: 'drag' },
        { label: '图标', value: 'icon' },
        { label: '样式', value: 'style' },
        { label: '其他', value: 'other' }
    ],
    props: {
        'node-key': {
            type: 'string',
            val: 'id',
            displayName: '唯一标识字段名',
            tips: '具有唯一标识的key值',
            belongGroup: 'data'
        },
        'show-icon': {
            type: 'boolean',
            val: true,
            displayName: '节点是否配置图标',
            tips: '节点是否可配置icon',
            belongGroup: 'icon'
        },
        multiple: {
            type: 'boolean',
            val: true,
            displayName: '是否可多选',
            tips: '单选/多选标识',
            belongGroup: 'other'
        },
        'has-border': {
            type: 'boolean',
            val: false,
            displayName: '是否显示边框',
            tips: '是否显示边框',
            belongGroup: 'display'
        },
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
                    id: 1,
                    children: [
                        {
                            name: 'tree node 1-1',
                            title: 'tree node 1-1',
                            id: 2
                        },
                        {
                            name: 'tree node 1-2',
                            title: 'tree node 1-2',
                            id: 3
                        }
                    ]
                }, {
                    name: 'tree node2',
                    title: 'tree node2',
                    id: 4
                }
            ],
            displayName: 'tree数据源',
            tips: 'tree 数据源',
            belongGroup: 'data'
        },
        draggable: {
            type: 'boolean',
            val: false,
            displayName: '节点是否可拖拽',
            tips: '节点是否可拖拽',
            belongGroup: 'drag'
        },
        dragSort: {
            type: 'boolean',
            val: false,
            displayName: '节点拖拽时可交换位置',
            tips: '节点拖拽时可交换位置（开启拖拽可交换位置后将不支持改变层级）',
            belongGroup: 'drag'
        },
        dragAfterExpanded: {
            type: 'boolean',
            val: true,
            displayName: '节点拖拽后是否展开',
            tips: '节点拖拽后是否展开',
            belongGroup: 'drag'
        },
        isDeleteRoot: {
            type: 'boolean',
            val: false,
            displayName: '是否可删除根节点',
            tips: '是否可删除根节点',
            belongGroup: 'other'
        },
        openedIcon: {
            type: 'icon',
            val: 'icon-folder-open',
            displayName: '父级节点展开全局icon',
            tips: '父级节点展开全局icon(优先级低于源数据中配置的icon)',
            belongGroup: 'icon'
        },
        closedIcon: {
            type: 'icon',
            val: 'icon-folder',
            displayName: '父级节点收起全局icon',
            tips: '父级节点收起全局icon(优先级低于源数据中配置的icon)',
            belongGroup: 'icon'
        },
        nodeIcon: {
            type: 'icon',
            val: 'icon-file',
            displayName: '子节点全局icon',
            tips: '子节点全局icon(优先级低于源数据中配置的icon)',
            belongGroup: 'icon'
        },
        tpl: {
            type: 'function',
            displayName: '自定义模板',
            tips: '自定义模板',
            belongGroup: 'other'
        },
        extCls: {
            type: 'string',
            displayName: '最外层元素的类名',
            tips: '配置自定义样式类名，传入的类会被加在组件最外层的DOM.bk-tree上',
            belongGroup: 'style'
        }
    }
}
