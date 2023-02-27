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
    name: 'bk-vision',
    type: 'widget-bk-vision',
    // display: 'none',
    displayName: '蓝鲸图表',
    icon: 'bk-drag-histogram',
    group: 'ECharts',
    order: 1,
    events: [],
    styles: [
        {
            name: 'size',
            include: ['width', 'height']
        }
    ],
    renderStyles: {
        width: '100%',
        height: '500px'
    },
    props: {
        uid: {
            type: 'string',
            tips: ''
        },
        waterMark: {
            type: 'string',
            tips: '水印内容'
        },
        isFullScroll: {
            type: 'boolean',
            val: true,
            tips: '默认面板将100%充满容器，工具栏固定，此值为false，整个面板将会在容器内滚动'
        },
        isShowTools: {
            type: 'boolean',
            val: true,
            tips: '是否展示面板上的工具栏'
        },
        isShowRefresh: {
            type: 'boolean',
            val: true,
            tips: '是否展示面板上的刷新按钮'
        },
        isShowTimeRange: {
            type: 'boolean',
            val: true,
            tips: '是否展示时间查询组件'
        }
    }
}
