<template>
    <section>
        <bk-table
            v-bind="$props"
            :pagination="renderPagination"
            :data="renderData"
            @page-value-change="handlePageChange"
            @page-limit-change="handleLimitChange"
            @select="(...args) => $emit('select', ...args)"
            @select-all="(...args) => $emit('select-all', ...args)"
            @selection-change="(...args) => $emit('selection-change', ...args)"
            @cell-click="(...args) => $emit('cell-click', ...args)"
            @cell-dblclick="(...args) => $emit('cell-dblclick', ...args)"
            @row-click="(...args) => $emit('row-click', ...args)"
            @row-dblclick="(...args) => $emit('row-dblclick', ...args)"
            @column-pick="(...args) => $emit('column-pick', ...args)"
            @column-sort="(...args) => $emit('column-sort', ...args)"
            @column-filter="(...args) => $emit('column-filter', ...args)"
            @col-filter-save="(...args) => $emit('col-filter-save', ...args)"
            @row-expand="(...args) => $emit('row-expand', ...args)"
            @setting-change="(...args) => $emit('setting-change', ...args)"
            @click="(...args) => $emit('click', ...args)"
            @dblclick="(...args) => $emit('dblclick', ...args)"
        >
            <slot></slot>
            <bk-table-column
                v-if="showOperationColumn"
                label="操作"
                width="120"
            >
                <template #default="prop">
                    <bk-button
                        class="mr5"
                        theme="primary"
                        :text="true"
                        @click="handleEdit(prop?.row)"
                    >
                        编辑
                    </bk-button>
                    <bk-button
                        theme="primary"
                        :text="true"
                        @click="handleDelete(prop?.row)"
                    >
                        删除
                    </bk-button>
                </template>
            </bk-table-column>
        </bk-table>

        <bk-sideslider
            title="编辑数据"
            :is-show="editData.show"
            :width="740"
            :transfer="true"
            @update:is-show="editData.show = false"
        >
            <template #default>
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
                            placeholder="请输入数字"
                        ></bk-input>
                        <bk-input
                            v-else-if="column.type === 'int'"
                            v-model="editData.form[column.propertyName]"
                            type="number"
                            placeholder="请输入数字"
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
                            :value="editData.form[column.propertyName]"
                            @change="changeDate(column.propertyName, ...arguments)"
                        >
                        </edit-object>
                        <bk-input
                            v-else
                            v-model="editData.form[column.propertyName]"
                            placeholder="请输入字符串"
                        ></bk-input>
                    </bk-form-item>
                    <bk-form-item>
                        <bk-button
                            theme="primary"
                            class="mr5"
                            :loading="editData.isSaving"
                            @click="handleSubmitData"
                        >提交</bk-button>
                        <bk-button
                            :disabled="editData.isSaving"
                            @click="handleCloseForm"
                        >取消</bk-button>
                    </bk-form-item>
                </bk-form>
            </template>
        </bk-sideslider>

        <bk-dialog
            title="确定删除"
            ext-cls=""
            :loading="deleteData.isloading"
            :mask-close="false"
            :is-show="deleteData.show"
            @closed="() => deleteData.show = false"
        >
            确定删除【id：{{ deleteData.form.id }}】？
            <template #footer>
                <div class="dialog-footer">
                    <bk-button
                        class="mr5"
                        theme="danger"
                        :loading="deleteData.isloading"
                        @click="handleConfirmDelete">确定</bk-button>
                    <bk-button @click="handleCloseDialog" :disabled="deleteData.isloading">取消</bk-button>
                </div>
            </template>
        </bk-dialog>
    </section>
</template>

<script>
    import dayjs from 'dayjs'
    import editObject from '@/components/edit-object'
    import DayJSUtcPlugin from 'dayjs/plugin/utc'
    dayjs.extend(DayJSUtcPlugin)

    const events = [
        'select',
        'select-all',
        'selection-change',
        'cell-click',
        'cell-dblclick',
        'row-click',
        'row-dblclick',
        'column-pick',
        'column-sort',
        'column-filter',
        'col-filter-save',
        'row-expand',
        'page-limit-change',
        'page-value-change',
        'setting-change',
        'scroll-bottom',
        'click',
        'dblclick'
    ]

    export default {
        name: 'widget-bk-table',

        emits: events,

        components: {
            editObject
        },

        props: {
            data: {
                type: Array
            },
            columnPick: {
                type: String
            },
            pagination: {
                type: Object
            },
            height: {
                type: String
            },
            minHeight: {
                type: String
            },
            maxHeight: {
                type: String
            },
            virtualEnabled: {
                type: Boolean
            },
            border: {
                type: Array
            },
            outerBorder: {
                type: Boolean
            },
            settings: {
                type: Boolean
            },
            rowClass: {
                type: String
            },
            rowStyle: {
                type: String
            },
            cellClass: {
                type: String
            },
            scrollLoading: {
                type: Boolean
            },
            reserveExpand: {
                type: Boolean
            },
            selectionKey: {
                type: String
            },
            rowKey: {
                type: String
            },
            showOverflowTooltip: {
                type: Boolean
            },
            rowHover: {
                type: String
            },
            isRowSelectEnable: {
                type: Boolean
            },
            resizerWay: {
                type: String
            },
            observerResize: {
                type: Boolean
            },
            showHead: {
                type: Boolean
            },
            emptyText: {
                type: String
            },
            tableName: String,
            paginationType: String,
            dataValueType: String,
            bkDataSourceType: String,
            showOperationColumn: Boolean
        },

        data () {
            const self = this
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
                isLoading: false,
                queryObject: {},
                sortObject: {},
                listeners: events.map(event => (...args) => self.$emit(event, ...args))
            }
        },

        watch: {
            pagination: {
                handler (pagination, oldPagination) {
                    try {
                        if (pagination === undefined) {
                            this.renderPagination = undefined
                        } else if (JSON.stringify(pagination) !== JSON.stringify(oldPagination)) {
                            this.renderPagination = JSON.parse(JSON.stringify(pagination))
                        }
                    } catch (error) {
                        this.renderPagination = undefined
                    }
                },
                immediate: true,
                deep: true
            },
            // fix vue same old value
            'pagination.count': {
                handler (count) {
                    if (this.renderPagination) {
                        this.renderPagination.count = count
                    }
                }
            },
            // fix vue same old value
            'pagination.current': {
                handler (current) {
                    if (this.renderPagination) {
                        this.renderPagination.current = current
                    }
                }
            },
            // fix vue same old value
            'pagination.limit': {
                handler (limit) {
                    if (this.renderPagination) {
                        this.renderPagination.limit = limit
                    }
                }
            },
            data: {
                handler () {
                    if (['none', 'local'].includes(this.paginationType)
                        || !this.pagination
                        || (this.paginationType === 'remote'
                            && this.dataValueType === 'table-data-source')) {
                        this.calcRenderData()
                    } else {
                        this.renderData = this.data
                    }
                    if (this.paginationType === 'remote'
                        && ['array', 'table-data-source'].includes(this.dataValueType)
                        && this.renderPagination) {
                        this.renderPagination.count = this.data.length
                    }
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
                        this.getTableDataFromApi()
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
                                this.getTableDataFromApi()
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
                        message: `${column.propertyName} 是必填项`,
                        trigger: 'blur'
                    }]
                }
            },

            getTableDataFromApi () {
                this.isLoading = true
                this
                    .$http
                    .get(
                        `/data-source/user/tableName/${this.tableName}`,
                        {
                            params: {
                                page: this.renderPagination?.current,
                                pageSize: this.renderPagination?.limit,
                                bkSortKey: this.sortObject.key,
                                bkSortValue: this.sortObject.value,
                                bkDataSourceType: this.bkDataSourceType,
                                ...this.queryObject
                            }
                        }
                    )
                    .then(({ data }) => {
                        this.renderData = data.list || []
                        if (this.renderPagination) {
                            this.renderPagination.count = data.count || 0
                        }
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
                    this.getTableDataFromApi()
                } else {
                    this.$emit('page-change', page)
                }
            },

            handleLimitChange (limit) {
                this.renderPagination.current = 1
                this.renderPagination.limit = limit
                if (this.paginationType === 'local') {
                    this.calcRenderData()
                } else if (this.paginationType === 'remote' && this.tableName) {
                    this.getTableDataFromApi()
                } else {
                    this.$emit('page-limit-change', limit)
                }
            },

            handleFilter ({ key, value }) {
                if (this.renderPagination) {
                    this.renderPagination.current = 1
                }
                if (['', undefined, null].includes(value)) {
                    delete this.queryObject[key]
                } else {
                    this.queryObject[key] = value
                }
                // 远程非数据表情况下需要用户自行处理
                if (['none', 'local'].includes(this.paginationType) || !this.pagination) {
                    this.calcRenderData()
                } else if (this.paginationType === 'remote' && this.tableName) {
                    this.getTableDataFromApi()
                } else {
                    this.$emit('filter-change', { key, value: [value] })
                }
            },

            handleSortChange ({ column, prop, order }) {
                const sortMap = {
                    ascending: 'ASC',
                    descending: 'DESC'
                }
                if (this.renderPagination) {
                    this.renderPagination.current = 1
                }
                this.sortObject.key = prop
                this.sortObject.value = sortMap[order]
                // 远程非数据表情况下需要用户自行处理
                if (['none', 'local'].includes(this.paginationType) || !this.pagination) {
                    this.calcRenderData()
                } else if (this.paginationType === 'remote' && this.tableName) {
                    this.getTableDataFromApi()
                } else {
                    this.$emit('sort-change', { column, prop, order })
                }
            },

            calcRenderData () {
                // 过滤
                const filterDataList = this.data.reduce((acc, cur) => {
                    const isMatch = Object
                        .keys(this.queryObject)
                        .every(key => this.queryObject[key] === '' || cur[key].includes(this.queryObject[key]))
                    if (isMatch) {
                        acc.push(cur)
                    }
                    return acc
                }, [])
                // 排序
                const { key, value } = this.sortObject
                filterDataList.sort((a, b) => {
                    if (value === 'ASC') {
                        return a[key] - b[key]
                    }
                    if (value === 'DESC') {
                        return b[key] - a[key]
                    }
                })
                this.renderData = this.renderPagination
                    ? filterDataList.slice(
                        (this.renderPagination.current - 1) * this.renderPagination.limit,
                        this.renderPagination.current * this.renderPagination.limit
                    )
                    : filterDataList
                if (this.renderPagination) {
                    this.renderPagination.count = filterDataList.length
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
    .mr5 {
        margin-right: 5px;
    }
</style>
