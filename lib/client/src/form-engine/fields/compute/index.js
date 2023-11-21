import { h } from 'bk-lesscode-render'

export default {
    name: 'bkform-engine-computed',
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
            class: 'bkform-engine-compute-widget',
            children: [self.value || '--']
        })
    }
}
