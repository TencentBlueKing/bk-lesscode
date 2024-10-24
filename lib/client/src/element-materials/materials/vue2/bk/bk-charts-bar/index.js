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
    name: 'bk-charts-bar',
    type: 'bk-charts',
    displayName: '柱状图',
    icon: 'bk-drag-histogram',
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
        { label: '颜色', value: 'color' },
        { label: '边框', value: 'border' }
    ],
    props: {
        type: {
            type: 'hidden',
            val: 'bar',
            displayName: '柱状图类型'
        },
        width: {
            type: 'size',
            val: '400px',
            displayName: '图表宽度',
            belongGroup: 'size'
        },
        height: {
            type: 'number',
            displayName: '图表高度',
            tips: '图表高度，单位为px',
            val: 200,
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
            val: 255,
            belongGroup: 'color'
        },
        'border-width': {
            type: 'string',
            displayName: '边框宽度',
            tips: '柱状图边框宽度',
            val: 0,
            belongGroup: 'border'
        },
        title: {
            type: 'string',
            displayName: '图表标题',
            tips: '图表标题, 留空则不展示标题',
            val: 'BK-Charts-Bar',
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
                    title: '人数',
                    data: [
                        {
                            'x': 'January',
                            'y': 65
                        },
                        {
                            'x': 'February',
                            'y': 59
                        },
                        {
                            'x': 'March',
                            'y': 80
                        },
                        {
                            'x': 'April',
                            'y': 81
                        },
                        {
                            'x': 'May',
                            'y': 56
                        },
                        {
                            'x': 'June',
                            'y': 55
                        },
                        {
                            'x': 'July',
                            'y': 40
                        }
                    ]
                },
                {
                    title: '销量',
                    data: [
                        {
                            'x': 'January',
                            'y': 265
                        },
                        {
                            'x': 'February',
                            'y': 159
                        },
                        {
                            'x': 'March',
                            'y': 380
                        },
                        {
                            'x': 'April',
                            'y': 281
                        },
                        {
                            'x': 'May',
                            'y': 356
                        },
                        {
                            'x': 'June',
                            'y': 555
                        },
                        {
                            'x': 'July',
                            'y': 20
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
                type: 'bar',
                data: {
                    labels: [
                        'January',
                        'February',
                        'March',
                        'April',
                        'May',
                        'June',
                        'July'
                    ],
                    datasets: [{
                        label: 'My First Dataset',
                        data: [65, 59, 80, 81, 56, 55, 40],
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(255, 159, 64, 0.2)',
                            'rgba(255, 205, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(201, 203, 207, 0.2)'
                        ],
                        borderColor: [
                            'rgb(255, 99, 132)',
                            'rgb(255, 159, 64)',
                            'rgb(255, 205, 86)',
                            'rgb(75, 192, 192)',
                            'rgb(54, 162, 235)',
                            'rgb(153, 102, 255)',
                            'rgb(201, 203, 207)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            },
            belongGroup: 'options'
        }
    }
}
