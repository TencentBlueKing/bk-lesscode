import dayjs from 'dayjs'
import {
    h,
    resolveComponent
} from 'vue'

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
        index: Number,
        field: String,
        status: Array
    },

    data () {
        return {
            filterText: ''
        }
    },

    methods: {
        bkTableFormatter (row, column, cellValue, index) {
            if (typeof cellValue === 'object') {
                return cellValue ? JSON.stringify(cellValue) : '--'
            } else if (/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/.test(cellValue)) {
                return cellValue ? dayjs(cellValue).format('YYYY-MM-DD HH:mm:ss') : '--'
            } else {
                return cellValue
            }
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
                                src: `/static/images/icon/${show.status}.svg`,
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
                const rowValue = props?.row?.[when.field]
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

    render () {
        const self = this

        const slots = {}

        if (self.status?.length > 0 && self.$props.type === 'status') {
            slots.default = (props) => self.renderStatus(props, h)
        }

        return h(
            resolveComponent(self.columnType),
            {
                formatter: self.bkTableFormatter,
                ...self.$props,
                type: self.type || 'action'
            },
            slots
        )
    }
}
