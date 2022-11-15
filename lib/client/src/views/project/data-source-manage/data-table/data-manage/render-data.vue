<template>
    <article>
        <bk-alert type="warning" :title="`数据的增删改会直接影响到${environment.name}，请谨慎操作`"></bk-alert>

        <section class="render-data-header">
            <bk-button theme="primary" class="mr10" @click="addData">新增</bk-button>
            <bk-button
                class="mr10"
                :disabled="dataStatus.selectRows.length <= 0"
                @click="bulkDelete"
            >批量删除</bk-button>
            <export-data
                class="mr10"
                title="导出数据"
                :disable-partial-selection="dataStatus.selectRows.length <= 0"
                :disabled="dataStatus.pagination.count <= 0"
                @download="exportDatas"
            />
            <import-data
                class="import-data"
                title="导入数据"
                tips="如果导入 sql 文件，仅支持解析插入数据的语法"
                :handle-import="importData"
                @downloadTemplate="handleDownloadTemplate"
            />
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
                    show-overflow-tooltip
                ></bk-table-column>
            </template>
            <bk-table-column label="操作" width="180">
                <template slot-scope="props">
                    <bk-button text @click="editData(props.row)" class="mr10">编辑</bk-button>
                    <bk-button text @click="deleteData([props.row])">删除</bk-button>
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
        </bk-table>

        <bk-sideslider
            :is-show.sync="formStatus.showEditData"
            :width="740"
            :title="formStatus.editTitle"
            :transfer="true"
        >
            <div slot="content">
                <bk-form
                    class="edit-data-form"
                    ref="formRef"
                    form-type="vertical"
                    :model="formStatus.editForm"
                    :label-width="120"
                >
                    <bk-form-item
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
                            placeholder="请输入数字"
                        ></bk-input>
                        <bk-input
                            v-else-if="column.type === 'int'"
                            v-model="formStatus.editForm[column.name]"
                            type="number"
                            placeholder="请输入数字"
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
                            placeholder="请输入字符串"
                        ></bk-input>
                    </bk-form-item>
                    <bk-form-item>
                        <bk-button
                            theme="primary"
                            class="mr5"
                            :loading="formStatus.isSaving"
                            @click="confirmSubmitData"
                        >提交</bk-button>
                        <bk-button
                            :disabled="formStatus.isSaving"
                            @click="closeForm"
                        >取消</bk-button>
                    </bk-form-item>
                </bk-form>
            </div>
        </bk-sideslider>
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
    import { messageError } from '@/common/bkmagic'
    import { bkInfoBox } from 'bk-magic-vue'
    import router from '@/router'
    import store from '@/store'
    import dayjs from 'dayjs'
    import {
        DataParse,
        DataJsonParser,
        DataSqlParser,
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
                message: `${column.name} 是必填项`,
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

            const closeForm = () => {
                formStatus.showEditData = false
                formStatus.editForm = {}
                formStatus.dataParse = {}
            }

            const addData = () => {
                formStatus.showEditData = true
                formStatus.editTitle = '新增数据'
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
                formStatus.editTitle = '编辑数据'
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
                const dateTimeColumns = activeTable.value.columns?.filter((column) => (column.type === 'datetime'))
                dateTimeColumns.forEach((dateTimeColumn) => {
                    list.forEach((form) => {
                        form[dateTimeColumn.name] = dayjs(form[dateTimeColumn.name])
                            .utcOffset(0)
                            .format('YYYY-MM-DD HH:mm:ss')
                    })
                })

                const data = [{ tableName, list }]
                const dataJsonParser = new DataJsonParser(data)
                const dataSqlParser = new DataSqlParser()
                const sql = dataParse.set(dataJsonParser).export(dataSqlParser)

                return modifyOnlineDb(sql).then((res) => {
                    closeForm()
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
                    title: '确认要删除？',
                    subTitle: `将会直接删除${environment.value.name} id 为【${list.map(x => x.id).join(',')}】的数据`,
                    theme: 'danger',
                    confirmLoading: true,
                    confirmFn () {
                        return modifyOnlineDb(sql).then(() => {
                            closeForm()
                            getDataList()
                        }).catch((error) => {
                            messageError(error.message || error)
                        })
                    }
                })
            }

            const modifyOnlineDb = (sql) => {
                const apiData = { environment: environment.value.key, projectId, sql }
                return store.dispatch('dataSource/modifyOnlineDb', apiData)
            }

            const exportAllDatas = (fileType) => {
                window.open(`/api/data-source/exportDatas/projectId/${projectId}/fileType/${fileType}/tableName/${activeTable.value.tableName}/environment/${environment.value.key}`)
            }

            const exportSelectDatas = (fileType) => {
                const datas = [{
                    tableName: activeTable.value.tableName,
                    list: dataStatus.selectRows
                }]
                const fileName = fileType === 'sql' ? `bklesscode-data-${projectId}.sql` : ''
                const files = generateExportDatas(datas, fileType, fileName)
                files.forEach(({ name, content }) => {
                    downloadFile(content, name)
                })
            }

            const exportDatas = (fileType, downloadType) => {
                if (downloadType === 'all') {
                    exportAllDatas(fileType)
                } else {
                    exportSelectDatas(fileType)
                }
            }

            const importData = ({ data, type }) => {
                return new Promise((resolve, reject) => {
                    try {
                        const [list] = handleImportData([data], type)
                        // 去除 id，由 DB 自增长
                        const filterList = list.map((item) => {
                            const { id, ...rest } = item
                            return rest
                        })
                        updateDB(activeTable.value.tableName, filterList, new DataParse())
                            .then((res) => {
                                const affectedRows = res.reduce((acc, cur) => {
                                    acc += cur.affectedRows
                                    return acc
                                }, 0)
                                resolve(`解析到${affectedRows}条数据，已导入`)
                            })
                            .catch(reject)
                    } catch (error) {
                        reject(error)
                    }
                })
            }

            const handleDownloadTemplate = (type) => {
                // 基于当前选择的表构建示例数据
                const demoData = activeTable.value.columns.reduce((acc, cur) => {
                    // 时间类型做特殊处理
                    acc[cur.name] = cur.default === 'CURRENT_TIMESTAMP' ? '' : cur.default
                    return acc
                }, {})
                // 下载示例
                downloadDataTemplate(
                    type,
                    {
                        tableName: 'demo_data',
                        list: [demoData]
                    }
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
                formRef,
                dataStatus,
                formStatus,
                tableSetting,
                getColumnRule,
                columnFormatter,
                timeFormatter,
                changeDateTime,
                changeDate,
                handleTableSettingChange,
                selectionChange,
                handlePageChange,
                handlePageLimitChange,
                closeForm,
                addData,
                editData,
                confirmSubmitData,
                bulkDelete,
                deleteData,
                exportDatas,
                handleDownloadTemplate,
                importData
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
</style>
