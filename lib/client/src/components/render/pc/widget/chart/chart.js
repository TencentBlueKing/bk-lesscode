import { h } from 'bk-lesscode-render'
import { uuid, debounce } from 'shared/util'
import './chart.postcss'

import * as echarts from 'echarts'

export default {
    name: 'chart',
    props: {
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
            uuid: '',
            chart: null
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
                this.chart.setOption(val, true)
                this.debounceResize()
            }
        }
    },
    created () {
        this.uuid = uuid(6)
    },
    mounted () {
        this.chart = echarts.init(this.$refs[`echart${this.uuid}`])
        this.chart.setOption(this.options, true)
        this.debounceResize = debounce(this.resizeChart, 500)
    },
    methods: {
        resizeChart () {
            this.chart = echarts.init(this.$refs[`echart${this.uuid}`])
            this.chart.setOption(this.options, true)
        }
    },
    render (render) {
        h.init(render)

        const self = this

        return h({
            component: 'div',
            class: 'echart-container',
            key: uuid(),
            style: {
                width: self.computedWidth,
                height: self.computedHeight
            },
            ref: `echart${self.uuid}`
        })
    }
}
