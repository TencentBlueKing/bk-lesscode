import { h } from 'bk-lesscode-render'
import { uuid, debounce } from 'shared/util'
import './chart.postcss'
import * as echarts from 'echarts'
import { baseChartConfig } from './chart-base-config'
import { colorSets } from '@/common/chart-color-sets'
 
export default {
    name: 'chart',
    props: {
        componentData: {
            type: Object,
            default: () => ({})
        },
        componentId: {
            type: String,
            default: () => ''
        },
        ...baseChartConfig()
    },
    data () {
        return {
            chartInst: '',
            uuid: null,
            observer: null
        }
    },
    computed: {
        computedWidth () {
            return this.width ? (typeof this.width === 'number' ? `${this.width}px` : this.width) : '100%'
        },
        computedHeight () {
            return this.height ? (typeof this.height === 'number' ? `${this.height}px` : this.height) : '100%'
        },
        echartOptions () {
            // 专业配置remoteOptions优先
            if (Object.keys(this.options).length) {
                return this.options
            }
            const { list: colorList } = colorSets.find(item => item.name === this.color)
            return {
                title: {
                    text: this.title,
                    x: this.titleX
                },
                legend: {
                    orient: this.legendOrient,
                    left: this.legendLeft
                },
                color: colorList,
                ...this.handleRemainOp(),
                series: this.series
            }
        }
    },
    watch: {
        width () {
            this.debounceRender()
        },
        height () {
            this.debounceRender()
        },
        echartOptions: {
            deep: true,
            handler (val) {
                this.debounceRender()
            }
        }
    },
    created () {
        this.uuid = this.componentData?.componentId || this.componentId
    },
    mounted () {
        this.chartInst = echarts.init(this.$refs[this.uuid])
        this.chartInst.setOption(this.echartOptions, true)
        this.debounceResize = debounce(this.resizeChart, 500)
        this.debounceRender = debounce(this.reRenderChart, 500)
        this.observer = new ResizeObserver(this.debounceResize)
        this.observer.observe(this.$refs[this.uuid])
    },
    beforeDestroy () {
        this.observer.unobserve(this.$refs[this.uuid])
    },
    methods: {
        reRenderChart () {
            if (this.$refs[this.uuid]) {
                this.observer.unobserve(this.$refs[this.uuid])
                this.chartInst = echarts.init(this.$refs[this.uuid])
                this.chartInst.setOption(this.echartOptions)
                this.observer.observe(this.$refs[this.uuid])
            }
        },
        resizeChart () {
            this.chartInst && this.chartInst.resize()
        },
        handleRemainOp () {
            if (this.type === 'line') {
                return {
                    xAxis: {
                        type: 'category'
                    },
                    yAxis: {
                        type: 'value'
                    }
                }
            }
            if (this.type === 'bar') {
                return {
                    tooltip: {},
                    xAxis: {
                        type: 'category'
                    },
                    yAxis: {
                        type: 'value'
                    }
                }
            }
            return {}
        }
    },
    render (render) {
        h.init(render)

        const self = this

        return h({
            component: 'div',
            class: `echart-container ${self.uuid}`,
            key: uuid(),
            style: {
                width: self.computedWidth,
                height: self.computedHeight
            },
            ref: self.uuid
        })
    }
}
