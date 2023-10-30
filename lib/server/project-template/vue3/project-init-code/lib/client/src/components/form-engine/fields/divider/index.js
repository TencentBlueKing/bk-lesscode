import { h, resolveComponent } from 'vue'

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
    render () {
        const { text, align, color } = this.fieldData.configure.dividerConfig

        return h(
            resolveComponent('bk-divider'),
            {
                align,
                color
            },
            text
        )
    }
}
