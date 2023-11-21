import { h, resolveComponent } from 'vue'
import './index.postcss'

export default {
    name: 'bkform-engine-checkbox',
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
            resolveComponent('bk-checkbox-group'),
            {
                class: 'bkform-engine-widget-checkbox',
                value: self.fieldData.configure.value,
                modelValue: self.fieldData.configure.value,
                disabled: self.disabled,
                ...self.fieldData.props,
                onChange: self.handleChange
            },
            self.fieldData.configure.dataSource.data.map(item => h(
                resolveComponent('bk-checkbox'),
                {
                    id: item.id,
                    value: item.id,
                    name: item.label,
                    label: item.label,
                    style: { marginRight: '24px' }
                },
                item.label
            ))
        )
    }
}
