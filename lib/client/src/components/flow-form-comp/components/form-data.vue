<template>
    <div class="form-data-manage">
        <div class="operate-btns" @click="handleFilterSwitchClick">
            <i class="bk-icon icon-funnel filter-switch-icon"></i>
        </div>
        <filters
            v-if="showFilter"
            :view-mode="viewMode"
            :filters="filters"
            :fields="fields"
            :system-fields="systemFields"
            @update="handleUpdate('filters', $event)">
        </filters>
        <table-fields
            style="margin-top: 16px"
            :view-mode="viewMode"
            :table-config="tableConfig"
            :fields="fields"
            :system-fields="systemFields"
            @update="handleUpdate('tableConfig', $event)">
        </table-fields>
    </div>
</template>
<script>
    import { FORM_SYS_FIELD } from '../common/field.js'
    import Filters from './filters.vue'
    import TableFields from './table-fields.vue'

    export default {
        name: 'formData',
        components: {
            Filters,
            TableFields
        },
        props: {
            viewMode: Boolean,
            config: {
                type: Object,
                default: () => {
                    return {
                        filters: [],
                        tableConfig: []
                    }
                }
            },
            fields: {
                type: Array,
                default: () => []
            }
        },
        data () {
            return {
                filters: this.config.filters.slice(0),
                tableConfig: this.config.tableConfig.slice(0),
                systemFields: FORM_SYS_FIELD,
                showFilter: true
            }
        },
        beforeDestroy () {
            this.$store.commit('nocode/formSetting/setTableFields', {})
        },
        methods: {
            handleFilterSwitchClick () {
                if (this.viewMode) {
                    this.showFilter = !this.showFilter
                }
            },
            handleUpdate (type, val) {
                if (type === 'filters') {
                    this.filters = val
                    this.$store.commit('nocode/formSetting/setTableFields', { filters: val, tableConfig: this.tableConfig })
                } else {
                    this.tableConfig = val
                    this.$store.commit('nocode/formSetting/setTableFields', { filters: this.filters, tableConfig: val })
                }
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .form-data-manage {
        .operate-btns {
            display: flex;
            align-items: center;
            flex-direction: row-reverse;
            margin-bottom: 16px;
            height: 32px;
        }
        .filter-switch-icon {
            height: 32px;
            line-height: 32px;
            width: 32px;
            text-align: center;
            color: #979ba5;
            border: 1px solid #c4c6cc;
            border-radius: 2px;
            background: #ffffff;
            cursor: pointer;
            &:hover {
                color: #3a84ff;
            }
        }
    }
</style>
