import { h, resolveComponent } from 'vue'
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
            handler (dataSource) {
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
    render () {
        const self = this

        return h(
            resolveComponent('bk-select'),
            {
                modelValue: self.value,
                placeholder: self.fieldData.configure.placeholder,
                disabled: self.disabled,
                ...self.fieldData.props,
                onChange: self.handleChange
            },
            self.list.map(item => h(
                resolveComponent('bk-option'),
                {
                    id: item.id,
                    key: item.id,
                    value: item.id,
                    name: item.label,
                    label: item.label
                }
            ))
        )
    }
}
