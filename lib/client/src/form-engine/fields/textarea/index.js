import { h } from 'bk-lesscode-render'

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
    render (render) {
        h.init(render)

        const self = this

        return h({
            component: 'bk-input',
            props: {
                value: self.value,
                modelValue: self.value,
                placeholder: self.fieldData.configure.placeholder,
                disabled: self.disabled,
                type: 'textarea',
                ...self.fieldData.props
            },
            on: {
                change: self.handleChange
            }
        })
    }
}
