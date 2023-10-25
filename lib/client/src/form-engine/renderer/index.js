import { h } from 'bk-lesscode-render'
import cloneDeep from 'lodash.clonedeep'
import fieldWidget from '../fields/index'
import './index.postcss'

export default {
    name: 'form-engine-renderer',
    inheritAttrs: false,
    props: {
        dataSource: Object,
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
        }
    },
    data () {
        const { type, id, relatedId } = this.dataSource
        const formId = type === 'USE_FORM' ? relatedId : id
        return {
            formId,
            list: [],
            tableName: '',
            value: this.getDefaultVal(),
            loading: false,
            pending: false
        }
    },
    created () {
        this.getFormDetail()
    },
    methods: {
        async getFormDetail () {
            this.loading = true
            const res = await this.$http.get(`/nocode-form/detail?formId=${this.formId}`)
            this.tableName = res.data.tableName
            this.loading = false
        },
        getDefaultVal () {
            const value = {}
            this.fields.forEach(field => {
                if ('value' in field.configure) {
                    value[field.configure.key] = cloneDeep(field.configure.value)
                } else if (field.type === 'table') {
                    value[field.configure.key] = []
                }
            })
            return value
        },
        handleChange (key, val) {
            this.value[key] = cloneDeep(val)
        },
        async handleSubmit () {
            try {
                this.pending = true
                const formattedVal = []
                Object.keys(this.value).forEach(key => {
                    const val = this.value[key]
                    const field = this.fields.find(item => item.configure.key === key)
                    if (Array.isArray(val) && field.type !== 'table') {
                        formattedVal.push({ key, value: val.join(',') })
                    } else {
                        formattedVal.push({ key, value: val })
                    }
                })
                await this.$http.post(`/data-source/user/tableName/${this.tableName}?formId=${this.formId}`, formattedVal)
                this.$bkMessage({
                    theme: 'success',
                    message: '表单数据添加成功'
                })
            } catch (e) {
                console.error(e)
            } finally {
                this.pending = false
            }
        },
        handleReset () {
            this.value = this.getDefaultVal()
        }
    },
    render (render) {
        h.init(render)

        const self = this

        const renderFields = () => h({
            component: 'div',
            class: ['bkform-engine-renderer-fields', { 'half-row-layout': self.rowLayout === 'half' }],
            children: self.fields.filter(field => !field.configure.hidden?.enable).map(field => h({
                component: fieldWidget,
                key: field.id,
                props: {
                    fieldData: field,
                    value: self.value[field.configure.key]
                },
                on: {
                    change (val) {
                        self.handleChange(field.configure.key, val)
                    }
                }
            }))
        })

        const renderActions = () => {
            const actionComps = []

            if (self.actions.submit) {
                actionComps.push(h({
                    component: 'bk-button',
                    props: {
                        theme: 'primary',
                        disabled: self.loading,
                        loading: self.pending
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
                    children: ['清空']
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
