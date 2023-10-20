import { h } from 'bk-lesscode-render'
import './index.postcss'

export default {
    name: 'bkform-engine-table',
    props: {
        fieldData: {
            type: Object,
            default: () => ({})
        },
        disabled: Boolean,
        viewMode: Boolean
    },
    data () {
        return {
            localVal: []
        }
    },
    created () {
        this.localVal.push(this.getDefaultVal())
    },
    methods: {
        getDefaultVal () {
            return this.fieldData.configure.tableConfig.reduce((val, col) => {
                val[col.key] = ''
                return val
            }, {})
        },
        handleChange (val) {
            this.$emit('change', val)
        }
    },
    render (render) {
        h.init(render)

        const self = this

        const getCellComp = (col) => {
            console.log(col.type)
            switch (col.type) {
                case 'select':
                case 'multiple-select':
                    return h({
                        component: 'bk-select',
                        props: {
                            disabled: col.disabled
                        },
                        on: {
                            change: (val) => {
                                console.log('change', val)
                            }
                        },
                        children: col.dataSource.map(option => h({
                            component: 'bk-option',
                            props: {
                                key: option.id,
                                id: option.id,
                                name: option.label,
                                label: option.label
                            }
                        }))
                    })
                case 'date':
                case 'datatime':
                    return h({
                        component: 'bk-date-picker',
                        props: {
                            type: col.type,
                            disabled: col.disabled
                        },
                        on: {
                            change: (val) => {
                                console.log('change', val)
                            }
                        }
                    })
                default:
                    return h({
                        component: 'bk-input',
                        props: {
                            disabled: col.disabled
                        },
                        on: {
                            change: (val) => {
                                console.log('change', val)
                            }
                        }
                    })
            }
        }

        const renderCols = () => {
            const cols = this.fieldData.configure.tableConfig.map(col => h({
                component: 'bk-table-column',
                props: {
                    key: col.key,
                    prop: col.key,
                    label: col.label
                },
                scopedSlots: {
                    default (props) {
                        return getCellComp(col, props)
                    }
                }
            }))
            if (!this.disabled || !this.viewMode) {
                cols.push(h({
                    component: 'bk-table-column',
                    props: {
                        // fixed: 'right'
                        label: '操作'
                    },
                    scopedSlots: {
                        default (props) {
                            return [
                                h({
                                    component: 'bk-button',
                                    style: { marginRight: '8px' },
                                    props: {
                                        text: true,
                                        theme: 'primary'
                                    },
                                    on: {
                                        click: () => {
                                            self.localVal.splice(props.$index, 0, self.getDefaultVal())
                                        }
                                    },
                                    children: '添加'
                                }),
                                h({
                                    component: 'bk-button',
                                    props: {
                                        text: true,
                                        theme: 'primary'
                                    },
                                    on: {
                                        click: () => {
                                            self.localVal.splice(props.$index, 1)
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
