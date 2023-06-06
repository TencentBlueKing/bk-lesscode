import { h } from 'bk-lesscode-render'
import dayjs from 'dayjs'
import RenderDelete from './delete'
import RenderEdit from './edit'
import DayJSUtcPlugin from 'dayjs/plugin/utc'
dayjs.extend(DayJSUtcPlugin)

export default {
    name: 'widget-bk-table',

    props: {
        data: {
            type: Array,
            default: function () {
                return []
            }
        },
        size: {
            type: String,
            default: 'small',
            validator (val) {
                return ['small', 'medium', 'large'].includes(val)
            }
        },
        height: [String, Number],
        maxHeight: [String, Number],
        fit: {
            type: Boolean,
            default: true
        },
        rowAutoHeight: {
            type: Boolean,
            default: false
        },
        stripe: Boolean,
        border: Boolean,
        outerBorder: {
            type: Boolean,
            default: true
        },
        rowBorder: {
            type: Boolean,
            default: true
        },
        colBorder: Boolean,
        rowKey: [String, Function],
        context: {
            type: Object,
            default: () => ({})
        },
        showHeader: {
            type: Boolean,
            default: true
        },
        showSummary: Boolean,
        sumText: String,
        summaryMethod: Function,
        rowClassName: [String, Function],
        rowStyle: [Object, Function],
        cellClassName: [String, Function],
        cellStyle: [Object, Function],
        headerBorder: {
            type: Boolean,
            default: false
        },
        headerRowClassName: [String, Function],
        headerRowStyle: [Object, Function],
        headerCellClassName: [String, Function],
        headerCellStyle: [Object, Function],
        highlightCurrentRow: Boolean,
        currentRowKey: [String, Number],
        emptyText: String,
        emptyBlockClassName: String,
        expandRowKeys: Array,
        defaultExpandAll: Boolean,
        defaultSort: Object,
        spanMethod: Function,
        selectOnIndeterminate: {
            type: Boolean,
            default: true
        },
        pagination: Object,
        showPaginationInfo: {
            type: Boolean,
            default: true
        },
        autoScrollToTop: {
            type: Boolean,
            default: false
        },
        extCls: {
            type: String,
            default: ''
        },
        setting: {
            type: Object,
            default: () => ({
                columns: []
            }),
            validator (setting) {
                return Array.isArray(setting.columns)
            }
        },
        cellAttributes: [Function, Object],
        headerCellAttributes: [Function, Object],
        virtualRender: {
            type: [Object, Boolean],
            default: false
        },
        scrollLoading: {
            type: Object,
            default: () => ({ isLoading: false })
        },
        popoverOptions: {
            type: Object,
            default: () => ({})
        },
        tableName: String,
        paginationType: String,
        dataValueType: String,
        bkDataSourceType: String,
        showOperationColumn: Boolean
    },

    data () {
        return {
            editData: {
                isLoading: false,
                show: false,
                columns: [],
                form: {}
            },
            deleteData: {
                show: false,
                id: 0
            },
            renderPagination: {
                'show-total-count': true,
                'count': 3,
                'show-limit': true,
                'limit': 10,
                'current': 1
            },
            renderData: [],
            isLoading: false,
            queryObject: {},
            sortObject: {}
        }
    },

    watch: {
        pagination: {
            handler (pagination, oldPagination) {
                try {
                    if (pagination === undefined) {
                        this.renderPagination = undefined
                    } else if (JSON.stringify(pagination) !== JSON.stringify(oldPagination)) {
                        this.renderPagination = JSON.parse(JSON.stringify(pagination))
                    }
                } catch (error) {
                    this.renderPagination = undefined
                }
            },
            immediate: true,
            deep: true
        },
        // fix vue same old value
        'pagination.count': {
            handler (count) {
                if (this.renderPagination) {
                    this.renderPagination.count = count
                }
            }
        },
        // fix vue same old value
        'pagination.current': {
            handler (current) {
                if (this.renderPagination) {
                    this.renderPagination.current = current
                }
            }
        },
        // fix vue same old value
        'pagination.limit': {
            handler (limit) {
                if (this.renderPagination) {
                    this.renderPagination.limit = limit
                }
            }
        },
        data: {
            handler () {
                if (['none', 'local'].includes(this.paginationType)
                    || !this.pagination
                    || (this.paginationType === 'remote'
                        && this.dataValueType === 'table-data-source')) {
                    this.calcRenderData()
                } else {
                    this.renderData = this.data
                }
                if (this.paginationType === 'remote'
                    && ['array', 'table-data-source'].includes(this.dataValueType)
                    && this.renderPagination) {
                    this.renderPagination.count = this.data.length
                }
            },
            immediate: true,
            deep: true
        }
    },

    methods: {
        handleEdit (row) {
            Object.assign(this.editData.form, row)
            this.editData.show = true
            this.editData.isLoading = true
            this
                .$http
                .get(`/data-source/user/tableName/${this.tableName}/columns`)
                .then((res) => {
                    this.editData.columns = res.data || []
                    this.editData.columns.forEach((column) => {
                        // 转换为本地时区
                        if (column.type === 'datetime') {
                            this.editData.form[column.propertyName] = dayjs(this.editData.form[column.propertyName])
                                .format('YYYY-MM-DD HH:mm:ss')
                        }
                        // 转换为字符串
                        if (column.type === 'json') {
                            this.editData.form[column.propertyName] = JSON.stringify(this.editData.form[column.propertyName])
                        }
                    })
                })
                .finally(() => {
                    this.editData.isLoading = false
                })
        },

        handleDelete (row) {
            this.deleteData.show = true
            this.deleteData.id = row.id
        },

        getTableDataFromApi () {
            this.isLoading = true
            this
                .$http
                .get(
                    `/data-source/user/tableName/${this.tableName}`,
                    {
                        params: {
                            page: this.renderPagination?.current,
                            pageSize: this.renderPagination?.limit,
                            bkSortKey: this.sortObject.key,
                            bkSortValue: this.sortObject.value,
                            bkDataSourceType: this.bkDataSourceType,
                            ...this.queryObject
                        }
                    }
                )
                .then(({ data }) => {
                    this.renderData = data.list || []
                    if (this.renderPagination) {
                        this.renderPagination.count = data.count || 0
                    }
                })
                .finally(() => {
                    this.isLoading = false
                })
        },

        handlePageChange (page) {
            this.renderPagination.current = page
            if (this.paginationType === 'local') {
                this.calcRenderData()
            } else if (this.paginationType === 'remote' && this.tableName) {
                this.getTableDataFromApi()
            } else {
                this.$emit('page-change', page)
            }
        },

        handleLimitChange (limit) {
            this.renderPagination.current = 1
            this.renderPagination.limit = limit
            if (this.paginationType === 'local') {
                this.calcRenderData()
            } else if (this.paginationType === 'remote' && this.tableName) {
                this.getTableDataFromApi()
            } else {
                this.$emit('page-limit-change', limit)
            }
        },

        handleFilter ({ key, value }) {
            if (this.renderPagination) {
                this.renderPagination.current = 1
            }
            if (['', undefined, null].includes(value)) {
                delete this.queryObject[key]
            } else {
                this.queryObject[key] = value
            }
            // 远程非数据表情况下需要用户自行处理
            if (['none', 'local'].includes(this.paginationType) || !this.pagination) {
                this.calcRenderData()
            } else if (this.paginationType === 'remote' && this.tableName) {
                this.getTableDataFromApi()
            } else {
                this.$emit('filter-change', { key, value: [value] })
            }
        },

        handleSortChange ({ column, prop, order }) {
            const sortMap = {
                ascending: 'ASC',
                descending: 'DESC'
            }
            if (this.renderPagination) {
                this.renderPagination.current = 1
            }
            this.sortObject.key = prop
            this.sortObject.value = sortMap[order]
            // 远程非数据表情况下需要用户自行处理
            if (['none', 'local'].includes(this.paginationType) || !this.pagination) {
                this.calcRenderData()
            } else if (this.paginationType === 'remote' && this.tableName) {
                this.getTableDataFromApi()
            } else {
                this.$emit('sort-change', { column, prop, order })
            }
        },

        calcRenderData () {
            // 过滤
            const filterDataList = this.data.reduce((acc, cur) => {
                const isMatch = Object
                    .keys(this.queryObject)
                    .every(key => this.queryObject[key] === '' || cur[key].includes(this.queryObject[key]))
                if (isMatch) {
                    acc.push(cur)
                }
                return acc
            }, [])
            // 排序
            const { key, value } = this.sortObject
            filterDataList.sort((a, b) => {
                if (value === 'ASC') {
                    return a[key] - b[key]
                }
                if (value === 'DESC') {
                    return b[key] - a[key]
                }
            })
            this.renderData = this.renderPagination
                ? filterDataList.slice(
                    (this.renderPagination.current - 1) * this.renderPagination.limit,
                    this.renderPagination.current * this.renderPagination.limit
                )
                : filterDataList
            if (this.renderPagination) {
                this.renderPagination.count = filterDataList.length
            }
        }
    },

    render (render) {
        h.init(render)

        const self = this

        const renderTable = () => {
            const renderChildren = [
                typeof self.$slots.default === 'function' ? self.$slots.default() : self.$slots.default
            ]
            if (self.showOperationColumn) {
                renderChildren.push(h({
                    component: 'bk-table-column',
                    props: {
                        label: window.i18n.t('操作'),
                        width: 120
                    },
                    scopedSlots: {
                        default (props) {
                            return [
                                h({
                                    component: 'bk-button',
                                    class: 'mr5',
                                    props: {
                                        text: true
                                    },
                                    on: {
                                        click: () => self.handleEdit(props?.row)
                                    },
                                    children: [
                                        window.i18n.t('编辑')
                                    ]
                                }),
                                h({
                                    component: 'bk-button',
                                    props: {
                                        text: true
                                    },
                                    on: {
                                        click: () => self.handleDelete(props?.row)
                                    },
                                    children: [
                                        window.i18n.t('删除')
                                    ]
                                })
                            ]
                        }
                    }
                }))
            }

            return h({
                component: 'bk-loading',
                key: self.isLoading,
                props: {
                    loading: self.isLoading,
                    isLoading: self.isLoading
                },
                children: [
                    h({
                        component: 'bk-table',
                        props: {
                            ...self.$props,
                            pagination: self.renderPagination,
                            data: self.renderData
                        },
                        on: {
                            'page-change': self.handlePageChange,
                            'page-limit': self.handleLimitChange,
                            'sort-change': self.handleSortChange,
                            ...self.$listeners
                        },
                        children: renderChildren
                    })
                ]
            })
        }

        const renderSidesilder = () => {
            return h({
                component: RenderEdit,
                props: {
                    isLoading: self.editData.isLoading,
                    isShow: self.editData.show,
                    form: self.editData.form,
                    columns: self.editData.columns,
                    tableName: self.tableName
                },
                on: {
                    close () {
                        self.editData.show = false
                    },
                    edit () {
                        self.getTableDataFromApi()
                    }
                }
            })
        }

        const renderDialog = () => {
            return h({
                component: RenderDelete,
                props: {
                    isShow: self.deleteData.show,
                    id: self.deleteData.id,
                    tableName: self.tableName
                },
                on: {
                    close () {
                        self.deleteData.show = false
                    },
                    delete () {
                        self.getTableDataFromApi()
                    }
                }
            })
        }

        return h({
            component: 'section',
            children: [
                renderTable(),
                renderSidesilder(),
                renderDialog()
            ]
        })
    }
}
