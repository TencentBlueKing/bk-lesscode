import bkUserSelector from '@blueking/user-selector'

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
            hostLoading: false,
            localVal: []
        }
    },
    computed: {
        api () {
            return `${this.host}/api/c/compapi/v2/usermanage/fs_list_users/`
        }
    },
    watch: {
        value: {
            handler (val) {
                if (Array.isArray(val)) {
                    this.localVal = val.slice()
                } else {
                    this.localVal = (typeof val === 'string' && val.length > 0) ? [val] : []
                }
            },
            immadiate: true
        },
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
    render (h) {
        const self = this

        return h(
            bkUserSelector,
            {
                props: {
                    value: self.localVal,
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
            }
        )
    }
}
