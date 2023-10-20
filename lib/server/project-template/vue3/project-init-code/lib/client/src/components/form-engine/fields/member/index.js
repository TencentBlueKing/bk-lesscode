import { h } from 'vue'
import bkUserSelector from '@blueking/user-selector'

export default {
    name: 'bkform-engine-member',
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
            bkUserSelector,
            {
                props: {
                    value: self.fieldData.configure.value,
                    modelValue: self.fieldData.configure.value,
                    multiple: !!self.fieldData.props.multiple,
                    api: `${process.env.BK_USER_MANAGE_HOST || ''}/api/c/compapi/v2/usermanage/fs_list_users/`,
                    placeholder: self.fieldData.configure.placeholder,
                    disabled: self.disabled,
                    fixedHeight: true,
                    ...self.fieldData.props
                },
                on: {
                    change: self.handleChange
                }
            }
        )
    }
}
