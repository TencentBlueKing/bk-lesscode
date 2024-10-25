import { h, resolveComponent } from 'vue'
import http from '@/api/pureAxios'
import WidgetFormContainer from '@/components/form-engine/renderer/index.js'
import './manual-node-form.postcss'

export default {
    name: 'ManualNodeForm',
    props: {
        id: Number,
        nodeId: String,
        fields: {
            type: Array,
            default: () => []
        }
    },
    data () {
        return {
            pending: false,
            formContainerRef: null
        }
    },
    methods: {
        async submitFormData (value) {
            try {
                this.pending = true
                await http.post(`/flow/task/${this.id}/manual_node/${this.nodeId}/submit`, value)
                this.$emit('submitted')
                this.$bkMessage({
                    theme: 'success',
                    message: window.i18n.t('提交成功')
                })
            } catch (e) {
                console.error(e)
            } finally {
                this.pending = false
            }
        }
    },
    render () {
        const self = this

        return h('div', {
            class: 'manual-node-form-wrapper'
        }, [
            h(WidgetFormContainer, {
                ref: 'formContainerRef',
                fields: self.fields,
                submitFn: self.submitFormData
            }),
            h('div', {
                class: 'task-detail-content-footer'
            }, [
                h(resolveComponent('bk-button'), {
                    theme: 'primary',
                    loading: self.pending,
                    onClick: () => {
                        self.$refs.formContainerRef.handleSubmit()
                    }
                }, ['提交']),
                h(resolveComponent('bk-button'), {
                    onClick: () => {
                        self.$emit('close')
                    }
                }, ['取消'])
            ])
        ])
    }
}
