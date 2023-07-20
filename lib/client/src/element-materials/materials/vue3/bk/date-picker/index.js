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
    name: 'date-picker',
    type: 'bk-date-picker',
    displayName: '日期选择',
    icon: 'bk-drag-date',
    group: '表单',
    order: 1,
    document: 'https://magicbox.bk.tencent.com/magicbox/3.0/date-picker',
    events: [
        {
            name: 'change',
            tips: '日期改变时调用该事件函数，事件回调参数 (date: Date | String | Array, type: String)'
        },
        {
            name: 'input',
            tips: '输入日期时调用该事件函数'
        },
        {
            name: 'clear',
            tips: '日历面板点击清空时调用该事件函数，暂无事件回调参数'
        },
        {
            name: 'open-change',
            tips: '日历面板弹出或收起时调用该事件函数，事件回调参数 (state: Boolean)'
        },
        {
            name: 'pick-success',
            tips: '日历面板选择日期后，点击确定选择成功时调用该事件函数，暂无事件回调参数'
        },
        {
            name: 'shortcut-change',
            tips: '快捷项改变时调用该事件函数，事件回调参数 (value: Object, index: Number)'
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
    renderStyles: {
        display: 'inline-block',
        width: '300px',
        verticalAlign: 'middle'
    },
    props: {
        // 日历组件的值，可以是 Date 或字符串或数组，只有在 daterange 和 datetimerange 类型时才支持数组
        'model-value': {
            type: ['string', 'array', 'date', 'number'],
            val: '',
            regExp: /^[1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/,
            // 正则校验错误时的提示文本，默认值为"格式错误，请重新输入"
            regErrorText: '请输入正确的日期格式，如"2020-01-01"',
            tips: '日期，如"2020-01-01"',
            directive: 'v-model'
        },
        placeholder: {
            type: 'string',
            val: '请选择日期',
            tips: '占位文案'
        },
        type: {
            type: 'string',
            options: ['date', 'daterange', 'datetime', 'datetimerange', 'month', 'year'],
            val: 'date',
            clearable: false,
            tips: '选择daterange或者datetimerange的时候，modelValue需要是数组'
        },
        format: {
            type: 'string',
            options: ['yyyy-MM-dd', 'yyyy-MM', 'yyyy', 'yyyy-MM-dd HH:mm:ss', 'HH:mm:ss', 'mm:ss'],
            val: 'yyyy-MM-dd'
        },
        'font-size': {
            type: 'string',
            options: ['normal', 'medium', 'large'],
            val: 'normal',
            tips: '设置组件主体内容字体大小：normal--12px；medium--14px；large--16px'
        },
        placement: {
            type: 'string',
            options: [
                'top', 'top-start', 'top-end', 'bottom', 'bottom-start', 'bottom-end',
                'left', 'left-start', 'left-end', 'right', 'right-start', 'right-end'
            ],
            val: 'bottom-start',
            tips: '日历面板出现的位置'
        },
        behavior: {
            type: 'string',
            options: ['normal', 'simplicity'],
            val: 'normal',
            tips: '设置simplicity为简约风格'
        },
        editable: {
            type: 'boolean',
            val: true
        },
        disabled: {
            type: 'boolean',
            val: false,
            tips: '是否禁用'
        },
        readonly: {
            type: 'boolean',
            val: false
        },
        clearable: {
            type: 'boolean',
            val: true
        },
        'ext-popover-cls': {
            type: 'string',
            val: '',
            tips: '外部设置的 popover class name'
        },
        multiple: {
            type: 'boolean',
            val: false
        },
        'time-picker-options': {
            type: 'object',
            val: {}
        },
        'split-panels': {
            type: 'boolean',
            val: true
        },
        transfer: {
            type: 'boolean',
            val: false
        },
        'append-to-body': {
            type: 'boolean',
            val: false
        },
        shortcuts: {
            type: 'array',
            val: []
        },
        'shortcut-close': {
            type: 'boolean',
            val: false
        },
        options: {
            type: 'object',
            val: {}
        },
        'up-to-now': {
            type: 'boolean',
            val: false
        },
        'use-shortcut-text': {
            type: 'boolean',
            val: false
        },
        'shortcut-selected-index': {
            type: 'number',
            val: -1
        },
        'header-slot-cls': {
            type: 'string',
            val: ''
        },
        'footer-slot-cls': {
            type: 'string',
            val: ''
        },
        'allow-cross-day': {
            type: 'boolean',
            val: false
        },
        'disabled-date': {
            type: 'function',
            val: () => {}
        },
        'with-validate': {
            type: 'boolean',
            val: true
        }
    }
}
