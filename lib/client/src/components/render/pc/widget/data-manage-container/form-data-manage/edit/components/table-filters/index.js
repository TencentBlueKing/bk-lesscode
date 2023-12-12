import { h, framework, toolTips } from 'bk-lesscode-render'
import { CAN_BE_FILTING_FIELDS } from '../../../constants'
import './index.postcss'

export default {
    name: 'table-filters',
    inheritAttrs: false,
    props: {
        fields: {
            type: Array,
            default: () => [],
            required: true
        },
        filters: {
            type: Array,
            default: () => [],
            required: true
        }
    },
    computed: {
        filterFields () {
            const list = []
            this.filters.filter(key => {
                const field = this.fields.find(item => item.key === key)
                if (field) {
                    list.push(field)
                }
            })
            return list
        },
        fieldOptions () {
            return this.fields.filter(item => !this.filters.includes(item.key) && CAN_BE_FILTING_FIELDS.includes(item.type))
        }
    },
    methods: {
        handleAddFilter (key) {
            this.$emit('update', 'filters', this.filters.concat(key))
        },
        handleDelFilter (key) {
            const index = this.filters.findIndex(item => item === key)
            if (index > -1) {
                const list = this.filters.slice()
                list.splice(index, 1)
                this.$emit('update', 'filters', list)
            }
        }
    },
    render (render) {
        h.init(render)

        const self = this

        const getFilterElement = (field) => {
            if (['select', 'multiple-select', 'checkbox', 'radio'].includes(field.type)) {
                return h({
                    component: 'bk-select',
                    style: 'pointer-events: none; background: #ffffff',
                    props: {
                        placeholder: this.$t('请选择{0}', [field.name])
                    }
                })
            } else if (['data', 'datetime'].includes(field.type)) {
                return h({
                    component: 'bk-date-picker',
                    style: 'pointer-events: none; width: 100%;',
                    props: {
                        placeholder: this.$t('请输入{0}', [field.name])
                    }
                })
            }
            return h({
                component: 'bk-input',
                style: 'pointer-events: none;',
                props: {
                    type: field.type === 'int' ? 'number' : 'text',
                    placeholder: this.$t('请输入{0}', [field.name])
                }
            })
        }

        const renderFilters = () => {
            const filters = []
            this.filterFields.forEach(item => {
                filters.push(h({
                    component: 'div',
                    class: 'filter-item-form',
                    on: {
                        click: (e) => {
                            e.stopPropagation()
                        }
                    },
                    children: [
                        h({
                            component: 'div',
                            class: 'filter-label',
                            children: item.name
                        }),
                        getFilterElement(item),
                        h({
                            component: 'i',
                            class: 'bk-drag-icon bk-drag-close-circle-fill delete-icon',
                            on: {
                                click: () => {
                                    self.handleDelFilter(item.key)
                                }
                            }
                        })
                    ]
                }))
            })

            if (this.fieldOptions.length > 0) {
                filters.push(h({
                    component: 'bk-popover',
                    props: {
                        'ext-cls': 'g-popover-empty-padding empty-padding',
                        style: 'margin: 9px 0 9px 4px; align-self: flex-end;',
                        theme: 'light',
                        arrow: false,
                        distance: 0,
                        placement: 'bottom-start',
                        tippyOptions: {
                            animateFill: false,
                            hideOnClick: false
                        }
                    },
                    slots: {
                        default: () => h({
                            component: 'div',
                            class: ['add-filter-trigger', { 'tooltips-trigger': framework === 'vue3' }],
                            directives: [{
                                name: toolTips,
                                value: {
                                    content: self.$t('添加筛选条件'),
                                    placement: 'top'
                                }
                            }],
                            children: [
                                h({
                                    component: 'i',
                                    class: 'bk-drag-icon bk-drag-add-line'
                                })
                            ]
                        }),
                        content: () => {
                            return h({
                                component: 'div',
                                class: 'field-options',
                                slot: 'content',
                                children: this.fieldOptions.map(field => h({
                                    component: 'div',
                                    class: 'option-item',
                                    key: field.key,
                                    on: {
                                        click: () => {
                                            self.handleAddFilter(field.key)
                                        }
                                    },
                                    children: field.name
                                }))
                            })
                        }
                    }
                }))
            }

            return h({
                component: 'div',
                class: 'filters-list-wrapper',
                children: filters
            })
        }

        return h({
            component: 'div',
            class: 'table-filters',
            children: [
                renderFilters()
            ]
        })
    }
}
