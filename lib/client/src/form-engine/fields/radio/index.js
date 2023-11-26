import { h } from 'bk-lesscode-render'
import { transDataSourceValue } from '../../utils/data-source'

export default {
    name: 'bkform-engine-radio',
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
    data () {
        return {
            list: [],
            loading: false
        }
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
            component: 'bk-radio-group',
            props: {
                value: self.value,
                modelValue: self.value,
                disabled: self.disabled,
                ...self.fieldData.props
            },
            on: {
                change: self.handleChange
            },
            children: self.list.map(item => h({
                component: 'bk-radio',
                style: { marginRight: '24px', fontSize: '12px' },
                props: {
                    id: item.id,
                    value: item.id,
                    name: item.label,
                    label: item.label,
                    disabled: self.disabled
                }
            }))
        })
    }
}
