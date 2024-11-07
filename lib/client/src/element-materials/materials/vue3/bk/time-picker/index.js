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
    name: 'time-picker',
    type: 'bk-time-picker',
    displayName: '时间选择',
    icon: 'bk-drag-time-2',
    group: '表单',
    order: 1,
    document: 'https://magicbox.bk.tencent.com/magicbox/3.0/time-picker',

    events: [
        {
            displayName: '时间改变',
            name: 'change',
            tips: '时间改变时调用该事件函数，事件回调参数 (time: Date | String | Array)'
        },
        {
            displayName: '面板弹出或收起时',
            name: 'open-change',
            tips: '面板弹出或收起时调用该事件函数，事件回调参数 (state: Boolean)'
        },
        {
            displayName: '清空时间',
            name: 'clear',
            tips: '日历面板点击清空事件，无参数'
        },
        {
            displayName: '确认选中时间成功',
            name: 'pick-success',
            tips: '日历面板选择日期后，点击确定选择成功的事件，无参数'
        },
        {
            displayName: '快捷项改变',
            name: 'shortcut-change',
            tips: '快捷项改变事件'
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
    groups: [
        { label: '值', value: 'value' },
        { label: '类型', value: 'type' },
        { label: '格式', value: 'format' },
        { label: '提示', value: 'tip' },
        { label: '状态', value: 'state' },
        { label: '隐藏', value: 'hide' },
        { label: '布局', value: 'layout' },
        { label: '样式', value: 'style' },
        { label: '其他', value: 'other' }
    ],
    props: {
        // Date String Array
        'model-value': {
            type (renderProps) {
                return ['timerange'].includes(renderProps?.type?.renderValue) ? 'array' : 'string'
            },
            displayName: '时间值',
            tips: '时间选择器组件的值',
            directive: 'v-model',
            belongGroup: 'value'
        },
        placeholder: {
            type: 'string',
            displayName: '空值时提示文案',
            tips: '空白提示',
            belongGroup: 'tip'
        },
        type: {
            type: 'string',
            options: ['time', 'timerange'],
            val: 'time',
            displayName: '类型',
            belongGroup: 'type'
        },
        format: {
            type: 'string',
            val: 'HH:mm:ss',
            displayName: '时间值格式',
            tips: '格式，不配置 ss 时即不显示秒',
            belongGroup: 'format'
        },
        'font-size': {
            type: 'string',
            options: ['normal', 'medium', 'large'],
            val: 'normal',
            displayName: '时间值字体大小',
            tips: '设置组件主体内容字体大小：normal--12px；medium--14px；large--16px',
            belongGroup: 'style'
        },
        placement: {
            type: 'string',
            options: ['top', 'top-start', 'top-end', 'bottom', 'bottom-start', 'bottom-end', 'left', 'left-start', 'left-end', 'right', 'right-start', 'right-end'],
            val: 'bottom-start',
            displayName: '时间面板出现的位置',
            tips: '面板出现的位置',
            belongGroup: 'layout'
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
            displayName: '是否编辑',
            belongGroup: 'state'
        },
        disabled: {
            type: 'boolean',
            val: false,
            displayName: '是否禁用',
            belongGroup: 'state'
        },
        'enter-mode': {
            type: 'boolean',
            val: true,
            displayName: '是否开启回车模式',
            tips: '是否开启回车模式',
            belongGroup: 'other'
        },
        steps: {
            type: 'array',
            displayName: '面板的时间间隔',
            tips: '面板的时间间隔，数组的三项分别对应小时、分钟、秒。例如设置为[1,15,20]时，面板中分钟的备选项为：00、15、30、45，秒的备选项为：00、20、40。',
            belongGroup: 'other'
        },
        readonly: {
            type: 'boolean',
            val: false,
            displayName: '是否只读',
            tips: '是否只读',
            belongGroup: 'state'
        },
        clearable: {
            type: 'boolean',
            val: true,
            displayName: '是否可清空',
            tips: '是否可清空',
            belongGroup: 'other'
        },
        // open: {
        //     type: 'boolean',
        //     val: false,
        //     displayName: '日历面板是否显示',
        //     tips: '控制日历面板的显示与隐藏'
        // },
        appendToBody: {
            type: 'boolean',
            val: false,
            displayName: '日历面板是否出现在body内',
            tips: '控制日历面板是否出现在body内',
            belongGroup: 'state'
        },
        disabledHours: {
            type: 'array',
            displayName: '不可选小时数',
            tips: '不可选小时数，数组中的小时数将为禁用状态',
            belongGroup: 'state'
        },
        disabledMinutes: {
            type: 'array',
            displayName: '不可选分钟数',
            tips: '不可选分钟数，数组中的分钟数将为禁用状态',
            belongGroup: 'state'
        },
        disabledSeconds: {
            type: 'array',
            displayName: '不可选秒数',
            tips: '不可选秒数，数组中的秒数将为禁用状态',
            belongGroup: 'state'
        },
        hideDisabledOptions: {
            type: 'boolean',
            val: false,
            displayName: '是否隐藏禁止选择的小时、分钟、秒',
            tips: '是否隐藏禁止选择的小时、分钟、秒',
            belongGroup: 'hide'
        },
        allowCrossDay: {
            type: 'boolean',
            val: false,
            displayName: '是否允许时间段进行跨天选择',
            tips: '是否允许时间段进行跨天选择,即起始时间大于终止时间,此属性只在type为timerange时生效',
            belongGroup: 'other'
        },
        extPopoverCls: {
            type: 'string',
            displayName: '日历面板上最外层元素样式类名',
            tips: '配置自定义样式类名，传入的类会被加在弹出的日历面板DOM`.bk-date-picker-dropdown`上',
            belongGroup: 'style'
        }
    }
}
