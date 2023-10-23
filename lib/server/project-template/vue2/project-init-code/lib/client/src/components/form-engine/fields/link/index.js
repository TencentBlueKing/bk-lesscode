export default {
    name: 'bkform-engine-link',
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
    render (h) {
        const self = this

        return h(
            'bk-input',
            {
                props: {
                    value: self.value,
                    modelValue: self.value,
                    placeholder: self.fieldData.configure.placeholder,
                    disabled: self.disabled,
                    ...self.fieldData.props
                },
                on: {
                    change: self.handleChange
                }
            }
        )
    }
}
