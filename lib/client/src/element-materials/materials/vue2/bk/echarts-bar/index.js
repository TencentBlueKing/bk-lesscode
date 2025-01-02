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
    name: 'echarts-bar',
    type: 'echarts',
    displayName: '柱状图',
    icon: 'bk-drag-histogram',
    group: 'ECharts',
    order: 1,
    events: [],
    document: 'https://echarts.apache.org/handbook/zh/how-to/chart-types/bar/basic-bar',
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
        { label: '标题', value: 'title' },
        { label: '图例', value: 'legend' },
        { label: '颜色', value: 'color' },
        { label: '专业配置', value: 'optionsConfig' },
        { label: '尺寸', value: 'size' }
    ],
    props: {
        type: {
            type: 'hidden',
            val: 'bar'
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
        title: {
            type: 'string',
            val: '柱状图demo',
            displayName: '标题',
            belongGroup: 'title'
        },
        'title-x': {
            type: 'string',
            options: ['auto', 'left', 'right', 'center'],
            val: 'center',
            displayName: '标题水平位置',
            belongGroup: 'title'
        },
        'legend-orient': {
            type: 'string',
            options: ['horizontal', 'vertical'],
            val: 'horizontal',
            displayName: '图例方向',
            belongGroup: 'legend'
        },
        'legend-left': {
            type: 'string',
            options: ['auto', 'left', 'right'],
            val: 'left',
            displayName: '图例水平位置',
            belongGroup: 'legend'
        },
        color: {
            type: 'chartColor',
            displayName: '图表配色',
            tips: '图表配色',
            val: 'echartsDef',
            belongGroup: 'color'
        },
        series: {
            type: 'array',
            val: [
                {
                    name: 'issue数量',
                    type: 'bar',
                    data: [['一', 3], ['二', 5], ['三', 8], ['四', 3], ['五', 5]]
                }
            ],
            displayName: '数据配置',
            belongGroup: 'data'
        },
        // options: {
        //     type: 'json',
        //     val: {
        //         title: {
        //             text: '柱状图demo',
        //             x: 'center'
        //         },
        //         tooltip: {},
        //         legend: {
        //             data: ['issue数量'],
        //             left: 'left'
        //         },
        //         xAxis: {
        //             data: ['一', '二', '三', '四', '五']
        //         },
        //         yAxis: {},
        //         series: [{
        //             name: 'issue数量',
        //             type: 'bar',
        //             data: [3, 5, 8, 3, 5]
        //         }]
        //     },
        //     displayName: '图表配置',
        //     tips: '图表配置，配置项同echarts'
        // },
        'options': {
            type: ['json', 'remote'],
            displayName: '专业图表配置',
            tips: '专业图表配置，可通过函数动态返回图表配置属性，函数返回值会覆盖上述opions里面的同名属性，\n\neg：若函数返回值为{series: [...]}，则最终的图表的渲染会使用函数返回的series数据，其它配置仍为options中的静态配置，由此可达到动态设置图表数据的效果',
            val: {},
            example: {
                title: {
                    text: '柱状图demo',
                    x: 'center'
                },
                tooltip: {},
                legend: {
                    data: ['issue数量'],
                    left: 'left'
                },
                xAxis: {
                    data: ['一', '二', '三', '四', '五']
                },
                yAxis: {},
                series: [{
                    name: 'issue数量',
                    type: 'bar',
                    data: [3, 5, 8, 3, 5]
                }]
            },
            bindProps: {
                autoGetData: false
            },
            remoteValidate (data) {
                if (typeof data !== 'object' || Array.isArray(data)) return '返回值需要是object'
            },
            belongGroup: 'optionsConfig'
        }
    }
}
