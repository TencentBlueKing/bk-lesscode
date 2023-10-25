import { h } from 'bk-lesscode-render'
import './index.postcss'

export default {
    name: 'bkform-engine-description',
    props: {
        fieldData: {
            type: Object,
            default: () => ({})
        },
        value: {
            type: String,
            default: ''
        },
        disabled: Boolean
    },
    methods: {
        handleChange (val) {
            this.$emit('change', val)
        }
    },
    render (render) {
        h.init(render)

        const self = this

        return h({
            component: 'div',
            class: 'bkform-engine-widget-description',
            children: self.value
        })
    }
}
