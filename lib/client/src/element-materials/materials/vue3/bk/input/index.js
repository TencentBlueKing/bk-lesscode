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
            name: 'change',
            tips: '值变更时触发事件，事件回调参数 (value: String, event: Event)'
        },
        {
            name: 'input',
            tips: '输入时触发事件，事件回调参数 (value: String, event: Event)'
        },
        {
            name: 'focus',
            tips: '获取焦点时触发事件，事件回调参数 (value: String, event: Event)'
        },
        {
            name: 'blur',
            tips: '失去焦点时触发事件，事件回调参数 (value: String, event: Event)'
        },
        {
            name: 'keypress',
            tips: '按下键盘时触发，事件回调参数 (value: String, event: Event)'
        },
        {
            name: 'keydown',
            tips: '按下键盘时触发事件，事件回调参数 (value: String, event: Event)'
        },
        {
            name: 'keyup',
            tips: '按下键盘按键松开时触发事件，事件回调参数 (value: String, event: Event)'
        },
        {
            name: 'enter',
            tips: '获取焦点时，按下回车时触发事件，事件回调参数 (value: String, event: Event)'
        },
        {
            name: 'paste',
            tips: '粘贴内容时触发事件，事件回调参数 (value: String, event: Event)'
        },
        {
            name: 'clear',
            tips: '清空值时触发事件，事件回调参数 (value: String, event: Event)'
        },
        {
            name: 'left-icon-click',
            tips: '点击配置的左图标时调用该事件函数，事件回调参数 (value: String, event: Event)'
        },
        {
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
        display: 'inline-flex',
        width: '300px'
    },
    props: {
        modelValue: {
            type: 'string',
            val: '',
            directive: 'v-model'
        },
        type: {
            type: 'string',
            options: ['text', 'password', 'number', 'email', 'url', 'date', 'textarea'],
            val: 'text',
            tips: '输入框样式'
        },
        size: {
            type: 'string',
            options: ['small', 'default', 'large'],
            val: 'default',
            tips: '输入框尺寸，只在 type!=\'textarea\' 时有效'
        },
        rows: {
            type: 'number',
            val: 1,
            tips: '编辑框行数，只在 type!=\'textarea\' 时有效'
        },
        selectReadonly: {
            type: 'boolean',
            val: false,
            tips: '选择时只读'
        },
        withValidate: {
            type: 'boolean',
            val: false
        },
        placeholder: {
            type: 'string',
            val: '请输入',
            tips: '空白提示'
        },
        disabled: {
            type: 'boolean',
            val: false,
            tips: '是否不可用'
        },
        readonly: {
            type: 'boolean',
            val: false,
            tips: '是否只读'
        },
        clearable: {
            type: 'boolean',
            val: true,
            tips: '是否可清除。数字输入框时，此配置不生效'
        },
        behavior: {
            type: 'string',
            options: ['normal', 'simplicity'],
            val: 'normal',
            tips: '简约风格设置(simplicity:简约 normal:正常 type=textarea时不生效)'
        },
        showControls: {
            type: 'boolean',
            val: true,
            tips: 'type 为number 时，是否显示右侧控制箭头'
        },
        maxlength: {
            type: 'number',
            tips: '最大输入长度'
        },
        max: {
            type: 'number',
            tips: '最大值'
        },
        min: {
            type: 'number',
            tips: '最小值'
        },
        showWordLimit: {
            type: 'boolean',
            val: false,
            tips: '是否显示输入字数统计，只在 type = "text" 或 type = "textarea" 时有效'
        },
        showControl: {
            type: 'boolean',
            val: true,
            tips: '是否显示控制器，只在 type = \'number\'时有效'
        },
        showClearOnlyHover: {
            type: 'boolean',
            val: true,
            tips: '鼠标移入时显示清空按钮'
        },
        suffix: {
            type: 'string',
            val: '',
            tips: '后缀字符，当配置suffix slot时失效'
        },
        prefix: {
            type: 'string',
            val: '',
            tips: '前缀字符，当配置prefix slot时失效'
        },
        // prefixIcon: {
        //     type: 'icon',
        //     tips: '左图标'
        // },
        // suffixIcon: {
        //     type: 'icon',
        //     tips: '右图标'
        // },
        step: {
            type: 'number',
            tips: '步长'
        },
        precision: {
            type: 'number',
            val: 0,
            options: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
            tips: '保留小数位数'
        }
    }
}
