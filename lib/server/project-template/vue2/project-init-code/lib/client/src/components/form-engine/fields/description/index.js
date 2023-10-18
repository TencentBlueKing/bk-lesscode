import './index.postcss'

export default {
    name: 'bkform-engine-description',
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
    render (h) {
        const self = this

        return h(
            'div',
            {
                class: 'bkform-engine-widget-description',
            },
            self.fieldData.configure.value
        )
    }
}
