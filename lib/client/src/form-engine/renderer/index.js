import { h } from 'bk-lesscode-render'
import fieldWidget from '../fields/index'
import './index.postcss'

export default {
    name: 'form-engine-renderer',
    inheritAttrs: false,
    props: {
        // 字段列表
        fields: {
            type: Array,
            default: () => []
        },
        // 表单行布局
        rowLayout: {
            type: String,
            default: 'full'
        },
        // 表单操作按钮
        actions: {
            type: Object,
            default: () => ({
                submit: false,
                reset: false
            })
        },
        // 表单字段值
        value: {
            type: Object,
            default: () => ({})
        }
    },
    data () {
        return {}
    },
    methods: {
        handleSubmit () {},
        handleReset () {}
    },
    render (render) {
        h.init(render)

        const self = this

        const renderFields = () => h({
            component: 'div',
            class: ['bkform-engine-renderer-fields', { 'half-row-layout': self.rowLayout === 'half' }],
            children: self.fields.map(field => h({
                component: fieldWidget,
                key: field.id,
                props: {
                    fieldData: field
                }
            }))
        })

        const renderActions = () => {
            const actionComps = []

            if (self.actions.submit) {
                actionComps.push(h({
                    component: 'bk-button',
                    props: {
                        theme: 'primary'
                    },
                    on: {
                        click: () => {
                            self.handleSubmit()
                        }
                    },
                    children: ['提交']
                }))
            }

            if (self.actions.reset) {
                actionComps.push(h({
                    component: 'bk-button',
                    on: {
                        click: () => {
                            self.handleReset()
                        }
                    },
                    children: ['重置']
                }))
            }

            if (actionComps.length > 0) {
                return h({
                    component: 'div',
                    class: 'bkform-engine-renderer-actions',
                    children: actionComps
                })
            }

            return null
        }

        return h({
            component: 'div',
            class: 'bkform-engine-renderer',
            children: [
                renderFields(),
                renderActions()
            ]
        })
    }
}
