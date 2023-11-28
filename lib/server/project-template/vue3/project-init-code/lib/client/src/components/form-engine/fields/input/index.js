import { h, resolveComponent } from 'vue'

export default {
    name: 'bkform-engine-input',
    props: {
        fieldData: {
            type: Object,
            default: () => ({})
        },
        value: {
            type: [String, Number],
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
                ...self.fieldData.props,
                onChange: self.handleChange
            }
        )
    }
}
