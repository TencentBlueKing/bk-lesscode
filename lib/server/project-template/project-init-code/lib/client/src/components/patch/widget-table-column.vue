<template>
    <component
        :is="type"
        :label="item.label"
        :prop="item.prop"
        :sortable="item.sortable"
        :type="item.type"
        :width="item.width"
        :formatter="bkTableFormatter"
    />
</template>

<script>
    import dayjs from 'dayjs'

    export default {
        props: {
            type: String,
            item: Object
        },

        methods: {
            bkTableFormatter (row, column, cellValue, index) {
                if (typeof cellValue === 'object') {
                    return JSON.stringify(cellValue)
                } else if (['createTime', 'updateTime'].includes(column.property)) {
                    return cellValue ? dayjs(cellValue).format('YYYY-MM-DD HH:mm:ss') : '--'
                } else {
                    return cellValue
                }
            }
        }
    }
</script>
