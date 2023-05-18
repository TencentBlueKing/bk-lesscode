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
    name: 'van-calendar',
    type: 'van-calendar',
    // bk-drag-custom-comp-default
    icon: 'bk-drag-button',
    interactiveShow: true,
    displayName: '日历',
    group: '基础',
    document: 'https://vant-contrib.gitee.io/vant/#/zh-CN/calendar',
    events: [
        { name: 'select', tips: '点击并选中任意日期时触发，事件回调参数 (value: Date | Date[])' },
        { name: 'confirm', tips: '日期选择完成后触发，若 show-confirm 为 true，则点击确认按钮后触发，事件回调参数 (value: Date | Date[])' },
        { name: 'open', tips: '打开弹出层时触发，事件回调参数 (e: Event)' },
        { name: 'close', tips: '关闭弹出层时触发，事件回调参数 (e: Event)' },
        { name: 'opened', tips: '打开弹出层且动画结束后触发，事件回调参数 (e: Event)' },
        { name: 'closed', tips: '关闭弹出层且动画结束后触发，事件回调参数 (e: Event)' },
        { name: 'unselect', tips: '当日历组件的 type 为 multiple 时，取消选中日期时触发，事件回调参数 (value: Date)' },
        { name: 'month-show', tips: '当某个月份进入可视区域时触发，事件回调参数 ({ date: Date, title: string })' },
        { name: 'over-range', tips: '范围选择超过最多可选天数时触发，事件回调参数 (e: Event)' },
        { name: 'click-subtitle', tips: '点击日历副标题时触发，事件回调参数 (event: MouseEvent)' }
    ],
    styles: ['size', 'padding', 'margin', 'display'],
    renderStyles: {
    },
    props: {
        type: {
            type: 'string',
            val: 'single',
            options: ['single', 'multiple', 'range'],
            tips: '选择类型:single 表示选择单个日期，multiple 表示选择多个日期，range 表示选择日期区间'
        },
        'max-range': {
            type: ['string', 'number'],
            val: '',
            tips: '当 Calendar 的 type 为 range或multiple 时，支持日期区间最多可选天数'
        },
        'range-prompt': {
            type: 'string',
            val: '最多选择 xx 天',
            tips: '当 Calendar 的 type 为 range或multiple 时，支持范围选择超过最多可选天数时的提示文案'
        },
        'show-range-prompt': {
            type: 'boolean',
            val: true,
            tips: '当 Calendar 的 type 为 range 时，支持范围选择超过最多可选天数时，是否展示提示文案'
        },
        'allow-same-day': {
            type: 'boolean',
            val: false,
            tips: '当 Calendar 的 type 为 range 时，支持是否允许日期范围的起止时间为同一天'
        },
        litle: {
            type: 'string',
            val: '日期选择',
            tips: '日历标题'
        },
        color: {
            type: 'string',
            val: '#1989fa',
            tips: '主题色，对底部按钮和选中日期生效'
        },
        'min-date': {
            type: 'date',
            val: new Date(),
            tips: '可选择的最小日期'
        },
        'max-date': {
            type: 'date',
            val: null,
            tips: '可选择的最大日期'
        },
        'default-date': {
            type: ['date', 'null'],
            val: new Date(),
            tips: '默认选中的日期，type 为 multiple 或 range 时为数组，传入 null 表示默认不选择'
        },
        'row-height': {
            type: ['number', 'string'],
            val: 64,
            tips: '日期行高'
        },
        formatter: {
            type: 'string',
            val: date => date,
            tips: '日期格式化函数'
        },
        poppable: {
            type: 'boolean',
            val: true,
            tips: '是否以弹层的形式展示日历'
        },
        show: {
            type: 'boolean',
            val: false,
            tips: '当 Calendar 的 poppable 为 true 时，支持是否以弹层的形式展示日历',
            directive: 'v-model'
        },
        position: {
            type: 'string',
            val: 'bottom',
            options: ['top', 'right', 'left'],
            tips: '当 Calendar 的 poppable 为 true 时，支持弹出位置，可选值为 top right left'
        },
        round: {
            type: 'boolean',
            val: true,
            tips: '当 Calendar 的 poppable 为 true 时，支持是否显示圆角弹窗'
        },
        'close-on-popstate': {
            type: 'boolean',
            val: true,
            tips: '当 Calendar 的 poppable 为 true 时，支持是否在页面回退时自动关闭'
        },
        'close-on-click-overlay': {
            type: 'boolean',
            val: true,
            tips: '当 Calendar 的 poppable 为 true 时，支持是否在点击遮罩层后关闭'
        },
        'safe-area-inset-top': {
            type: 'boolean',
            val: false,
            tips: '当 Calendar 的 poppable 为 true 时，支持是否开启顶部安全区适配'
        },
        'safe-area-inset-bottom': {
            type: 'boolean',
            val: true,
            tips: '当 Calendar 的 poppable 为 true 时，支持是否开启底部安全区适配'
        },
        'teleport': {
            type: ['string', 'element'],
            val: true,
            tips: '当 Calendar 的 poppable 为 true 时，支持是否指定挂载的节点，等同于 Teleport 组件的 to 属性'
        },
        'lazy-render': {
            type: 'boolean',
            val: true,
            tips: '是否只渲染可视区域的内容'
        },
        'show-mark': {
            type: 'boolean',
            val: true,
            tips: '是否显示月份背景水印'
        },
        'show-title': {
            type: 'boolean',
            val: true,
            tips: '是否展示日历标题'
        },
        'show-subtitle': {
            type: 'boolean',
            val: true,
            tips: '是否展示日历副标题（年月）'
        },
        'show-confirm': {
            type: 'boolean',
            val: true,
            tips: '是否展示确认按钮'
        },
        'readonly': {
            type: 'boolean',
            val: false,
            tips: '是否为只读状态，只读状态下不能选择日期'
        },
        'confirm-text': {
            type: 'string',
            val: '确定',
            tips: '确认按钮的文字'
        },
        'confirm-disabled-text': {
            type: 'string',
            val: '确定',
            tips: '确认按钮处于禁用状态时的文字'
        },
        'first-day-of-week': {
            type: 'number',
            val: 0,
            tips: '设置周起始日'
        }
    },
    slots: {
        title: {
            name: ['text'],
            type: ['text'],
            displayName: '自定义标题',
            val: '自定义标题'
        },
        subtitle: {
            name: ['text'],
            type: ['text'],
            displayName: '自定义日历副标题',
            val: '自定义日历副标题'
        },
        'month-title': {
            name: ['text'],
            type: ['text'],
            displayName: '自定义每个月份的小标题',
            val: '自定义每个月份的小标题'
        },
        footer: {
            name: ['html'],
            type: ['html'],
            displayName: '自定义底部区域内容',
            val: '自定义底部区域内容'
        },
        'confirm-text': {
            name: ['text'],
            type: ['text'],
            displayName: '自定义确认按钮的内容',
            val: '自定义确认按钮的内容'
        },
        'top-info': {
            name: ['text'],
            type: ['text'],
            displayName: '自定义日期上方的提示信息',
            val: '自定义日期上方的提示信息'
        },
        'bottom-info': {
            name: ['text'],
            type: ['text'],
            displayName: '自定义日期下方的提示信息',
            val: '自定义日期下方的提示信息'
        }
    }
}
