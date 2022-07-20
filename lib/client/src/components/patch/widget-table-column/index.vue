<template>
    <component
        :is="type"
        :formatter="bkTableFormatter"
        v-bind="getProps()"
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

        methods: {
            getProps () {
                const props = {
                    ...this.item
                }
                // 排序
                if (this.item.filterable) {
                    props.filters = this
                        .$parent
                        .data
                        .reduce((acc, cur) => {
                            const val = cur[props.prop]
                            const index = acc.findIndex(x => x.value === val)
                            if (index <= -1) {
                                acc.push({
                                    text: val,
                                    value: val
                                })
                            }
                            return acc
                        }, [])
                    props.filterMethod = this.filterMethod
                    props.filterMultiple = true
                }
                return props
            },

            bkTableFormatter (row, column, cellValue, index) {
                if (typeof cellValue === 'object') {
                    return JSON.stringify(cellValue)
                } else if (['createTime', 'updateTime'].includes(column.property)) {
                    return cellValue ? dayjs(cellValue).format('YYYY-MM-DD HH:mm:ss') : '--'
                } else {
                    return cellValue
                }
            },

            filterMethod (value, row, column) {
                const property = column.property
                return row[property] === value
            }
        }
    }
</script>
