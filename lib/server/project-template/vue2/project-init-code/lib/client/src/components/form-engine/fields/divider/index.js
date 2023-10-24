export default {
    name: 'bkform-engine-divider',
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
    render (h) {
        const { text, align, color } = this.fieldData.configure.dividerConfig

        return h(
            'bk-divider',
            {
                props: {
                    align,
                    color
                },
            },
            [text]
        )
    }
}
