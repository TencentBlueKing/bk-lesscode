<template>
    <article>
        <bk-alert type="warning" :title="$t('数据的增删改会直接影响到{0}，请谨慎操作',[environment.name])"></bk-alert>

        <section class="render-data-header">
            <bk-button theme="primary" class="mr10" @click="addData">{{ $t('新增') }}</bk-button>
            <bk-button
                class="mr10"
                :disabled="dataStatus.selectRows.length <= 0"
                @click="bulkDelete"
            >{{ $t('批量删除') }}</bk-button>
            <export-data
                class="mr10"
                :title="downloadType === 'all' ? $t('导出所有数据') : $t('导出选中数据')"
                :disable-partial-selection="dataStatus.selectRows.length <= 0"
                :disabled="dataStatus.pagination.count <= 0"
                @download="exportDatas"
                @show="handleShowExport"
            />
            <import-data
                class="import-data"
                :title="$t('导入数据')"
                :tips="$t('如果导入 sql 文件，仅支持解析插入数据的语法')"
                :upload-key="dataImportOperationType"
                :parse-import="parseImport"
                :handle-import="handleImport"
                @downloadTemplate="handleDownloadTemplate"
            >
                <template v-slot:tips="slotProps">
                    <template v-if="slotProps.fileType === DATA_FILE_TYPE.SQL">
                        {{$t('支持INSERT、UPDATE、DELETE三种操作，时间类型的值需要转成0时区，')}}
                    </template>
                </template>
                <template v-slot="slotProps">
                    <template v-if="slotProps.fileType === DATA_FILE_TYPE.XLSX">
                        <h5 class="import-title">{{$t('操作类型')}}</h5>
                        <bk-radio-group
                            v-model="dataImportOperationType"
                            class="import-content"
                        >
                            <bk-radio-button
                                v-for="item in Object.values(DATA_IMPORT_OPERATION_TYPE)"
                                :value="item.ID"
                                :key="item.ID"
                            >
                                <span
                                    :class="{
                                        'import-tips': true,
                                        checked: dataImportOperationType === item.ID
                                    }"
                                    v-bk-tooltips="{ content: item.TIPS, maxWidth: 400 }"
                                >{{ item.NAME }}</span>
                            </bk-radio-button>
                        </bk-radio-group>
                    </template>
                </template>
            </import-data>
        </section>

        <bk-table
            v-bkloading="{ isLoading: dataStatus.isLoading }"
            class="g-hairless-table"
            :outer-border="false"
            :data="dataStatus.dataList"
            :pagination="dataStatus.pagination"
            :size="tableSetting.size"
            :header-border="false"
            :header-cell-style="{ background: '#f0f1f5' }"
            @page-change="handlePageChange"
            @page-limit-change="handlePageLimitChange"
            @selection-change="selectionChange"
        >
            <bk-table-column
                type="selection"
                width="60"
            ></bk-table-column>
            <template
                v-for="column in activeTable.columns"
            >
                <bk-table-column
                    v-if="tableSetting.selectedFields.find(selectedField => selectedField.id === column.name)"
                    :key="column.name"
                    :label="column.name"
                    :prop="column.name"
                    :formatter="columnFormatter(column.type)"
                    :render-header="renderHeader"
                    show-overflow-tooltip
                ></bk-table-column>
            </template>
            <bk-table-column :label="$t('操作')" width="180">
                <template slot-scope="props">
                    <bk-button text @click="editData(props.row)" class="mr10">{{ $t('编辑') }}</bk-button>
                    <bk-button text @click="deleteData([props.row])">{{ $t('删除') }}</bk-button>
                </template>
            </bk-table-column>
            <bk-table-column
                type="setting"
                :tippy-options="{ zIndex: 3000 }"
            >
                <bk-table-setting-content
                    :fields="tableSetting.fields"
                    :selected="tableSetting.selectedFields"
                    :max="tableSetting.max"
                    :size="tableSetting.size"
                    @setting-change="handleTableSettingChange">
                </bk-table-setting-content>
            </bk-table-column>
            <empty-status slot="empty"></empty-status>
        </bk-table>

        <lc-sideslider
            :is-show="formStatus.showEditData"
            :width="740"
            :title="formStatus.editTitle"
            :transfer="true"
            @update:isShow="close"
        >
            <div slot="content">
                <lc-form
                    class="edit-data-form"
                    ref="formRef"
                    form-type="vertical"
                    :model="formStatus.editForm"
                    :label-width="300"
                >
                    <lc-form-item
                        v-for="column in activeTable.columns.filter(column => column.name !== 'id')"
                        :key="column.name"
                        :label="column.name"
                        :required="!column.nullable"
                        :property="column.name"
                        :rules="getColumnRule(column)"
                        error-display-type="normal"
                    >
                        <bk-date-picker
                            v-if="column.type === 'datetime'"
                            type="datetime"
                            style="width:100%"
                            :clearable="false"
                            :value="formStatus.editForm[column.name]"
                            @change="changeDateTime(column.name, ...arguments)"
                        ></bk-date-picker>
                        <bk-input
                            v-else-if="column.type === 'decimal'"
                            v-model="formStatus.editForm[column.name]"
                            :precision="column.scale"
                            type="number"
                            :placeholder="$t('请输入数字')"
                        ></bk-input>
                        <bk-input
                            v-else-if="column.type === 'int'"
                            v-model="formStatus.editForm[column.name]"
                            type="number"
                            :placeholder="$t('请输入数字')"
                        ></bk-input>
                        <bk-date-picker
                            v-else-if="column.type === 'date'"
                            style="width:100%"
                            :clearable="false"
                            :value="formStatus.editForm[column.name]"
                            @change="changeDate(column.name, ...arguments)"
                        ></bk-date-picker>
                        <edit-object
                            v-else-if="column.type === 'json'"
                            :value.sync="formStatus.editForm[column.name]"
                        >
                        </edit-object>
                        <bk-input
                            v-else
                            v-model="formStatus.editForm[column.name]"
                            :placeholder="$t('请输入字符串')"
                        ></bk-input>
                    </lc-form-item>
                    <lc-form-item style="margin-top: 32px;">
                        <bk-button
                            theme="primary"
                            class="mr5"
                            :loading="formStatus.isSaving"
                            @click="confirmSubmitData"
                        >{{ $t('提交') }}</bk-button>
                        <bk-button
                            :disabled="formStatus.isSaving"
                            @click="closeForm"
                        >{{ $t('取消') }}</bk-button>
                    </lc-form-item>
                </lc-form>
            </div>
        </lc-sideslider>
    </article>
</template>

<script lang="ts">
    import {
        defineComponent,
        onBeforeMount,
        watch,
        toRefs,
        ref,
        PropType,
        reactive
    } from '@vue/composition-api'
    import Vue from 'vue'
    import { messageError, messageSuccess } from '@/common/bkmagic'
    import { bkInfoBox } from 'bk-magic-vue'
    import router from '@/router'
    import store from '@/store'
    import dayjs from 'dayjs'
    import {
        DataParse,
        DataJsonParser,
        DataSqlParser,
        FIELDS_TYPES,
        DATA_FILE_TYPE,
        DATA_IMPORT_OPERATION_TYPE,
        generateExportDatas,
        handleImportData
    } from 'shared/data-source'
    import {
        downloadFile
    } from '@/common/util.js'
    import exportData from '../common/export.vue'
    import editObject from '@/components/edit-object.vue'
    import importData from '../common/import.vue'
    import {
        downloadDataTemplate
    } from '../common/use-download-demo'
    import {
        isEmpty
    } from 'shared/util'
    import { leaveConfirm } from '@/common/leave-confirm'

    import DayJSUtcPlugin from 'dayjs/plugin/utc'
    dayjs.extend(DayJSUtcPlugin)

    interface ITable {
        tableName: string,
        columns: any[]
    }

    interface IProps {
        environment?: any,
        activeTable?: ITable
    }

    interface IDataParse {
        import?: (object) => IDataParse,
        set?: (object) => IDataParse,
        export?: (object) => string
    }

    interface IFormStatus {
        showEditData: boolean,
        editTitle: string,
        editForm: any,
        isSaving: boolean,
        dataParse: IDataParse
    }

    const getColumnRule = (column) => {
        if (!column.nullable) {
            return [{
                required: true,
                message: window.i18n.t('{0} 是必填项', [column.name]),
                trigger: 'blur'
            }]
        }
    }

    export default defineComponent({
        components: {
            exportData,
            editObject,
            importData
        },

        props: {
            environment: Object,
            activeTable: Object as PropType<ITable>
        },

        setup (props) {
            const projectId = router?.currentRoute?.params?.projectId
            const { environment, activeTable } = toRefs<IProps>(props)
            const formRef = ref(null)
            const dataStatus = reactive({
                dataList: [],
                selectRows: [],
                pagination: { current: 1, count: 0, limit: 10 },
                isLoading: false
            })
            const formStatus = reactive<IFormStatus>({
                showEditData: false,
                editTitle: '',
                editForm: {},
                dataParse: {},
                isSaving: false
            })
            const tableSetting = ref({
                fields: [],
                selectedFields: [],
                max: 3,
                size: 'small'
            })
            const downloadType = ref('')
            const dataImportOperationType = ref(DATA_IMPORT_OPERATION_TYPE().ALL_INSERT.ID)
            const userInfo = store.state.user

            const calcTableSetting = () => {
                const fields = activeTable
                    .value
                    .columns
                    .map(column => ({
                        id: column.name,
                        label: column.name
                    }))
                tableSetting.value.fields = fields
                tableSetting.value.selectedFields = fields
            }

            const handleTableSettingChange = ({ fields, size }) => {
                tableSetting.value.size = size
                tableSetting.value.selectedFields = fields
            }

            const selectionChange = (selections) => {
                dataStatus.selectRows = selections
            }

            const handlePageChange = (newPage) => {
                dataStatus.pagination.current = newPage
                getDataList()
            }

            const handlePageLimitChange = (limit) => {
                dataStatus.pagination.limit = limit
                getDataList()
            }

            const normalizeData = (data) => {
                // update datetime
                const dateTimeColumns = activeTable.value.columns?.filter((column) => (column.type === 'datetime'))
                dateTimeColumns.forEach((dateTimeColumn) => {
                    data[dateTimeColumn.name] = timeFormatter(data[dateTimeColumn.name])
                })
                // update date
                const dateColumns = activeTable.value.columns?.filter((column) => (column.type === 'date'))
                dateColumns.forEach((dateColumn) => {
                    data[dateColumn.name] = dateFormatter(data[dateColumn.name])
                })
                return data
            }

            const getDataList = () => {
                if (!activeTable.value?.tableName) return

                const queryData = {
                    projectId,
                    environment: environment.value.key,
                    tableName: activeTable.value.tableName,
                    page: dataStatus.pagination.current,
                    pageSize: dataStatus.pagination.limit
                }
                dataStatus.isLoading = true
                return store.dispatch('dataSource/getOnlineTableDatas', queryData).then((res) => {
                    dataStatus.dataList = res.list?.map(normalizeData)
                    dataStatus.pagination.count = res.count
                }).catch((error) => {
                    messageError(error.message || error)
                }).finally(() => {
                    dataStatus.isLoading = false
                })
            }

            const timeFormatter = (val) => {
                return val ? dayjs(val).format('YYYY-MM-DD HH:mm:ss') : ''
            }

            const dateFormatter = (val) => {
                return val ? dayjs(val).format('YYYY-MM-DD') : ''
            }

            const columnFormatter = (type) => {
                return (obj, con, val) => {
                    const getValue = () => {
                        let value
                        switch (type) {
                            case 'date':
                                value = dateFormatter(val)
                                break
                            case 'datetime':
                                value = timeFormatter(val)
                                break
                            case 'json':
                                value = JSON.stringify(val)
                                break
                            default:
                                value = val
                                break
                        }
                        return value
                    }
                    return ![null, undefined, ''].includes(val) ? getValue() : '--'
                }
            }

            // date-pick 手动格式化
            const changeDateTime = (propName, date) => {
                formStatus.editForm[propName] = timeFormatter(date)
            }

            const changeDate = (propName, date) => {
                formStatus.editForm[propName] = dateFormatter(date)
            }
            const close = () => {
                formStatus.showEditData = false
                formStatus.editForm = {}
                formStatus.dataParse = {}
            }

            const closeForm = () => {
                leaveConfirm()
                    .then(() => {
                        close()
                    })
            }

            const addData = () => {
                formStatus.showEditData = true
                formStatus.editTitle = window.i18n.t('新增数据')
                formStatus.dataParse = new DataParse()
                const columns = activeTable.value.columns
                columns.forEach((column) => {
                    const value = column.type === 'datetime' ? timeFormatter(new Date()) : column.default
                    if (column.name !== 'id') {
                        Vue.set(formStatus.editForm, column.name, value)
                    }
                })
            }

            const editData = (row) => {
                const data = [{ tableName: activeTable.value.tableName, list: [row] }]
                formStatus.showEditData = true
                formStatus.editTitle = window.i18n.t('编辑数据')
                formStatus.dataParse = new DataParse(data)
                Object.keys(row).forEach((key) => {
                    let value = row[key]
                    if (Object.prototype.toString.call(value) === '[object Object]') {
                        value = JSON.stringify(value)
                    }
                    Vue.set(formStatus.editForm, key, value)
                })
            }

            const confirmSubmitData = () => {
                formRef.value.validate().then(() => {
                    formStatus.isSaving = true
                    updateDB(
                        activeTable.value.tableName,
                        [formStatus.editForm],
                        formStatus.dataParse
                    )
                        .catch((error) => {
                            messageError(error.message || error)
                        })
                        .finally(() => {
                            formStatus.isSaving = false
                        })
                }).catch((validator) => {
                    messageError(validator.content || validator)
                })
            }

            // 基于 json 更新 db
            const updateDB = (tableName, list, dataParse) => {
                // 入库前根据浏览器时间转换时区
                const dateColumns = activeTable.value.columns?.filter((column) => (['date', 'datetime'].includes(column.type)))
                dateColumns.forEach((dateColumn) => {
                    list.forEach((form) => {
                        if (isEmpty(form[dateColumn.name])) {
                            return
                        }
                        if (!dayjs(form[dateColumn.name]).isValid()) {
                            throw new Error(window.i18n.t('数据是【{1}】类型，但是值【{0}】不符合【{1}】格式', [form[dateColumn.name], dateColumn.type]))
                        }
                        if (dateColumn.type === 'datetime') {
                            form[dateColumn.name] = dayjs(form[dateColumn.name])
                                .utcOffset(0)
                                .format('YYYY-MM-DD HH:mm:ss')
                        }
                        if (dateColumn.type === 'date') {
                            form[dateColumn.name] = dayjs(form[dateColumn.name])
                                .format('YYYY-MM-DD')
                        }
                    })
                })

                const data = [{ tableName, list }]
                const dataJsonParser = new DataJsonParser(data)
                const dataSqlParser = new DataSqlParser()
                const sql = dataParse.set(dataJsonParser).export(dataSqlParser)

                return modifyOnlineDb(sql).then((res) => {
                    window.leaveConfirm = false
                    close()
                    getDataList()
                    return res
                })
            }

            const bulkDelete = () => {
                deleteData(dataStatus.selectRows)
            }

            const deleteData = (list) => {
                const data = [{ tableName: activeTable.value.tableName, list }]
                const dataParse = new DataParse(data)
                const dataJsonParser = new DataJsonParser()
                const dataSqlParser = new DataSqlParser()
                const sql = dataParse.set(dataJsonParser).export(dataSqlParser)
                bkInfoBox({
                    title: window.i18n.t('确认要删除？'),
                    subTitle: window.i18n.t('将会直接删除{0} id 为【{1}】的数据', [environment.value.name, list.map(x => x.id).join(',')]),
                    theme: 'danger',
                    confirmLoading: true,
                    confirmFn () {
                        return modifyOnlineDb(sql).then(() => {
                            close()
                            getDataList()
                        }).catch((error) => {
                            messageError(error.message || error)
                        })
                    }
                })
            }

            const modifyOnlineDb = (sql) => {
                const apiData = {
                    environment: environment.value.key,
                    projectId,
                    sql
                }
                return store.dispatch('dataSource/modifyOnlineDb', apiData)
            }

            const exportAllDatas = (fileType) => {
                window.open(`/api/data-source/exportDatas/projectId/${projectId}/fileType/${fileType}/tableName/${activeTable.value.tableName}/environment/${environment.value.key}?x-timezone-offset=${new Date().getTimezoneOffset()}`)
            }

            const exportSelectDatas = (fileType) => {
                // 生产 sql 语法不需要id
                const datas = [{
                    tableName: activeTable.value.tableName,
                    list: dataStatus.selectRows.map((row) => {
                        if (fileType === DATA_FILE_TYPE.SQL) {
                            const { id, ...rest } = row
                            return rest
                        }
                        return row
                    })
                }]
                const fileName = fileType === DATA_FILE_TYPE.SQL ? `bklesscode-data-${projectId}.sql` : ''
                const files = generateExportDatas(datas, fileType, fileName)
                files.forEach(({ name, content }) => {
                    downloadFile(content, name)
                })
            }

            const handleShowExport = (type) => {
                downloadType.value = type
            }

            const exportDatas = (fileType, downloadType) => {
                if (downloadType === 'all') {
                    exportAllDatas(fileType)
                } else {
                    exportSelectDatas(fileType)
                }
            }

            // 解析导入的数据
            const parseImport = ({ data, type }) => {
                return new Promise((resolve, reject) => {
                    try {
                        const [list] = handleImportData(
                            [data],
                            type,
                            activeTable.value.columns.map(column => column.name)
                        )
                        resolve({
                            data: list,
                            message: type === DATA_FILE_TYPE.XLSX ? window.i18n.t('解析到【{0}】条数据，点击导入后插入到数据库', [list.length]) : ''
                        })
                    } catch (error) {
                        reject(error)
                    }
                })
            }

            // 执行导入
            const handleImport = (data, fileType) => {
                // 导入成功提示消息
                const handleImportSuccessMessage = (results) => {
                    const affectedRows = results.reduce((acc, cur) => {
                        acc += cur.affectedRows
                        return acc
                    }, 0)
                    messageSuccess(`数据导入操作执行成功，数据库受影响的行数为：${affectedRows}`)
                }
                // sql 导入则直接执行 sql 语法
                if (fileType === DATA_FILE_TYPE.SQL) {
                    return modifyOnlineDb(data.content).then((results) => {
                        window.leaveConfirm = false
                        close()
                        getDataList()
                        handleImportSuccessMessage(results)
                    })
                }

                // 如果内置时间字段没填，去掉该字段，由系统自动生成
                // 如果内置用户没填，取当前登录人
                const filterList = data.map((item) => {
                    const { createTime, updateTime, ...rest } = item
                    if (!isEmpty(createTime)) {
                        rest.createTime = createTime
                    }
                    if (!isEmpty(updateTime)) {
                        rest.updateTime = updateTime
                    }
                    if (isEmpty(rest.updateUser)) {
                        rest.updateUser = userInfo.username
                    }
                    if (isEmpty(rest.createUser)) {
                        rest.createUser = userInfo.username
                    }
                    // 新增导入和有唯一性约束的情况下，导入不需要id字段
                    if (dataImportOperationType.value === DATA_IMPORT_OPERATION_TYPE().ALL_INSERT.ID
                        || activeTable.value.columns.some(column => column.unique)
                    ) {
                        delete rest.id
                    }
                    Object.defineProperty(
                        rest,
                        '_dataImportOperationType',
                        {
                            value: dataImportOperationType.value,
                            enumerable: false
                        }
                    )
                    return rest
                })
                return updateDB(activeTable.value.tableName, filterList, new DataParse()).then(handleImportSuccessMessage)
            }

            const handleDownloadTemplate = (type) => {
                // 基于类型获取默认值
                const getDefaultValueByType = (type, name) => {
                    // 使用当前登录人作为更新人和创建人
                    if (['updateUser', 'createUser'].includes(name)) {
                        return userInfo.username
                    }
                    if (type === 'date') {
                        return dayjs().format('YYYY-MM-DD')
                    }
                    if (type === 'datetime') {
                        return dayjs().format('YYYY-MM-DD HH:mm:ss')
                    }
                    // 使用值类型的默认值
                    const fieldType = FIELDS_TYPES.find(fieldType => fieldType.name === type)
                    return fieldType.defaultValue
                }
                // 过滤掉不需要导出的字段
                const filterColumns = activeTable.value.columns.filter((column) => {
                    return column.name !== 'id' || type === DATA_FILE_TYPE.XLSX
                })
                // 基于当前选择的表构建示例数据
                const demoData = filterColumns.reduce((acc, cur) => {
                    acc[cur.name] = getDefaultValueByType(cur.type, cur.name)
                    return acc
                }, {})
                // 下载示例
                downloadDataTemplate(
                    type,
                    {
                        tableName: activeTable.value?.tableName,
                        list: [demoData]
                    }
                )
            }

            const renderHeader = (h, data) => {
                return h(
                    'span',
                    {
                        attrs: {
                            title: data.column.label
                        },
                        style: 'render-table-header'
                    },
                    data.column.label
                )
            }

            watch(
                [environment, activeTable],
                () => {
                    dataStatus.pagination.current = 1
                    getDataList()
                    calcTableSetting()
                }
            )

            onBeforeMount(() => {
                getDataList()
                calcTableSetting()
            })

            return {
                DATA_FILE_TYPE,
                DATA_IMPORT_OPERATION_TYPE: DATA_IMPORT_OPERATION_TYPE(),
                formRef,
                dataStatus,
                formStatus,
                tableSetting,
                downloadType,
                dataImportOperationType,
                getColumnRule,
                columnFormatter,
                timeFormatter,
                changeDateTime,
                changeDate,
                handleTableSettingChange,
                selectionChange,
                handlePageChange,
                handlePageLimitChange,
                close,
                closeForm,
                addData,
                editData,
                confirmSubmitData,
                bulkDelete,
                deleteData,
                handleShowExport,
                exportDatas,
                handleDownloadTemplate,
                parseImport,
                handleImport,
                renderHeader
            }
        }
    })
</script>

<style lang="postcss" scoped>
    .render-data-header {
        display: flex;
        align-items: center;
        margin: 16px 0;
    }
    .edit-data-form {
        padding: 25px;
        min-height: calc(100vh - 60px);
    }
    .import-title {
        font-weight: normal;
        font-size: 12px;
        line-height: 20px;
        margin: 0 0 6px;
    }
    .import-content {
        margin-bottom: 25px;
        .bk-form-radio-button {
            width: 33.33%;
        }
        /deep/ .bk-radio-button-text {
            width: 100%;
        }
    }
    .import-tips {
        border-bottom: 1px dashed #313238;
        padding-bottom: 2px;
        line-height: 20px;
        &.checked {
            border-bottom: 1px dashed #3a84ff;
        }
    }
</style>
