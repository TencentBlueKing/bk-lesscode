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
    type: 'widget-tab',
    displayName: '选项卡',
    icon: 'bk-drag-tab',
    group: '导航',
    order: 1,
    document: 'https://magicbox.bk.tencent.com/magicbox/3.0/tab',
    events: [
        {
            displayName: '选项卡切换',
            name: 'tab-change',
            tips: '选项卡切换时调用该事件函数，事件回调参数 (name: String)'
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
            displayName: '删除选项卡',
            name: 'remove-panel',
            tips: '删除选项卡时调用该事件函数，暂无事件回调参数'
        },
        {
            displayName: '选项卡排序',
            name: 'sort-change',
            tips: '排序选项卡时调用该事件函数，暂无事件回调参数'
        },
        {
            displayName: '拖拽选项卡',
            name: 'on-drag-tab',
            tips: '拖拽选项卡时调用该事件函数，暂无事件回调参数'
        },
        {
            displayName: '新增选项卡',
            name: 'add',
            tips: '新增选项卡时调用该事件函数，暂无事件回调参数'
        },
        {
            displayName: '选项卡切换',
            name: 'change',
            tips: '选项卡切换时调用该事件函数，事件回调参数 (name: String)'
        }, {
            displayName: '删除选项卡',
            name: 'remove',
            tips: '删除选项卡时调用该事件函数，暂无事件回调参数'
        }, {
            displayName: '选项卡排序',
            name: 'sort',
            tips: '排序选项卡时调用该事件函数，暂无事件回调参数'
        }
        // {
        //     displayName: '拖拽选项卡',
        //     name: 'drag',
        //     tips: '拖拽选项卡时调用该事件函数，暂无事件回调参数'
        // }
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
        { label: '类型', value: 'type' },
        { label: '布局', value: 'layout' },
        { label: '排序', value: 'sort' },
        { label: 'hover选项时', value: 'hoverTab' },
        { label: '显示', value: 'display' },
        { label: '样式', value: 'style' },
        { label: '其他', value: 'other' }
    ],
    props: {
        active: {
            type: 'hidden',
            val: '',
            displayName: '显示的选项卡名称',
            tips: '当前显示的选项卡名称',
            directive: 'v-model'
        },
        type: {
            type: 'string',
            options: ['card', 'border-card', 'unborder-card', 'card-tab'],
            val: 'border-card',
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
        // closable: {
        //     type: 'boolean',
        //     val: false,
        //     tips: '是否可关闭选项卡'
        // },
        sortable: {
            type: 'boolean',
            val: false,
            displayName: '是否排序',
            belongGroup: 'sort'
        },
        'sort-type': {
            type: 'string',
            options: ['replace', 'insert'],
            val: 'replace',
            displayName: '排序类型',
            belongGroup: 'sort'
        },
        // addable: {
        //     type: 'boolean',
        //     val: false,
        //     tips: '是否可新增选项卡'
        // },
        'label-height': {
            type: 'number',
            val: 50,
            displayName: '选项卡高度',
            belongGroup: 'style'
        },
        'show-header': {
            type: 'boolean',
            val: true,
            displayName: '是否显示选项卡头部',
            tips: '是否显示选项卡头部',
            belongGroup: 'display'
        },
        'change-on-hover': {
            type: 'boolean',
            val: false,
            displayName: '鼠标悬停tab时进行切换',
            belongGroup: 'hoverTab'
        },
        'change-on-hover-delay': {
            type: 'number',
            val: 1000,
            displayName: '鼠标悬停切换tab的延时，单位为毫秒',
            belongGroup: 'hoverTab'
        },
        'validate-active': {
            type: 'boolean',
            val: true,
            displayName: '是否校验选项卡名称',
            tips: '是否校验ActiveName，true：如果active匹配不到，默认激活第一个Tab，触发tab-change；false：active匹配不到不显示',
            belongGroup: 'other'
        }
    },
    slots: {
        default: []
    }
}
