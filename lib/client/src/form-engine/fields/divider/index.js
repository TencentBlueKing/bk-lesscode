import { h } from 'bk-lesscode-render'

export default {
    name: 'bkform-engine-divider',
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

        const { text, align, color } = this.fieldData.configure.dividerConfig

        return h({
            component: 'bk-divider',
            props: {
                align,
                color
            },
            children: [text]
        })
    }
}
