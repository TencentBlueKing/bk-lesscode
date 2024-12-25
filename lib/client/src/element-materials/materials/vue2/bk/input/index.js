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
    document: 'https://magicbox.bk.tencent.com/static_api/v3/components_vue/2.0/example/index.html#/input',
    events: [
        {
            displayName: '文本框内容变化',
            name: 'change',
            tips: '文本框内容变化时调用该事件函数，事件回调参数 (value: String, event: Event)'
        },
        {
            displayName: '文本框输入',
            name: 'input',
            tips: '文本框输入时调用该事件函数，事件回调参数 (value: String, event: Event)'
        },
        {
            displayName: '文本框聚焦',
            name: 'focus',
            tips: '文本框获取焦点时调用该事件函数，事件回调参数 (value: String, event: Event)'
        },
        {
            displayName: '文本框失焦',
            name: 'blur',
            tips: '文本框失去焦点时调用该事件函数，事件回调参数 (value: String, event: Event)'
        },
        {
            displayName: '文本框输入按下键盘',
            name: 'keypress',
            tips: '文本框输入按下键盘时调用该事件函数，事件回调参数 (value: String, event: Event)'
        },
        {
            displayName: '文本框输入按下键盘',
            name: 'keydown',
            tips: '文本框输入按下键盘时调用该事件函数，事件回调参数 (value: String, event: Event)'
        },
        {
            displayName: '文本框输入按下键盘后松开',
            name: 'keyup',
            tips: '文本框输入按下键盘按键松开时调用该事件函数，事件回调参数 (value: String, event: Event)'
        },
        {
            displayName: '文本框聚焦后按下回车',
            name: 'enter',
            tips: '文本框获取焦点时，按下回车时调用该事件函数，事件回调参数 (value: String, event: Event)'
        },
        {
            displayName: '文本框粘贴内容',
            name: 'paste',
            tips: '文本框粘贴内容时调用该事件函数，事件回调参数 (value: String, event: Event)'
        },
        {
            displayName: '点击文本框上清除图标',
            name: 'clear',
            tips: '点击文本框的清除图标时调用该事件函数，事件回调参数 (value: String, event: Event)'
        },
        {
            displayName: '点击文本框上左图标',
            name: 'left-icon-click',
            tips: '点击配置的左图标时调用该事件函数，事件回调参数 (value: String, event: Event)'
        },
        {
            displayName: '点击文本框上右图标',
            name: 'right-icon-click',
            tips: '点击配置的右图标时调用该事件函数，事件回调参数 (value: String, event: Event)'
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
        verticalAlign: 'middle',
        width: '300px'
    },
    directives: [
        {
            type: 'v-model',
            prop: 'value'
        }
    ],
    groups: [
        { label: '输入内容', value: 'input' },
        { label: '类型', value: 'type' },
        { label: '提示', value: 'tip' },
        { label: '状态', value: 'state' },
        { label: '限制字数', value: 'limitLen' },
        { label: '图标', value: 'icon' },
        { label: '样式', value: 'style' },
        { label: '其他', value: 'other' }
    ],
    props: {
        value: {
            type: ['string', 'number'],
            val: '',
            displayName: '输入框内容',
            tips: '输入框内容，支持v-model双向绑定，v-model优先级更高',
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
        'font-size': {
            type: 'string',
            options: ['normal', 'medium', 'large'],
            val: 'normal',
            displayName: '输入框内容字体大小',
            tips: '设置输入框内容字体大小：normal--12px；medium--14px；large--16px',
            belongGroup: 'style'
        },
        placeholder: {
            type: 'string',
            displayName: '空值时提示文案',
            tips: '空白提示',
            belongGroup: 'tip'
        },
        disabled: {
            type: 'boolean',
            val: false,
            displayName: '是否禁用',
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
            displayName: '是否清空',
            belongGroup: 'state'
        },
        behavior: {
            type: 'string',
            options: ['normal', 'simplicity'],
            val: 'normal',
            displayName: '显示风格设置',
            tips: '设置simplicity为简约风格',
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
        minlength: {
            type: 'number',
            displayName: '最小输入长度',
            tips: '最小输入长度',
            belongGroup: 'limitLen'
        },
        name: {
            type: 'string',
            displayName: '输入框名称',
            tips: 'html 原生属性 name',
            belongGroup: 'other'
        },
        leftIcon: {
            type: 'icon',
            displayName: '左侧图标',
            belongGroup: 'icon'
        },
        'right-icon': {
            type: 'icon',
            displayName: '右侧图标',
            belongGroup: 'icon'
        },
        precision: {
            type: 'number',
            options: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
            displayName: '保留小数位',
            tips: '保留小数位',
            belongGroup: 'other'
        },
        inputStyle: {
            type: 'object',
            displayName: '样式',
            tips: '样式',
            belongGroup: 'style'
        },
        size: {
            type: 'string',
            options: ['large', 'small'],
            displayName: '输入框尺寸',
            tips: '输入框尺寸，只在type!="textarea"时有效，字号可通过font-size属性覆盖',
            belongGroup: 'style'
        },
        passwordIcon: {
            type: 'array',
            displayName: '密码框切换显示密码的icon',
            tips: '设置密码框切换显示密码的icon',
            belongGroup: 'icon'
        },
        extCls: {
            type: 'string',
            displayName: '最外层元素的类名',
            tips: '配置自定义样式类名，传入的类会被加在组件最外层的DOM.bk-form-control上',
            belongGroup: 'style'
        },
        nativeAttributes: {
            type: 'object',
            displayName: 'input标签原生属性设置',
            tips: 'Htmlinput标签原生属性设置',
            belongGroup: 'other'
        },
        showWordLimit: {
            type: 'boolean',
            displayName: '是否显示输入字数统计',
            tips: '是否显示输入字数统计，只在type="text"或type="textarea"时有效',
            belongGroup: 'limitLen'
        },
        showClearOnlyHover: {
            type: 'boolean',
            val: false,
            displayName: '是否在只有hover时显示清除按钮',
            tips: '是否在只有hover的时候才显示clear清除按钮',
            belongGroup: 'other'
        },
        allowNumberPaste: {
            type: 'boolean',
            val: false,
            displayName: '是否可粘贴',
            tips: '允许type为number时可粘贴',
            belongGroup: 'other'
        }
    }
}
