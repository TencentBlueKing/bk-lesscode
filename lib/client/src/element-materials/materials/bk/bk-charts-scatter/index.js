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
    name: 'bk-charts-scatter',
    type: 'bk-charts',
    displayName: '散点图',
    icon: 'bk-drag-bk-scatter-chart',
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
    props: {
        type: {
            type: 'hidden',
            val: 'scatter'
        },
        width: {
            type: 'size',
            val: '400px'
        },
        height: {
            type: 'string',
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
            val: 255
        },
        pointRadius: {
            type: 'number',
            tips: '散点半径',
            val: 3
        },
        borderWidth: {
            type: 'string',
            tips: '边框宽度',
            val: 1
        },
        title: {
            type: 'string',
            tips: '图表标题, 留空则不展示标题',
            val: 'BK-Scatter-Charts'
        },
        data: {
            type: ['array', 'remote'],
            tips: '图表数据',
            val: [
                {
                    title: 'Scatter Dataset',
                    data: [
                        { 'x': 39.8, 'y': -8.607 },
                        { 'x': 50.1, 'y': -10.38 },
                        { 'x': 100, 'y': -16.07 },
                        { 'x': 126, 'y': -18.03 },
                        { 'x': 158, 'y': -20 },
                        { 'x': 200, 'y': -21.99 },
                        { 'x': 251, 'y': -23.98 },
                        { 'x': 316, 'y': -25.97 },
                        { 'x': 398, 'y': -27.97 },
                        { 'x': 501, 'y': -29.96 },
                        { 'x': 631, 'y': -31.96 },
                        { 'x': 794, 'y': -33.96 }
                    ]
                },
                {
                    title: 'Scatter Dataset 2',
                    data: [
                        { x: -10, y: 0 },
                        { x: 22, y: -20 },
                        { x: 204, y: 5 },
                        { x: 500, y: -5 }
                    ]
                }
            ]
        },
        options: {
            type: ['json', 'remote'],
            val: {},
            tips: '专业图表配置，用于对bkCharts进行高度自定义配置；当设置其不为空时，将会覆盖基本配置，要求必须满足bkCharts的数据规范。',
            example: {
                'type': 'scatter',
                'data': {
                    'datasets': [
                        {
                            'label': 'Scatter Dataset',
                            'borderColor': 'rgba(255,111,114,1)',
                            'backgroundColor': 'rgba(255,111,114,1)',
                            'pointRadius': 3,
                            'data': [
                                { 'x': 39.8, 'y': -8.607 },
                                { 'x': 50.1, 'y': -10.38 },
                                { 'x': 100, 'y': -16.07 },
                                { 'x': 126, 'y': -18.03 },
                                { 'x': 158, 'y': -20 },
                                { 'x': 200, 'y': -21.99 },
                                { 'x': 251, 'y': -23.98 },
                                { 'x': 316, 'y': -25.97 },
                                { 'x': 398, 'y': -27.97 },
                                { 'x': 501, 'y': -29.96 },
                                { 'x': 631, 'y': -31.96 },
                                { 'x': 794, 'y': -33.96 }
                            ]
                        }
                    ]
                },
                'options': {
                    'flexWithContainer': true,
                    'scales': { 'xAxes': { 'type': 'linear', 'position': 'bottom' } }

                }
            }
        }

    }
}
