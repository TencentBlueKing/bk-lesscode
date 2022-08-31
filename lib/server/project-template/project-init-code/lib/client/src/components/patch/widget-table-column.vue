<template>
    <component
        :is="type"
        :formatter="bkTableFormatter"
        :render-header="renderHeader"
        v-bind="item"
    />
</template>

<script>
    import dayjs from 'dayjs'

    export default {
        name: 'widget-table-column',

        props: {
            type: String,
            item: Object
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
                        this.item.filterable
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
                this.$parent.$parent.handleFilter({
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
            }
        }
    }
</script>
