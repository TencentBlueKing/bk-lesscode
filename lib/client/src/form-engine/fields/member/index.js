import { h, framework } from 'bk-lesscode-render'
import bkUserSelectorV2 from '@blueking/user-selector'

export default {
    name: 'bkform-engine-member',
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
            host: '',
            hostLoading: false
        }
    },
    computed: {
        api () {
            return `${this.host}/api/c/compapi/v2/usermanage/fs_list_users/`
        }
    },
    created () {
        if (process.env.BK_USER_MANAGE_HOST) {
            this.host = process.env.BK_USER_MANAGE_HOST
        } else {
            this.getUserManageUrl()
        }
    },
    methods: {
        async getUserManageUrl () {
            try {
                this.hostLoading = true
                const res = await this.$http.get('/nocode/userManageUrl')
                this.host = res.data
                this.hostLoading = false
            } catch (e) {
                this.host = location.origin
                this.hostLoading = false
            }
        },
        handleChange (val) {
            this.$emit('change', val)
        }
    },
    render (render) {
        h.init(render)

        const self = this

        return h({
            component: framework === 'vue2' ? bkUserSelectorV2 : 'bk-member-selector',
            props: {
                value: self.value,
                modelValue: self.value,
                multiple: !!self.fieldData.props.multiple,
                api: self.api,
                placeholder: self.fieldData.configure.placeholder,
                disabled: self.disabled,
                fixedHeight: true,
                ...self.fieldData.props
            },
            on: {
                change: self.handleChange
            }
        })
    }
}
