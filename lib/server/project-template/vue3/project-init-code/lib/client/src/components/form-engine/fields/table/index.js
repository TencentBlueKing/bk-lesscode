import { h, resolveComponent } from 'vue'
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
        disabled: Boolean
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
    render () {
        const self = this

        const getCellComp = (col, index) => {
            switch (col.type) {
                case 'select':
                case 'multiple-select':
                    return h(
                        resolveComponent('bk-select'),
                        {
                            disabled: col.disabled || self.disabled,
                            value: self.localVal[index][col.key],
                            modelValue: self.localVal[index][col.key],
                            onChange: (val) => {
                                self.handleCellValChange(index, col.key, val)
                            }
                        },
                        col.dataSource.map(option => h(
                            resolveComponent('bk-option'),
                            {
                                id: option.id,
                                key: option.id,
                                value: option.id,
                                name: option.label,
                                label: option.label
                            }
                        ))
                    )
                case 'date':
                case 'datatime':
                    return h(
                        resolveComponent('bk-date-picker'),
                        {
                            type: col.type,
                            disabled: col.disabled || self.disabled,
                            value: self.localVal[index][col.key],
                            modelValue: self.localVal[index][col.key],
                            onChange: (val) => {
                                self.handleCellValChange(index, col.key, val)
                            }
                        }
                    )
                default:
                    return h(
                        resolveComponent('bk-input'),
                        {
                            disabled: col.disabled || self.disabled,
                            value: self.localVal[index][col.key],
                            modelValue: self.localVal[index][col.key],
                            onChange: (val) => {
                                self.handleCellValChange(index, col.key, val)
                            }
                        }
                    )
            }
        }

        const renderCols = () => {
            const cols = this.fieldData.configure.tableConfig.map((col, index) => h(
                resolveComponent('bk-table-column'),
                {
                    key: col.key,
                    prop: col.key,
                    label: col.label,
                    index,
                    inheritAttrs: false
                },
                {
                    default (props) {
                        // vue3 table组件bk-table-column默认插槽初次渲染时，props内值为空
                        if (!('index' in props)) {
                            return null
                        }
                        return getCellComp(col, props.index)
                    }
                }
            ))
            if (!this.disabled || !this.viewMode) {
                cols.push(h(
                    resolveComponent('bk-table-column'),
                    {
                        // fixed: 'right'
                        label: '操作',
                        index: 9999,
                        inheritAttrs: false
                    },
                    {
                        default (props) {
                            return [
                                h(
                                    resolveComponent('bk-button'),
                                    {
                                        style: { marginRight: '8px' },
                                        text: true,
                                        theme: 'primary',
                                        onClick: () => {
                                            self.handleAdd(props.index)
                                        }
                                    },
                                    '添加'
                                ),
                                h(
                                    resolveComponent('bk-button'),
                                    {
                                        text: true,
                                        theme: 'primary',
                                        disabled: self.localVal.length === 1,
                                        onClick: () => {
                                            self.handleDel(props.index)
                                        }
                                    },
                                    '删除'
                                )
                            ]
                        }
                    }
                ))
            }

            return cols
        }

        return h(
            resolveComponent('bk-table'),
            {
                data: self.localVal,
                disabled: self.disabled,
                inheritAttrs: false,
                ...self.fieldData.props
            },
            renderCols()
        )
    }
}
