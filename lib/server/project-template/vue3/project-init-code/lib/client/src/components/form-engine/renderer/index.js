import { h } from 'vue'
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
            const value = []
            this.fields.forEach(field => {
                if ('value' in field.configure) {
                    value.push({ key: field.configure.key, value: field.configure.value })
                }
            })
            return value
        },
        handleChange (key, val) {
            const index = this.value.findIndex(item => item.key === key)
            if (index > -1) {
                this.value[index].value = val
            }
        },
        async handleSubmit () {
            try {
                this.pending = true
                await this.$http.post(`/data-source/user/tableName/${this.tableName}?formId=${this.formId}`, this.value)
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
        handleReset () {}
    },
    render () {
        const self = this

        const renderFields = () => h(
            'div',
            {
                class: ['bkform-engine-renderer-fields', { 'half-row-layout': self.rowLayout === 'half' }],
            },
            self.fields.map(field => h(
                fieldWidget,
                {
                    key: field.id,
                    props: {
                        fieldData: field
                    },
                    on: {
                        change (val) {
                            self.handleChange(field.configure.key, val)
                        }
                    }
                }
            ))
        )

        const renderActions = () => {
            const actionComps = []

            if (self.actions.submit) {
                actionComps.push(h(
                    'bk-button',
                    {
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
                    },
                    '提交'
                ))
            }

            if (self.actions.reset) {
                actionComps.push(h(
                    'bk-button',
                    {
                        on: {
                            click: () => {
                                self.handleReset()
                            }
                        },
                    },
                    '重置'
                ))
            }

            if (actionComps.length > 0) {
                return h(
                    'div',
                    {
                        class: 'bkform-engine-renderer-actions',
                    },
                    actionComps
                )
            }

            return null
        }

        return h(
            'div',
            {
                class: 'bkform-engine-renderer',
            },
            [
                renderFields(),
                renderActions()
            ]
        )
    }
}
