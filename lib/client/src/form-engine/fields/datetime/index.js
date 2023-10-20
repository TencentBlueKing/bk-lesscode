import { h } from 'bk-lesscode-render'

export default {
    name: 'bkform-engine-datetime',
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
    render (render) {
        h.init(render)

        const self = this

        return h({
            component: 'bk-date-picker',
            class: 'date-picker-widget',
            props: {
                value: self.fieldData.configure.value,
                modelValue: self.fieldData.configure.value,
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
