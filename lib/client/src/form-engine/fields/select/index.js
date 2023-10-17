import { h } from 'bk-lesscode-render'

export default {
    name: 'bkform-engine-select',
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
            component: 'bk-select',
            props: {
                value: self.fieldData.configure.value,
                modelValue: self.fieldData.configure.value,
                disabled: self.disabled,
                ...self.fieldData.props
            },
            on: {
                change: self.handleChange
            },
            children: self.fieldData.configure.dataSource.data.map(item => h({
                component: 'bk-option',
                props: {
                    id: item.id,
                    label: item.label,
                    name: item.label
                }
            }))
        })
    }
}
