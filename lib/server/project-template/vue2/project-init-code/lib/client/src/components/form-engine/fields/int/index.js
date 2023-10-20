export default {
    name: 'bkform-engine-int',
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
            'bk-input',
            {
                props: {
                    value: self.fieldData.configure.value,
                    modelValue: self.fieldData.configure.value,
                    placeholder: self.fieldData.configure.placeholder,
                    disabled: self.disabled,
                    type: 'number',
                    ...self.fieldData.props
                },
                on: {
                    change: self.handleChange
                }
            }
        )
    }
}
