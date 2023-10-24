import { h } from 'vue'

export default {
    name: 'bkform-engine-select',
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
    render () {
        const self = this

        return h(
            'bk-select',
            {
                props: {
                    value: self.fieldData.configure.value,
                    modelValue: self.fieldData.configure.value,
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
