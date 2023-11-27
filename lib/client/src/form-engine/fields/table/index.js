import { h, framework } from 'bk-lesscode-render'
import cloneDeep from 'lodash.clonedeep'
import './index.postcss'

export default {
    name: 'bkform-engine-table',
    props: {
        fieldData: {
            type: Object,
            default: () => ({})
        },
        value: {
            type: Array,
            default: () => []
        },
        disabled: Boolean,
        viewMode: Boolean
    },
    data () {
        return {
            localVal: cloneDeep(this.value)
        }
    },
    watch: {
        value: {
            handler (val) {
                if (val.length === 0) {
                    this.localVal = [this.getDefaultVal()]
                } else {
                    this.localVal = cloneDeep(val)
                }
            },
            deep: true
        }
    },
    created () {
        if (this.value.length === 0) {
            this.localVal = [this.getDefaultVal()]
        }
    },
    methods: {
        getDefaultVal () {
            return this.fieldData.configure.tableConfig.reduce((val, col) => {
                val[col.key] = ''
                return val
            }, {})
        },
        handleAdd (index) {
            this.localVal.splice(index + 1, 0, this.getDefaultVal())
            this.change()
        },
        handleDel (index) {
            this.localVal.splice(index, 1)
            this.change()
        },
        handleCellValChange (index, key, val) {
            this.localVal[index][key] = val
            this.change()
        },
        change () {
            this.$emit('change', this.localVal)
        }
    },
    render (render) {
        h.init(render)

        const self = this

        const getCellComp = (col, index) => {
            switch (col.type) {
                case 'select':
                case 'multiple-select':
                    return h({
                        component: 'bk-select',
                        slot: 'default',
                        props: {
                            disabled: col.disabled || self.disabled,
                            value: self.localVal[index][col.key],
                            modelValue: self.localVal[index][col.key]
                        },
                        on: {
                            change: (val) => {
                                self.handleCellValChange(index, col.key, val)
                            }
                        },
                        children: col.dataSource.map(option => h({
                            component: 'bk-option',
                            props: {
                                id: option.id,
                                key: option.id,
                                value: option.id,
                                name: option.label,
                                label: option.label
                            }
                        }))
                    })
                case 'date':
                case 'datatime':
                    return h({
                        component: 'bk-date-picker',
                        slot: 'default',
                        props: {
                            type: col.type,
                            disabled: col.disabled || self.disabled,
                            value: self.localVal[index][col.key],
                            modelValue: self.localVal[index][col.key]
                        },
                        on: {
                            change: (val) => {
                                self.handleCellValChange(index, col.key, val)
                            }
                        }
                    })
                default:
                    return h({
                        component: 'bk-input',
                        slot: 'default',
                        props: {
                            disabled: col.disabled || self.disabled,
                            value: self.localVal[index][col.key],
                            modelValue: self.localVal[index][col.key]
                        },
                        on: {
                            change: (val) => {
                                self.handleCellValChange(index, col.key, val)
                            }
                        }
                    })
            }
        }

        const renderCols = () => {
            const cols = this.fieldData.configure.tableConfig.map((col, index) => h({
                component: 'bk-table-column',
                props: {
                    key: col.key,
                    prop: col.key,
                    label: col.label,
                    index
                },
                scopedSlots: {
                    default (props) {
                        // vue3 table组件bk-table-column默认插槽初次渲染时，props内值为空
                        if (framework === 'vue3' && !('index' in props)) {
                            return null
                        }
                        // vue3 table组件表示行的字段名称为index
                        const index = framework === 'vue3' ? props.index : props.$index
                        return getCellComp(col, index)
                    }
                }
            }))
            if (!this.disabled || !this.viewMode) {
                cols.push(h({
                    component: 'bk-table-column',
                    props: {
                        // fixed: 'right'
                        label: '操作',
                        index: 99999
                    },
                    scopedSlots: {
                        default (props) {
                            const index = framework === 'vue3' ? props.index : props.$index
                            return [
                                h({
                                    component: 'bk-button',
                                    slot: 'default',
                                    style: { marginRight: '8px' },
                                    props: {
                                        text: true,
                                        theme: 'primary'
                                    },
                                    on: {
                                        click: () => {
                                            self.handleAdd(index)
                                        }
                                    },
                                    children: '添加'
                                }),
                                h({
                                    component: 'bk-button',
                                    slot: 'default',
                                    props: {
                                        text: true,
                                        theme: 'primary',
                                        disabled: self.localVal.length === 1
                                    },
                                    on: {
                                        click: () => {
                                            self.handleDel(index)
                                        }
                                    },
                                    children: '删除'
                                })
                            ]
                        }
                    }
                }))
            }

            return cols
        }

        return h({
            component: 'bk-table',
            props: {
                data: self.localVal,
                disabled: self.disabled,
                ...self.fieldData.props
            },
            children: renderCols()
        })
    }
}
