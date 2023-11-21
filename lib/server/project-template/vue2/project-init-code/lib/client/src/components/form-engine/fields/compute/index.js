export default {
    name: 'bkform-engine-computed',
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
    methods: {
        handleChange (val) {
            this.$emit('change', val)
        }
    },
    render (h) {
        const self = this

        return h(
            'div',
            {
                class: 'bkform-engine-compute-widget',
            },
            [self.value || '--']
        )
    }
}
