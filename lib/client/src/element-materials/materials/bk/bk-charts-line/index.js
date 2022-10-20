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
    name: 'bk-charts-line',
    type: 'bk-charts',
    displayName: '折线图',
    icon: 'bk-drag-line-chart',
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
            val: 'line'
        },
        width: {
            type: 'size',
            val: '400px'
        },
        maintainAspectRatio: {
            type: 'boolean',
            val: true,
            tips: '修改图表宽、高时，是否保持默认的宽高比'
        },
        height: {
            type: 'number',
            tips: '图表高度，单位为px',
            val: 200
        },
        colorSet: {
            type: 'chartColor',
            tips: '图表配色',
            val: 'default'
        },
        title: {
            type: 'string',
            tips: '图表标题, 留空则不展示标题',
            val: 'BK-Charts-Line'
        },
        xAxis: {
            type: 'json',
            tips: 'X轴数据',
            val: [
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July'
            ]
        },
        data: {
            type: 'json',
            tips: '图表数据',
            val: [
                {
                    title: '人数',
                    data: [65, 59, 80, 81, 56, 55, 40]
                },
                {
                    title: '销量',
                    data: [265, 159, 380, 281, 356, 555, 20]
                }
            ]
        },
        fill: {
            type: 'boolean',
            tips: '是否绘制填充',
            val: false
        },
        fillColor: {
            type: 'color',
            tips: '填充颜色'
        },
        tension: {
            type: 'string',
            tips: '折线图曲率，值为0~1之间，设置0为折线图',
            val: '0'
        },
        stepped: {
            type: 'boolean',
            tips: '是否设置为阶跃图，设置为true时将忽略tension的配置',
            val: false
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
                type: 'line',
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
                        fill: false,
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1
                    }]
                },
                options: {
                    flexWithContainer: true
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
