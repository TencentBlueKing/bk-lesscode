import dayjs from 'dayjs'

const comparatorMap = {
    lg: '>',
    lt: '<',
    gte: '>=',
    lte: '<=',
    eq: '=',
    neq: '!=',
    in: 'in',
    like: 'like'
}

const getValue = (val) => {
    if (val === 'true') {
        return true
    }
    if (val === 'false') {
        return false
    }
    if (/^\d+$/.test(val)) {
        return +val
    }
    return val
}

export default {
    name: 'widget-table-column',

    props: {
        columnType: String,
        type: String,
        label: String,
        prop: String,
        sortable: Boolean,
        width: String,
        filterable: Boolean,
        align: String,
        status: Array
    },

    data () {
        return {
            filterText: ''
        }
    },

    methods: {
        renderHeader (h, { column, $index }) {
            const vm = this
            return h(
                'div',
                {},
                [
                    column.label,
                    this.filterable
                        ? h(
                            'bk-popover',
                            {
                                props: {
                                    trigger: 'click',
                                    theme: 'light',
                                    extCls: 'g-popover-empty-padding'
                                },
                                ref: 'popoverRef',
                                refInFor: true
                            },
                            [
                                h(
                                    'bk-input',
                                    {
                                        slot: 'content',
                                        props: {
                                            value: vm.filterText,
                                            placeholder: '请输入并按回车键进行搜索'
                                        },
                                        on: {
                                            enter () {
                                                vm.handleFilter(column)
                                            },
                                            change (val) {
                                                vm.changeFilterText(val)
                                            }
                                        }
                                    }
                                ),
                                h(
                                    'i',
                                    {
                                        class: 'bk-table-column-filter-trigger bk-icon icon-funnel',
                                        slot: 'default'
                                    }
                                )
                            ]
                        )
                        : ''
                ]
            )
        },

        bkTableFormatter (row, column, cellValue, index) {
            if (typeof cellValue === 'object') {
                return cellValue ? JSON.stringify(cellValue) : '--'
            } else if (/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/.test(cellValue)) {
                return cellValue ? dayjs(cellValue).format('YYYY-MM-DD HH:mm:ss') : '--'
            } else {
                return cellValue
            }
        },

        handleFilter (column) {
            this.$parent.$refs.tableHeader.$refs.popoverRef.forEach(refItem => refItem.hideHandler())
            this.$parent.$parent.$parent.handleFilter({
                key: column.property,
                value: this.filterText
            })
        },

        changeFilterText (val) {
            this.filterText = val
        },

        filterMethod (value, row, column) {
            const property = column.property
            return row[property] === value
        },

        renderStatus (props, h) {
            let renderContent = []
            this.status.forEach(({ when, show }) => {
                const qualifiedComponent = h(
                    'span',
                    {
                        style: {
                            display: 'flex',
                            height: '100%',
                            'alignItems': 'center'
                        }
                    },
                    [
                        h(
                            'img',
                            {
                                attrs: {
                                    src: `/static/images/icon/${show.status}.svg`
                                },
                                style: {
                                    width: '13px',
                                    height: '13px',
                                    marginRight: '5px'
                                }
                            }
                        ),
                        show.description
                    ]
                )
                const rowValue = props.row[when.field]
                const val = getValue(when.value)
                switch (when.comparator) {
                    case comparatorMap.eq:
                        if (rowValue === val && when.value.trim() !== '') {
                            renderContent = qualifiedComponent
                        }
                        break
                    case comparatorMap.gte:
                        if (rowValue >= val && when.value.trim() !== '') {
                            renderContent = qualifiedComponent
                        }
                        break
                    case comparatorMap.in:
                        if (rowValue.includes(val) && when.value.trim() !== '') {
                            renderContent = qualifiedComponent
                        }
                        break
                    case comparatorMap.lg:
                        if (rowValue > val && when.value.trim() !== '') {
                            renderContent = qualifiedComponent
                        }
                        break
                    case comparatorMap.like:
                        if (rowValue.includes(val) && when.value.trim() !== '') {
                            renderContent = qualifiedComponent
                        }
                        break
                    case comparatorMap.lt:
                        if (rowValue < val && when.value.trim() !== '') {
                            renderContent = qualifiedComponent
                        }
                        break
                    case comparatorMap.lte:
                        if (rowValue <= val && when.value.trim() !== '') {
                            renderContent = qualifiedComponent
                        }
                        break
                    case comparatorMap.neq:
                        if (rowValue !== val && when.value.trim() !== '') {
                            renderContent = qualifiedComponent
                        }
                        break
                }
            })
            return renderContent
        }
    },

    render (h) {
        const self = this

        const slots = {}

        if (self.status?.length > 0 && self.$props.type === 'status') {
            slots.scopedSlots = {
                default: (props) => self.renderStatus(props, h)
            }
        }

        return h(
            self.columnType,
            {
                props: {
                    formatter: self.bkTableFormatter,
                    renderHeader: self.renderHeader,
                    render: self.renderHeader,
                    ...self.$props
                },
                ...slots
            }
        )
    }
}
