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
    name: 'image',
    type: 'bk-image',
    displayName: '图片',
    icon: 'bk-drag-image',
    group: '基础',
    order: 1,
    document: 'https://magicbox.bk.tencent.com/static_api/v3/components_vue/2.0/example/index.html#/image',
    events: [
        {
            displayName: '点击',
            name: 'click',
            tips: '点击组件时调用该事件函数，事件回调参数 (event: Event)'
        }
    ],
    styles: ['position', 'size', 'margin', 'pointer', 'opacity'],
    renderStyles: {
        display: 'inline-block',
        width: '60px',
        verticalAlign: 'middle'
    },
    groups: [
        { label: '地址', value: 'address' },
        { label: '文本', value: 'text' },
        { label: '预览', value: 'preview' },
        { label: '样式', value: 'style' },
        { label: '其他', value: 'other' }
    ],
    props: {
        src: {
            type: 'src',
            val: 'data:image/svg+xml;base64,PHN2ZyBpZD0i5Zu+5bGCXzEiIGRhdGEtbmFtZT0i5Zu+5bGCIDEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHZpZXdCb3g9IjAgMCAxOSAxNyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJsaW5lYXItZ3JhZGllbnQiIHgxPSI2LjEzIiB5MT0iMy43IiB4Mj0iNy4wMiIgeTI9IjIuMTYiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiMwMGE2ZmQiLz48c3RvcCBvZmZzZXQ9IjAuNDQiIHN0b3AtY29sb3I9IiMyYTg3ZjAiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMwMGM3ZGIiLz48L2xpbmVhckdyYWRpZW50PjxsaW5lYXJHcmFkaWVudCBpZD0ibGluZWFyLWdyYWRpZW50LTIiIHgxPSI2LjgyIiB5MT0iMTQuODgiIHgyPSIxMy40NSIgeTI9IjMuNCIgeGxpbms6aHJlZj0iI2xpbmVhci1ncmFkaWVudCIvPjwvZGVmcz48dGl0bGU+bG9nb+WbvuaghzwvdGl0bGU+PHBhdGggZD0iTTUuNjEsMy44NGExLjMyLDEuMzIsMCwwLDEsMS4yNC40N3MwLS4xNywwLS4xNmExLjUyLDEuNTIsMCwwLDEsLjY4LTEuMDdjLjEtLjA3LjA2LS40NS4wNi0uNTRTNy41OCwyLDcuNTcsMmExLjg3LDEuODcsMCwwLDAtLjc2LDEuMzljMC0uMDUsMC0uMSwwLS4xNWExLjMsMS4zLDAsMCwwLTEuMjQtLjQ4Yy0uMTUsMCwwLDEuMDgsMCwxLjA4WiIgc3R5bGU9ImZpbGw6dXJsKCNsaW5lYXItZ3JhZGllbnQpIi8+PHBhdGggZD0iTTE1LjczLDEzSDUuMzNBMi4zOSwyLjM5LDAsMCwxLDMuNTQsMTJjLS44OC0xLjEzLS40Ny0yLjc2LDAtNCwuNjgtMS45LDEuOTMtMy4zMyw0LTMuMTVBNC4yMSw0LjIxLDAsMCwxLDExLDguOTFjLjA1LDIuMSwxLjU2LDQsMy43MiwzLjQ0YTQsNCwwLDAsMCwyLjQyLTIuODdBMy44MSwzLjgxLDAsMCwwLDE2LDYuMTFhMy45MSwzLjkxLDAsMCwwLTEuNjEtMWMtLjMzLS4xLS4yNC0uMTUtLjI3LS40OWEzLjM0LDMuMzQsMCwwLDAtLjI4LTEsMi43MywyLjczLDAsMCwwLTMuMjgtMS4zNEE0LjYyLDQuNjIsMCwwLDAsOC42NiwzLjg3Yy0uNDQuNDkuMzMtLjE4LjQ1LS4zMSwxLjExLTEuMjUsMy0uNDYsMy44Ni42MmEyLjgzLDIuODMsMCwwLDEsLjQ2LDEuNDdjMCwuMzEsMS4wOC42MiwxLjQyLjg1YTMuOTEsMy45MSwwLDAsMSwxLjYzLDMuMDgsMi42NCwyLjY0LDAsMCwxLS41NywxLjg2Yy0uMy4zMS0xLjI0LjI5LTEuNi4yNy0yLS4xNC0yLjM4LTIuNTYtMi42LTQuMThhNC4wOCw0LjA4LDAsMCwwLTQtMy40OGMtMy4yNCwwLTUuNzIsNC42Mi01LjQsNy41M0EyLjU2LDIuNTYsMCwwLDAsNSwxMy44SDE1Yy4yOSwwLC41Ny0uNzcuNzQtLjc3WiIgc3R5bGU9ImZpbGw6dXJsKCNsaW5lYXItZ3JhZGllbnQtMikiLz48L3N2Zz4=',
            displayName: '图片地址',
            tips: '图片地址',
            belongGroup: 'address'
        },
        alt: {
            type: 'string',
            val: '',
            displayName: '图片异常时文本提示',
            tips: '图片加载失败时替换文字',
            belongGroup: 'text'
        },
        fit: {
            type: 'string',
            options: ['fill', 'contain', 'cover', 'none', 'scale-down'],
            displayName: '适应容器框方式',
            tips: '确定图片如何适应容器框，同原生object-fit',
            belongGroup: 'style'
        },
        referrerPolicy: {
            type: 'string',
            displayName: '原生referrerPolicy',
            tips: '原生referrerPolicy',
            belongGroup: 'other'
        },
        lazy: {
            type: 'boolean',
            val: false,
            displayName: '是否开启懒加载',
            tips: '是否开启懒加载',
            belongGroup: 'other'
        },
        scrollContainer: {
            type: 'string',
            displayName: '监听scroll事件的容器',
            tips: '开启懒加载后，监听scroll事件的容器',
            belongGroup: 'other'
        },
        fallback: {
            type: 'string',
            displayName: '加载失败容错地址',
            tips: '加载失败容错地址,会被Slotserror覆盖',
            belongGroup: 'address'
        },
        previewSrcList: {
            type: 'array',
            displayName: '开启图片预览功能',
            tips: '开启图片预览功能',
            belongGroup: 'preview'
        },
        isShowPreviewTitle: {
            type: 'boolean',
            val: false,
            displayName: '是否显示头部信息',
            tips: '预览图片图片时，是否显示头部信息',
            belongGroup: 'preview'
        },
        maskClose: {
            type: 'boolean',
            val: true,
            displayName: '是否点击遮罩关闭弹框',
            tips: '是否允许点击遮罩关闭弹框',
            belongGroup: 'preview'
        },
        transfer: {
            type: 'boolean',
            val: true,
            displayName: '图片预览弹框是否出现在body内',
            tips: '控制图片预览弹框是否出现在body内',
            belongGroup: 'preview'
        },
        zIndex: {
            type: 'number',
            val: 2000,
            displayName: '图片预览的弹窗zIndex',
            tips: '设置图片预览的弹窗z-index',
            belongGroup: 'style'
        }
    }
}
