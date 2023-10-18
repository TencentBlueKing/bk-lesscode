import { h } from 'bk-lesscode-render'

export default {
    name: 'bkform-engine-table',
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
            component: 'bk-table',
            props: {
                value: self.fieldData.configure.value,
                modelValue: self.fieldData.configure.value,
                disabled: self.disabled,
                ...self.fieldData.props
            },
            children: self.fieldData.configure.tableConfig.map(item => h({
                component: 'bk-table-column',
                props: {
                    prop: item.key,
                    label: item.name
                }
            }))
        })
    }
}
