<template>
    <bk-dialog
        title="查看详情"
        header-position="left"
        :mask-close="true"
        :auto-close="false"
        :close-icon="true"
        :render-directive="'if'"
        width="960"
        :value="show"
        @confirm="$emit('update:show', false)"
        @cancel="$emit('update:show', false)">
        <custom-table :value="value" :field="field" :view-mode="true"></custom-table>
    </bk-dialog>
</template>

<script>
    import customTable from '../form/fields/table'
    export default {
        name: 'TableView',
        components: {
            customTable
        },
        props: {
            show: {
                type: Boolean,
                default: false
            },
            field: {
                type: Object,
                default: () => ({})
            },
            value: {
                type: Array,
                default: () => ([])
            }
        }
    }
</script>

<style scoped>

</style>
