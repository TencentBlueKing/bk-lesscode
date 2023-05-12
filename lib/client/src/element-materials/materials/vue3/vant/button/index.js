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
    name: 'van-button',
    type: 'van-button',
    // bk-drag-custom-comp-default
    icon: 'bk-drag-button',
    displayName: '按钮',
    group: '基础',
    document: 'https://vant-contrib.gitee.io/vant/#/zh-CN/button',
    events: [
        {
            name: 'click',
            tips: '点击时调用该事件函数，事件回调参数 (e: Event)'
        },
        {
            name: 'touchstart',
            tips: '开始触摸按钮时触发，事件回调参数 (e: TouchEvent)'
        }
    ],
    styles: [
        'position',
        'size',
        'margin',
        'pointer',
        'opacity'
    ],
    renderStyles: {
        display: 'inline-block'
    },
    props: {
        size: {
            type: 'string',
            val: 'normal',
            options: ['normal', 'large', 'small', 'mini'],
            tips: '尺寸'
        },
        type: {
            type: 'string',
            val: 'default',
            options: ['primary', 'warning', 'danger', 'success', 'default'],
            tips: '类型'
        },
        plain: {
            type: 'boolean',
            val: false,
            tips: '是否朴素按钮'
        },
        text: {
            type: 'string',
            val: '按钮文字',
            tips: '按钮文字'
        },
        color: {
            type: 'string',
            val: '',
            tips: '按钮颜色，支持传入 linear-gradient 渐变色'
        },
        icon: {
            type: 'van-icon',
            val: '',
            tips: '左侧图标名称或图片链接，等同于 Icon 组件的 name 属性'
        },
        'icon-prefix': {
            type: 'string',
            val: 'van-icon',
            tips: '图标类名前缀，等同于 Icon 组件的 class-prefix 属性'
        },
        'icon-position': {
            type: 'string',
            val: 'left',
            options: ['left', 'right'],
            tips: '图标展示位置，可选值为 right'
        },
        tag: {
            type: 'string',
            val: 'button',
            tips: '按钮根节点的 HTML 标签'
        },
        block: {
            type: 'boolean',
            val: false,
            tips: '是否为块级元素'
        },
        square: {
            type: 'boolean',
            val: false,
            tips: '是否为方形按钮'
        },
        round: {
            type: 'boolean',
            val: false,
            tips: '是否圆角按钮'
        },
        hairline: {
            type: 'boolean',
            val: false,
            tips: '是否使用 0.5px 边框'
        },
        loading: {
            type: 'boolean',
            val: false,
            'v-bind': '',
            tips: '是否加载中状态'
        },
        'loading-text': {
            type: 'string',
            val: '',
            vips: '加载状态提示文字'
        },
        'loading-type': {
            type: 'string',
            val: 'circular',
            options: ['circular', 'spinner'],
            tips: '加载图标类型'
        },
        'loading-size': {
            type: ['string', 'number'],
            val: '20px',
            tips: '加载图标大小，默认单位为 px'
        },
        url: {
            type: 'string',
            val: '',
            vips: '点击后跳转的链接地址'
        },
        to: {
            type: 'string',
            val: '',
            vips: '点击后跳转的目标路由对象，等同于 vue-router 的 to 属性'
        },
        replace: {
            type: 'boolean',
            val: false,
            vips: '是否在跳转时替换当前页面历史'
        },
        disabled: {
            type: 'boolean',
            val: false,
            'v-bind': '',
            tips: '是否禁用状态'
        },
        'native-type': {
            type: 'string',
            val: 'button',
            options: ['button', 'submit', 'reset'],
            tips: '原生 type 属性'
        }
    },
    slots: {
        default: {
            name: ['text'],
            type: ['text'],
            displayName: '文本',
            val: '默认按钮'
        }
        // icon: {
        //     name: ['html'],
        //     type: ['html'],
        //     displayName: '自定义图标',
        //     val: ''
        // },
        // loading: {
        //     name: ['html'],
        //     type: ['html'],
        //     displayName: '自定义加载图标',
        //     val: 'loading_icon'
        // }
    }
}
