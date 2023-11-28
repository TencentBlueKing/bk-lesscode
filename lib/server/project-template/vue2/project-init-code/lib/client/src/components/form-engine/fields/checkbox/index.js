import { transDataSourceValue } from '../../utils/data-source'
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
    render (h) {
        const self = this

        return h(
            'bk-checkbox-group',
            {
                class: 'bkform-engine-widget-checkbox',
                props: {
                    value: self.fieldData.configure.value,
                    modelValue: self.fieldData.configure.value,
                    disabled: self.disabled,
                    ...self.fieldData.props
                },
                on: {
                    change: self.handleChange
                },
            },
            self.list.map(item => h(
                'bk-checkbox',
                {
                    props: {
                        id: item.id,
                        value: item.id,
                        name: item.label,
                        label: item.label,
                        disabled: self.disabled
                    },
                    style: { marginRight: '24px' },
                },
                item.label
            ))
        )
    }
}
