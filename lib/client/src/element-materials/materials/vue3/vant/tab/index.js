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
    name: 'van-tabs',
    type: 'van-tabs',
    displayName: '标签页',
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
            name: 'change',
            tips: '当前激活的标签改变时触发，事件回调参数 (name：标识符，title：标题)'
        },
        {
            name: 'disabled',
            tips: '当前激活的标签改变时触发，事件回调参数 (name：标识符，title：标题)'
        },
        {
            name: 'rendered',
            tips: '标签内容首次渲染时触发（仅在开启延迟渲染后触发），事件回调参数 (name：标识符，title：标题)'
        },
        {
            name: 'scroll',
            tips: '滚动时触发，仅在 sticky 模式下生效，事件回调参数 (name：标识符，title：标题)'
        }
    ],
    styles: [
        'position',
        'margin',
        'pointer'
    ],
    props: {
        active: {
            type: ['number', 'string'],
            val: 0,
            tips: '绑定当前选中标签的标识符',
            directive: 'v-model'
        },
        type: {
            type: 'string',
            val: 'line',
            options: ['card', 'line'],
            tips: '样式风格类型'
        },
        color: {
            type: 'color',
            val: '#ee0a24',
            tips: '标签主题色'
        },
        background: {
            type: 'color',
            val: 'white',
            tips: '标签栏背景色'
        },
        duration: {
            type: ['number', 'string'],
            val: 0.3,
            tips: '动画时间，单位秒'
        },
        'line-width': {
            type: ['number', 'string'],
            val: 40,
            tips: '底部条宽度，默认单位 px'
        },
        'line-height': {
            type: ['number', 'string'],
            val: 3,
            tips: '底部条高度，默认单位 px'
        },
        animated: {
            type: 'boolean',
            val: false,
            tips: '是否开启切换标签内容时的转场动画'
        },
        border: {
            type: 'boolean',
            val: false,
            tips: '是否显示标签栏外边框，仅在 type="line" 时有效'
        },
        ellipsis: {
            type: 'boolean',
            val: true,
            tips: '是否省略过长的标题文字'
        },
        sticky: {
            type: 'boolean',
            val: false,
            tips: '是否使用粘性定位布局'
        },
        swipeable: {
            type: 'boolean',
            val: false,
            tips: '是否开启手势滑动切换'
        },
        'lazy-render': {
            type: 'boolean',
            val: true,
            tips: '是否开启延迟渲染（首次切换到标签时才触发内容渲染）'
        },
        scrollspy: {
            type: 'boolean',
            val: false,
            tips: '是否开启滚动导航'
        },
        'offset-top': {
            type: ['number', 'string'],
            val: 0,
            tips: '粘性定位布局下与顶部的最小距离，支持 px vw vh rem 单位，默认 px'
        },
        'swipe-threshold': {
            type: ['number', 'string'],
            val: 5,
            tips: '滚动阈值，标签数量超过阈值且总宽度超过标签栏宽度时开始横向滚动'
        },
        'title-active-color': {
            type: 'color',
            tips: '标题选中态颜色'
        },
        'title-inactive-color': {
            type: 'color',
            tips: '标题默认态颜色'
        },
        'active-color': {
            type: 'color',
            val: '#1989fa',
            tips: '打开时的背景色'
        },
        'inactive-color': {
            type: 'color',
            val: 'white',
            tips: '关闭时的背景色'
        }
    },
    slots: {
        default: {
            name: ['van-tab'],
            type: ['list', 'remote'],
            displayName: '可选项',
            tips: '默认插槽，填写的数据需要是数组且每个元素需包含title和name字段',
            remoteValidate (data) {
                if (!Array.isArray(data)) return '返回值需要是数组'
            },
            keys: [
                { id: 'name', label: '值', tips: '从数据中获取值的字段key，不填取 name 字段' },
                { id: 'title', label: '标题', tips: '从数据中获取标题的字段key，不填取 title 字段' },
                { id: 'disabled', label: '是否禁用', tips: '从数据中获取是否禁用的字段key，不填取 disabled 字段' },
                { id: 'dot', label: '是否展示右上角小红点', tips: '从数据中获取是否展示右上角小红点的字段key，不填取 dot 字段' },
                { id: 'url', label: '链接地址', tips: '从数据中获取链接地址的字段key，不填取 url 字段' },
                { id: 'to', label: '跳转路由对象', tips: '从数据中获取跳转路由对象的字段key，不填取 to 字段' }
            ],
            val: [
                { name: 'Tab-1', title: 'Tab-1' },
                { name: 'Tab-2', title: 'Tab-2' },
                { name: 'Tab-3', title: 'Tab-3' }
            ]
        }
    }
}
