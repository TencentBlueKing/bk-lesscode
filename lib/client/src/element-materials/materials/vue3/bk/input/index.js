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
    name: 'input',
    type: 'bk-input',
    displayName: '输入框',
    icon: 'bk-drag-input',
    group: '表单',
    order: 1,
    document: 'https://magicbox.bk.tencent.com/magicbox/3.0/input',
    events: [
        {
            displayName: '文本框内容变化',
            name: 'change',
            tips: '值变更时触发事件，事件回调参数 (value: String, event: Event)'
        },
        {
            displayName: '文本框输入',
            name: 'input',
            tips: '输入时触发事件，事件回调参数 (value: String, event: Event)'
        },
        {
            displayName: '获取焦点',
            name: 'focus',
            tips: '获取焦点时触发事件，事件回调参数 (value: String, event: Event)'
        },
        {
            displayName: '失去焦点',
            name: 'blur',
            tips: '失去焦点时触发事件，事件回调参数 (value: String, event: Event)'
        },
        {
            displayName: '按下键盘',
            name: 'keypress',
            tips: '按下键盘时触发，事件回调参数 (value: String, event: Event)'
        },
        {
            displayName: '按下键盘',
            name: 'keydown',
            tips: '按下键盘时触发事件，事件回调参数 (value: String, event: Event)'
        },
        {
            displayName: '按下键盘后松开',
            name: 'keyup',
            tips: '按下键盘按键松开时触发事件，事件回调参数 (value: String, event: Event)'
        },
        {
            displayName: '聚焦后按下回车',
            name: 'enter',
            tips: '获取焦点时，按下回车时触发事件，事件回调参数 (value: String, event: Event)'
        },
        {
            displayName: '粘贴内容',
            name: 'paste',
            tips: '粘贴内容时触发事件，事件回调参数 (value: String, event: Event)'
        },
        {
            displayName: '点击文本框上清除图标',
            name: 'clear',
            tips: '清空值时触发事件，事件回调参数 (value: String, event: Event)'
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
        display: 'inline-flex',
        width: '300px'
    },
    groups: [
        { label: '输入内容', value: 'input' },
        { label: '类型', value: 'type' },
        { label: '提示', value: 'tip' },
        { label: '状态', value: 'state' },
        { label: 'hover时提示', value: 'tooltip' },
        { label: '前后缀', value: 'preSuffix' },
        { label: '数字输入框', value: 'inputNumber' },
        { label: '限制字数', value: 'limitLen' },
        { label: '样式', value: 'style' },
        { label: '其他', value: 'other' }
    ],
    props: {
        'model-value': {
            type: ['string', 'number'],
            val: '',
            directive: 'v-model',
            displayName: '输入框内容',
            belongGroup: 'input'
        },
        type: {
            type: 'string',
            options: ['text', 'password', 'number', 'email', 'url', 'date', 'textarea'],
            val: 'text',
            displayName: '输入框类型',
            tips: '输入框样式',
            belongGroup: 'type'
        },
        size: {
            type: 'string',
            options: ['small', 'default', 'large'],
            val: 'default',
            displayName: '尺寸',
            tips: '输入框尺寸，只在 type!=\'textarea\' 时有效',
            belongGroup: 'style'
        },
        'select-readonly': {
            type: 'boolean',
            val: false,
            displayName: '选择时只读',
            tips: '选择时只读',
            belongGroup: 'state'
        },
        'with-validate': {
            type: 'boolean',
            val: false,
            displayName: '值改变时触发字段校验规则',
            belongGroup: 'other'
        },
        placeholder: {
            type: 'string',
            val: '请输入',
            displayName: '空值时提示文案',
            tips: '空白提示',
            belongGroup: 'tip'
        },
        disabled: {
            type: 'boolean',
            val: false,
            displayName: '是否禁用',
            tips: '是否不可用',
            belongGroup: 'state'
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
            displayName: '是否可清除',
            tips: '是否可清除。数字输入框时，此配置不生效',
            belongGroup: 'state'
        },
        behavior: {
            type: 'string',
            options: ['normal', 'simplicity'],
            val: 'normal',
            displayName: '显示风格设置',
            tips: '简约风格设置(simplicity:简约 normal:正常 type=textarea时不生效)',
            belongGroup: 'style'
        },
        'show-controls': {
            type: 'boolean',
            val: true,
            displayName: '是否显示右侧控制箭头',
            tips: 'type 为number 时，是否显示右侧控制箭头',
            belongGroup: 'other'
        },
        maxlength: {
            type: 'number',
            displayName: '最大输入长度',
            tips: '最大输入长度',
            belongGroup: 'limitLen'
        },
        max: {
            type: 'number',
            displayName: '最大值',
            tips: '最大值',
            belongGroup: 'inputNumber'
        },
        min: {
            type: 'number',
            displayName: '最小值',
            tips: '最小值',
            belongGroup: 'inputNumber'
        },
        'show-word-limit': {
            type: 'boolean',
            val: false,
            displayName: '是否显示输入字数统计',
            tips: '是否显示输入字数统计，只在 type = "text" 或 type = "textarea" 时有效',
            belongGroup: 'limitLen'
        },
        'show-control': {
            type: 'boolean',
            val: true,
            displayName: '是否有数字控制器',
            tips: '是否显示控制器，只在 type = \'number\'时有效',
            belongGroup: 'inputNumber'
        },
        'show-clear-only-hover': {
            type: 'boolean',
            val: true,
            displayName: '鼠标移入时显示清空按钮',
            tips: '鼠标移入时显示清空按钮',
            belongGroup: 'other'
        },
        suffix: {
            type: 'string',
            val: '',
            displayName: '后缀字符',
            tips: '后缀字符，当配置suffix slot时失效',
            belongGroup: 'preSuffix'
        },
        prefix: {
            type: 'string',
            val: '',
            displayName: '前缀字符',
            tips: '前缀字符，当配置prefix slot时失效',
            belongGroup: 'preSuffix'
        },
        step: {
            type: 'number',
            displayName: '步长',
            tips: '步长',
            belongGroup: 'inputNumber'
        },
        precision: {
            type: 'number',
            val: 0,
            options: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
            displayName: '保留小数位',
            tips: '保留小数位数',
            belongGroup: 'inputNumber'
        },
        minlength: {
            type: 'number',
            displayName: '最小输入长度',
            tips: '最小输入长度',
            belongGroup: 'limitLen'
        },
        name: {
            type: 'string',
            displayName: '名称',
            tips: '名称',
            belongGroup: 'other'
        },
        overMaxLengthLimit: {
            type: 'boolean',
            displayName: '超出最大字数限制后是否可以继续输入',
            tips: '超出最大字数限制后是否可以继续输入，结合maxlength使用',
            belongGroup: 'limitLen'
        },
        showOverflowTooltips: {
            type: 'boolean',
            displayName: '文本超出长度是否显示tooltips',
            tips: '文本超出长度是否显示tooltips',
            belongGroup: 'tooltip'
        },
        autosize: {
            type: ['boolean', 'object'],
            displayName: '内容自动调整的高度',
            tips: '设置文本框autosize属性使得根据内容自动调整的高度。你可以给autosize提供一个包含有最大行数和最小行数的对象，让输入框自动调整。',
            belongGroup: 'other'
        },
        stopPropagation: {
            type: 'boolean',
            displayName: '是否阻止事件冒泡',
            tips: '是否阻止事件冒泡',
            belongGroup: 'other'
        }
    }
}
