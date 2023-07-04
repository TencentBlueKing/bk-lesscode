<!--
  Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
  Copyright (C) 2017-2019 THL A29 Limited, a Tencent company. All rights reserved.
  Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
  http://opensource.org/licenses/MIT
  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
  an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
  specific language governing permissions and limitations under the License.
-->

<template>
    <div class="bk-chart-container" :style="{ height: `${height}px`, width: computedWidth }">
        <canvas class="bk-chart" ref="chart"></canvas>
    </div>
</template>

<script>
    import { bkChartProps, chartsConfigMap, colorSets } from './bk-chart-config'
    import Chart from '@blueking/bkcharts'

    export default {
        name: 'bk-charts',
        props: { ...bkChartProps() },
        data () {
            return {
                chart: null,
                ctx: null
            }
        },
        computed: {
            computedWidth () {
                const widthVal = this.width ? (typeof this.width === 'number' ? `${this.width}px` : this.width) : '100%'
                return widthVal
            },
            baseChartOptions () {
                const title = {
                    display: this.title !== '',
                    text: this.title
                }

                return {
                    type: this.type,
                    data: {
                        datasets: []
                    },
                    options: {
                        plugins: {
                            title
                        },
                        maintainAspectRatio: this.maintainAspectRatio
                    }
                }
            },
            chartOptions () {
                /** options参数具有最高优先级，用于更高级的自定义配置 */
                if (Object.keys(this.options).length) {
                    return this.options
                }

                const { list: colorList } = colorSets.find(item => item.name === this.colorSet)
                const options = JSON.parse(JSON.stringify(this.baseChartOptions))
                return chartsConfigMap[this.type](this, options, colorList)
            }
        },
        watch: {
            chartOptions: {
                deep: true,
                handler (val, old) {
                    if (JSON.stringify(val) === JSON.stringify(old)) return

                    this.chart.destroy()
                    this.chart = new Chart(this.ctx, val)
                }
            }
        },
        mounted () {
            this.ctx = this.$refs.chart.getContext('2d')
            this.chart = new Chart(this.ctx, JSON.parse(JSON.stringify(this.chartOptions)))
        }
    }
</script>
