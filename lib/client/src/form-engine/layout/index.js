import { h } from 'bk-lesscode-render'
import { bkInfoBox } from 'bk-magic-vue'
import Sortable from 'sortablejs'
import cloneDeep from 'lodash.clonedeep'
import setters from '../setter/setters'
import { uuid } from '../utils/index'
import fieldWidget from '../fields/index'
import './index.postcss'

export default {
    name: 'form-engine-layout',
    inheritAttrs: false,
    props: {
        // 数据源设置
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
        },
        // 当前选中的字段
        actived: {
            type: String,
            default: ''
        }
    },
    data () {
        return {
            list: this.fields.slice(),
            instance: null,
            value: this.getFieldsVal()
        }
    },
    computed: {
        // 表单数据源是否为复用数据表
        isReuseForm () {
            return this.dataSource.type === 'USE_FORM'
        }
    },
    watch: {
        fields (val) {
            this.list = val.slice()
            console.log(val)
            this.value = this.getFieldsVal()
        },
        isReuseForm (val) {
            this.instance.option('disabled', val)
        }
    },
    mounted () {
        this.$nextTick(() => {
            if (this.$refs.layoutFieldsContainer) {
                this.instance = Sortable.create(this.$refs.layoutFieldsContainer, {
                    disabled: this.isReuseForm,
                    group: {
                        name: 'bkform-engine-layout',
                        pull: false,
                        put: ['bkform-engine-material'],
                        sort: true
                    },
                    ghostClass: 'drag-material-ghost',
                    onEnd: (event) => this.handleEnd(event),
                    onAdd: (event) => this.handleAdd(event)
                })
            }
        })
    },

    beforeDestroy () {
        this.instance && this.instance.destroy()
    },
    methods: {
        getFieldsVal () {
            const value = {}
            this.fields.forEach(field => {
                if ('value' in field.configure) {
                    value[field.configure.key] = field.configure.value
                }
            })
            return value
        },
        // 生成字段配置
        generateFieldSetting (config) {
            const { type, name, component, props, properties } = config
            const setting = {
                id: `${type}-${uuid(8)}`,
                type,
                component,
                props,
                configure: properties.reduce((config, key) => {
                    const setter = setters[key]
                    if (setter && setter.default) {
                        config[key] = typeof setter.default === 'function' ? setter.default(type, name, props) : setter.default
                    }
                    return config
                }, {})
            }
            return setting
        },
        // 拖入新增
        handleAdd (e) {
            const defaultSetting = this.generateFieldSetting(e.item._underlying_vm_)
            this.list.splice(e.newIndex, 0, defaultSetting)
            this.updateFields()
            this.$emit('activeField', defaultSetting)
        },
        // 拖动排序
        handleEnd (e) {
            const { oldIndex, newIndex } = e
            const field = this.list[oldIndex]
            this.list.splice(oldIndex, 1)
            this.list.splice(newIndex, 0, field)
            this.updateFields()
        },
        // 取消自定页面编辑器组件hover态
        handleFieldMouseMove () {
            this.$emit('mouseMoveField')
        },
        // 取消自定义页面编辑器组件选中
        handleActiveField (field) {
            this.$emit('activeField', field)
        },
        handleCopyField (field) {
            const index = this.list.findIndex(item => item.id === field.id)
            if (index > -1) {
                const setting = cloneDeep({ ...field, id: `${field.type}-${uuid(8)}` })
                this.list.splice(index + 1, 0, setting)
                this.updateFields()
                this.$emit('activeField', setting)
            }
        },
        handleDelField (field) {
            bkInfoBox({
                title: this.$t('删除'),
                subTitle: this.$t('确认删除 {0}({1}) 组件？', [field.name, field.id]),
                confirmFn: () => {
                    const index = this.list.findIndex(item => item.id === field.id)
                    if (index > -1) {
                        this.list.splice(index, 1)
                        this.updateFields()
                        this.$emit('delField', field)
                    }
                }
            })
        },
        updateFields () {
            this.$emit('update', this.list)
        }
    },
    render (render) {
        h.init(render)

        const self = this

        const renderMaskActions = (field) => {
            const actions = [h({ component: 'span', class: 'action-tag field-widget-key', children: [field.id] })]
            if (!this.isReuseForm) {
                actions.push(
                    h({
                        component: 'span',
                        class: 'action-tag field-widget-action-btn',
                        on: {
                            click: (e) => {
                                e.stopPropagation()
                                self.handleCopyField(field)
                            }
                        },
                        children: [h({ component: 'i', class: 'bk-icon icon-copy' })]
                    }),
                    h({
                        component: 'span',
                        class: 'action-tag field-widget-action-btn',
                        on: {
                            click: (e) => {
                                e.stopPropagation()
                                self.handleDelField(field)
                            }
                        },
                        children: [h({ component: 'i', class: 'bk-drag-icon bk-drag-shanchu' })]
                    })
                )
            }
            return actions
        }

        const renderFields = () => h({
            component: 'div',
            ref: 'layoutFieldsContainer',
            class: [
                'bkform-engine-layout-fields',
                {
                    'half-row-layout': self.rowLayout === 'half',
                    empty: self.list.length === 0
                }
            ],
            attrs: {
                'data-empty-content': self.isReuseForm ? self.$t('请选择复用数据表') : self.$t('请拖入表单编辑器控件或配置数据源'),
                'role': 'draggable'
            },
            children: self.list.map(field => h({
                component: 'div',
                class: [
                    'bkform-engine-layout-drag-item',
                    {
                        actived: self.actived === field.id,
                        'full-row': field.type === 'rich-text'
                    }
                ],
                key: field.id,
                on: {
                    mousemove: (e) => {
                        e.stopPropagation()
                        self.handleFieldMouseMove(field)
                    },
                    click: (e) => {
                        e.stopPropagation()
                        self.handleActiveField(field)
                    },
                    dblclick: (e) => e.stopPropagation(),
                    contextmenu: e => e.stopPropagation()
                },
                children: [
                    h({
                        component: 'div',
                        class: 'actions-area',
                        children: renderMaskActions(field)
                    }),
                    h({
                        component: 'div',
                        class: 'drag-mask'
                    }),
                    h({
                        component: fieldWidget,
                        props: {
                            fieldData: field,
                            value: self.value[field.configure.key]
                        },
                        on: {
                            change (val) {
                                self.value[field.configure.key] = val
                            }
                        }
                    })
                ]
            }))
        })

        const renderButtonsArea = () => {
            const actionComps = []

            if (self.actions.submit) {
                actionComps.push(h({
                    component: 'bk-button',
                    class: 'action-btn-item',
                    props: {
                        theme: 'primary'
                    },
                    children: [self.$t('提交')]
                }))
            }

            if (self.actions.reset) {
                actionComps.push(h({
                    component: 'bk-button',
                    class: 'action-btn-item',
                    children: [self.$t('清空')]
                }))
            }

            if (actionComps.length > 0) {
                return h({
                    component: 'div',
                    class: 'bkform-engine-layout-actions',
                    children: actionComps
                })
            }

            return null
        }

        return h({
            component: 'div',
            class: ['bkform-engine-layout', { 'has-btns-area': self.actions.submit || self.actions.reset }],
            children: [
                renderFields(),
                renderButtonsArea()
            ]
        })
    }
}
