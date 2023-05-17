import cssModule from './table.postcss?module'
import {
    h,
    framework
} from 'bk-lesscode-render'
import dayjs from 'dayjs'
import editObject from '@/components/edit-object.vue'
import DayJSUtcPlugin from 'dayjs/plugin/utc'
dayjs.extend(DayJSUtcPlugin)

export default {
    name: 'widget-bk-table',

    components: {
        editObject
    },

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
                isSaving: false,
                show: false,
                columns: [],
                form: {}
            },
            deleteData: {
                show: false,
                isloading: false,
                form: {}
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
            this.deleteData.form = row
        },

        handleConfirmDelete () {
            this.deleteData.isloading = true
            return this
                .$http
                .delete(`/data-source/user/tableName/${this.tableName}?id=${this.deleteData.form.id}`)
                .then(() => {
                    this.getTableDataFromApi()
                    this.handleCloseDialog()
                })
        },

        handleCloseDialog () {
            this.deleteData.show = false
            this.deleteData.form = {}
            this.deleteData.isloading = false
        },

        handleSubmitData () {
            this
                .$refs
                .formRef
                .validate()
                .then(() => {
                    // 入库前根据浏览器时间转换时区
                    const dateTimeColumns = this.editData.columns?.filter((column) => (column.type === 'datetime'))
                    dateTimeColumns.forEach((dateTimeColumn) => {
                        this.editData.form[dateTimeColumn.propertyName] = dayjs(this.editData.form[dateTimeColumn.propertyName])
                            .utcOffset(0)
                            .format('YYYY-MM-DD HH:mm:ss')
                    })
                    this.editData.isSaving = true
                    return this
                        .$http
                        .put(`/data-source/user/tableName/${this.tableName}`, this.editData.form)
                        .then(() => {
                            this.getTableDataFromApi()
                            this.handleCloseForm()
                        })
                        .finally(() => {
                            this.editData.isSaving = false
                        })
                })
                .catch((validator) => {
                    this.messageError(validator.content || validator)
                })
        },

        handleCloseForm () {
            this.editData.show = false
            this.editData.form = {}
            this.editData.isLoading = false
            this.editData.columns = []
        },

        getColumnRule (column) {
            if (!column.isNullable) {
                return [{
                    required: true,
                    message: `${column.propertyName} 是必填项`,
                    trigger: 'blur'
                }]
            }
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
        },

        timeFormatter (val) {
            return val ? dayjs(val).format('YYYY-MM-DD HH:mm:ss') : ''
        },

        dateFormatter (val) {
            return val ? dayjs(val).format('YYYY-MM-DD') : ''
        },

        changeDateTime (propName, date) {
            this.editData.form[propName] = this.timeFormatter(date)
        },

        changeDate (propName, date) {
            this.editData.form[propName] = this.dateFormatter(date)
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
                        label: '操作',
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
                                        '编辑'
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
                                        '删除'
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

        const renderEditItem = (column) => {
            const handleChange = (propertyName, val) => {
                self.editData.form[propertyName] = val
            }
            switch (column.type) {
                case 'datetime':
                    return h({
                        component: 'bk-date-picker',
                        style: 'width:100%',
                        props: {
                            type: 'datetime',
                            clearable: false,
                            value: self.editData.form[column.propertyName]
                        },
                        on: {
                            change () {
                                self.changeDateTime(column.propertyName, ...arguments)
                            }
                        }
                    })
                case 'decimal':
                    return h({
                        component: 'bk-input',
                        props: {
                            value: self.editData.form[column.propertyName],
                            modelValue: self.editData.form[column.propertyName],
                            precision: +column.scale,
                            type: 'number',
                            placeholder: '请输入数字'
                        },
                        on: {
                            change (val) {
                                handleChange(column.propertyName, val)
                            }
                        }
                    })
                case 'int':
                    return h({
                        component: 'bk-input',
                        props: {
                            value: self.editData.form[column.propertyName],
                            modelValue: self.editData.form[column.propertyName],
                            type: 'number',
                            placeholder: '请输入数字'
                        },
                        on: {
                            change (val) {
                                handleChange(column.propertyName, val)
                            }
                        }
                    })
                case 'date':
                    return h({
                        component: 'bk-date-picker',
                        style: 'width:100%',
                        props: {
                            value: self.editData.form[column.propertyName],
                            clearable: false
                        },
                        on: {
                            change () {
                                self.changeDate(column.propertyName, ...arguments)
                            }
                        }
                    })
                case 'json':
                    return h({
                        component: 'edit-object',
                        props: {
                            value: self.editData.form[column.propertyName]
                        },
                        on: {
                            change (val) {
                                handleChange(column.propertyName, val)
                            }
                        }
                    })
                default:
                    return h({
                        component: 'bk-input',
                        props: {
                            value: self.editData.form[column.propertyName],
                            modelValue: self.editData.form[column.propertyName],
                            placeholder: '请输入字符串'
                        },
                        on: {
                            change (val) {
                                handleChange(column.propertyName, val)
                            }
                        }
                    })
            }
        }
        
        const renderEditFormItems = () => {
            return self.editData.columns.filter(column => column.propertyName !== 'id').map((column) => {
                return h({
                    component: 'bk-form-item',
                    key: column.propertyName,
                    props: {
                        label: column.propertyName,
                        required: !column.isNullable,
                        property: column.propertyName,
                        rules: self.getColumnRule(column),
                        errorDisplayType: 'normal'
                    },
                    children: [
                        renderEditItem(column)
                    ]
                })
            })
        }

        const renderOperationFormItem = () => {
            return h({
                component: 'bk-form-item',
                children: [
                    h({
                        component: 'bk-button',
                        class: 'mr5',
                        props: {
                            theme: 'primary',
                            loading: self.editData.isSaving
                        },
                        on: {
                            click: self.handleSubmitData
                        },
                        children: [
                            '提交'
                        ]
                    }),
                    h({
                        component: 'bk-button',
                        props: {
                            disabled: self.editData.isSaving
                        },
                        on: {
                            click: self.handleCloseForm
                        },
                        children: [
                            '取消'
                        ]
                    })
                ]
            })
        }

        const renderSidesilder = () => {
            const slotName = framework === 'vue2' ? 'content' : 'default'
            return h({
                component: 'bk-sideslider',
                props: {
                    title: '编辑数据',
                    width: 740,
                    transfer: true,
                    isShow: self.editData.show
                },
                slots: {
                    [slotName] () {
                        return h({
                            slot: slotName,
                            component: 'bk-loading',
                            key: self.isLoading,
                            props: {
                                loading: self.editData.isLoading,
                                isLoading: self.editData.isLoading
                            },
                            children: [
                                h({
                                    component: 'bk-form',
                                    ref: 'formRef',
                                    class: cssModule['edit-data-form'],
                                    props: {
                                        formType: 'vertical',
                                        labelWidth: 120,
                                        model: self.editData.form
                                    },
                                    children: [
                                        ...renderEditFormItems(),
                                        renderOperationFormItem()
                                    ]
                                })
                            ]
                        })
                    }
                }
            })
        }

        const renderDialog = () => {
            return h({
                component: 'bk-dialog',
                props: {
                    title: '确定删除',
                    maskClose: false,
                    loading: self.deleteData.isloading,
                    isShow: self.deleteData.show
                },
                slots: {
                    default () {
                        return `确定删除【id：${self.deleteData.form.id}】？`
                    },
                    footer () {
                        return h({
                            component: 'div',
                            class: 'dialog-footer',
                            children: [
                                h({
                                    component: 'bk-button',
                                    props: {
                                        theme: 'danger',
                                        loading: self.deleteData.isloading
                                    },
                                    on: {
                                        click: self.handleConfirmDelete
                                    },
                                    children: [
                                        '确定'
                                    ]
                                }),
                                h({
                                    component: 'bk-button',
                                    props: {
                                        disabled: self.deleteData.isloading
                                    },
                                    on: {
                                        click: self.handleCloseDialog
                                    },
                                    children: [
                                        '取消'
                                    ]
                                })
                            ]
                        })
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
