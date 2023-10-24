import { h } from 'bk-lesscode-render'

export default {
    name: 'bkform-engine-datetime',
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
    render (render) {
        h.init(render)

        const self = this

        return h({
            component: 'bk-date-picker',
            class: 'date-picker-widget',
            props: {
                value: self.value,
                modelValue: self.value,
                disabled: self.disabled,
                type: 'datetime',
                ...self.fieldData.props
            },
            on: {
                change: self.handleChange
            }
        })
    }
}
