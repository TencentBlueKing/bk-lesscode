import cssModule from './edit-object.postcss?module'
import {
    h
} from 'bk-lesscode-render'

export default {
    props: {
        value: Object
    },

    emits: ['change'],

    data () {
        return {
            displayJSON: '',
            copyValue: ''
        }
    },

    created () {
        this.getDisplayJson(JSON.stringify(this.value))
    },

    methods: {
        getDisplayJson (val) {
            try {
                this.displayJSON = JSON.stringify(JSON.parse(val), null, 2)
                this.copyValue = JSON.stringify(JSON.parse(val), null, 2)
                this.$emit('change', JSON.parse(val))
            } catch (e) {
                this.displayJSON = this.$t('请输入正确格式的数据')
            }
        }
    },

    render (render) {
        h.init(render)

        const self = this

        return h({
            component: 'section',
            class: cssModule['edit-object'],
            style: self.styleVar,
            children: [
                h({
                    component: 'bk-input',
                    props: {
                        type: 'textarea',
                        value: self.copyValue,
                        modelValue: self.copyValue
                    },
                    on: {
                        input: self.getDisplayJson
                    }
                }),
                h({
                    component: 'bk-input',
                    props: {
                        type: 'textarea',
                        readonly: true,
                        value: self.displayJSON,
                        modelValue: self.displayJSON
                    }
                })
            ]
        })
    }
}
