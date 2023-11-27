export default {
    name: 'bkform-engine-rate',
    props: {
        fieldData: {
            type: Object,
            default: () => ({})
        },
        value: {
            type: Number,
            default: 0
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
                    rate: self.value,
                    modelValue: self.value,
                    edit: !self.disabled,
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
