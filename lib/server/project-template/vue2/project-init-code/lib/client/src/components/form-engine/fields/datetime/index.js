export default {
    name: 'bkform-engine-datetime',
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
                    transfer: true, // vue2配置
                    disabled: self.disabled,
                    type: 'datetime',
                    ...self.fieldData.props
                },
                on: {
                    change: self.handleChange
                }
            }
        )
    }
}
