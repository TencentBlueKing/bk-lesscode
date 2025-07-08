/**
 * Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
 * Copyright (C) 2025 Tencent. All rights reserved.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

export default {
    name: 'van-progress',
    type: 'van-progress',
    // bk-drag-custom-comp-default
    icon: 'bk-drag-progress',
    displayName: '进度条',
    group: '数据',
    document: 'https://vant-contrib.gitee.io/vant/#/zh-CN/progress',
    events: [],
    styles: ['padding', 'margin'],
    renderStyles: {},
    groups: [
        { label: '值', value: 'value' },
        { label: '文本', value: 'text' },
        { label: '样式', value: 'style' },
        { label: '其他', value: 'other' }
    ],
    props: {
        'percentage': {
            type: ['string', 'number'],
            val: '0',
            displayName: '进度百分比',
            tips: '进度百分比',
            belongGroup: 'value'
        },
        'stroke-width': {
            type: ['string', 'number'],
            val: '4px',
            displayName: '进度条粗细',
            tips: '进度条粗细，默认单位为px',
            belongGroup: 'style'
        },
        'color': {
            type: 'color',
            val: '#1989fa',
            displayName: '进度条颜色',
            tips: '进度条颜色',
            belongGroup: 'style'
        },
        'track-color': {
            type: 'color',
            val: '#e5e5e5',
            displayName: '轨道颜色',
            tips: '轨道颜色',
            belongGroup: 'style'
        },
        'pivot-text': {
            type: 'string',
            displayName: '进度文字内容',
            tips: '进度文字内容',
            belongGroup: 'text'
        },
        'pivot-color': {
            type: 'color',
            val: '#1989fa',
            displayName: '进度文字背景色',
            tips: '进度文字背景色',
            belongGroup: 'style'
        },
        'text-color': {
            type: 'color',
            val: 'white',
            displayName: '进度文字颜色',
            tips: '进度文字颜色',
            belongGroup: 'style'
        },
        'inactive': {
            type: 'boolean',
            val: false,
            displayName: '是否置灰',
            tips: '是否置灰',
            belongGroup: 'other'
        },
        'show-pivot': {
            type: 'boolean',
            val: true,
            displayName: '是否有进度文字',
            tips: '是否显示进度文字',
            belongGroup: 'text'
        }
    }
}
