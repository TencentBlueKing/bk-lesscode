import { h } from 'bk-lesscode-render'
import { isSourceFieldsChange, transDataSourceValue } from '../../utils/data-source'

export default {
    name: 'bkform-engine-select',
    props: {
        fieldData: {
            type: Object,
            default: () => ({})
        },
        formValue: {
            type: Object,
            default: () => ({})
        },
        value: {
            type: [String, Array],
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
                this.updateDataSource(dataSource)
            },
            immediate: true
        },
        formValue: {
            handler (val, oldVal) {
                const dataSource = this.fieldData.configure.dataSource
                if (isSourceFieldsChange(dataSource, val, oldVal)) {
                    this.updateDataSource(dataSource, this)
                }
            },
            deep: true
        }
    },
    methods: {
        async updateDataSource (dataSource) {
            this.loading = true
            this.list = await transDataSourceValue(dataSource, this.formValue, this)
            this.loading = false
        },
        handleChange (val) {
            this.$emit('change', val)
        }
    },
    render (render) {
        h.init(render)

        const self = this

        return h({
            component: 'bk-select',
            style: { background: self.disabled ? '#fafbfd' : '#ffffff' },
            props: {
                value: self.value,
                modelValue: self.value,
                loading: self.loading,
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
                    key: item.id,
                    value: item.id,
                    label: item.label,
                    name: item.label
                }
            }))
        })
    }
}
