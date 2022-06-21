<template>
    <div class="form-data-manage">
        <div class="operate-btns">
            <i class="bk-icon icon-funnel filter-switch-icon"></i>
        </div>
        <filters
            :filters="filters"
            :fields="fields"
            :system-fields="systemFields"
            @update="handleUpdate('filters', $event)">
        </filters>
        <table-fields
            style="margin-top: 16px"
            :table-config="tableConfig"
            :fields="fields"
            :system-fields="systemFields"
            @update="handleUpdate('tableConfig', $event)">
        </table-fields>
    </div>
</template>
<script>
    import { mapGetters } from 'vuex'
    import { messageError } from '@/common/bkmagic'
    import { FORM_SYS_FIELD } from '@/components/flow-form-comp/common/field.js'
    import Filters from './components/filters.vue'
    import TableFields from './components/table-fields.vue'
    export default {
        name: 'formData',
        components: {
            Filters,
            TableFields
        },
        data () {
            return {
                filters: [],
                tableConfig: [],
                formDetailLoading: false,
                formDetail: {},
                fields: [],
                systemFields: FORM_SYS_FIELD
            }
        },
        computed: {
            ...mapGetters('page', ['pageDetail'])
        },
        created () {
            // 页面创建时content默认为数组
            if (Array.isArray(this.pageDetail.content)) {
                this.filters = []
                this.tableConfig = []
            } else {
                const { filters, tableConfig } = this.pageDetail.content
                this.filters = filters
                this.tableConfig = tableConfig
            }
            this.getFormDetail()
        },
        beforeDestroy () {
            this.$store.commit('nocode/formSetting/setTableFields', {})
        },
        methods: {
            async getFormDetail () {
                try {
                    this.formDetailLoading = true
                    this.formDetail = await this.$store.dispatch('nocode/form/formDetail', { formId: this.pageDetail.formId })
                    this.fields = JSON.parse(this.formDetail.content)
                } catch (e) {
                    messageError(e.message || e)
                } finally {
                    this.formDetailLoading = false
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
        }
    }
</style>
