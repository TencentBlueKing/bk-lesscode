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
            type (renderProps) {
                return ['daterange', 'datetimerange'].includes(renderProps?.type?.renderValue) ? 'array' : ['string', 'number']
            },
            val: '',
            regExp: /^[1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/,
            // 正则校验错误时的提示文本，默认值为"格式错误，请重新输入"
            regErrorText: '请输入正确的日期格式，如"2020-01-01"',
            displayName: '日历值',
            tips: '日期，如"2020-01-01"',
            directive: 'v-model'
        },
        placeholder: {
            type: 'string',
            val: '请选择日期',
            displayName: '空值时提示文案',
            tips: '占位文案'
        },
        type: {
            type: 'string',
            options: ['date', 'daterange', 'datetime', 'datetimerange', 'month', 'year'],
            val: 'date',
            clearable: false,
            displayName: '日历类型',
            tips: '选择daterange或者datetimerange的时候，modelValue需要是数组'
        },
        format: {
            type: 'string',
            options: ['yyyy-MM-dd', 'yyyy-MM', 'yyyy', 'yyyy-MM-dd HH:mm:ss', 'HH:mm:ss', 'mm:ss'],
            val: 'yyyy-MM-dd',
            displayName: '日期值格式'
        },
        'font-size': {
            type: 'string',
            options: ['normal', 'medium', 'large'],
            val: 'normal',
            displayName: '日期值字体大小',
            tips: '设置组件主体内容字体大小：normal--12px；medium--14px；large--16px'
        },
        placement: {
            type: 'string',
            options: [
                'top', 'top-start', 'top-end', 'bottom', 'bottom-start', 'bottom-end',
                'left', 'left-start', 'left-end', 'right', 'right-start', 'right-end'
            ],
            val: 'bottom-start',
            displayName: '日历面板出现的位置',
            tips: '日历面板出现的位置'
        },
        behavior: {
            type: 'string',
            options: ['normal', 'simplicity'],
            val: 'normal',
            displayName: '显示风格设置',
            tips: '设置simplicity为简约风格'
        },
        editable: {
            type: 'boolean',
            val: true,
            displayName: '是否可编辑',
            tips: '设置文本框是否可编辑'
        },
        disabled: {
            type: 'boolean',
            val: false,
            displayName: '是否禁用',
            tips: '是否禁用'
        },
        readonly: {
            type: 'boolean',
            val: false,
            displayName: '是否只读'
        },
        clearable: {
            type: 'boolean',
            val: true,
            displayName: '是否可清空'
        },
        'ext-popover-cls': {
            type: 'string',
            val: '',
            displayName: '日历面板自定义样式类名',
            tips: '外部设置的 popover class name'
        },
        multiple: {
            type: 'boolean',
            val: false,
            displayName: '是否允许选择多个日期'
        },
        'time-picker-options': {
            type: 'object',
            val: {},
            displayName: '时间选择器属性配置',
            tips: '支持 datetime 和 datetimerange 类型，在 DatePicker 中配置 TimePicker 的属性'
        },
        'append-to-body': {
            type: 'boolean',
            val: false,
            displayName: '历面板是否出现在body内',
            tips: '控制日历面板是否出现在 body 内'
        },
        shortcuts: {
            type: 'array',
            val: [],
            displayName: '配置快捷选择日期',
            tips: '配置快捷选择日期。类型为 {text: string;value?: () => Date[];onClick?: (picker: any) => void;}[]'
        },
        'shortcut-close': {
            type: 'boolean',
            val: false,
            displayName: '点击快捷日期是否关闭弹框',
            tips: '配置点击 shortcuts 是否关闭弹层'
        },
        'up-to-now': {
            type: 'boolean',
            val: false,
            displayName: '是否终止时间为"至今"',
            tips: '在日期范围选择器和日期时间范围选择器中（即 type 为 `daterange` 或者 `datetimerange`），设置 `up-to-now` 为 `true` 可使配置终止时间为“至今”'
        },
        'use-shortcut-text': {
            type: 'boolean',
            val: false,
            displayName: '快捷文案是否可编辑',
            tips: '开启后，点击选中配置的快捷项时，输入框显示的内容为选中的快捷文案，且不可编辑'
        },
        'shortcut-selected-index': {
            type: 'number',
            val: -1,
            displayName: '选中快捷项索引',
            tips: '选中的快捷项index'
        },
        'header-slot-cls': {
            type: 'string',
            val: '',
            displayName: '头部自定义样式'
        },
        'footer-slot-cls': {
            type: 'string',
            val: '',
            displayName: '底部自定义样式'
        },
        'disabled-date': {
            type: 'function',
            val: () => {},
            displayName: '配置不可选的日期',
            tips: '配置不可选的日期，参数为当前的日期，返回 true 禁用这天，否则不禁用。类型为 (date: Date | number) => boolean'
        },
        'with-validate': {
            type: 'boolean',
            val: true,
            displayName: '值改变时触发字段校验规则'
        }
        // open: {
        //     type: 'boolean',
        //     val: false,
        //     displayName: '日历面板是否显示',
        //     tips: '控制日历面板的显示与隐藏'
        // }
        // startDate: {
        //     type: 'date',
        //     displayName: '默认显示的日期',
        //     tips: '设置日历面板默认显示的日期'
        // }
    }
}
