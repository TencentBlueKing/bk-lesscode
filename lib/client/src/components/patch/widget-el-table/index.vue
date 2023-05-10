<template>
    <section>
        <el-table
            v-bkloading="{ isLoading }"
            v-bind="$props"
            v-on="$listeners"
            :pagination="renderPagination"
            :data="renderData"
            @page-change="handlePageChange"
            @page-limit-change="handleLimitChange"
        >
            <slot></slot>
            <el-table-column
                v-if="tableName"
                :label="$t('操作')"
                width="120"
            >
                <template slot-scope="{ row }">
                    <bk-button
                        class="mr5"
                        title="primary"
                        :text="true"
                        @click="handleEdit(row)"
                    >
                        {{ $t('编辑') }} </bk-button>
                    <bk-button
                        title="primary"
                        :text="true"
                        @click="handleDelete(row)"
                    >
                        {{ $t('删除') }} </bk-button>
                </template>
            </el-table-column>
        </el-table>

        <bk-sideslider
            :title="$t('编辑数据')"
            :is-show.sync="editData.show"
            :width="740"
            :transfer="true"
        >
            <div slot="content">
                <bk-form
                    class="edit-data-form"
                    ref="formRef"
                    form-type="vertical"
                    :model="editData.form"
                    :label-width="120"
                    v-bkloading="{ isLoading: editData.isLoading }"
                >
                    <bk-form-item
                        v-for="column in editData.columns.filter(column => column.propertyName !== 'id')"
                        :key="column.propertyName"
                        :label="column.propertyName"
                        :required="!column.isNullable"
                        :property="column.propertyName"
                        :rules="getColumnRule(column)"
                        error-display-type="normal"
                    >
                        <bk-date-picker
                            v-if="column.type === 'datetime'"
                            type="datetime"
                            style="width:100%"
                            :clearable="false"
                            :value="editData.form[column.propertyName]"
                            @change="changeDateTime(column.propertyName, ...arguments)"
                        ></bk-date-picker>
                        <bk-input
                            v-else-if="column.type === 'decimal'"
                            v-model="editData.form[column.propertyName]"
                            :precision="+column.scale"
                            type="number"
                            :placeholder="$t('请输入数字')"
                        ></bk-input>
                        <bk-input
                            v-else-if="column.type === 'int'"
                            v-model="editData.form[column.propertyName]"
                            type="number"
                            :placeholder="$t('请输入数字')"
                        ></bk-input>
                        <bk-date-picker
                            v-else-if="column.type === 'date'"
                            style="width:100%"
                            :clearable="false"
                            :value="editData.form[column.propertyName]"
                            @change="changeDate(column.propertyName, ...arguments)"
                        ></bk-date-picker>
                        <edit-object
                            v-else-if="column.type === 'json'"
                            :value.sync="editData.form[column.propertyName]"
                        >
                        </edit-object>
                        <bk-input
                            v-else
                            v-model="editData.form[column.propertyName]"
                            :placeholder="$t('请输入字符串')"
                        ></bk-input>
                    </bk-form-item>
                    <bk-form-item>
                        <bk-button
                            theme="primary"
                            class="mr5"
                            :loading="editData.isSaving"
                            @click="handleSubmitData"
                        >{{ $t('提交') }}</bk-button>
                        <bk-button
                            :disabled="editData.isSaving"
                            @click="handleCloseForm"
                        >{{ $t('取消') }}</bk-button>
                    </bk-form-item>
                </bk-form>
            </div>
        </bk-sideslider>

        <bk-dialog
            :title="$t('确定删除')"
            ext-cls=""
            :loading="deleteData.isloading"
            :mask-close="false"
            v-model="deleteData.show"
        >
            {{ $t('确定删除【id：{0}】', [deleteData.form.id]) }} <div class="dialog-footer" slot="footer">
                <bk-button
                    theme="danger"
                    :loading="deleteData.isloading"
                    @click="handleConfirmDelete">{{ $t('确定') }}</bk-button>
                <bk-button @click="handleCloseDialog" :disabled="deleteData.isloading">{{ $t('取消') }}</bk-button>
            </div>
        </bk-dialog>
    </section>
</template>

<script>
    import dayjs from 'dayjs'
    import editObject from '@/components/edit-object.vue'
    import DayJSUtcPlugin from 'dayjs/plugin/utc'
    dayjs.extend(DayJSUtcPlugin)

    export default {
        name: 'widget-el-table',

        components: {
            editObject
        },

        props: {
            data: {
                type: Array,
                default: function () {
                    return []
                }
            },
            size: {
                type: String,
                default: 'small',
                validator (val) {
                    return ['small', 'medium', 'large'].includes(val)
                }
            },
            height: [String, Number],
            maxHeight: [String, Number],
            fit: {
                type: Boolean,
                default: true
            },
            rowAutoHeight: {
                type: Boolean,
                default: false
            },
            stripe: Boolean,
            border: Boolean,
            outerBorder: {
                type: Boolean,
                default: true
            },
            rowBorder: {
                type: Boolean,
                default: true
            },
            colBorder: Boolean,
            rowKey: [String, Function],
            context: {
                type: Object,
                default: () => ({})
            },
            showHeader: {
                type: Boolean,
                default: true
            },
            showSummary: Boolean,
            sumText: String,
            summaryMethod: Function,
            rowClassName: [String, Function],
            rowStyle: [Object, Function],
            cellClassName: [String, Function],
            cellStyle: [Object, Function],
            headerBorder: {
                type: Boolean,
                default: false
            },
            headerRowClassName: [String, Function],
            headerRowStyle: [Object, Function],
            headerCellClassName: [String, Function],
            headerCellStyle: [Object, Function],
            highlightCurrentRow: Boolean,
            currentRowKey: [String, Number],
            emptyText: String,
            emptyBlockClassName: String,
            expandRowKeys: Array,
            defaultExpandAll: Boolean,
            defaultSort: Object,
            spanMethod: Function,
            selectOnIndeterminate: {
                type: Boolean,
                default: true
            },
            pagination: Object,
            showPaginationInfo: {
                type: Boolean,
                default: true
            },
            autoScrollToTop: {
                type: Boolean,
                default: false
            },
            extCls: {
                type: String,
                default: ''
            },
            setting: {
                type: Object,
                default: () => ({
                    columns: []
                }),
                validator (setting) {
                    return Array.isArray(setting.columns)
                }
            },
            cellAttributes: [Function, Object],
            headerCellAttributes: [Function, Object],
            virtualRender: {
                type: [Object, Boolean],
                default: false
            },
            scrollLoading: {
                type: Object,
                default: () => ({ isLoading: false })
            },
            popoverOptions: {
                type: Object,
                default: () => ({})
            },
            tableName: String,
            paginationType: String
        },

        data () {
            return {
                editData: {
                    isLoading: false,
                    isSaving: false,
                    show: false,
                    columns: [],
                    form: {}
                },
                deleteData: {
                    show: false,
                    isloading: false,
                    form: {}
                },
                renderPagination: {
                    'show-total-count': true,
                    'count': 3,
                    'show-limit': true,
                    'limit': 10,
                    'current': 1
                },
                renderData: [],
                isLoading: false
            }
        },

        watch: {
            pagination: {
                handler (pagination) {
                    this.renderPagination = pagination
                    this.calcCount()
                },
                immediate: true,
                deep: true
            },
            data: {
                handler () {
                    this.calcRenderData()
                    this.calcCount()
                },
                immediate: true,
                deep: true
            }
        },

        methods: {
            handleEdit (row) {
                Object.assign(this.editData.form, row)
                this.editData.show = true
                this.editData.isLoading = true
                this
                    .$http
                    .get(`/data-source/user/tableName/${this.tableName}/columns`)
                    .then((res) => {
                        this.editData.columns = res.data || []
                        this.editData.columns.forEach((column) => {
                            // 转换为本地时区
                            if (column.type === 'datetime') {
                                this.editData.form[column.propertyName] = dayjs(this.editData.form[column.propertyName])
                                    .format('YYYY-MM-DD HH:mm:ss')
                            }
                            // 转换为字符串
                            if (column.type === 'json') {
                                this.editData.form[column.propertyName] = JSON.stringify(this.editData.form[column.propertyName])
                            }
                        })
                    })
                    .finally(() => {
                        this.editData.isLoading = false
                    })
            },

            handleDelete (row) {
                this.deleteData.show = true
                this.deleteData.form = row
            },

            handleConfirmDelete () {
                this.deleteData.isloading = true
                return this
                    .$http
                    .delete(`/data-source/user/tableName/${this.tableName}?id=${this.deleteData.form.id}`)
                    .then(() => {
                        this.getTableDataByPage()
                        this.handleCloseDialog()
                    })
            },

            handleCloseDialog () {
                this.deleteData.show = false
                this.deleteData.form = {}
                this.deleteData.isloading = false
            },

            handleSubmitData () {
                this
                    .$refs
                    .formRef
                    .validate()
                    .then(() => {
                        // 入库前根据浏览器时间转换时区
                        const dateTimeColumns = this.editData.columns?.filter((column) => (column.type === 'datetime'))
                        dateTimeColumns.forEach((dateTimeColumn) => {
                            this.editData.form[dateTimeColumn.propertyName] = dayjs(this.editData.form[dateTimeColumn.propertyName])
                                .utcOffset(0)
                                .format('YYYY-MM-DD HH:mm:ss')
                        })
                        this.editData.isSaving = true
                        return this
                            .$http
                            .put(`/data-source/user/tableName/${this.tableName}`, this.editData.form)
                            .then(() => {
                                this.getTableDataByPage()
                                this.handleCloseForm()
                            })
                            .finally(() => {
                                this.editData.isSaving = false
                            })
                    })
                    .catch((validator) => {
                        this.messageError(validator.content || validator)
                    })
            },

            handleCloseForm () {
                this.editData.show = false
                this.editData.form = {}
                this.editData.isLoading = false
                this.editData.columns = []
            },

            getColumnRule (column) {
                if (!column.isNullable) {
                    return [{
                        required: true,
                        message: this.$t('{0} 是必填项', [column.propertyName]),
                        trigger: 'blur'
                    }]
                }
            },

            getTableDataByPage () {
                this.isLoading = true
                this
                    .$http
                    .get(
                        `/data-source/user/tableName/${this.tableName}`,
                        {
                            params: {
                                page: this.renderPagination.current,
                                pageSize: this.renderPagination.limit
                            }
                        }
                    )
                    .then(({ data }) => {
                        this.renderData = data.list || []
                        this.renderPagination.count = data.count || 0
                    })
                    .finally(() => {
                        this.isLoading = false
                    })
            },

            handlePageChange (page) {
                this.renderPagination.current = page
                if (this.paginationType === 'local') {
                    this.calcRenderData()
                } else if (this.paginationType === 'remote' && this.tableName) {
                    this.getTableDataByPage()
                } else {
                    this.$emit('page-change', page)
                }
            },

            handleLimitChange (limit) {
                if (this.paginationType === 'local') {
                    this.renderPagination.limit = limit
                    this.calcRenderData()
                } else if (this.paginationType === 'remote' && this.tableName) {
                    this.getTableDataByPage()
                } else {
                    this.$emit('page-limit-change', limit)
                }
            },

            calcRenderData () {
                this.renderData = this.renderPagination
                    ? this.data.slice(
                        (this.renderPagination.current - 1) * this.renderPagination.limit,
                        this.renderPagination.current * this.renderPagination.limit
                    )
                    : this.data
            },

            calcCount () {
                if (this.tableName && this.renderPagination) {
                    this.renderPagination.count = this.data.length
                }
            },

            timeFormatter (val) {
                return val ? dayjs(val).format('YYYY-MM-DD HH:mm:ss') : ''
            },

            dateFormatter (val) {
                return val ? dayjs(val).format('YYYY-MM-DD') : ''
            },

            changeDateTime (propName, date) {
                this.editData.form[propName] = this.timeFormatter(date)
            },

            changeDate (propName, date) {
                this.editData.form[propName] = this.dateFormatter(date)
            }
        }
    }
</script>

<style lang="postcss" scoped>
    .edit-data-form {
        padding: 0 20px 20px;
        height: calc(100vh - 70px);
        .bk-form-control {
            width: 100%;
        }
    }
</style>
