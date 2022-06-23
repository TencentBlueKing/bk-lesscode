<template>
    <div class="form-data-manage" v-bkloading="{ isLoading: formDetailLoading }">
        <div class="operate-btns" @click="showFilter = !showFilter">
            <i class="bk-icon icon-funnel filter-switch-icon"></i>
        </div>
        <filters
            v-if="filters.length > 0 && showFilter"
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
    import { messageError } from '@/common/bkmagic'
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
            formIds: Number,
            config: {
                type: Object,
                default: () => {
                    return {
                        filters: [],
                        tableConfig: []
                    }
                }
            }
        },
        data () {
            return {
                filters: this.config.filters.slice(0),
                tableConfig: this.config.tableConfig.slice(0),
                fields: [],
                formDetailLoading: true,
                systemFields: FORM_SYS_FIELD,
                showFilter: true
            }
        },
        created () {
            this.getFormDetail()
        },
        methods: {
            async getFormDetail () {
                try {
                    this.formDetailLoading = true
                    const formDetail = await this.$http.get('/nocode-form/detail', { params: { formId: this.formIds } })
                    this.fields = JSON.parse(formDetail.data.content)
                } catch (e) {
                    messageError(e.message || e)
                } finally {
                    this.formDetailLoading = false
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
