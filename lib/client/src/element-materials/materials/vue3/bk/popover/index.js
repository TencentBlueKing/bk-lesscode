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
    name: 'popover',
    type: 'bk-popover',
    displayName: '弹出提示',
    icon: 'bk-drag-popover-2',
    group: '反馈',
    order: 1,
    document: 'https://magicbox.bk.tencent.com/magicbox/3.0/popover',
    events: [
        {
            name: 'show',
            tips: '显示提示框时触发函数'
        },
        {
            name: 'hide',
            tips: '隐藏提示框时触发函数'
        },
        {
            name: 'clickoutside',
            tips: ''
        },
        {
            name: 'contentMouseenter',
            tips: ''
        },
        {
            name: 'contentMouseleave',
            tips: ''
        },
        {
            name: 'stopHide',
            tips: ''
        }
    ],
    styles: [
        'position',
        {
            name: 'size',
            include: ['display']
        },
        'margin',
        'pointer',
        'opacity'
    ],
    directives: [
        {
            type: 'v-model',
            prop: 'isShow'
        }
    ],
    props: {
        isShow: {
            type: 'boolean',
            val: false,
            tips: '控制显示、隐藏'
        },
        content: {
            type: 'string',
            val: '这里是提示文字',
            tips: '显示的内容',
            'v-bind': ''
        },
        disabled: {
            type: 'boolean',
            val: false,
            tips: '是否禁用提示框'
        },
        theme: {
            type: 'string',
            options: ['light', 'dark'],
            val: 'dark',
            tips: '组件主题色'
        },
        placement: {
            type: 'string',
            val: 'top',
            options: ['auto', 'auto-start', 'auto-end', 'top', 'top-start', 'top-end', 'bottom', 'bottom-start', 'bottom-end', 'right', 'right-start', 'right-end', 'left', 'left-start', 'left-end'],
            tips: '组件显示位置'
        },
        trigger: {
            type: 'string',
            options: ['click', 'hover', 'manual'],
            val: 'hover',
            tips: '触发方式。如果值为manual，则通过isShow控制显示、隐藏'
        },
        renderType: {
            type: 'string',
            options: ['auto', 'shown'],
            val: 'auto',
            tips: '内容渲染方式'
        },
        arrow: {
            type: 'boolean',
            val: true,
            tips: '是否显示箭头'
        },
        padding: {
            type: 'number',
            val: 5,
            tips: '内边距'
        },
        width: {
            type: ['string', 'number'],
            val: 'auto',
            tips: '提示框的内容容器的宽度'
        },
        height: {
            type: ['string', 'number'],
            val: 'auto',
            tips: '提示框的内容容器的高度'
        },
        maxHeight: {
            type: ['string', 'number'],
            val: 'auto',
            tips: '提示框的内容容器的最大高度'
        },
        offset: {
            type: 'number',
            val: 6
        },
        boundary: {
            type: 'string',
            val: 'parent'
        },
        always: {
            type: 'boolean',
            val: false,
            tips: '是否总是可见'
        },
        disableTeleport: {
            type: 'boolean',
            val: false
        },
        autoVisibility: {
            type: 'boolean',
            val: true,
            tips: '当有滚动条，滚动出可是范围时自动隐藏pop'
        },
        disableOutsideClick: {
            type: 'boolean',
            val: false,
            tips: '是否禁用clickoutside'
        },
        disableTransform: {
            type: 'boolean',
            val: false,
            tips: '是否禁用样式的transform更新位移'
        },
        popoverDelay: {
            type: 'number',
            val: 100,
            tips: 'popover显示和隐藏的延时时间'
        },
        onAfterHidden: {
            type: 'function',
            val: () => {},
            tips: ''
        },
        onAfterShow: {
            type: 'function',
            val: () => {},
            tips: ''
        },
        zIndex: {
            type: 'number',
            val: 1,
            tips: '弹出层z-index'
        }
    },
    slots: {
        default: {
            name: ['html'],
            type: ['html'],
            displayName: '展示内容',
            tips: '组件默认插槽，请编写html，用于组件自身展示',
            val: '<bk-button>多行</bk-button>'
        },
        content: {
            name: ['html'],
            type: ['html'],
            displayName: '弹层内容',
            tips: '组件 content 插槽，请编写html，用于组件弹层展示',
            val: '<div class="bk-text-primary pt10 pb5 pl10 pr10">显示多行信息</div>'
        }
    }
}