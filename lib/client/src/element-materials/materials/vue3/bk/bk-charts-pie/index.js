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
    name: 'bk-charts-pie',
    type: 'bk-charts',
    displayName: '饼图',
    icon: 'bk-drag-pie-chart',
    group: 'BKCharts',
    order: 3,
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
    props: {
        type: {
            type: 'hidden',
            val: 'pie'
        },
        width: {
            type: 'size',
            val: '400px'
        },
        height: {
            type: 'number',
            tips: '图表高度，单位为px',
            val: 200
        },
        'maintain-aspect-ratio': {
            type: 'boolean',
            val: false,
            tips: '修改图表宽、高时，是否保持默认的宽高比'
        },
        'color-set': {
            type: 'chartColor',
            tips: '图表配色',
            val: 'default'
        },
        'border-color': {
            type: 'color',
            tips: '边框颜色',
            val: '#fff'
        },
        'border-width': {
            type: 'string',
            tips: '边框宽度',
            val: 2
        },
        title: {
            type: 'string',
            tips: '图表标题, 留空则不展示标题',
            val: 'BK-Pie-Charts'
        },
        'hover-offset': {
            type: 'number',
            tips: '鼠标Hover时，图块偏移的距离',
            val: 4
        },
        data: {
            type: ['array', 'remote'],
            tips: '图表数据',
            val: [
                {
                    'x': 'Running',
                    'y': 65
                },
                {
                    'x': 'Swimming',
                    'y': 150
                },
                {
                    'x': 'Eating',
                    'y': 350
                }
            ]
        },
        options: {
            type: ['json', 'remote'],
            val: {},
            tips: '专业图表配置，用于对bkCharts进行高度自定义配置；当设置其不为空时，将会覆盖基本配置，要求必须满足bkCharts的数据规范。',
            example: {
                'type': 'pie',
                'data': {
                    'labels': ['Running', 'Swimming', 'Eating', 'Cycling', 'Jumping'],
                    'datasets': [
                        {
                            'backgroundColor': [
                                'rgba(51,157,255,1)',
                                'rgba(59,206,149,1)',
                                'rgba(255,156,74,1)',
                                'rgba(255,111,114,1)',
                                'rgba(248,211,15,1)'
                            ],
                            'borderAlign': 'center',
                            'borderColor': '#fff',
                            'borderWidth': 2,
                            'clip': 1.5,
                            'data': [20, 10, 30, 50],
                            'hoverBackgroundColor': 'rgba(0, 0, 0, 0.1)',
                            'hoverBorderColor': 'rgba(0, 0, 0, 0.1)',
                            'hoverBorderWidth': 1,
                            'weight': 1,
                            'label': 'label'
                        }
                    ]
                },
                options: {
                    'flexWithContainer': true,
                    'aspectRatio': 1.5,
                    'title': 'Title',
                    'cutoutPercentage': 0,
                    'rotation': -1.5707963267948966,
                    'animation': { 'animateRotate': true, 'animateScale': false }
                }
            }
        }
    }
}
