/**
 * Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
 * Copyright (C) 2025 Tencent. All rights reserved.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

export default {
    name: 'tab-simplified',
    type: 'widget-tab',
    displayName: '选项卡(简化版)',
    icon: 'bk-drag-tab',
    group: '导航',
    order: 1,
    document: 'https://magicbox.bk.tencent.com/static_api/v3/components_vue/2.0/example/index.html#/tab',
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
        { label: '类型', value: 'type' },
        { label: '布局', value: 'layout' },
        { label: '显示', value: 'display' },
        { label: '其他', value: 'other' }
    ],
    props: {
        active: {
            type: 'hidden',
            val: '',
            displayName: '显示的选项卡名称',
            tips: '当前显示的选项卡名称',
            modifiers: ['sync']
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
            belongGroup: 'other'
        },
        addable: {
            type: 'boolean',
            val: false,
            displayName: '是否新增选项卡',
            tips: '是否可新增选项卡',
            belongGroup: 'other'
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
        }
    },
    slots: {
        default: []
    }
}
