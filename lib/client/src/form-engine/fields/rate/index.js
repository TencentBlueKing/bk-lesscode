import { h } from 'bk-lesscode-render'

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
    render (render) {
        h.init(render)

        const self = this

        return h({
            component: 'bk-rate',
            props: {
                rate: self.value,
                modelValue: self.value,
                edit: !self.disabled,
                editable: !self.disabled,
                ...self.fieldData.props
            },
            on: {
                score: self.handleChange,
                change: self.handleChange
            }
        })
    }
}
