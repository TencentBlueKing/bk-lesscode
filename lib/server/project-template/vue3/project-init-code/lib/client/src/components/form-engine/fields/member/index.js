import { h } from 'vue'
import bkUserSelector from '@blueking/bk-member-selector'


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
            return `${this.host}/component/compapi/tof3/get_all_staff_info/?format=jsonp&app_code=workbench`
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
    onMounted () {
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
    render () {
        const self = this

        return h(
            bkUserSelector,
            {
                modelValue: self.value,
                multiple: !!self.fieldData.props.multiple,
                api: self.api,
                placeholder: self.fieldData.configure.placeholder,
                disabled: self.disabled,
                fixedHeight: true,
                ...self.fieldData.props,
                onChange: self.handleChange
            }
        )
    }
}
