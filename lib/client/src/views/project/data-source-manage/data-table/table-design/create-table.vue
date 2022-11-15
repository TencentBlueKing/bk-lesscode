<template>
    <article>
        <render-header>
            <span class="table-header">
                <i class="bk-drag-icon bk-drag-arrow-back" @click="goBack"></i>
                新建表
            </span>
        </render-header>

        <main class="table-main">
            <section class="table-section">
                <h5 class="section-title">基础信息</h5>
                <info-table ref="basicFormRef" :basic-info="tableStatus.basicInfo" @change="changeEdit(true)"></info-table>
            </section>

            <section class="table-section">
                <h5 class="section-title">
                    字段配置
                    <i
                        class="bk-icon icon-info"
                        v-bk-tooltips="{
                            content: `数据行 id，createTime，createUser，updateTime，updateUser 是系统内置字段，系统会自动进行赋值。
                            数据列中，小数点只会在字段类型为 decimal 的时候生效`,
                            width: '400'
                        }"
                    ></i>
                    <import-table
                        class="import-table"
                        title="导入表结构"
                        tips="1. 如果导入 sql 文件，仅支持解析创建表的语法<br>2. 仅支持系统可创建的字段类型<br>3. 系统内置字段会默认添加且不可修改<br>4. 导入文件后会解析并更新表字段配置"
                        :handle-import="importTable"
                        @downloadTemplate="downloadStructTemplate"
                    />
                </h5>
                <field-table ref="fieldTableRef" :data.sync="tableStatus.data" @change="changeEdit(true)"></field-table>
            </section>

            <bk-button theme="primary" class="mr5" @click="submit" :loading="isLoading">提交</bk-button>
            <bk-button @click="goBack" :disabled="isLoading">取消</bk-button>
        </main>

        <confirm-dialog
            :is-show.sync="showConfirmDialog"
            :sql="sql"
            :is-loading="isLoading"
            @confirm="confirmSubmit"
        ></confirm-dialog>
    </article>
</template>

<script lang="ts">
    import {
        defineComponent
    } from '@vue/composition-api'
    import {
        useTableStatus
    } from './composables/table-info'
    import {
        BASE_COLUMNS,
        DataParse,
        StructJsonParser,
        StructSqlParser,
        handleImportStruct
    } from 'shared/data-source'
    import {
        messageSuccess,
        messageError
    } from '@/common/bkmagic'
    import {
        bkInfoBox
    } from 'bk-magic-vue'
    import router from '@/router'
    import store from '@/store'
    import renderHeader from '../common/header'
    import fieldTable from '../common/field-table'
    import infoTable from '../common/info-table.vue'
    import confirmDialog from '../common/confirm-dialog.vue'
    import importTable from '../common/import.vue'
    import {
        downloadStructTemplate
    } from '../common/use-download-demo'

    export default defineComponent({
        components: {
            renderHeader,
            fieldTable,
            infoTable,
            confirmDialog,
            importTable
        },

        beforeRouteLeave (to, from, next) {
            const confirmFn = () => next()
            const cancelFn = () => next(false)
            if (this.hasEdit) {
                bkInfoBox({
                    title: '确认离开当前页面？',
                    subTitle: '当前页面内容未保存，离开修改的内容将会丢失',
                    confirmFn,
                    cancelFn
                })
            } else {
                confirmFn()
            }
        },

        setup () {
            const projectId = router?.currentRoute?.params?.projectId
            const {
                tableStatus,
                sql,
                isLoading,
                hasEdit,
                showConfirmDialog,
                basicFormRef,
                fieldTableRef
            } = useTableStatus({
                data: BASE_COLUMNS
            })

            const goBack = () => {
                router.push({ name: 'tableList' })
            }

            const changeEdit = (val) => {
                hasEdit.value = val
            }

            const submit = () => {
                Promise.all([
                    basicFormRef.value.validate(),
                    fieldTableRef.value.validate()
                ]).then(([basicInfo, tableList]) => {
                    // 基于用户创建的表格生成 sql
                    const table = {
                        ...basicInfo,
                        columns: tableList
                    }
                    const dataParse = new DataParse()
                    const structJsonParser = new StructJsonParser([table])
                    const structSqlParser = new StructSqlParser()
                    // 写入数据
                    sql.value = dataParse.import(structJsonParser).export(structSqlParser)
                    Object.assign(tableStatus.basicInfo, basicInfo)
                    tableStatus.data = tableList
                    showConfirmDialog.value = true
                }).catch((error) => {
                    messageError(error.message || error)
                })
            }

            const confirmSubmit = () => {
                const dataTable = {
                    ...tableStatus.basicInfo,
                    projectId,
                    columns: tableStatus.data
                }
                const record = {
                    projectId,
                    sql: sql.value
                }
                const postData = {
                    dataTable,
                    record
                }
                isLoading.value = true
                return enableDataSource().then(() => {
                    return store.dispatch('dataSource/modifyOnlineDb', record).then(() => {
                        return store.dispatch('dataSource/add', postData).then(() => {
                            messageSuccess('新增表成功')
                            changeEdit(false)
                            goBack()
                        })
                    })
                }).catch((error) => {
                    messageError(error.message || error)
                }).finally(() => {
                    isLoading.value = false
                })
            }

            const enableDataSource = () => {
                const projectInfo = store.getters['project/currentProject'] || {}
                const isEnableDataSource = projectInfo.isEnableDataSource
                if (isEnableDataSource) {
                    return Promise.resolve()
                } else {
                    return store.dispatch('dataSource/enable', projectId).then(() => {
                        projectInfo.isEnableDataSource = 1
                    })
                }
            }

            const importTable = ({ data, type }) => {
                return new Promise((resolve, reject) => {
                    try {
                        const [tableInfo] = handleImportStruct([data], type)
                        // 过滤掉基础字段设置，使用系统内置
                        tableStatus.data = [
                            ...BASE_COLUMNS,
                            ...tableInfo.columns.filter(column => !BASE_COLUMNS.find(baseColumn => baseColumn.name === column.name))
                        ]
                        resolve('已解析文件并更新字段配置')
                    } catch (error) {
                        reject(error)
                    }
                })
            }

            return {
                hasEdit,
                sql,
                isLoading,
                showConfirmDialog,
                basicFormRef,
                fieldTableRef,
                tableStatus,
                changeEdit,
                goBack,
                submit,
                confirmSubmit,
                downloadStructTemplate,
                importTable
            }
        }
    })
</script>

<style lang="postcss" scoped>
    .table-header {
        display: flex;
        align-items: center;
        .bk-drag-arrow-back {
            color: #3a84ff;
            padding: 10px;
            cursor: pointer;
            font-size: 14px;
        }
    }
    .table-main {
        padding: 20px 24px;
    }
    .table-section {
        background: #ffffff;
        box-shadow: 0px 2px 4px 0px rgba(25,25,41,0.05);
        padding: 16px 24px 25px;
        margin-bottom: 23px;
        .section-title {
            font-weight: 700;
            text-align: left;
            color: #313238;
            line-height: 19px;
            font-size: 14px;
            margin: 0 0 12px;
        }
        .import-table {
            font-weight: normal;
            display: inline-block;
            margin-left: 20px;
        }
    }
</style>
