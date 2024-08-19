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
    document: 'https://magicbox.bk.tencent.com/magicbox/3.0/dialog',
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
            name: 'prev',
            tips: '流程型对话框中，点击上一步触发'
        },
        {
            name: 'next',
            tips: '流程型对话框中，点击下一步触发'
        },
        {
            name: 'closed',
            tips: '关闭弹框时调用该事件函数'
            
        }
    ],
    renderStyles: {
        display: 'inline-block'
    },
    props: {
        'is-show': {
            type: 'boolean',
            val: true,
            staticValue: true,
            displayName: '是否显示弹框',
            tips: '是否显示弹框，支持v-model双向绑定',
            directive: 'v-model'
        },
        title: {
            type: 'string',
            val: '标题',
            displayName: '弹框标题'
        },
        'confirm-button-theme': {
            type: 'string',
            options: ['primary', 'success', 'warning', 'danger'],
            val: 'primary',
            displayName: '确认按钮主题',
            tips: '主题'
        },
        'header-align': {
            type: 'string',
            val: 'left',
            options: ['left', 'center', 'right'],
            displayName: '标题位置',
            tips: '显示 header 的位置'

        },
        'footer-align': {
            type: 'string',
            val: 'right',
            options: ['left', 'center', 'right'],
            displayName: '底部内容位置',
            tips: '显示 footer 的位置'
        },
        'dialog-type': {
            type: 'string',
            options: ['show', 'operation', 'confirm', 'process'],
            val: 'operation',
            displayName: '对话框类型',
            tips: '对话框类型'
        },
        size: {
            type: 'string',
            val: 'normal',
            options: ['large', 'small', 'normal', 'medium'],
            displayName: '尺寸',
            tips: '尺寸大小'
        },
        'close-icon': {
            type: 'boolean',
            val: true,
            displayName: '是否显示关闭图标'
        },
        'esc-close': {
            type: 'boolean',
            val: false,
            staticValue: false,
            displayName: '是否esc键关闭弹框'
        },
        fullscreen: {
            type: 'boolean',
            val: false,
            displayName: '是否全屏',
            tips: '是否全屏'
        },
        draggable: {
            type: 'boolean',
            val: true,
            displayName: '是否可拖拽',
            tips: '是否可拖拽'
        },
        'quick-close': {
            type: 'boolean',
            val: true,
            staticValue: false,
            displayName: '是否可点击遮罩关闭弹框',
            tips: '是否允许点击遮罩关闭弹窗'
        },
        scrollable: {
            type: 'boolean',
            val: true,
            displayName: '是否页面会滚动',
            tips: '弹框出现时，是否允许页面滚动'
        },
        width: {
            type: ['number', 'string'],
            val: 480,
            displayName: '对话框宽度'
        },
        height: {
            type: ['number', 'string'],
            val: 240,
            displayName: '对话框高度'
        },
        'is-loading': {
            type: 'boolean',
            val: false,
            displayName: '是否加载中状态'
        },
        'confirm-text': {
            type: 'string',
            val: '确定',
            displayName: '确认按钮文字显示',
            tips: '确认按钮文字'
        },
        'show-mask': {
            type: 'boolean',
            val: true,
            staticValue: false,
            displayName: '是否显示遮罩层',
            tips: '是否显示遮罩层'
        },
        'multi-instance': {
            type: 'boolean',
            val: true,
            displayName: '是否多个弹框可同时存在',
            tips: '是否允许多个弹框同时存在'
        },
        'cancel-text': {
            type: 'string',
            val: '取消',
            displayName: '取消按钮文字显示',
            tips: '取消按钮文字'
        },
        'prev-text': {
            type: 'string',
            val: '上一步',
            displayName: '上一步按钮文字',
            tips: '上一步按钮文字'
        },
        'next-text': {
            type: 'string',
            val: '下一步',
            displayName: '下一步按钮文字',
            tips: '下一步按钮文字'
        },
        current: {
            type: 'number',
            val: 1,
            displayName: '当前步骤',
            tips: '当前步骤'
        },
        'total-step': {
            type: 'number',
            val: 0,
            displayName: '总步数',
            tips: '总步数'
        },
        transfer: {
            type: 'boolean',
            val: true,
            staticValue: false,
            displayName: '是否将弹框插入到 body'
        },
        'render-directive': {
            type: 'string',
            options: ['show', 'if'],
            val: 'show',
            displayName: '弹框的渲染方式',
            tips: '弹框的渲染方式'
        },
        'before-close': {
            type: 'function',
            val: '',
            displayName: '关闭前回调函数'
        },
        'z-index': {
            type: 'number',
            val: 10,
            displayName: 'zindex层级'
        }
    },
    slots: {
        default: {
            name: ['layout'],
            type: ['render-block']
        }
    }
}
