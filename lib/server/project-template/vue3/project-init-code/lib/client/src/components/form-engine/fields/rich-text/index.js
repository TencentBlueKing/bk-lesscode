import { h, resolveComponent } from 'vue'

export default {
    name: 'bkform-engine-rich-text',
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
    render () {
        const self = this

        return h(
            resolveComponent('bk-input'),
            {
                value: self.value,
                modelValue: self.value,
                disabled: self.disabled,
                ...self.fieldData.props,
                onChange: self.handleChange
            }
        )
    }
}
