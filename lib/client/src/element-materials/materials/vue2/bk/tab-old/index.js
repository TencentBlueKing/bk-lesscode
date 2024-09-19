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
            displayName: '选项卡切换',
            name: 'tab-change',
            tips: '选项卡切换时调用该事件函数，事件回调参数 (name: String)',
            functionTemplates: [{
                funcName: 'handleTabChange',
                funcParams: ['tabName'],
                funcBody: '// 将选中 tab 的 name，赋值给 tab 组件的 active 属性的变量来记录当前选中的tab。lesscode[\'${prop:activeTab}\'] 可以替换成实际绑定的变量\nlesscode[\'${prop:activeTab}\'] = tabName\n'
            }]
        },
        {
            displayName: '关闭选项卡',
            name: 'close-panel',
            tips: '关闭选项卡时调用该事件函数，事件回调参数 (index: Number, panel: Object)'
        },
        {
            displayName: '新增选项卡',
            name: 'add-panel',
            tips: '新增选项卡时调用该事件函数，暂无事件回调参数'
        },
        {
            displayName: '标签位置拖动交换',
            name: 'sort-change',
            tips: '标签拖动交互位置后调用'
        },
        {
            displayName: '标签拖动',
            name: 'on-drag-tab',
            tips: '标签拖动时调用'
        },
        {
            displayName: '滚动按钮显隐',
            name: 'scroll-show-change',
            tips: '滚动按钮显隐时调用'
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
    groups: [
        { label: '选中值', value: 'value' },
        { label: '类型', value: 'type' },
        { label: '显示', value: 'display' },
        { label: '选项卡数变动', value: 'tabUpdate' },
        { label: '鼠标悬浮', value: 'mouseHover' },
        { label: '拖拽', value: 'drag' },
        { label: '布局', value: 'layout' },
        { label: '样式', value: 'style' },
        { label: '其他', value: 'other' }
    ],
    props: {
        active: {
            type: 'string',
            val: 'Tab-1',
            displayName: '显示的选项卡名称',
            tips: '当前显示的选项卡名称',
            modifiers: ['sync'],
            belongGroup: 'value'
        },
        type: {
            type: 'string',
            options: ['card', 'border-card', 'unborder-card'],
            val: 'unborder-card',
            displayName: '选项卡样式',
            belongGroup: 'type'
        },
        'tab-position': {
            type: 'string',
            options: ['left', 'right', 'top'],
            val: 'top',
            displayName: '选项卡位置',
            tips: '选项卡位置',
            belongGroup: 'layout'
        },
        'scroll-step': {
            type: 'number',
            val: 200,
            displayName: '一次滚动像素',
            tips: '可滚动时，每次滚动的像素',
            belongGroup: 'other'
        },
        closable: {
            type: 'boolean',
            val: false,
            displayName: '是否关闭选项卡',
            tips: '是否可关闭选项卡',
            belongGroup: 'tabUpdate'
        },
        addable: {
            type: 'boolean',
            val: false,
            displayName: '是否新增选项卡',
            tips: '是否可新增选项卡',
            belongGroup: 'tabUpdate'
        },
        'show-header': {
            type: 'boolean',
            val: true,
            displayName: '是否显示选项卡头部',
            tips: '是否显示选项卡头部',
            belongGroup: 'display'
        },
        'validate-active': {
            type: 'boolean',
            val: true,
            displayName: '是否校验选项卡名称',
            tips: '是否校验ActiveName，true：如果active匹配不到，默认激活第一个Tab，触发tab-change；false：active匹配不到不显示',
            belongGroup: 'other'
        },
        sortable: {
            type: 'boolean',
            val: false,
            displayName: '标签是否可拖拽排序',
            tips: '标签是否可拖拽排序',
            belongGroup: 'drag'
        },
        sortType: {
            type: 'string',
            options: ['replace', 'insert'],
            val: 'replace',
            displayName: '标签拖拽排序的方式',
            tips: '标签拖拽排序的方式',
            belongGroup: 'drag'
        },
        labelHeight: {
            type: 'number',
            val: 50,
            displayName: '选项卡label的高度',
            tips: '选项卡label的高度',
            belongGroup: 'style'
        },
        beforeToggle: {
            type: 'function',
            displayName: '切换选项卡前的钩子函数',
            tips: '切换选项卡前的钩子函数,支持异步函数',
            belongGroup: 'other'
        },
        extCls: {
            type: 'string',
            displayName: '最外层元素的类名',
            tips: '配置自定义样式类名，传入的类会被加在组件最外层的DOM.bk-tab上',
            belongGroup: 'style'
        },
        changeOnHover: {
            type: 'boolean',
            val: false,
            displayName: '鼠标悬停tab时进行切换',
            tips: '鼠标悬停tab时进行切换',
            belongGroup: 'mouseHover'
        },
        changeOnHoverDelay: {
            type: 'number',
            val: 1000,
            displayName: '鼠标悬停切换tab的延时',
            tips: '鼠标悬停切换tab的延时，单位为毫秒',
            belongGroup: 'mouseHover'
        },
        activeBar: {
            type: 'object',
            val: { position: 'bottom', height: '2px' },
            displayName: '当前选中激活样式',
            tips: '当前选中激活样式，暂时只支持横排样式',
            belongGroup: 'style'
        },
        addShowNextRight: {
            type: 'boolean',
            val: false,
            displayName: '添加按钮是否显示在右边滚动按钮左边',
            tips: '添加按钮是否显示在右边滚动按钮左边',
            belongGroup: 'display'
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
