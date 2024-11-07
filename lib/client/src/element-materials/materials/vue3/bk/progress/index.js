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
    name: 'progress',
    type: 'bk-progress',
    displayName: '进度条',
    icon: 'bk-drag-progress',
    group: '数据',
    order: 1,
    document: 'https://magicbox.bk.tencent.com/magicbox/3.0/progress',
    styles: [
        'position',
        {
            name: 'size',
            exclude: ['height', 'maxHeight', 'minHeight']
        },
        'margin',
        'pointer',
        'opacity'
    ],
    renderStyles: {
        width: '100%'
    },
    groups: [
        { label: '数值', value: 'value' },
        { label: '类型', value: 'type' },
        { label: '文本', value: 'text' },
        { label: '颜色', value: 'color' },
        { label: '样式', value: 'style' }
    ],
    props: {
        theme: {
            type: 'string',
            options: ['primary', 'warning', 'success', 'danger'],
            val: 'primary',
            displayName: '进度条主题',
            belongGroup: 'style'
        },
        type: {
            type: 'string',
            options: ['line', 'circle', 'dashboard'],
            val: 'line',
            displayName: '进度条类型',
            tips: '进度条类型',
            belongGroup: 'type'
        },
        percent: {
            type: 'number',
            val: 0,
            displayName: '进度百分比',
            tips: '进度百分比',
            belongGroup: 'value'
        },
        // size: {
        //     type: 'string',
        //     options: ['small', 'normal', 'large'],
        //     val: 'normal'
        // },
        width: {
            type: 'number',
            val: 126,
            displayName: '圆弧形进度条大小',
            tips: '环形/仪表盘进度条大小',
            belongGroup: 'style'
        },
        'stroke-width': {
            type: 'number',
            val: 3,
            displayName: '线宽大小',
            tips: '线宽',
            belongGroup: 'style'
        },
        'stroke-linecap': {
            type: 'string',
            val: 'round',
            options: ['butt', 'round', 'square', 'inherit'],
            displayName: '仪表盘路径两端形状',
            tips: '仪表盘进度路径两端形状',
            belongGroup: 'style'
        },
        'text-inside': {
            type: 'boolean',
            val: false,
            displayName: '文字是否内置进度条内',
            tips: '线性进度条是否显示文字到进度条内',
            belongGroup: 'text'
        },
        color: {
            type: 'color',
            val: '#13ce66',
            displayName: '进度条颜色',
            tips: '环形/仪表盘路径颜色',
            belongGroup: 'color'
        },
        'bg-color': {
            type: 'color',
            val: '#f5f5f5',
            displayName: '进度条背景颜色',
            tips: '环形/仪表盘背景颜色',
            belongGroup: 'color'
        },
        fixed: {
            type: 'number',
            val: 0,
            options: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
            displayName: '保留小数点位数',
            tips: '精确到小数点位数',
            belongGroup: 'value'
        },
        format: {
            type: 'function',
            displayName: '自定义显示文案',
            tips: '文案过滤回调方法',
            val: (percent) => `${percent}%`,
            belongGroup: 'text'
        },
        'show-text': {
            type: 'boolean',
            val: true,
            displayName: '是否显示文案',
            tips: '是否显示文案',
            belongGroup: 'text'
        },
        'title-style': {
            type: 'object',
            val: {
                fontSize: '16px',
                verticalAlign: 'middle'
            },
            displayName: '设置文案样式',
            tips: '设置文案样式',
            belongGroup: 'style'
        },
        size: {
            type: 'string',
            options: ['small', 'large', 'huge'],
            displayName: '线性进度条大小',
            tips: '线性进度条大小',
            belongGroup: 'style'
        },
        extCls: {
            type: 'string',
            displayName: '最外层元素样式类名',
            tips: '自定义样式类名',
            belongGroup: 'style'
        }
    }
}
