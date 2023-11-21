import { h, resolveComponent } from 'vue'

export default {
    name: 'bkform-engine-date',
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
            resolveComponent('bk-date-picker'),
            {
                class: 'date-picker-widget',
                value: self.value,
                modelValue: self.value,
                disabled: self.disabled,
                ...self.fieldData.props,
                onChange: self.handleChange
            }
        )
    }
}
