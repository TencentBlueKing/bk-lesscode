import { h } from 'bk-lesscode-render'
import { uuid, debounce } from 'shared/util'
import './chart.postcss'

import * as echarts from 'echarts'

let chartInst = null
 
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
        width: {
            type: [Number, String],
            default: ''
        },
        height: {
            type: [Number, String],
            default: ''
        },
        options: {
            type: Object,
            default: () => ({})
        }
    },
    data () {
        return {
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
        }
    },
    watch: {
        width () {
            this.debounceResize()
        },
        height () {
            this.debounceResize()
        },
        options: {
            deep: true,
            handler (val) {
                chartInst.setOption(val, true)
                this.debounceRender()
            }
        }
    },
    created () {
        this.uuid = this.componentData?.componentId || this.componentId
    },
    mounted () {
        chartInst = echarts.init(this.$refs[this.uuid])
        chartInst.setOption(this.options, true)
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
            console.log(this.uuid, this.$refs[this.uuid], 'rerender')
            if (this.$refs[this.uuid]) {
                chartInst = echarts.init(this.$refs[this.uuid])
                chartInst.setOption(this.options, true)
            }
        },
        resizeChart () {
            console.log(chartInst, 'inst')
            chartInst && chartInst.resize()
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
