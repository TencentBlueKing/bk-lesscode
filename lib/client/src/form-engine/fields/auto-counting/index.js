import { h } from 'bk-lesscode-render'

export default {
    name: 'bkform-engine-auto-counting',
    props: {
        fieldData: {
            type: Object,
            default: () => ({})
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
            style: { lineHeight: '30px', color: '#63656e', fontSize: '12px' },
            children: self.fieldData.configure.autoCountingConfig.val
        })
    }
}
