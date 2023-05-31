<template>
    <div class="form-data-manage">
        <template v-if="!formDetailLoading">
            <div class="opereate-btns">
                <custom-buttons
                    :table-name="tableName"
                    :fields="fields"
                    :system-fields="systemFields"
                    :table-config="tableConfig"
                    :buttons="config.buttons || []">
                </custom-buttons>
                <i
                    v-if="filters.length > 0"
                    class="bk-icon icon-funnel filter-switch-icon"
                    @click="showFilter = !showFilter">
                </i>
            </div>
            <filters
                v-show="showFilter && filters.length > 0"
                :filters="filters"
                :fields="fields"
                :system-fields="systemFields"
                :value="filtersData"
                @change="handleFilterDataChange">
            </filters>
            <table-fields
                v-if="!formDetailLoading"
                style="margin-top: 16px"
                :form-id="formIds"
                :table-name="tableName"
                :table-config="tableConfig"
                :table-actions="config.tableActions || []"
                :fields="fields"
                :system-fields="systemFields"
                :filters-data="filtersData">
            </table-fields>
        </template>
    </div>
</template>
<script>
    import { formMap } from 'shared/form'
    import { FORM_SYS_FIELD } from '../common/field.js'
    import queryStrSearchMixin from '../common/query-str-search-mixin'
    import { NO_VIEWED_FIELD } from '../form/constants/forms.js'
    import CustomButtons from './custom-buttons.vue'
    import Filters from './filters.vue'
    import TableFields from './table-fields.vue'

    export default {
        name: 'formData',
        components: {
            CustomButtons,
            Filters,
            TableFields
        },
        mixins: [queryStrSearchMixin],
        props: {
            formIds: Number,
            viewType: String,
            config: {
                type: Object,
                default: () => {
                    return {
                        filters: [],
                        tableConfig: [],
                        buttons: [],
                        tableActions: []
                    }
                }
            }
        },
        data () {
            return {
                showFilter: true,
                filters: this.config.filters?.slice(0) || [],
                tableConfig: this.config.tableConfig?.slice(0) || [],
                fields: [],
                formDetailLoading: true,
                systemFields: FORM_SYS_FIELD,
                tableName: '',
                filtersData: {}
            }
        },
        async created () {
            await this.getFormDetail()
            this.setInitFilterData()
        },
        methods: {
            async getFormDetail () {
                try {
                    this.formDetailLoading = true
                    let formDetail = {}
                    if (this.viewType === 'preview') {
                        const res = await this.$http.get('/nocode-form/detail', { params: { formId: this.formIds } })
                        const { tableName, content } = res.data
                        formDetail = {
                            tableName,
                            content: JSON.parse(content)
                        }
                    } else {
                        formDetail = formMap[this.formIds]
                    }
                    const { content = [], tableName } = formDetail
                    this.fields = content.filter(field => !NO_VIEWED_FIELD.includes(field.type))
                    this.tableName = tableName
                } catch (e) {
                    console.error(e.message || e)
                } finally {
                    this.formDetailLoading = false
                }
            },
            handleFilterDataChange (val) {
                this.filtersData = val
                this.updateQueryString()
            }
        }
    }
</script>
<style lang="postcss" scoped>
.form-data-manage {
    .opereate-btns {
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
</style>
