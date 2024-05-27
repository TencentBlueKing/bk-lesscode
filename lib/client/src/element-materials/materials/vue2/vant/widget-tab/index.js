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
    name: 'van-tab-simplified',
    type: 'widget-van-tab',
    displayName: '标签页（简化版）',
    icon: 'bk-drag-tab',
    group: '导航',
    order: 1,
    document: 'https://youzan.github.io/vant/v2/#/zh-CN/tab',
    events: [
        {
            name: 'click',
            tips: '点击时触发，事件回调参数 (name：标识符，title：标题)'
        },
        {
            name: 'rendered',
            tips: '标签内容首次渲染时触发（仅在开启延迟渲染后触发），事件回调参数 (name：标识符，title：标题)'
        }
    ],
    styles: [
        'position',
        'margin',
        'pointer'
    ],
    directives: [
        {
            type: 'v-model',
            prop: 'value'
        }
    ],
    props: {
        type: {
            type: 'string',
            val: 'line',
            options: ['card', 'line'],
            displayName: '设置选项卡样式风格',
            tips: '样式风格类型'
        },
        color: {
            type: 'color',
            val: '#ee0a24',
            displayName: '设置标签主题色',
            tips: '标签主题色'
        },
        background: {
            type: 'color',
            val: 'white',
            displayName: '设置标签栏背景色',
            tips: '标签栏背景色'
        },
        duration: {
            type: ['number', 'string'],
            val: 0.3,
            displayName: '动画时间',
            tips: '动画时间，单位秒'
        },
        'line-width': {
            type: ['number', 'string'],
            val: '40px',
            displayName: '设置底部条宽度',
            tips: '底部条宽度，默认单位 px'
        },
        'line-height': {
            type: ['number', 'string'],
            val: '3px',
            displayName: '设置底部条高度',
            tips: '底部条高度，默认单位 px'
        },
        animated: {
            type: 'boolean',
            val: false,
            displayName: '是否切换标签时有转场动画',
            tips: '是否开启切换标签内容时的转场动画'
        },
        border: {
            type: 'boolean',
            val: false,
            displayName: '是否标签栏有外边框',
            tips: '是否显示标签栏外边框，仅在 type="line" 时有效'
        },
        ellipsis: {
            type: 'boolean',
            val: true,
            displayName: '标题文字过长是否省略',
            tips: '是否省略过长的标题文字'
        },
        swipeable: {
            type: 'boolean',
            val: false,
            displayName: '是否滑动切换标签页',
            tips: '是否开启手势滑动切换'
        },
        'swipe-threshold': {
            type: ['number', 'string'],
            val: 5,
            displayName: '设置最大标签数',
            tips: '滚动阈值，标签数量超过阈值且总宽度超过标签栏宽度时开始横向滚动'
        },
        'title-active-color': {
            type: 'color',
            displayName: '标题选中时颜色样式',
            tips: '标题选中态颜色'
        },
        'title-inactive-color': {
            type: 'color',
            displayName: '标题未选中时颜色样式',
            tips: '标题默认态颜色'
        }
    },
    slots: {
        default: []
    }
}
