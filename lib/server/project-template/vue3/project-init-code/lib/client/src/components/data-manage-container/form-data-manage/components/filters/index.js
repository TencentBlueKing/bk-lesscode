import { h, resolveComponent } from 'vue'
import cloneDeep from 'lodash.clonedeep'
import widgetSelect from '../../../../form-engine/fields/select'
import './index.postcss'

export default {
    name: 'data-manage-filters',
    props: {
        fields: {
            type: Array,
            default: () => []
        },
        filters: {
            type: Array,
            default: () => []
        },
        queryData: {
            type: Object,
            default: () => ({})
        }
    },
    data () {
        return {
            localVal: {}
        }
    },
    computed: {
        filterFields () {
            const list = []
            this.filters.filter(key => {
                const field = this.fields.find(item => {
                    return item.configure.key === key
                })
                if (field) {
                    list.push(field)
                }
            })
            return list
        }
    },
    created () {
        this.localVal = this.getLocalVal()
    },
    methods: {
        getLocalVal () {
            const localVal = {}
            this.filterFields.forEach(field => {
                const key = field.configure.key
                if (key in this.queryData) {
                    localVal[key] = cloneDeep(this.queryData[key])
                } else {
                    localVal[key] = ['data', 'datetime'].includes(field.type) ? ['', ''] : ''
                }
            })
            return localVal
        },
        handleChange (field, val) {
            const key = field.configure.key
            if (['data', 'datetime'].includes(field.type)) {
                const value = []
                val.map(item => {
                    if (item !== '') {
                        value.push(item)
                    }
                })
                this.localVal[key] = value
                return
            }
            this.localVal[key] = val
        },
        handleQuery () {
            this.$emit('query', cloneDeep(this.localVal))
        },
        handleReset () {
            Object.keys(this.localVal).forEach(key => {
                this.localVal[key] = ''
            })
            this.handleQuery()
        }
    },
    render () {
        const self = this

        const getFilterElement = (field) => {
            const key = field.configure.key
            const name = field.configure.name
            if (['select', 'multiple-select', 'checkbox', 'radio'].includes(field.type)) {
                return h(
                    widgetSelect,
                    {
                        fieldData: field,
                        value: self.localVal[key],
                        modelValue: self.localVal[key],
                        onChange: (val) => {
                            self.handleChange(field, val)
                        }
                    }
                )
            } else if (['data', 'datetime'].includes(field.type)) {
                return h(
                    resolveComponent('bk-date-picker'),
                    {
                        style: 'width: 100%;',
                        type: 'daterange',
                        format: 'yyyy-MM-dd HH:mm:ss',
                        value: self.localVal[key],
                        modelValue: self.localVal[key],
                        placeholder: `请输入${name}`,
                        onChange: (val) => {
                            self.handleChange(field, val)
                        }
                    }
                )
            }
            return h(
                resolveComponent('bk-input'),
                {
                    type: field.type === 'int' ? 'number' : 'text',
                    value: self.localVal[key],
                    modelValue: self.localVal[key],
                    placeholder: `请输入${name}`,
                    onChange: (val) => {
                        self.handleChange(field, val)
                    }
                }
            )
        }

        const renderFilters = () => {
            return h(
                'div',
                {
                    class: 'filter-list'
                },
                this.filterFields.map(field => {
                    return h(
                        'div',
                        {
                            class: 'filter-item-form'
                        },
                        [
                            h(
                                'div',
                                {
                                    class: 'filter-label'
                                },
                                field.configure.name
                            ),
                            getFilterElement(field)
                        ]
                    )
                })
            )
        }

        const renderBtns = () => {
            return h(
                'div',
                {
                    class: 'data-manage-filters-btns'
                },
                [
                    h(
                        resolveComponent('bk-button'),
                        {
                            style: { marginRight: '8px' },
                            theme: 'primary',
                            onClick: () => {
                                self.handleQuery()
                            }
                        },
                        '查询'
                    ),
                    h(
                        resolveComponent('bk-button'),
                        {
                            onClick: () => {
                                self.handleReset()
                            }
                        },
                        '重置'
                    )
                ]
            )
        }

        return h(
            'div',
            {
                class: 'data-manage-filters-wrapper'
            },
            [
                renderFilters(),
                renderBtns()
            ]
        )
    }
}
