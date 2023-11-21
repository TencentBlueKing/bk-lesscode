
import { bkChartProps, chartsConfigMap } from './bk-chart-config'
import { h } from 'bk-lesscode-render'
import Chart from '@blueking/bkcharts'
import { colorSets } from '@/common/chart-color-sets'

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
                return JSON.parse(JSON.stringify(this.options))
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
        this.ctx = this.$refs.bkchart.getContext('2d')
        this.chart = new Chart(this.ctx, JSON.parse(JSON.stringify(this.chartOptions)))
    },
    render (render) {
        h.init(render)

        const self = this

        return h({
            component: 'div',
            class: 'bk-chart-container',
            style: {
                height: `${self.height}px`,
                width: self.computedWidth
            },
            children: [
                h({
                    component: 'canvas',
                    ref: 'bkchart'
                })
            ]
        })
    }
}
