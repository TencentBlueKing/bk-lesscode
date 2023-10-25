import { h, resolveComponent } from 'vue'

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
            resolveComponent('bk-select'),
            {
                props: {
                    
                },
                value: self.fieldData.configure.value,
                modelValue: self.fieldData.configure.value,
                placeholder: self.fieldData.configure.placeholder,
                disabled: self.disabled,
                ...self.fieldData.props,
                onChange: self.handleChange
            },
            self.fieldData.configure.dataSource.data.map(item => h(
                resolveComponent('bk-option'),
                {
                    id: item.id,
                    key: item.id,
                    label: item.label,
                    name: item.label
                }
            ))
        )
    }
}
