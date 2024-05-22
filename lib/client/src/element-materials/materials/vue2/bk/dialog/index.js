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
            name: 'confirm',
            tips: '点击确定按钮时调用该事件函数，暂无事件回调参数'
        },
        {
            name: 'cancel',
            tips: '点击取消按钮时调用该事件函数，主动调用关闭才会触发，通过改变双向绑定的值关闭弹框时不会触发，暂无事件回调参数'
        },
        {
            name: 'value-change',
            tips: '弹框显示状态变化时调用该事件函数，暂无事件回调参数'
        },
        {
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
    props: {
        'value': {
            type: 'boolean',
            val: false,
            staticValue: true,
            displayName: '是否显示弹框',
            tips: '是否显示弹框，支持v-model双向绑定'
        },
        'title': {
            type: 'string',
            val: '这是标题',
            displayName: '设置弹框标题'
        },
        'theme': {
            type: 'string',
            options: ['primary', 'success', 'warning', 'danger'],
            val: 'success',
            displayName: '确认按钮主题'
        },
        'header-position': {
            type: 'string',
            options: ['left', 'center'],
            displayName: '设置标题位置'
        },
        'show-footer': {
            type: 'boolean',
            val: true,
            displayName: '是否显示底部内容',
            tips: '是否显示 footer'
        },
        'footer-position': {
            type: 'string',
            options: ['left', 'center', 'right'],
            displayName: '设置底部内容位置'
        },
        'mask-close': {
            type: 'boolean',
            val: false,
            displayName: '是否可点击遮罩关闭弹框'
        },
        'close-icon': {
            type: 'boolean',
            val: true,
            displayName: '是否显示关闭图标'
        },
        'fullscreen': {
            type: 'boolean',
            val: false,
            displayName: '是否全屏弹框'
        },
        'draggable': {
            type: 'boolean',
            val: false,
            displayName: '是否弹框可拖拽'
        },
        'scrollable': {
            type: 'boolean',
            val: false,
            displayName: '是否页面可滚动'
        },
        'width': {
            type: 'number',
            val: 400,
            displayName: '设置弹框宽度'
        },
        'show-mask': {
            type: 'boolean',
            val: true,
            staticValue: false,
            displayName: '遮罩是否出现'
        },
        'ok-text': {
            type: 'string',
            val: '确定',
            displayName: '确认按钮文字显示'
        },
        'cancel-text': {
            type: 'string',
            val: '取消',
            displayName: '取消按钮文字显示'
        },
        'auto-close': {
            type: 'boolean',
            val: true,
            displayName: '确认时是否关闭弹框'
        },
        transfer: {
            type: 'boolean',
            val: true,
            staticValue: false,
            displayName: 'dialog标签是否放到body内'
        }
    },
    slots: {
        default: {
            name: ['layout'],
            type: ['render-block']
        }
    }
}
