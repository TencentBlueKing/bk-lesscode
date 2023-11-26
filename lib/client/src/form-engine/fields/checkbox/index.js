import { h } from 'bk-lesscode-render'
import { transDataSourceValue } from '../../utils/data-source'
import './index.postcss'

export default {
    name: 'bkform-engine-checkbox',
    props: {
        fieldData: {
            type: Object,
            default: () => ({})
        },
        value: {
            type: Array,
            default: () => []
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
            component: 'bk-checkbox-group',
            class: 'bkform-engine-widget-checkbox',
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
                component: 'bk-checkbox',
                props: {
                    id: item.id,
                    value: item.id,
                    name: item.label,
                    label: item.label,
                    disabled: self.disabled
                },
                style: { marginRight: '24px' },
                children: [item.label]
            }))
        })
    }
}
