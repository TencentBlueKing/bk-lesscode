export default {
    name: 'bkform-engine-radio',
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
            'bk-radio-group',
            {
                props: {
                    value: self.fieldData.configure.value,
                    modelValue: self.fieldData.configure.value,
                    disabled: self.disabled,
                    ...self.fieldData.props
                },
                on: {
                    change: self.handleChange
                },
            },
            self.fieldData.configure.dataSource.data.map(item => h(
                'bk-radio',
                {
                    style: { marginRight: '24px', fontSize: '12px' },
                    props: {
                        id: item.id,
                        value: item.id,
                        name: item.label,
                        label: item.label
                    }
                }
            ))
        )
    }
}