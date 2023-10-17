import { h } from 'bk-lesscode-render'
import './index.postcss'

export default {
    name: 'bkform-engine-checkbox',
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
            component: 'bk-checkbox-group',
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
                component: 'bk-checkbox',
                props: {
                    id: item.id,
                    value: item.id,
                    name: item.label,
                    label: item.label
                },
                style: { marginRight: '24px' },
                children: [item.label]
            }))
        })
    }
}
