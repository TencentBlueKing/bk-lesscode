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
    name: 'widget-van-date-time-picker',
    type: 'widget-van-date-time-picker',
    // bk-drag-custom-comp-default
    icon: 'bk-drag-date',
    displayName: '时间选择',
    group: '表单',
    document: 'https://vant-contrib.gitee.io/vant/#/zh-CN/time-picker',
    events: [
        {
            name: 'change',
            tips: '选项改变时触发，事件回调参数 (picker: Picker实例)'
        },
        {
            name: 'confirm',
            tips: '点击完成按钮时触发，事件回调参数 (value: 当前选中的时间)'
        },
        {
            name: 'cancel',
            tips: '点击取消按钮时触发，暂无事件回调参数'
        }
    ],
    styles: [
        'position',
        {
            name: 'size',
            include: ['display']
        },
        'margin',
        'pointer',
        'opacity'
    ],
    props: {
        value: {
            type: 'array',
            val: ['12', '00'],
            tips: '当前选中的时间'
        },
        'columns-type': {
            type: 'array',
            val: ['hour', 'minute'],
            tips: '选项类型，由 hour、minute 和 second 组成的数组'
        },
        'min-hour': {
            type: ['number', 'string'],
            val: 0,
            tips: '可选的最小小时'
        },
        'max-hour': {
            type: ['number', 'string'],
            val: 23,
            tips: '可选的最大小时'
        },
        'min-minute': {
            type: ['number', 'string'],
            val: 0,
            tips: '可选的最小分钟'
        },
        'max-minute': {
            type: ['number', 'string'],
            val: 59,
            tips: '可选的最大分钟'
        },
        'min-second': {
            type: ['number', 'string'],
            val: 0,
            tips: '可选的最小秒数'
        },
        'max-second': {
            type: ['number', 'string'],
            val: 59,
            tips: '可选的最大秒数'
        },
        title: {
            type: 'string',
            val: '选择时间',
            tips: '顶部栏标题'
        },
        'confirm-button-text': {
            type: 'string',
            val: '确认',
            tips: '确认按钮文字'
        },
        'cancel-button-text': {
            type: 'string',
            val: '取消',
            tips: '取消按钮文字'
        },
        'show-toolbar': {
            type: 'boolean',
            val: true,
            tips: '是否显示顶部栏'
        },
        loading: {
            type: 'boolean',
            val: false,
            tips: '是否显示加载状态'
        },
        readonly: {
            type: 'boolean',
            val: false,
            tips: '是否为只读状态，只读状态下无法切换选项'
        },
        filter: {
            type: 'function',
            tips: '选项过滤函数'
        },
        formatter: {
            type: 'function',
            tips: '选项格式化函数'
        },
        'option-height': {
            type: ['number', 'string'],
            val: 44,
            tips: '选项高度，支持 px vw vh rem 单位，默认 px'
        },
        'visible-option-num': {
            type: ['number', 'string'],
            val: 6,
            tips: '可见的选项个数'
        },
        'swipe-duration': {
            type: ['number', 'string'],
            val: 1000,
            tips: '快速滑动时惯性滚动的时长，单位ms'
        }
    },
    slots: {
        toolbar: {
            name: ['html'],
            type: ['html'],
            displayName: '自定义整个顶部栏的内容',
            val: '自定义整个顶部栏的内容'
        },
        title: {
            name: ['text'],
            type: ['text'],
            displayName: '自定义标题内容',
            val: '自定义标题内容'
        },
        confirm: {
            name: ['text'],
            type: ['text'],
            displayName: '自定义确认按钮内容',
            val: '自定义确认按钮内容'
        },
        cancel: {
            name: ['text'],
            type: ['text'],
            displayName: '自定义取消按钮内容',
            val: '自定义取消按钮内容'
        },
        option: {
            name: ['text'],
            type: ['text'],
            displayName: '自定义选项内容',
            val: '自定义选项内容'
        },
        'columns-top': {
            name: ['text'],
            type: ['text'],
            displayName: '自定义选项上方内容',
            val: '自定义选项上方内容'
        },
        'columns-bottom': {
            name: ['text'],
            type: ['text'],
            displayName: '自定义选项下方内容',
            val: '自定义选项下方内容'
        }
    }
}
