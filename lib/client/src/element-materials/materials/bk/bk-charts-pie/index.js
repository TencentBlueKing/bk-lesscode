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
        maintainAspectRatio: {
            type: 'boolean',
            val: false,
            tips: '修改图表宽、高时，是否保持默认的宽高比'
        },
        colorSet: {
            type: 'chartColor',
            tips: '图表配色',
            val: 'default'
        },
        borderColor: {
            type: 'color',
            tips: '边框颜色',
            val: '#fff'
        },
        borderWidth: {
            type: 'string',
            tips: '边框宽度',
            val: 2
        },
        title: {
            type: 'string',
            tips: '图表标题, 留空则不展示标题',
            val: 'BK-Pie-Charts'
        },
        hoverOffset: {
            type: 'number',
            tips: '鼠标Hover时，图块偏移的距离',
            val: 4
        },
        xAxis: {
            type: 'json',
            tips: 'X轴数据',
            val: ['Running', 'Swimming', 'Eating']
        },
        data: {
            type: 'json',
            tips: '图表数据',
            val: [
                65,
                150,
                350
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
