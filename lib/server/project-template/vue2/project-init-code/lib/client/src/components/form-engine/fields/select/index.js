export default {
    name: 'bkform-engine-select',
    props: {
        fieldData: {
            type: Object,
            default: () => ({})
        },
        value: {
            type: [String, Array],
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
            'bk-select',
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
                },
            },
            self.fieldData.configure.dataSource.data.map(item => h(
                'bk-option',
                {
                    props: {
                        id: item.id,
                        label: item.label,
                        name: item.label
                    }
                }
            ))
        )
    }
}
