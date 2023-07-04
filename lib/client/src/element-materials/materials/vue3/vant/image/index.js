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
    name: 'van-image',
    type: 'van-image',
    // bk-drag-custom-comp-default
    icon: 'bk-drag-image',
    displayName: '图片',
    group: '基础',
    document: 'https://vant-contrib.gitee.io/vant/#/zh-CN/image',
    events: [
        {
            name: 'click',
            tips: '点击图片时触发，事件回调参数 (e: Event)'
        },
        {
            name: 'load',
            tips: '图片加载完毕时触发，无回调参数'
        },
        {
            name: 'error',
            tips: '图片加载失败时触发，无回调参数'
        }
    ],
    styles: [
        'position',
        {
            name: 'size',
            include: ['display', 'width', 'height']
        },
        'margin',
        'pointer',
        'opacity'
    ],
    renderStyles: {
        display: 'inline-block',
        width: '200rpx',
        height: '200rpx'
    },
    props: {
        src: {
            type: 'src',
            val: 'data:image/svg+xml;base64,PHN2ZyBpZD0i5Zu+5bGCXzEiIGRhdGEtbmFtZT0i5Zu+5bGCIDEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHZpZXdCb3g9IjAgMCAxOSAxNyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJsaW5lYXItZ3JhZGllbnQiIHgxPSI2LjEzIiB5MT0iMy43IiB4Mj0iNy4wMiIgeTI9IjIuMTYiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiMwMGE2ZmQiLz48c3RvcCBvZmZzZXQ9IjAuNDQiIHN0b3AtY29sb3I9IiMyYTg3ZjAiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMwMGM3ZGIiLz48L2xpbmVhckdyYWRpZW50PjxsaW5lYXJHcmFkaWVudCBpZD0ibGluZWFyLWdyYWRpZW50LTIiIHgxPSI2LjgyIiB5MT0iMTQuODgiIHgyPSIxMy40NSIgeTI9IjMuNCIgeGxpbms6aHJlZj0iI2xpbmVhci1ncmFkaWVudCIvPjwvZGVmcz48dGl0bGU+bG9nb+WbvuaghzwvdGl0bGU+PHBhdGggZD0iTTUuNjEsMy44NGExLjMyLDEuMzIsMCwwLDEsMS4yNC40N3MwLS4xNywwLS4xNmExLjUyLDEuNTIsMCwwLDEsLjY4LTEuMDdjLjEtLjA3LjA2LS40NS4wNi0uNTRTNy41OCwyLDcuNTcsMmExLjg3LDEuODcsMCwwLDAtLjc2LDEuMzljMC0uMDUsMC0uMSwwLS4xNWExLjMsMS4zLDAsMCwwLTEuMjQtLjQ4Yy0uMTUsMCwwLDEuMDgsMCwxLjA4WiIgc3R5bGU9ImZpbGw6dXJsKCNsaW5lYXItZ3JhZGllbnQpIi8+PHBhdGggZD0iTTE1LjczLDEzSDUuMzNBMi4zOSwyLjM5LDAsMCwxLDMuNTQsMTJjLS44OC0xLjEzLS40Ny0yLjc2LDAtNCwuNjgtMS45LDEuOTMtMy4zMyw0LTMuMTVBNC4yMSw0LjIxLDAsMCwxLDExLDguOTFjLjA1LDIuMSwxLjU2LDQsMy43MiwzLjQ0YTQsNCwwLDAsMCwyLjQyLTIuODdBMy44MSwzLjgxLDAsMCwwLDE2LDYuMTFhMy45MSwzLjkxLDAsMCwwLTEuNjEtMWMtLjMzLS4xLS4yNC0uMTUtLjI3LS40OWEzLjM0LDMuMzQsMCwwLDAtLjI4LTEsMi43MywyLjczLDAsMCwwLTMuMjgtMS4zNEE0LjYyLDQuNjIsMCwwLDAsOC42NiwzLjg3Yy0uNDQuNDkuMzMtLjE4LjQ1LS4zMSwxLjExLTEuMjUsMy0uNDYsMy44Ni42MmEyLjgzLDIuODMsMCwwLDEsLjQ2LDEuNDdjMCwuMzEsMS4wOC42MiwxLjQyLjg1YTMuOTEsMy45MSwwLDAsMSwxLjYzLDMuMDgsMi42NCwyLjY0LDAsMCwxLS41NywxLjg2Yy0uMy4zMS0xLjI0LjI5LTEuNi4yNy0yLS4xNC0yLjM4LTIuNTYtMi42LTQuMThhNC4wOCw0LjA4LDAsMCwwLTQtMy40OGMtMy4yNCwwLTUuNzIsNC42Mi01LjQsNy41M0EyLjU2LDIuNTYsMCwwLDAsNSwxMy44SDE1Yy4yOSwwLC41Ny0uNzcuNzQtLjc3WiIgc3R5bGU9ImZpbGw6dXJsKCNsaW5lYXItZ3JhZGllbnQtMikiLz48L3N2Zz4=',
            tips: '图片链接'
        },
        fit: {
            type: 'string',
            val: 'fill',
            options: ['fill', 'contain', 'cover', 'none', 'scale-down'],
            tips: '图片填充模式'
        },
        position: {
            type: 'string',
            val: 'center',
            options: ['top', 'center', 'right', 'bottom', 'left', 'string'],
            tips: '图片位置，等同于原生的 object-position 属性，可选值为 top right bottom left 或 string'
        },
        alt: {
            type: 'string',
            val: '',
            tips: '替代文本'
        },
        width: {
            type: ['string', 'number'],
            tips: '宽度，默认单位为px'
        },
        height: {
            type: ['string', 'number'],
            tips: '高度，默认单位为px'
        },
        radius: {
            type: ['string', 'number'],
            tips: '圆角大小，默认单位为px'
        },
        round: {
            type: 'boolean',
            val: false,
            tips: '是否显示为圆形'
        },
        block: {
            type: 'boolean',
            val: false,
            tips: '是否将根节点设置为块级元素，默认情况下为 inline-block 元素'
        },
        'lazy-load': {
            type: 'boolean',
            val: false,
            vips: '是否开启图片懒加载'
        },
        'show-error': {
            type: 'boolean',
            val: true,
            vips: '是否展示图片加载失败提示'
        },
        'show-loading': {
            type: 'boolean',
            val: true,
            vips: '是否展示图片加载中提示'
        },
        'error-icon': {
            type: 'van-icon',
            val: 'photo-fail',
            tips: '失败时提示的图标名称或图片链接'
        },
        'loading-icon': {
            type: 'van-icon',
            val: 'photo',
            tips: '加载时提示的图标名称或图片链接'
        },
        'icon-size': {
            type: ['number', 'string'],
            val: 32,
            tips: '加载图标和失败图标的大小'
        },
        'icon-prefix': {
            type: 'string',
            val: 'van-icon',
            tips: '图标类名前缀，等同于 Icon 组件的 class-prefix 属性'
        }
    }
    // slots: {
    //     default: {
    //         name: ['text'],
    //         type: ['text'],
    //         displayName: '自定义图片下方的内容',
    //         val: '自定义图片下方的内容'
    //     },
    //     loading: {
    //         name: ['html'],
    //         type: ['html'],
    //         displayName: '自定义加载中的提示内容',
    //         val: '自定义加载中的提示内容'
    //     },
    //     error: {
    //         name: ['text'],
    //         type: ['text'],
    //         displayName: '自定义加载失败时的提示内容',
    //         val: '自定义加载失败时的提示内容'
    //     }
    // }
}
