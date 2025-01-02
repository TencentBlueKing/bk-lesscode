import { h } from 'bk-lesscode-render'
import { isSourceFieldsChange, transDataSourceValue } from '../../utils/data-source'
import './index.postcss'

export default {
    name: 'bkform-engine-radio',
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
    render (render) {
        h.init(render)

        const self = this

        return h({
            component: 'bk-radio-group',
            class: 'bkform-engine-widget-radio',
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
                style: { marginRight: '24px' },
                props: {
                    key: item.key,
                    label: item.id,
                    value: item.id,
                    disabled: self.disabled
                },
                children: [item.label]
            }))
        })
    }
}
