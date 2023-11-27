import { h, resolveComponent } from 'vue'

export default {
    name: 'bkform-engine-rate',
    props: {
        fieldData: {
            type: Object,
            default: () => ({})
        },
        value: {
            type: Number,
            default: 0
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
            resolveComponent('bk-rate'),
            {
                rate: self.value,
                modelValue: self.value,
                editable: !self.disabled,
                ...self.fieldData.props,
                onScore: self.handleChange,
                onChange: self.handleChange
            }
        )
    }
}
