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
import moment from 'moment'
const defulatDate = moment(new Date()).format('yyyy-MM-DD').split('-')

export default {
    name: 'widget-van-datetime-picker',
    type: 'widget-van-picker',
    // bk-drag-custom-comp-default
    icon: 'bk-drag-date',
    displayName: '时间选择',
    group: '表单',
    document: 'https://vant-contrib.gitee.io/vant/#/zh-CN/time-picker',
    events: [
        {
            name: 'change',
            tips: '选项改变时触发，事件回调参数 ({ selectedValues, selectedOptions, columnIndex })'
        },
        {
            name: 'confirm',
            tips: '点击完成按钮时触发，事件回调参数 ({ selectedValues, selectedOptions })'
        },
        {
            name: 'cancel',
            tips: '点击取消按钮时触发，事件回调参数（{ selectedValues, selectedOptions }）'
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
            val: defulatDate,
            directive: 'v-model',
            disableVariableType: ['expression'] // 不兼容的类型
        },
        'component-type': {
            type: 'hidden',
            val: 'van-date-picker'
        },
        format: {
            type: 'string',
            val: 'yyyy-MM-DD',
            tips: '时间显示格式'
        },
        'date-title': {
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
        label: {
            type: 'string',
            val: '日期',
            tips: '左侧的label'
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
        'columns-type': {
            type: 'array',
            val: ['year', 'month', 'day'],
            tips: '控制选项的类型，支持以任意顺序对 year、month 和 day 进行排列组合'
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
    }
}
