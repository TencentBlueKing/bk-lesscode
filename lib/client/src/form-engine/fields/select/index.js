import { h } from 'bk-lesscode-render'
import { transDataSourceValue } from '../../utils/data-source'

export default {
    name: 'bkform-engine-select',
    data () {
        return {
            list: [],
            loading: false
        }
    },
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
    watch: {
        'fieldData.configure.dataSource': {
            async handler (dataSource) {
                this.loading = true
                this.list = await transDataSourceValue(dataSource, this)
                this.loading = false
            },
            immediate: true
        }
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
                value: self.value,
                modelValue: self.value,
                placeholder: self.fieldData.configure.placeholder,
                disabled: self.disabled,
                ...self.fieldData.props
            },
            on: {
                change: self.handleChange
            },
            children: self.list.map(item => h({
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
