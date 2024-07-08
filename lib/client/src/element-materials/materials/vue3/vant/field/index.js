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
    name: 'van-field',
    type: 'van-field',
    // bk-drag-custom-comp-default
    icon: 'bk-drag-input',
    displayName: '输入框',
    group: '表单',
    document: 'https://vant-contrib.gitee.io/vant/#/zh-CN/field',
    events: [
        {
            name: 'focus',
            tips: '输入框获得焦点时调用该事件函数，事件回调参数 (event: Event)'
        },
        {
            name: 'blur',
            tips: '输入框失去焦点时调用该事件函数，事件回调参数 (event: Event)'
        },
        {
            name: 'clear',
            tips: '点击清除按钮时调用该事件函数，事件回调参数 (event: Event)'
        },
        {
            name: 'click',
            tips: '点击 Field 时调用该事件函数，事件回调参数 (event: Event)'
        },
        {
            name: 'click-input',
            tips: '点击输入区域时调用该事件函数，事件回调参数 (event: Event)'
        },
        {
            name: 'click-left-icon',
            tips: '点击左侧图标时调用该事件函数，事件回调参数 (event: Event)'
        },
        {
            name: 'click-right-icon',
            tips: '点击右侧图标时调用该事件函数，事件回调参数 (event: Event)'
        },
        {
            name: 'start-validate',
            tips: '开始表单校验时触发，事件回调参数 (event: Event)'
        },
        {
            name: 'end-validate',
            tips: '结束表单校验时触发，事件回调参数 (event: Event)'
        }
    ],
    styles: [
        'position',
        {
            name: 'size',
            include: ['display', 'width', 'min-width', 'max-width']
        },
        'margin',
        'pointer',
        'opacity'
    ],
    props: {
        'model-value': {
            type: ['string', 'number'],
            val: '',
            displayName: '当前输入的值',
            tips: '当前输入的值',
            directive: 'v-model'
        },
        label: {
            type: 'string',
            displayName: '左侧标签名',
            tips: '输入框左侧文本',
            val: '文本'
        },
        name: {
            type: 'string',
            val: '',
            displayName: '输入框名称',
            tips: '名称，提交表单的标识符'
        },
        id: {
            type: 'string',
            val: 'van-field-n-input',
            displayName: '字段唯一标识',
            tips: '输入框 id，同时会设置 label 的 for 属性'
        },
        type: {
            type: 'string',
            options: ['text', 'tel', 'digit', 'password', 'number', 'textarea'],
            val: 'text',
            displayName: '输入框类型',
            tips: '输入框类型'
        },
        size: {
            type: 'string',
            options: ['normal', 'large'],
            val: 'normal',
            displayName: '输入框大小',
            tips: '大小'
        },
        maxlength: {
            type: 'number',
            val: 50,
            displayName: '最大输入长度',
            tips: '输入的最大字符数'
        },
        placeholder: {
            type: 'string',
            displayName: '空值时提示文案',
            tips: '输入框占位提示文字',
            val: '请输入文本'
        },
        border: {
            type: 'boolean',
            val: true,
            displayName: '是否显示内边框',
            tips: '是否显示内边框'
        },
        disabled: {
            type: 'boolean',
            val: false,
            displayName: '是否禁用',
            tips: '是否禁用输入框'
        },
        readonly: {
            type: 'boolean',
            val: false,
            displayName: '是否只读',
            tips: '是否只读'
        },
        colon: {
            type: 'boolean',
            val: false,
            displayName: '是否在标签名后加冒号',
            tips: '是否在 label 后面添加冒号'
        },
        required: {
            type: 'boolean',
            val: false,
            displayName: '是否添加必填星号',
            tips: '是否显示表单必填星号'
        },
        center: {
            type: 'boolean',
            val: false,
            displayName: '内容是否垂直居中',
            tips: '是否使内容垂直居中'
        },
        clearable: {
            type: 'boolean',
            val: false,
            displayName: '是否显示清除图标',
            tips: '是否启用清除图标，点击清除图标后会清空输入框'
        },
        'clear-icon': {
            type: 'van-icon',
            val: 'clear',
            displayName: '清除图标或图片',
            tips: '清除图标名称或图片链接，等同于 Icon 组件的 name 属性'
        },
        'clear-trigger': {
            type: 'string',
            options: ['always', 'focus'],
            val: 'focus',
            displayName: '显示清除图标的动作',
            tips: '显示清除图标的时机，always 表示输入框不为空时展示，focus 表示输入框聚焦且不为空时展示'
        },
        clickable: {
            type: 'boolean',
            val: false,
            displayName: '是否可点击反馈',
            tips: '是否开启点击反馈'
        },
        'is-link': {
            type: 'boolean',
            val: false,
            displayName: '是否显示右侧箭头',
            tips: '是否展示右侧箭头并开启点击反馈'
        },
        autofocus: {
            type: 'boolean',
            val: false,
            displayName: '是否自动聚焦',
            tips: '是否自动聚焦，iOS 系统不支持该属性'
        },
        'show-word-limit': {
            type: 'boolean',
            val: false,
            displayName: '是否显示字数统计',
            tips: '是否显示字数统计，需要设置maxlength属性'
        },
        error: {
            type: 'boolean',
            val: false,
            displayName: '输入内容是否标红',
            tips: '是否将输入内容标红'
        },
        'error-message': {
            type: 'string',
            displayName: '底部错误提示文案',
            tips: '底部错误提示文案，为空时不展示'
        },
        'error-message-align': {
            type: 'string',
            options: ['left', 'center', 'right'],
            val: 'left',
            displayName: '错误提示文案对齐方式',
            tips: '错误提示文案对齐方式，可选值为 center right'
        },
        'arrow-direction': {
            type: 'string',
            options: ['left', 'up', 'down', 'right'],
            val: 'right',
            displayName: '箭头方向',
            tips: '箭头方向'
        },
        'label-class': {
            type: ['string', 'array ', 'object'],
            val: '',
            displayName: '左侧标签样式',
            tips: '左侧文本额外类名'
        },
        'label-width': {
            type: ['string', 'number'],
            val: '6.2em',
            displayName: '左侧标签名宽度',
            tips: '左侧文本宽度，默认单位为px'
        },
        'label-align': {
            type: 'string',
            options: ['center', 'left', 'right'],
            val: 'left',
            displayName: '标签名对齐方式',
            tips: '左侧文本对齐方式'
        },
        'input-align': {
            type: 'string',
            options: ['center', 'left', 'right'],
            val: 'left',
            displayName: '输入框对齐方式',
            tips: '输入框对齐方式'
        },
        autosize: {
            type: ['boolean', 'object'],
            val: false,
            displayName: '是否自适应内容高度',
            tips: '是否自适应内容高度，只对 textarea 有效，可传入对象,如 { maxHeight: 100, minHeight: 50 }'
        },
        'left-icon': {
            type: 'van-icon',
            val: '',
            displayName: '左侧图标或图片'
        },
        'right-icon': {
            type: 'van-icon',
            val: '',
            displayName: '右侧图标或图片'
        },
        'icon-prefix': {
            type: 'string',
            val: 'van-icon',
            displayName: '图标类名前缀',
            tips: '图标类名前缀，等同于 Icon 组件的 class-prefix 属性'
        },
        rules: {
            type: 'array',
            val: [],
            displayName: '输入值的校验规则',
            tips: '表单校验规则，详见 Form 组件'
        },
        autocomplete: {
            type: 'string',
            val: '',
            displayName: '浏览器预测补全',
            tips: 'input 标签原生的自动完成属性'
        },
        enterkeyhint: {
            type: 'string',
            displayName: '设置回车键样式',
            tips: 'HTML 原生属性，用于控制回车键样式，此 API 仅在部分浏览器支持，详见 MDN - enterkeyhint',
            val: ''
        }
    }
    
}
