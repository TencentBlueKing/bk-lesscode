/**
 * Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
 * Copyright (C) 2025 Tencent. All rights reserved.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

export default {
    name: 'chart-bar',
    type: 'chart',
    displayName: '柱状图',
    icon: 'bk-drag-histogram',
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
        { label: '配置', value: 'options' },
        { label: '尺寸', value: 'size' }
    ],
    props: {
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
        options: {
            type: 'json',
            val: {
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
            displayName: '图表配置',
            tips: '图表配置，配置项同echarts',
            belongGroup: 'options'
        },
        'remoteOptions': {
            type: 'remote',
            displayName: '动态图表配置',
            tips: '动态图表配置，可通过函数动态返回图表配置属性，函数返回值会覆盖上述opions里面的同名属性，\n\neg：若函数返回值为{series: [...]}，则最终的图表的渲染会使用函数返回的series数据，其它配置仍为options中的静态配置，由此可达到动态设置图表数据的效果',
            val: {
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
            belongGroup: 'options'
        }
    }
}
