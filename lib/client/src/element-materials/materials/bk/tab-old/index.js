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
    name: 'tab',
    type: 'bk-tab',
    displayName: '选项卡',
    icon: 'bk-drag-tab',
    group: '导航',
    order: 1,
    document: 'https://magicbox.bk.tencent.com/static_api/v3/components_vue/2.0/example/index.html#/tab',
    events: [
        {
            name: 'tab-change',
            tips: '选项卡切换时调用该事件函数，事件回调参数 (name: String)',
            functionTemplates: [{
                funcName: 'handleTabChange',
                funcParams: ['tabName'],
                funcBody: '// 将选中 tab 的 name，赋值给 tab 组件的 active 属性的变量来记录当前选中的tab。lesscode[\'${prop:activeTab}\'] 可以替换成实际绑定的变量\nlesscode[\'${prop:activeTab}\'] = tabName\n'
            }]
        },
        {
            name: 'close-panel',
            tips: '关闭选项卡时调用该事件函数，事件回调参数 (index: Number, panel: Object)'
        },
        {
            name: 'add-panel',
            tips: '新增选项卡时调用该事件函数，暂无事件回调参数'
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
        active: {
            type: 'string',
            val: 'Tab-1',
            tips: '当前显示的选项卡名称',
            modifiers: ['sync']
        },
        type: {
            type: 'string',
            options: ['card', 'border-card', 'unborder-card'],
            val: 'unborder-card'
        },
        'tab-position': {
            type: 'string',
            options: ['left', 'right', 'top'],
            val: 'top',
            tips: '选项卡位置'
        },
        'scroll-step': {
            type: 'number',
            val: 200,
            tips: '可滚动时，每次滚动的像素'
        },
        closable: {
            type: 'boolean',
            val: false,
            tips: '是否可关闭选项卡'
        },
        addable: {
            type: 'boolean',
            val: false,
            tips: '是否可新增选项卡'
        },
        'show-header': {
            type: 'boolean',
            val: true,
            tips: '是否显示选项卡头部'
        },
        'validate-active': {
            type: 'boolean',
            val: true,
            tips: '是否校验ActiveName，true：如果active匹配不到，默认激活第一个Tab，触发tab-change；false：active匹配不到不显示'
        }
    },
    slots: {
        default: {
            name: ['bk-tab-panel'],
            type: ['list', 'remote'],
            children: [
                {
                    name: ['text'],
                    type: ['span']
                }
            ],
            displayName: '可选项',
            tips: '默认插槽，填写的数据需要是数组且每个元素需包含label和name字段',
            remoteValidate (data) {
                if (!Array.isArray(data)) return '返回值需要是数组'
            },
            keys: [
                { id: 'label', label: '名称', tips: '从数据中获取名称的字段key，不填取 label 字段' },
                { id: 'name', label: '值', tips: '从数据中获取值的字段key，不填取 name 字段' }
            ],
            val: [
                { name: 'Tab-1', label: 'Tab-1', content: '111' },
                { name: 'Tab-2', label: 'Tab-2', content: '222' },
                { name: 'Tab-3', label: 'Tab-3', content: '333' }
            ]
        }
    }
}
