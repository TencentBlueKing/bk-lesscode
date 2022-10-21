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
            val: 'bar'
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
            val: 255
        },
        borderWidth: {
            type: 'string',
            tips: '柱状图边框宽度',
            val: 0
        },
        title: {
            type: 'string',
            tips: '图表标题, 留空则不展示标题',
            val: 'BK-Charts-Bar'
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
