<template>
    <div class="table-fields-wrapper">
        <bk-table
            v-bkloading="{ isLoading: tableDataLoading }"
            ref="fieldsTable"
            class="hairless-table"
            :header-border="false"
            :outer-border="false"
            :header-cell-style="{ background: '#f0f1f5' }"
            :pagination="pagination"
            :data="tableData"
            @page-change="handlePageChange"
            @page-limit-change="handlePageLimitChange">
            <bk-table-column
                v-for="field in colFields"
                show-overflow-tooltip
                :key="field.key"
                :label="field.name"
                :width="getColumn(field)"
                :prop="field.key">
                <template slot-scope="{ row }">
                    <table-cell-value
                        :field="field"
                        :value="row"
                        @viewTable="handleViewTable"
                        @viewRichText="handleViewRichText">
                    </table-cell-value>
                </template>
            </bk-table-column>
            <bk-table-column v-if="tableActions.length > 0" label="操作">
                <template slot-scope="{ row }">
                    <table-cell-actions :buttons="tableActions" @click="handleOperate($event, row)"></table-cell-actions>
                <!-- <bk-button theme="primary" :text="true" @click="handleViewDetail(row.id)">详情</bk-button> -->
                </template>
            </bk-table-column>
            <bk-table-column type="setting">
                <bk-table-setting-content ref="settingCol" v-show="false">
                </bk-table-setting-content>
                <div class="table-setting-wrapper">
                    <h2 class="title">表格设置</h2>
                    <div class="field-content-wrapper">
                        <template v-if="systemFields.length > 0">
                            <p class="field-title">系统字段</p>
                            <bk-checkbox-group :value="selectedFieldKeys">
                                <bk-checkbox
                                    v-for="item in systemFields"
                                    :value="item.key"
                                    :key="item.key"
                                    @change="handleSelectField($event, item.key)">
                                    {{ item.name }}
                                </bk-checkbox>
                            </bk-checkbox-group>
                        </template>
                        <p class="field-title" style="margin-top: 6px;">自定义字段</p>
                        <bk-checkbox-group v-if="fields.length > 0" :value="selectedFieldKeys">
                            <bk-checkbox
                                v-for="item in fields"
                                :value="item.key"
                                :key="item.key"
                                @change="handleSelectField($event, item.key)">
                                {{ item.name }}
                            </bk-checkbox>
                        </bk-checkbox-group>
                        <bk-exception v-else type="empty" scene="part">暂无可展示字段，请在节点表单中配置</bk-exception>
                    </div>
                    <div class="btn-area">
                        <bk-button :theme="'primary'" @click="handleSelectConfirm">确定</bk-button>
                        <bk-button :theme="'default'" @click="handleSelectCancel">取消</bk-button>
                    </div>
                </div>
            </bk-table-column>
        </bk-table>
        <table-cell-detail
            v-if="cellDetailId"
            :table-name="tableName"
            :id.sync="cellDetailId"
            :fields="colFields">
        </table-cell-detail>
        <bk-sideslider
            title="富文本"
            :width="640"
            :is-show.sync="showRichText"
            :quick-close="true"
            :show-mask="true"
            v-if="richText"
            @before-close="richText = ''">
            <div slot="content">
                <viewer :initial-value="richText"></viewer>
            </div>
        </bk-sideslider>
        <table-view :show.sync="showTableDetail" :value="tableValue" :field="tableField">
        </table-view>
    </div>
</template>
<script>
    import TableCellValue from './table-cell-value.vue'
    import TableCellDetail from './table-cell-detail.vue'
    import TableCellActions from './table-cell-actions.vue'
    import { isValEmpty } from '@/common/util'
    import TableView from './table-view'
    import { Viewer } from '@toast-ui/vue-editor'

    export default {
        name: 'TableFields',
        components: {
            TableCellValue,
            TableCellDetail,
            TableCellActions,
            Viewer,
            TableView
        },
        props: {
            tableName: String,
            fields: {
                type: Array,
                default: () => []
            },
            systemFields: {
                type: Array,
                default: () => []
            },
            tableConfig: {
                type: Array,
                default: () => []
            },
            tableActions: {
                type: Array,
                default: () => []
            },
            filtersData: {
                type: Object,
                default: () => ({})
            }
        },
        data () {
            return {
                cols: this.tableConfig.slice(),
                selectedFieldKeys: [],
                tableData: [],
                tableDataLoading: false,
                cellDetailId: '',
                pagination: {
                    current: 1,
                    count: 0,
                    limit: 10,
                    'show-limit': true
                },
                showRichText: false,
                showTableDetail: false,
                richText: '',
                tableField: {},
                tableValue: []
            }
        },
        computed: {
            colFields () {
                const list = []
                this.cols.forEach(key => {
                    let field = this.systemFields.find(item => item.key === key)
                    if (!field) {
                        field = this.fields.find(item => item.key === key)
                    }
                    if (field) {
                        list.push(field)
                    }
                })
                return list
            }
        },
        watch: {
            fields: {
                handler (val) {
                    const selectedFieldKeys = []
                    this.tableConfig.forEach(key => {
                        if (
                            this.systemFields.find(field => field.key === key)
                            || val.find(field => field.key === key)
                        ) {
                            selectedFieldKeys.push(key)
                        }
                    })
                    this.selectedFieldKeys = selectedFieldKeys
                },
                immediate: true
            },
            tableConfig (val) {
                this.cols = val.slice()
                this.pagination.current = 1
                this.pagination.count = 0
                this.getTableData()
            },
            filtersData () {
                this.pagination.current = 1
                this.pagination.count = 0
                this.getTableData()
            }
        },
        created () {
            this.getTableData()
        },
        methods: {
            async getTableData () {
                try {
                    this.tableDataLoading = true
                    const { current, limit } = this.pagination
                    const params = {
                        pageSize: limit,
                        page: current,
                        fields: [...this.cols, 'id'],
                        query: this.getQueryData()
                    }
                    const res = await this.$http.post(`/nocode/filterTableData/keys/tableName/${this.tableName}`, params)
                    this.tableData = res.data.list
                    this.pagination.count = res.data.count
                } catch (e) {
                    this.tableData = []
                    console.log(e.message || e)
                } finally {
                    this.tableDataLoading = false
                }
            },
            getQueryData () {
                const query = {}
                Object.keys(this.filtersData).forEach(key => {
                    if (!isValEmpty(this.filtersData[key])) {
                        query[key] = this.filtersData[key]
                    }
                })
                return query
            },
            getColumn (field) {
                const { type } = field
                if (['MULTISELECT', 'CHECKBOX'].includes(type)) {
                    return '170'
                } else if (['SELECT', 'RADIO', 'INPUTSELECT'].includes(type)) {
                    return '100'
                }
            },
            // 查看详情
            handleViewDetail (id) {
                this.cellDetailId = id
            },
            // 删除数据
            handleDelItem (id) {
                this.$bkInfo({
                    title: '确认删除该条数据？',
                    confirmLoading: true,
                    confirmFn: async () => {
                        try {
                            await this.$http.delete(`/data-source/user/tableName/${this.tableName}?id=${id}`)
                            this.$bkMessage({
                                message: '删除成功',
                                theme: 'success'
                            })
                            this.getTableData()
                            return true
                        } catch (e) {
                            console.warn(e)
                            return false
                        }
                    }
                })
            },
            handlePageChange (val) {
                this.pagination.current = val
                this.getTableData()
            },
            handlePageLimitChange (val) {
                this.pagination.current = 1
                this.pagination.limit = val
                this.getTableData()
            },
            handleSelectField (val, key) {
                if (val) {
                    this.selectedFieldKeys.push(key)
                } else {
                    this.selectedFieldKeys = this.selectedFieldKeys.filter(item => item !== key)
                }
            },
            handleSelectConfirm () {
                this.cols = [...this.selectedFieldKeys]
                this.getTableData()
                this.$refs.settingCol.handleCancel()
            },
            handleSelectCancel () {
                this.$refs.settingCol.handleCancel()
            },
            handleViewRichText (val) {
                this.richText = val
                this.showRichText = true
            },
            handleViewTable ({ field, value }) {
                this.tableField = field
                this.tableValue = value
                this.showTableDetail = true
            },
            handleOperate (button, data) {
                const { enable, name } = button.events.click
                if (!enable) {
                    return
                }
                if (name === 'rowDetail') {
                    this.handleViewDetail(data.id)
                } else if (name === 'rowDelete') {
                    this.handleDelItem(data.id)
                }
            }
        }
    }
</script>
<style lang="postcss" scoped>
>>> .bk-link-text {
    padding: 0;
    font-size: 12px;
    cursor: text;
}
>>> .bk-table:before{
    background-color: #F0F1F5
}

>>> .bk-table-column-setting{
    border-left: none;
}
.table-setting-wrapper {
    width: 422px;

    .title {
        padding: 0 24px;
        margin: 0;
        line-height: 32px;
        font-size: 16px;
        font-weight: 400;
        color: #313238;
    }

    .field-content-wrapper {
        padding: 10px 24px 24px;
        max-height: 500px;
        overflow: auto;
    }

    .field-title {
        margin-bottom: 9px;
        font-size: 14px;
        color: #313238;
    }

    .bk-form-checkbox {
        margin-right: 24px;
        margin-bottom: 10px;
    }

    .btn-area {
        padding: 0 24px;
        height: 50px;
        line-height: 50px;
        text-align: right;
        border-top: 1px solid #dcdee5;
        background: #fafbfd;

        .bk-button {
        margin-left: 4px;
        }
    }
}
.hairless-table {
    &:before {
        height: 0;
    }
}

</style>
