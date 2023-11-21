import { h, framework } from 'bk-lesscode-render'
import { isValEmpty } from '@/common/util'
import colSetting from './col-setting'
import rowActions from './row-actions'
import cellValue from './cell-value'

export default {
    name: 'data-manage-table',
    props: {
        tableName: String,
        queryData: {
            type: Object,
            default: () => ({})
        },
        tableRowActions: {
            type: Array,
            default: () => []
        },
        tableColsExclude: {
            type: Array,
            default: () => []
        },
        fields: {
            type: Array,
            default: () => []
        }
    },
    data () {
        return {
            loading: false,
            tableData: [],
            colsExclude: this.tableColsExclude.slice(),
            pagination: {
                current: 1,
                count: 0,
                limit: 10,
                'show-limit': true
            }
        }
    },
    computed: {
        fieldsToBeDisplayed () {
            return this.fields.filter(item => !this.colsExclude.includes(item.configure.key))
        }
    },
    watch: {
        queryData () {
            this.pagination.current = 1
            this.pagination.count = 0
            this.getTableData()
        }
    },
    created () {
        this.getTableData()
    },
    methods: {
        async getTableData () {
            this.loading = true
            const { current, limit } = this.pagination
            const params = {
                pageSize: limit,
                page: current,
                fields: [...this.fields.map(item => item.configure.key), 'id'],
                query: this.getQueries()
            }
            const res = await this.$http.post(`/nocode/filterTableData/keys/tableName/${this.tableName}`, params)
            this.tableData = res.data.list
            this.pagination.count = res.data.count
            this.loading = false
        },
        getQueries () {
            const query = {}
            Object.keys(this.queryData).forEach(key => {
                const val = this.queryData[key]
                if (Array.isArray(val) && val.every(item => item === '')) {
                    return
                }
                if (!isValEmpty(val)) {
                    query[key] = val
                }
            })
            return query
        },
        handleColSettingUpdate (val) {
            this.colsExclude = val
        },
        handlePageChange (val) {
            this.pagination.current = val
            this.getTableData()
        },
        handlePageLimitChange (val) {
            this.pagination.current = 1
            this.pagination.limit = val
            this.getTableData()
        }
    },
    render (render) {
        h.init(render)

        const self = this

        const renderRowActions = () => {
            return h({
                component: 'bk-table-column',
                props: {
                    width: 200,
                    index: 9999,
                    label: this.$t('操作')
                },
                scopedSlots: {
                    default: (props) => {
                        return h({
                            component: rowActions,
                            slot: 'default',
                            props: {
                                tableName: self.tableName,
                                fields: self.fields,
                                actions: self.tableRowActions,
                                value: props.row
                            },
                            on: {
                                delete: () => {
                                    if (self.tableData.length === 1 && self.pagination.current !== 1) {
                                        self.pagination.current -= 1
                                    }
                                    self.getTableData()
                                }
                            }
                        })
                    }
                }
            })
        }

        const renderTableColSetting = () => {
            return h({
                component: colSetting,
                props: {
                    fields: this.fields,
                    exclude: this.colsExclude
                },
                on: {
                    update: self.handleColSettingUpdate
                }
            })
        }
        
        const renderTableCols = () => {
            const cols = this.fieldsToBeDisplayed.map((field, index) => {
                return h({
                    component: 'bk-table-column',
                    props: {
                        index,
                        key: field.configure.key,
                        prop: field.configure.key,
                        label: field.configure.name
                    },
                    scopedSlots: {
                        default (props) {
                            return h({
                                component: cellValue,
                                props: {
                                    field,
                                    value: props.row[field.configure.key]
                                }
                            })
                        }
                    }
                })
            })

            if (this.tableRowActions.length > 0) {
                cols.push(renderRowActions())
            }

            if (framework === 'vue2') {
                cols.push(renderTableColSetting())
            }

            return cols
        }

        return h({
            component: 'bk-table',
            props: {
                data: this.tableData,
                pagination: this.pagination
            },
            on: {
                'page-change': (val) => {
                    self.handlePageChange(val)
                },
                'page-limit-change': (val) => {
                    self.handlePageLimitChange(val)
                }
            },
            children: renderTableCols()
        })
    }
}
