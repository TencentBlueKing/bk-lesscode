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
    document: 'https://magicbox.bk.tencent.com/static_api/v3/components_vue/2.0/example/index.html#/popover',
    renderStyles: {
        display: 'inline-block',
        verticalAlign: 'middle'
    },
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
    groups: [
        { label: '内容', value: 'content' },
        { label: '显示', value: 'display' },
        { label: '状态', value: 'state' },
        { label: '布局', value: 'layout' },
        { label: '样式', value: 'style' },
        { label: '其他', value: 'other' }
    ],
    props: {
        content: {
            type: 'string',
            val: '这里是提示文字',
            displayName: '显示的内容',
            tips: '显示的内容',
            'v-bind': '', // 用于动态绑定的属性
            belongGroup: 'content'
        },
        placement: {
            type: 'string',
            val: 'bottom',
            options: ['top', 'top-start', 'top-end', 'bottom', 'bottom-start', 'bottom-end', 'left', 'left-start', 'left-end', 'right', 'right-start', 'right-end'],
            displayName: '显示内容在的位置',
            tips: '组件显示位置',
            belongGroup: 'layout'
        },
        width: {
            type: ['string', 'number'],
            val: 'auto',
            displayName: '提示框宽度',
            tips: '提示框内容宽度',
            belongGroup: 'style'
        },
        'max-width': {
            type: ['string', 'number'],
            val: 'auto',
            displayName: '提示框最大宽度',
            tips: '提示框内容最大宽度',
            belongGroup: 'style'
        },
        always: {
            type: 'boolean',
            val: false,
            displayName: '是否总是可见',
            tips: '是否总是可见',
            belongGroup: 'display'
        },
        'z-index': {
            type: 'number',
            val: 2500,
            displayName: 'zindex层级',
            tips: '弹出层z-index',
            belongGroup: 'style'
        },
        delay: {
            type: 'number',
            val: 0,
            displayName: '延迟显示，单位毫秒',
            tips: '延迟显示，单位毫秒',
            belongGroup: 'other'
        },
        disabled: {
            type: 'boolean',
            val: false,
            displayName: '是否禁用提示框',
            tips: '是否禁用提示框',
            belongGroup: 'state'
        },
        transfer: {
            type: 'boolean',
            val: false,
            displayName: '弹层是否放到body内',
            tips: '将弹层放置于document.body内，使其不受父级样式影响，方便布局',
            belongGroup: 'state'
        },
        onShow: {
            type: 'function',
            displayName: '显示提示框时触发',
            tips: '显示提示框时触发',
            belongGroup: 'other'
        },
        onHide: {
            type: 'function',
            displayName: '隐藏提示框时触发',
            tips: '隐藏提示框时触发',
            belongGroup: 'other'
        },
        tippyOptions: {
            type: 'object',
            displayName: '配置其他tippyjs参数',
            tips: '更多的其他tippyjs参数参考tippyjs参数',
            belongGroup: 'other'
        },
        extCls: {
            type: 'string',
            displayName: '最外层元素的类名',
            tips: '配置自定义样式类名，传入的类会被加在组件最外层的DOM.tippy-popper上',
            belongGroup: 'style'
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
