<template>
    <div class="form-data-manage">
        <div class="operate-btns-area">
            <custom-btns-edit></custom-btns-edit>
            <i class="bk-icon icon-funnel filter-switch-icon" @click="showFilters = !showFilters"></i>
        </div>
        <filters
            v-show="showFilters"
            :filters="filters"
            :fields="fields"
            :table-config="tableConfig"
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
    import { mapState, mapGetters } from 'vuex'
    import { messageError } from '@/common/bkmagic'
    import { cloneDeep } from 'lodash'
    import { FORM_SYS_FIELD } from '@/components/flow-form-comp/common/field.js'
    import { NO_VIEWED_FIELD } from '@/components/flow-form-comp/form/constants/forms.js'
    import CustomBtnsEdit from './components/custom-btns-edit.vue'
    import Filters from './components/filters.vue'
    import TableFields from './components/table-fields.vue'
    export default {
        name: 'formData',
        components: {
            CustomBtnsEdit,
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
                systemFields: FORM_SYS_FIELD,
                showFilters: true
            }
        },
        computed: {
            ...mapGetters('page', ['pageDetail']),
            ...mapState('nocode/dataManage', ['pageConfig'])
        },
        async created () {
            await this.getFormDetail()
            this.initConfigData()
        },
        beforeDestroy () {
            this.$store.commit('nocode/dataManage/resetPageConfig')
        },
        methods: {
            async getFormDetail () {
                try {
                    this.formDetailLoading = true
                    this.formDetail = await this.$store.dispatch('nocode/form/formDetail', { formId: this.pageDetail.formId })
                    this.fields = JSON.parse(this.formDetail.content).filter(field => !NO_VIEWED_FIELD.includes(field.type))
                } catch (e) {
                    messageError(e.message || e)
                } finally {
                    this.formDetailLoading = false
                }
            },
            initConfigData () {
                let filters = []
                let tableColsExclude = []
                if (Object.prototype.toString.call(this.pageDetail.content) === '[object Object]') {
                    filters = this.pageDetail.content.filters || []
                    tableColsExclude = this.pageDetail.content.tableColsExclude || []
                }
                this.filters = filters
                this.tableConfig = [...this.fields, ...this.systemFields].filter(item => !tableColsExclude.includes(item.key)).map(item => item.key)
                this.$store.commit('nocode/dataManage/setPageConfig', { filters, tableColsExclude })
            },
            handleUpdate (type, val) {
                const pageConfig = cloneDeep(this.pageConfig)
                if (type === 'filters') {
                    this.filters = val
                } else {
                    this.tableConfig = val
                    this.filters = this.filters.filter(item => this.tableConfig.includes(item))
                }
                pageConfig.filters = this.filters
                pageConfig.tableColsExclude = [...this.fields, ...this.systemFields].filter(item => !val.includes(item.key)).map(item => item.key)
                this.$store.commit('nocode/dataManage/setPageConfig', pageConfig)
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .form-data-manage {
      height: calc(100vh - 236px);
        .operate-btns-area {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin: 16px 0;
            .bk-button {
                cursor: inherit;
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
    }
    .filters-leave-active,
    .filters-enter-active {
      transition: all .01s ease;
    }
    .filters-leave-active,
    .filters-enter{
      height: 0 !important;
    }

    .filters-leave,
    .filters-enter-active {
      max-height: 500px;
    }
</style>
