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
    name: 'dialog',
    type: 'bk-dialog',
    displayName: '对话框',
    icon: 'bk-drag-dialog',
    group: '反馈',
    order: 1,
    interactiveShow: false,
    document: 'https://magicbox.bk.tencent.com/static_api/v3/components_vue/2.0/example/index.html#/dialog',
    events: [
        {
            displayName: '点击确定按钮',
            name: 'confirm',
            tips: '点击确定按钮时调用该事件函数，暂无事件回调参数'
        },
        {
            displayName: '点击取消按钮',
            name: 'cancel',
            tips: '点击取消按钮时调用该事件函数，主动调用关闭才会触发，通过改变双向绑定的值关闭弹框时不会触发，暂无事件回调参数'
        },
        {
            displayName: '弹框显示状态变化',
            name: 'value-change',
            tips: '弹框显示状态变化时调用该事件函数，暂无事件回调参数'
        },
        {
            displayName: '弹框消失动画结束',
            name: 'after-leave',
            tips: '弹框消失的动画结束后调用该事件函数，暂无事件回调参数'
        }
    ],
    renderStyles: {
        display: 'inline-block'
    },
    directives: [
        {
            type: 'v-model',
            prop: 'value'
        }
    ],
    groups: [
        { label: 'header区域', value: 'header' },
        { label: 'footer区域', value: 'footer' },
        { label: '状态', value: 'state' },
        { label: '渲染方式', value: 'render' },
        { label: '样式', value: 'style' },
        { label: '其他', value: 'other' }
    ],
    props: {
        'value': {
            type: 'boolean',
            val: false,
            staticValue: true,
            displayName: '是否显示弹框',
            tips: '是否显示弹框，支持v-model双向绑定',
            belongGroup: 'state'
        },
        'title': {
            type: 'string',
            val: '这是标题',
            displayName: '弹框标题',
            belongGroup: 'header'
        },
        'theme': {
            type: 'string',
            options: ['primary', 'success', 'warning', 'danger'],
            val: 'success',
            displayName: '确认按钮主题',
            belongGroup: 'footer'
        },
        'header-position': {
            type: 'string',
            options: ['left', 'center'],
            displayName: '标题位置',
            belongGroup: 'header'
        },
        'show-footer': {
            type: 'boolean',
            val: true,
            displayName: '是否显示底部内容',
            tips: '是否显示 footer',
            belongGroup: 'footer'
        },
        'footer-position': {
            type: 'string',
            options: ['left', 'center', 'right'],
            displayName: '底部内容位置',
            belongGroup: 'footer'
        },
        'mask-close': {
            type: 'boolean',
            val: false,
            displayName: '是否可点击遮罩关闭弹框',
            belongGroup: 'state'
        },
        'close-icon': {
            type: 'boolean',
            val: true,
            displayName: '是否显示关闭图标',
            belongGroup: 'state'
        },
        'fullscreen': {
            type: 'boolean',
            val: false,
            displayName: '是否全屏弹框',
            belongGroup: 'state'
        },
        'draggable': {
            type: 'boolean',
            val: false,
            displayName: '是否弹框可拖拽',
            belongGroup: 'state'
        },
        'scrollable': {
            type: 'boolean',
            val: false,
            displayName: '是否页面可滚动',
            belongGroup: 'state'
        },
        'width': {
            type: 'number',
            val: 400,
            displayName: '弹框宽度',
            belongGroup: 'style'
        },
        'show-mask': {
            type: 'boolean',
            val: true,
            staticValue: false,
            displayName: '遮罩是否出现',
            belongGroup: 'state'
        },
        'ok-text': {
            type: 'string',
            val: '确定',
            displayName: '确认按钮文字显示',
            belongGroup: 'footer'
        },
        'cancel-text': {
            type: 'string',
            val: '取消',
            displayName: '取消按钮文字显示',
            belongGroup: 'footer'
        },
        'auto-close': {
            type: 'boolean',
            val: true,
            displayName: '确认时是否关闭弹框',
            belongGroup: 'state'
        },
        'transfer': {
            type: 'boolean',
            val: true,
            staticValue: false,
            displayName: 'dialog标签是否放到body内',
            belongGroup: 'state'
        },
        'renderDirective': {
            type: 'string',
            options: ['if', 'show'],
            val: 'show',
            displayName: '弹框的渲染方式',
            tips: '弹框的渲染方式',
            belongGroup: 'render'
        },
        'position': {
            type: 'object',
            displayName: '设置层的位置',
            tips: '设置层的位置，接收top,left两个属性。',
            belongGroup: 'style'
        },
        'escClose': {
            type: 'boolean',
            val: true,
            displayName: '是否允许esc按键关闭弹框',
            tips: '是否允许esc按键关闭弹框',
            belongGroup: 'other'
        },
        'onClose': {
            type: 'function',
            displayName: '点击取消时触发的回调方法',
            tips: '点击取消时触发的回调方法，参数是Dialog的this对象',
            belongGroup: 'other'
        },
        'confirmFn': {
            type: 'function',
            displayName: '点击确认时触发的回调方法',
            tips: '点击确认时触发的回调方法，参数是Dialog的this对象',
            belongGroup: 'other'
        },
        'extCls': {
            type: 'string',
            displayName: '最外层元素的类名',
            tips: '配置自定义样式类名，传入的类会被加在组件最外层的DOM.bk-dialog-wrapper上',
            belongGroup: 'style'
        },
        'zIndex': {
            type: 'number',
            displayName: '配置自定义层级',
            tips: '配置自定义层级',
            belongGroup: 'style'
        }
    },
    slots: {
        default: {
            name: ['layout'],
            type: ['render-block']
        }
    }
}
