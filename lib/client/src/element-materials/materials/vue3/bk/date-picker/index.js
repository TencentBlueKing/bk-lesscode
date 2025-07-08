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
    name: 'date-picker',
    type: 'bk-date-picker',
    displayName: '日期选择',
    icon: 'bk-drag-date',
    group: '表单',
    order: 1,
    document: 'https://magicbox.bk.tencent.com/magicbox/3.0/date-picker',
    events: [
        {
            displayName: '日期改变',
            name: 'change',
            tips: '日期改变时调用该事件函数，事件回调参数 (date: Date | String | Array, type: String)'
        },
        {
            displayName: '输入日期',
            name: 'input',
            tips: '输入日期时调用该事件函数'
        },
        {
            displayName: '点击日历面板上清空图标',
            name: 'clear',
            tips: '日历面板点击清空时调用该事件函数，暂无事件回调参数'
        },
        {
            displayName: '日历面板弹出或收起时',
            name: 'open-change',
            tips: '日历面板弹出或收起时调用该事件函数，事件回调参数 (state: Boolean)'
        },
        {
            displayName: '日期面板选择日期',
            name: 'pick-success',
            tips: '日历面板选择日期后，点击确定选择成功时调用该事件函数，暂无事件回调参数'
        },
        {
            displayName: '快捷项改变',
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
    directives: [
        {
            type: 'v-model',
            prop: 'model-value'
        }
    ],
    groups: [
        { label: '值', value: 'value' },
        { label: '值的格式', value: 'format' },
        { label: '提示', value: 'tip' },
        { label: '状态', value: 'state' },
        { label: '日历面板位置', value: 'position' },
        { label: '快捷配置', value: 'shortcut' },
        { label: '样式', value: 'style' },
        { label: '其他', value: 'other' }
    ],
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
            tips: '日期，如"2020-01-01"，支持v-model双向绑定，v-model优先级更高',
            directive: 'v-model',
            belongGroup: 'value'
        },
        placeholder: {
            type: 'string',
            val: '请选择日期',
            displayName: '空值时提示文案',
            tips: '占位文案',
            belongGroup: 'tip'
        },
        type: {
            type: 'string',
            options: ['date', 'daterange', 'datetime', 'datetimerange', 'month', 'year'],
            val: 'date',
            clearable: false,
            trigger: 'change-format',
            displayName: '日历类型',
            tips: '选择daterange或者datetimerange的时候，modelValue需要是数组',
            belongGroup: 'format'
        },
        format: {
            type: 'string',
            options: ['yyyy-MM-dd', 'yyyy-MM', 'yyyy', 'yyyy-MM-dd HH:mm:ss', 'HH:mm:ss', 'mm:ss'],
            val: 'yyyy-MM-dd',
            listener: 'change-format',
            displayName: '日期值格式',
            belongGroup: 'format'
        },
        'font-size': {
            type: 'string',
            options: ['normal', 'medium', 'large'],
            val: 'normal',
            displayName: '日期值字体大小',
            tips: '设置组件主体内容字体大小：normal--12px；medium--14px；large--16px',
            belongGroup: 'style'
        },
        placement: {
            type: 'string',
            options: [
                'top', 'top-start', 'top-end', 'bottom', 'bottom-start', 'bottom-end',
                'left', 'left-start', 'left-end', 'right', 'right-start', 'right-end'
            ],
            val: 'bottom-start',
            displayName: '日历面板出现的位置',
            tips: '日历面板出现的位置',
            belongGroup: 'position'
        },
        behavior: {
            type: 'string',
            options: ['normal', 'simplicity'],
            val: 'normal',
            displayName: '显示风格设置',
            tips: '设置simplicity为简约风格',
            belongGroup: 'style'
        },
        editable: {
            type: 'boolean',
            val: true,
            displayName: '是否可编辑',
            tips: '设置文本框是否可编辑',
            belongGroup: 'state'
        },
        disabled: {
            type: 'boolean',
            val: false,
            displayName: '是否禁用',
            tips: '是否禁用',
            belongGroup: 'state'
        },
        readonly: {
            type: 'boolean',
            val: false,
            displayName: '是否只读',
            belongGroup: 'state'
        },
        clearable: {
            type: 'boolean',
            val: true,
            displayName: '是否可清空',
            belongGroup: 'state'
        },
        'ext-popover-cls': {
            type: 'string',
            val: '',
            displayName: '日历面板自定义样式类名',
            tips: '外部设置的 popover class name',
            belongGroup: 'style'
        },
        multiple: {
            type: 'boolean',
            val: false,
            displayName: '是否允许选择多个日期',
            belongGroup: 'other'
        },
        'time-picker-options': {
            type: 'object',
            val: {},
            displayName: '时间选择器属性配置',
            tips: '支持 datetime 和 datetimerange 类型，在 DatePicker 中配置 TimePicker 的属性',
            belongGroup: 'other'
        },
        'append-to-body': {
            type: 'boolean',
            val: false,
            displayName: '历面板是否出现在body内',
            tips: '控制日历面板是否出现在 body 内',
            belongGroup: 'state'
        },
        shortcuts: {
            type: 'array',
            val: [],
            displayName: '配置快捷选择日期',
            tips: '配置快捷选择日期。类型为 {text: string;value?: () => Date[];onClick?: (picker: any) => void;}[]',
            belongGroup: 'shortcut'
        },
        'shortcut-close': {
            type: 'boolean',
            val: false,
            displayName: '点击快捷日期是否关闭弹框',
            tips: '配置点击 shortcuts 是否关闭弹层',
            belongGroup: 'shortcut'
        },
        'up-to-now': {
            type: 'boolean',
            val: false,
            displayName: '是否终止时间为"至今"',
            tips: '在日期范围选择器和日期时间范围选择器中（即 type 为 `daterange` 或者 `datetimerange`），设置 `up-to-now` 为 `true` 可使配置终止时间为“至今”',
            belongGroup: 'other'
        },
        'use-shortcut-text': {
            type: 'boolean',
            val: false,
            displayName: '快捷文案是否可编辑',
            tips: '开启后，点击选中配置的快捷项时，输入框显示的内容为选中的快捷文案，且不可编辑',
            belongGroup: 'shortcut'
        },
        'shortcut-selected-index': {
            type: 'number',
            val: -1,
            displayName: '选中快捷项索引',
            tips: '选中的快捷项index',
            belongGroup: 'shortcut'
        },
        'header-slot-cls': {
            type: 'string',
            val: '',
            displayName: '头部自定义样式',
            belongGroup: 'style'
        },
        'footer-slot-cls': {
            type: 'string',
            val: '',
            displayName: '底部自定义样式',
            belongGroup: 'style'
        },
        'disabled-date': {
            type: 'function',
            val: () => {},
            displayName: '配置不可选的日期',
            tips: '配置不可选的日期，参数为当前的日期，返回 true 禁用这天，否则不禁用。类型为 (date: Date | number) => boolean',
            belongGroup: 'state'
        },
        'with-validate': {
            type: 'boolean',
            val: true,
            displayName: '值改变时触发字段校验规则',
            belongGroup: 'other'
        }
    }
}
