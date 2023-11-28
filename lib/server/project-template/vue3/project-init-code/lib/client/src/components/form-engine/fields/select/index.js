import { h, resolveComponent } from 'vue'
import { transDataSourceValue } from '../../utils/data-source'

export default {
    name: 'bkform-engine-select',
    props: {
        fieldData: {
            type: Object,
            default: () => ({})
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
    render () {
        const self = this

        return h(
            resolveComponent('bk-select'),
            {
                value: self.fieldData.configure.value,
                modelValue: self.fieldData.configure.value,
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
