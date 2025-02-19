import { h } from 'bk-lesscode-render'
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
    name: 'widget-blueking-table-column',

    props: {
        columnType: String,
        type: String,
        label: String,
        field: String,
        status: Array,
        sortable: Boolean,
        filterable: Array,
        width: String,
        index: Number,
        key: String
    },

    data () {
        return {
            filterText: ''
        }
    },

    methods: {
        renderCustomFilter (props) {
            const vm = this
            return h(
                {
                    component: 'bk-input',
                    props: {
                        value: vm.filterText,
                        placeholder: window.i18n.t('请输入并按回车键进行搜索')
                    },
                    on: {
                        enter () {
                            vm.handleFilter(vm.label)
                        },
                        change (val) {
                            vm.changeFilterText(val)
                        }
                    }
                }
            )
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

        renderStatus (props) {
            let renderContent = []
            this.status.forEach(({ when, show }) => {
                const qualifiedComponent = h({
                    component: 'span',
                    style: {
                        display: 'flex',
                        height: '100%',
                        'alignItems': 'center'
                    },
                    children: [
                        h({
                            component: 'img',
                            attrs: {
                                src: `/static/images/icon/${show.status}.svg`
                            },
                            style: {
                                width: '13px',
                                height: '13px',
                                marginRight: '5px'
                            }
                        }),
                        show.description
                    ]
                })
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
        },

        bluekingTableFormatter ({ cellValue, row, column }) {
            if (typeof cellValue === 'object') {
                return cellValue ? JSON.stringify(cellValue) : '--'
            } else if (/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/.test(cellValue)) {
                return cellValue ? dayjs(cellValue).format('YYYY-MM-DD HH:mm:ss') : '--'
            } else {
                return cellValue
            }
        }
    },

    render (render) {
        h.init(render)

        const self = this

        const slots = {
            scopedSlots: {}
        }

        if (self.status?.length > 0 && self.$props.type === 'status') {
            slots.scopedSlots = {
                default: self.renderStatus
            }
        }
        // slots.scopedSlots.filter = self.renderCustomFilter
        const filterArr = self.filterable?.slice() || []
        return h({
            component: self.columnType,
            props: {
                formatter: self.bluekingTableFormatter,
                ...self.$props,
                ...self.filterable?.length > 0 ? { filters: filterArr } : {}
            },
            ...slots
        })
    }
}
