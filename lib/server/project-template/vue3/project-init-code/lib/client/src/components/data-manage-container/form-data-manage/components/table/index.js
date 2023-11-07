import { h, resolveComponent } from 'vue'
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
                if (!isValEmpty(this.queryData[key])) {
                    query[key] = this.queryData[key]
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
    render () {
        const self = this

        const renderRowActions = () => {
            return h(
                resolveComponent('bk-table-column'),
                {
                    width: 200,
                    index: 9999,
                    label: '操作'
                },
                {
                    default: (props) => {
                        return h(
                            rowActions,
                            {
                                tableName: self.tableName,
                                fields: self.fields,
                                actions: self.tableRowActions,
                                value: props.row,
                                onDelete: () => {
                                    if (self.tableData.length === 1 && self.pagination.current !== 1) {
                                        self.pagination.current -= 1
                                    }
                                    self.getTableData()
                                }
                            }
                        )
                    }
                }
            )
        }

        const renderTableColSetting = () => {
            return h(
                colSetting,
                {
                    fields: this.fields,
                    exclude: this.colsExclude,
                    onUpdate: self.handleColSettingUpdate
                }
            )
        }
        
        const renderTableCols = () => {
            const cols = this.fieldsToBeDisplayed.map((field, index) => {
                return h(
                    resolveComponent('bk-table-column'),
                    {
                        index,
                        key: field.configure.key,
                        // prop: field.configure.key,
                        label: field.configure.name
                    },
                    {
                        default (props) {
                            return h(
                                cellValue,
                                {
                                    field,
                                    value: props.row[field.configure.key]
                                }
                            )
                        }
                    }
                )
            })

            if (this.tableRowActions.length > 0) {
                cols.push(renderRowActions())
            }
            cols.push(renderTableColSetting())

            return cols
        }

        return h(
            resolveComponent('bk-table'),
            {
                data: this.tableData,
                pagination: this.pagination,
                onPageChange: (val) => {
                    self.handlePageChange(val)
                },
                onPageLimitChange: (val) => {
                    self.handlePageLimitChange(val)
                }
            },
            renderTableCols()
        )
    }
}
