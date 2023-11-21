export default {
    name: 'bkform-engine-date',
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
            'bk-date-picker',
            {
                class: 'date-picker-widget',
                props: {
                    value: self.value,
                    modelValue: self.value,
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
