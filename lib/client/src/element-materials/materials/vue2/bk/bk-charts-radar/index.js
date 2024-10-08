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
    name: 'bk-charts-radar',
    type: 'bk-charts',
    displayName: '雷达图',
    icon: 'bk-drag-radar-chart',
    group: 'BKCharts',
    order: 1,
    events: [],
    document: 'https://bkcharts.bk.tencent.com/#/docs',
    styles: [
        {
            name: 'size',
            include: ['display']
        }
    ],
    renderStyles: {
        display: 'inline-block',
        verticalAlign: 'middle'
    },
    groups: [
        { label: '数据', value: 'data' },
        { label: '配置', value: 'options' },
        { label: '标题', value: 'title' },
        { label: '图例', value: 'legend' },
        { label: '尺寸', value: 'size' },
        { label: '数据点', value: 'dataPoint' },
        { label: '颜色', value: 'color' },
        { label: '填充', value: 'fill' }
    ],
    props: {
        type: {
            type: 'hidden',
            val: 'radar',
            displayName: '雷达图类型'
        },
        width: {
            type: 'size',
            val: '400px',
            displayName: '图表宽度',
            belongGroup: 'size'
        },
        height: {
            type: 'string',
            displayName: '图表高度',
            tips: '图表高度，单位为px',
            val: 'auto',
            belongGroup: 'size'
        },
        'maintain-aspect-ratio': {
            type: 'boolean',
            val: true,
            displayName: '是否保持默认的宽高比',
            tips: '修改图表宽、高时，是否保持默认的宽高比',
            belongGroup: 'size'
        },
        'color-set': {
            type: 'chartColor',
            displayName: '图表配色',
            tips: '图表配色',
            val: 'default',
            belongGroup: 'color'
        },
        'color-opacity': {
            type: 'number',
            displayName: '条形背景色透明度',
            tips: '柱状图条形背景色透明度，范围是 0 ~ 255',
            val: 51,
            belongGroup: 'color'
        },
        'point-border-color': {
            type: 'color',
            displayName: '数据点的边框颜色',
            tips: '数据点的边框颜色',
            val: '#fff',
            belongGroup: 'dataPoint'
        },
        'point-hover-background-color': {
            type: 'color',
            displayName: 'hover时数据点的颜色',
            tips: '数据点Hover时的背景色',
            val: '#fff',
            belongGroup: 'dataPoint'
        },
        fill: {
            type: 'boolean',
            displayName: '是否绘制填充',
            tips: '是否绘制填充',
            val: true,
            belongGroup: 'fill'
        },
        title: {
            type: 'string',
            displayName: '图表标题',
            tips: '图表标题, 留空则不展示标题',
            val: 'BK-Radar-Charts',
            belongGroup: 'title'
        },
        'title-align': {
            type: 'string',
            displayName: '标题对齐',
            tips: '标题对齐方式',
            val: 'center',
            options: ['start', 'center', 'end'],
            belongGroup: 'title'
        },
        'legend-position': {
            type: 'string',
            displayName: '图例位置',
            tips: '图例位置',
            val: 'top',
            options: ['top', 'bottom', 'left', 'right'],
            belongGroup: 'legend'
        },
        data: {
            type: ['array', 'remote'],
            displayName: '图表数据',
            tips: '图表数据',
            val: [
                {
                    title: 'Sam',
                    data: [
                        {
                            'x': [
                                'Eating',
                                'Dinner'
                            ],
                            'y': 65
                        },
                        {
                            'x': [
                                'Drinking',
                                'Water'
                            ],
                            'y': 59
                        },
                        {
                            'x': 'Sleeping',
                            'y': 80
                        },
                        {
                            'x': [
                                'Designing',
                                'Graphics'
                            ],
                            'y': 81
                        },
                        {
                            'x': 'Coding',
                            'y': 56
                        },
                        {
                            'x': 'Cycling',
                            'y': 55
                        },
                        {
                            'x': 'Running',
                            'y': 40
                        }
                    ]
                },
                {
                    title: 'Tom',
                    data: [
                        {
                            'x': [
                                'Eating',
                                'Dinner'
                            ],
                            'y': 28
                        },
                        {
                            'x': [
                                'Drinking',
                                'Water'
                            ],
                            'y': 48
                        },
                        {
                            'x': 'Sleeping',
                            'y': 40
                        },
                        {
                            'x': [
                                'Designing',
                                'Graphics'
                            ],
                            'y': 19
                        },
                        {
                            'x': 'Coding',
                            'y': 96
                        },
                        {
                            'x': 'Cycling',
                            'y': 27
                        },
                        {
                            'x': 'Running',
                            'y': 100
                        }
                    ]
                }
            ],
            belongGroup: 'data'
        },
        options: {
            type: ['json', 'remote'],
            val: {},
            displayName: '专业图表配置',
            tips: '专业图表配置，用于对bkCharts进行高度自定义配置；当设置其不为空时，将会覆盖基本配置，要求必须满足bkCharts的数据规范。',
            example: {
                'type': 'radar',
                'data': {
                    'labels': [
                        ['Eating', 'Dinner'],
                        ['Drinking', 'Water'],
                        'Sleeping',
                        ['Designing', 'Graphics'],
                        'Coding',
                        'Cycling',
                        'Running'
                    ],
                    'datasets': [
                        {
                            'borderWidth': 1,
                            'backgroundColor': 'rgba(255,111,114,1)',
                            'borderColor': 'rgba(255,111,114,1)',
                            'fill': false,
                            'data': [80, -86, 34, 8, 60, -14, -4],
                            'label': 'First dataset'
                        }
                    ]
                },
                'options': {
                    'flexWithContainer': true,
                    'aspectRatio': 1.5,
                    'title': { 'display': true, 'text': 'Title' }
                }
            },
            belongGroup: 'options'
        }
    }
}
