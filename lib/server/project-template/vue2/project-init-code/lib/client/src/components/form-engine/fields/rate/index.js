export default {
    name: 'bkform-engine-rate',
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
            'bk-rate',
            {
                props: {
                    rate: self.fieldData.configure.value,
                    modelValue: self.fieldData.configure.value,
                    disabled: self.disabled,
                    ...self.fieldData.props
                },
                on: {
                    score: self.handleChange,
                    change: self.handleChange
                }
            }
        )
    }
}
