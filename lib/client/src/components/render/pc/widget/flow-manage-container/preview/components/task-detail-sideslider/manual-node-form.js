import { h } from 'bk-lesscode-render'
import http from '@/api/pureAxios'
import WidgetFormContainer from '@/form-engine/renderer/index'
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
    render (render) {
        h.init(render)

        const self = this

        return h({
            component: 'div',
            class: 'manual-node-form-wrapper',
            children: [
                h({
                    component: WidgetFormContainer,
                    ref: 'formContainerRef',
                    props: {
                        fields: self.fields,
                        submitFn: self.submitFormData
                    }
                }),
                h({
                    component: 'div',
                    class: 'task-detail-content-footer',
                    children: [
                        h({
                            component: 'bk-button',
                            props: {
                                theme: 'primary',
                                loading: self.pending
                            },
                            on: {
                                click: () => {
                                    self.$refs.formContainerRef.handleSubmit()
                                }
                            },
                            children: ['提交']
                        }),
                        h({
                            component: 'bk-button',
                            on: {
                                click: () => {
                                    self.$emit('close')
                                }
                            },
                            children: ['取消']
                        })
                    ]
                })
            ]
        })
    }
}
