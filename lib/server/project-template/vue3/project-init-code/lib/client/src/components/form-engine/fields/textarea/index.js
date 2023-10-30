import { h, resolveComponent } from 'vue'

export default {
    name: 'bkform-engine-textarea',
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
            resolveComponent('bk-input'),
            {
                value: self.value,
                modelValue: self.value,
                placeholder: self.fieldData.configure.placeholder,
                disabled: self.disabled,
                type: 'textarea',
                ...self.fieldData.props,
                onChange: self.handleChange
            }
        )
    }
}
