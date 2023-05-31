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
    name: 'bk-charts-bubble',
    type: 'bk-charts',
    displayName: '气泡图',
    icon: 'bk-drag-bk-bubble-chart',
    group: 'BKCharts',
    order: 4,
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
            val: 'bubble'
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
            val: 55
        },
        borderWidth: {
            type: 'string',
            tips: '柱状图边框宽度',
            val: 1
        },
        title: {
            type: 'string',
            tips: '图表标题, 留空则不展示标题',
            val: 'BK-Bubble-Charts'
        },
        data: {
            type: ['array', 'remote'],
            tips: '图表数据',
            val: [
                {
                    title: 'Bubble point 1',
                    data: [
                        { 'x': -58, 'y': -37, 'r': 7 },
                        { 'x': -80, 'y': -5, 'r': 1.8 },
                        { 'x': -3, 'y': 20, 'r': 7 },
                        { 'x': 58, 'y': -77, 'r': 6 },
                        { 'x': -16, 'y': -13, 'r': 2.8 },
                        { 'x': -23, 'y': 30, 'r': 1 }
                    ]
                }, {
                    title: 'Bubble point 2',
                    data: [
                        { 'x': 55, 'y': -23, 'r': 10 },
                        { 'x': 88, 'y': 33, 'r': 5 },
                        { 'x': 22, 'y': -35, 'r': 14 },
                        { 'x': 79, 'y': 59, 'r': 11 },
                        { 'x': 40, 'y': -91, 'r': 7 },
                        { 'x': 10, 'y': 33, 'r': 11.5 }
                    ]
                }
            ]
        },
        options: {
            type: ['json', 'remote'],
            val: {},
            tips: '专业图表配置，用于对bkCharts进行高度自定义配置；当设置其不为空时，将会覆盖基本配置，要求必须满足bkCharts的数据规范。',
            example: {
                'type': 'bubble',
                'data': {
                    'datasets': [
                        {
                            'label': 'Bubble point 1',
                            'hoverBackgroundColor': 'rgba(255,111,114,0.5)',
                            'hoverBorderColor': 'rgba(255,111,114,1)',
                            'backgroundColor': 'rgba(255,111,114,0.5)',
                            'borderColor': 'rgba(255,111,114,1)',
                            'borderWidth': 1,
                            'data': [
                                { 'x': -58, 'y': -37, 'r': 7 },
                                { 'x': -80, 'y': -5, 'r': 1.8 },
                                { 'x': -3, 'y': 20, 'r': 7 },
                                { 'x': 58, 'y': -77, 'r': 6 },
                                { 'x': -16, 'y': -13, 'r': 2.8 },
                                { 'x': -23, 'y': 30, 'r': 1 }
                            ]
                        },
                        {
                            'label': 'Bubble point 2',
                            'hoverBackgroundColor': 'rgba(51,157,255,0.5)',
                            'hoverBorderColor': 'rgba(51,157,255,1)',
                            'backgroundColor': 'rgba(51,157,255,0.5)',
                            'borderColor': 'rgba(51,157,255,1)',
                            'borderWidth': 1,
                            'data': [
                                { 'x': 55, 'y': -23, 'r': 10 },
                                { 'x': 88, 'y': 33, 'r': 5 },
                                { 'x': 22, 'y': -35, 'r': 14 },
                                { 'x': 79, 'y': 59, 'r': 11 },
                                { 'x': 40, 'y': -91, 'r': 7 },
                                { 'x': 10, 'y': 33, 'r': 11.5 }
                            ]
                        }
                    ]
                },
                'options': {
                    'flexWithContainer': true,
                    'title': { 'display': true, 'text': '气泡图', 'tooltips': { 'mode': 'point' } }
                }
            }
        }
    }
}
