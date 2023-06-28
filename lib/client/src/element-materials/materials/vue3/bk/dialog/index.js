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
        isShow: {
            type: 'boolean',
            val: true,
            staticValue: true,
            tips: '是否显示弹框，支持v-model双向绑定',
            directive: 'v-model'
        },
        title: {
            type: 'string',
            val: '标题'
        },
        theme: {
            type: 'string',
            options: ['primary', 'success', 'warning', 'danger'],
            val: 'primary',
            tips: '主题'
        },
        headerAlign: {
            type: 'string',
            val: 'left',
            options: ['left', 'center', 'right'],
            tips: '显示 header 的位置'

        },
        footerAlign: {
            type: 'string',
            val: 'right',
            options: ['left', 'center', 'right'],
            tips: '显示 footer 的位置'
        },
        dialogType: {
            type: 'string',
            options: ['show', 'operation', 'confirm', 'process'],
            val: 'operation',
            tips: '对话框类型'
        },
        size: {
            type: 'string',
            val: 'normal',
            options: ['large', 'small', 'normal', 'medium'],
            tips: '尺寸大小'
        },
        maskClose: {
            type: 'boolean',
            val: false,
            staticValue: false
        },
        closeIcon: {
            type: 'boolean',
            val: true
        },
        escClose: {
            type: 'boolean',
            val: false,
            staticValue: false
        },
        fullscreen: {
            type: 'boolean',
            val: false,
            tips: '是否全屏'
        },
        draggable: {
            type: 'boolean',
            val: true,
            tips: '是否可拖拽'
        },
        quickClose: {
            type: 'boolean',
            val: true,
            staticValue: false,
            tips: '是否允许点击遮罩关闭弹窗'
        },
        scrollable: {
            type: 'boolean',
            val: true,
            tips: '弹框出现时，是否允许页面滚动'
        },
        width: {
            type: ['number', 'string'],
            val: 480
        },
        height: {
            type: ['number', 'string'],
            val: 240
        },
        isLoading: {
            type: 'boolean',
            val: false
        },
        confirmText: {
            type: 'string',
            val: '确定',
            tips: '确认按钮文字'
        },
        showMask: {
            type: 'boolean',
            val: true,
            staticValue: false,
            tips: '是否显示遮罩层'
        },
        multiInstance: {
            type: 'boolean',
            val: true,
            tips: '是否允许多个弹框同时存在'
        },
        cancelText: {
            type: 'string',
            val: '取消',
            tips: '取消按钮文字'
        },
        prevText: {
            type: 'string',
            val: '上一步',
            tips: '上一步按钮文字'
        },
        nextText: {
            type: 'string',
            val: '下一步',
            tips: '下一步按钮文字'
        },
        current: {
            type: 'number',
            val: 1,
            tips: '当前步骤'
        },
        totalStep: {
            type: 'number',
            val: 0,
            tips: '总步数'
        },
        autoClose: {
            type: 'boolean',
            val: true
        },
        transfer: {
            type: 'string',
            val: 'body',
            staticValue: 'parent'
        },
        maxHeight: {
            type: 'string',
            val: ''
        },
        direction: {
            type: 'string',
            val: 'slide'
        },
        animateType: {
            type: 'string',
            val: ''
        },
        renderDirective: {
            type: 'string',
            options: ['show', 'if'],
            val: 'show',
            tips: '弹框的渲染方式'
        },
        beforeClose: {
            type: 'function',
            val: ''
        },
        zIndex: {
            type: 'number',
            val: 10
        }
    },
    slots: {
        default: {
            name: ['layout'],
            type: ['render-block']
        }
    }
}
