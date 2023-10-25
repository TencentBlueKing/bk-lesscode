import { h } from 'vue'

export default {
    name: 'bkform-engine-auto-counting',
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
    render () {
        const self = this

        return h(
            'div',
            {
                style: { lineHeight: '30px', color: '#63656e', fontSize: '12px' }
            },
            self.fieldData.configure.autoCountingConfig.val
        )
    }
}
