<template>
    <div class="table-fields-wrapper">
        <bk-table
            v-bkloading="{ isLoading: tableDataLoading }"
            ref="fieldsTable"
            header-row-class-name="custom-table-header"
            :pagination="pagination"
            :data="tableData"
            :outer-border="!tableData.length > 0"
            @page-change="handlePageChange"
            @page-limit-change="handlePageLimitChange">
            <bk-table-column
                v-for="field in colFields"
                show-overflow-tooltip
                :key="field.key"
                :label="field.name"
                :prop="field.key">
                <template slot-scope="{ row }">
                    <table-cell-value :field="field" :value="row" @viewDetail="handleViewDetail"></table-cell-value>
                </template>
            </bk-table-column>
            <bk-table-column label="操作" :max-width="80">
                <template slot-scope="{ row }">
                    <bk-button theme="primary" :text="true" @click="handleViewDetail(row.id)">详情</bk-button>
                </template>
            </bk-table-column>
            <bk-table-column ref="settingCol" type="setting">
                <div class="table-setting-wrapper">
                    <h2 class="title">表格设置</h2>
                    <div class="field-content-wrapper">
                        <p class="field-title">系统字段</p>
                        <bk-checkbox-group v-model="selectedSys">
                            <bk-checkbox
                                v-for="item in systemFields"
                                :value="item.key"
                                :key="item.key">
                                {{ item.name }}
                            </bk-checkbox>
                        </bk-checkbox-group>
                        <p class="field-title" style="margin-top: 6px;">自定义字段</p>
                        <bk-checkbox-group v-model="selectedCustom">
                            <bk-checkbox
                                v-for="item in fields"
                                :value="item.key"
                                :key="item.key">
                                {{ item.name }}
                            </bk-checkbox>
                        </bk-checkbox-group>
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
    </div>
</template>
<script>
    import TableCellValue from './table-cell-value.vue'
    import TableCellDetail from './table-cell-detail.vue'
    import { isValEmpty } from '@/common/util'

    export default {
        name: 'TableFields',
        components: {
            TableCellValue,
            TableCellDetail
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
            filtersData: {
                type: Object,
                default: () => ({})
            }
        },
        data () {
            return {
                cols: this.tableConfig.slice(),
                selectedSys: [],
                selectedCustom: [],
                tableData: [],
                tableDataLoading: false,
                cellDetailId: '',
                pagination: {
                    current: 1,
                    count: 0,
                    limit: 10,
                    'show-limit': true
                }
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
                    const selectedSys = []
                    const selectedCustom = []
                    this.tableConfig.forEach(key => {
                        if (this.systemFields.find(field => field.key === key)) {
                            selectedSys.push(key)
                        } else if (val.find(field => field.key === key)) {
                            selectedCustom.push(key)
                        }
                    })
                    this.selectedSys = selectedSys
                    this.selectedCustom = selectedCustom
                },
                immediate: true
            },
            tableConfig (val) {
                this.cols = val.slice()
            },
            filtersData () {
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
            handleViewDetail (id) {
                this.cellDetailId = id
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
            handleSelectConfirm () {
                this.cols = [...this.selectedSys, ...this.selectedCustom]
                this.getTableData()
            },
            handleSelectCancel () {
                console.log(this.$refs.fieldsTable)
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
        padding: 24px;
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

</style>

<style lang="postcss">
.custom-table-header {
  th {
    background: #F0F1F5 ;

  }
}
</style>
