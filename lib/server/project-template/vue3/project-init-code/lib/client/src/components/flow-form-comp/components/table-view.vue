<template>
    <bk-dialog
        :title="$t('查看详情')"
        header-position="left"
        :mask-close="true"
        :auto-close="false"
        :close-icon="true"
        :render-directive="'if'"
        width="960"
        :value="show"
        @confirm="$emit('update:show', false)"
        @cancel="$emit('update:show', false)">
        <custom-table class="table-view" :value="value" :field="field" :view-mode="true" need-pagination></custom-table>
    </bk-dialog>
</template>

<script>
    import customTable from '../form/fields/table.vue'
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

<style lang="postcss" scoped>
@import '@/css/mixins/scroller.css';
.table-view{
  max-height: 565px;
  overflow: auto ;
  @mixin scroller;
}
</style>
