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
    name: 'h5-container',
    type: 'h5-container',
    displayName: 'H5容器',
    icon: 'bk-drag-grid-2',
    group: '布局',
    order: 2,
    styles: [],
    groups: [
        { label: '初始设置', value: 'init' },
        { label: '翻页', value: 'pageTurn' },
        { label: '页面设置', value: 'pageSet' },
        { label: '其他', value: 'other' }
    ],
    props: {
        'initial-slide': {
            type: 'number',
            displayName: '初始页',
            tips: '初始页，默认为0，在编辑时可将其置为当前编辑页',
            val: 0,
            belongGroup: 'init'
        },
        mousewheel: {
            type: 'boolean',
            displayName: '是否支持鼠标滚轮拖拽',
            tips: '支持使用鼠标滚轮拖拽',
            val: true,
            belongGroup: 'other'
        },
        'free-mode': {
            type: 'boolean',
            displayName: '允许滑动非一页的距离',
            tips: '默认情况下每次滑动时只滑动完整一页，freeMode打开时，允许根据惯性滑动非一页的距离',
            val: false,
            belongGroup: 'other'
        },
        init: {
            type: 'boolean',
            displayName: '是否自动初始化',
            tips: '创建H5时是否自动初始化，如果设置为false，需要在使用时，手动调用`this.bkH5Container.init()`以启用',
            val: true,
            belongGroup: 'init'
        },
        effect: {
            type: 'string',
            options: ['slide', 'flip', 'coverflow', 'fade'],
            val: 'slide',
            displayName: '翻页效果',
            tips: '翻页效果',
            belongGroup: 'pageTurn'
        },
        pagination: {
            type: 'boolean',
            displayName: '是否有页面指示器',
            tips: '是否开启页面指示器，默认为开',
            val: true,
            belongGroup: 'pageSet'
        },
        loop: {
            type: 'boolean',
            displayName: '是否开启循环模式',
            tips: '是否设置循环模式，循环模式下最后一页下滑会到第一页',
            val: false,
            belongGroup: 'pageSet'
        },
        autoplay: {
            type: 'boolean',
            displayName: '是否自动翻页',
            tips: '是否自动翻页',
            val: false,
            belongGroup: 'pageTurn'
        }
    },
    slots: {
        default: [
            {
                name: ['h5-page'],
                type: ['h5-page']
            },
            {
                name: ['h5-page'],
                type: ['h5-page']
            }
        ]
    }
}
