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
            val: 'radar'
        },
        width: {
            type: 'size',
            val: '400px'
        },
        height: {
            type: 'string',
            tips: '图表高度，单位为px',
            val: 'auto'
        },
        maintainAspectRatio: {
            type: 'boolean',
            val: true,
            tips: '修改图表宽、高时，是否保持默认的宽高比'
        },
        colorSet: {
            type: 'chartColor',
            tips: '图表配色',
            val: 'default'
        },
        colorOpacity: {
            type: 'number',
            tips: '柱状图条形背景色透明度，范围是 0 ~ 255',
            val: 51
        },
        pointBorderColor: {
            type: 'color',
            tips: '数据点的边框颜色',
            val: '#fff'
        },
        pointHoverBackgroundColor: {
            type: 'color',
            tips: '数据点Hover时的背景色',
            val: '#fff'
        },
        fill: {
            type: 'boolean',
            tips: '是否绘制填充',
            val: true
        },
        title: {
            type: 'string',
            tips: '图表标题, 留空则不展示标题',
            val: 'BK-Radar-Charts'
        },
        xAxis: {
            type: 'json',
            tips: 'X轴数据',
            val: [
                ['Eating', 'Dinner'],
                ['Drinking', 'Water'],
                'Sleeping',
                ['Designing', 'Graphics'],
                'Coding',
                'Cycling',
                'Running'
            ]
        },
        data: {
            type: 'json',
            tips: '图表数据',
            val: [
                {
                    title: 'Sam',
                    data: [65, 59, 80, 81, 56, 55, 40]
                },
                {
                    title: 'Tom',
                    data: [28, 48, 40, 19, 96, 27, 100]
                }
            ]
        },
        options: {
            type: 'json',
            val: {},
            tips: '图表配置，配置项详见bkcharts'
        },
        remoteOptions: {
            type: 'remote',
            tips: '动态图表配置，可通过函数动态返回图表配置属性，函数返回值会覆盖上述opions里面的同名属性，\n\neg：若函数返回值为{series: [...]}，则最终的图表的渲染会使用函数返回的series数据，其它配置仍为options中的静态配置，由此可达到动态设置图表数据的效果',
            val: {
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
            bindProps: {
                autoGetData: false
            },
            remoteValidate (data) {
                if (typeof data !== 'object' || Array.isArray(data)) return '返回值需要是object'
            }
        }
    }
}
