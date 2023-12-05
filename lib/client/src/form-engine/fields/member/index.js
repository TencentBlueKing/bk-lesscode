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
            hostLoading: false,
            localVal: []
        }
    },
    computed: {
        api () {
            return `${this.host}${framework === 'vue3' ? '/component/compapi/tof3/get_all_staff_info/?format=jsonp&app_code=workbench' : '/component/compapi/tof3/get_all_staff_info/'}`
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

        const renderV2 = () => h({
            component: bkUserSelectorV2,
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
        })

        const renderV3 = () => h({
            component: 'bk-member-selector',
            props: {
                modelValue: self.localVal,
                multiple: !!self.fieldData.props.multiple,
                api: self.api,
                placeholder: self.fieldData.configure.placeholder,
                disabled: self.disabled,
                fixedHeight: true,
                showPhoto: false,
                ...self.fieldData.props
            },
            on: {
                change: self.handleChange
            }
        })

        return this.hostLoading ? null : (framework === 'vue3' ? renderV3() : renderV2())
    }
}
