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
    groups: [
        { label: '日历值', value: 'value' },
        { label: '类型', value: 'type' },
        { label: '日期格式', value: 'format' },
        { label: '顶部栏', value: 'toolbar' },
        { label: '按钮', value: 'button' },
        { label: '标签', value: 'label' },
        { label: '状态', value: 'state' },
        { label: '样式', value: 'style' },
        { label: '其他', value: 'other' }
    ],
    props: {
        value: {
            type: 'array',
            val: defulatDate,
            directive: 'v-model',
            disableVariableType: ['expression'], // 不兼容的类型
            displayName: '日历值',
            belongGroup: 'value'
        },
        'component-type': {
            type: 'hidden',
            val: 'van-date-picker'
        },
        format: {
            type: 'string',
            val: 'yyyy-MM-DD',
            displayName: '日期值格式',
            tips: '时间显示格式',
            belongGroup: 'format'
        },
        title: {
            type: 'string',
            val: '选择时间',
            displayName: '顶部栏标题',
            tips: '顶部栏标题',
            belongGroup: 'toolbar'
        },
        'confirm-button-text': {
            type: 'string',
            val: '确认',
            displayName: '确认按钮文字',
            tips: '确认按钮文字',
            belongGroup: 'button'
        },
        'cancel-button-text': {
            type: 'string',
            val: '取消',
            displayName: '取消按钮文字',
            tips: '取消按钮文字',
            belongGroup: 'button'
        },
        label: {
            type: 'string',
            val: '日期',
            displayName: '左侧标签',
            tips: '左侧的label',
            belongGroup: 'label'
        },
        'show-toolbar': {
            type: 'boolean',
            val: true,
            displayName: '是否显示顶部栏',
            tips: '是否显示顶部栏',
            belongGroup: 'toolbar'
        },
        loading: {
            type: 'boolean',
            val: false,
            displayName: '是否加载中状态',
            tips: '是否显示加载状态',
            belongGroup: 'state'
        },
        readonly: {
            type: 'boolean',
            val: false,
            displayName: '是否只读',
            tips: '是否为只读状态，只读状态下无法切换选项',
            belongGroup: 'state'
        },
        'columns-type': {
            type: 'array',
            val: ['year', 'month', 'day'],
            displayName: '控制选项类型',
            tips: '控制选项的类型，支持以任意顺序对 year、month 和 day 进行排列组合',
            belongGroup: 'type'
        },
        'option-height': {
            type: ['number', 'string'],
            val: 44,
            displayName: '选项高度',
            tips: '选项高度，支持 px vw vh rem 单位，默认 px',
            belongGroup: 'style'
        },
        'visible-option-num': {
            type: ['number', 'string'],
            val: 6,
            displayName: '可见选项个数',
            tips: '可见的选项个数',
            belongGroup: 'other'
        },
        'swipe-duration': {
            type: ['number', 'string'],
            val: 1000,
            displayName: '滚动时间',
            tips: '快速滑动时惯性滚动的时长，单位ms',
            belongGroup: 'other'
        }
    }
}
