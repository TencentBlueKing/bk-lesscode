import { h, resolveComponent } from 'vue'

export default {
    name: 'bkform-engine-radio',
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
    render () {
        const self = this

        return h(
            resolveComponent('bk-radio-group'),
            {
                value: self.value,
                modelValue: self.value,
                disabled: self.disabled,
                ...self.fieldData.props,
                onChange: self.handleChange
            },
            self.fieldData.configure.dataSource.data.map(item => h(
                resolveComponent('bk-radio'),
                {
                    key: item.key,
                    label: item.id,
                    disabled: self.disabled,
                    style: { marginRight: '24px', fontSize: '12px' }
                },
                item.label
            ))
        )
    }
}
