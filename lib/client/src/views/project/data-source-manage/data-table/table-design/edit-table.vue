<template>
    <article v-bkloading="{ isLoading }">
        <render-header>
            <span class="table-header">
                <i class="bk-drag-icon bk-drag-arrow-back" @click="goBack"></i>
                {{ $t('编辑表【{0}】信息', [originTableStatus.basicInfo.tableName]) }} </span>
        </render-header>

        <main class="table-main">
            <section class="table-section">
                <h5 class="section-title">{{ $t('基础信息') }}</h5>
                <info-table ref="basicFormRef" :basic-info="originTableStatus.basicInfo" @change="changeEdit(true)"></info-table>
            </section>

            <section class="table-section">
                <h5 class="section-title">
                    {{ $t('字段配置') }} <i
                        class="bk-icon icon-info"
                        v-bk-tooltips="{
                            content: $t('数据行 id，createTime，createUser，updateTime，updateUser 是系统内置字段，系统会自动进行赋值。数据列中，小数点只会在字段类型为 decimal 的时候生效，长度只会在字段类型为 varchar 的时候生效'),
                            width: '400'
                        }"
                    ></i>
                    <import-table
                        class="import-table"
                        :title="$t('导入表结构')"
                        :tips="`1. ${$t('如果导入 sql 文件，仅支持解析创建表的语法')}<br>
                                2. ${$t('仅支持系统可创建的字段类型')}<br>
                                3. ${$t('系统内置字段会默认添加且不可修改')}<br>
                                4. ${$t('导入文件后会解析并更新表字段配置')}`"
                        :parse-import="parseImport"
                        :handle-import="handleImport"
                        @downloadTemplate="downloadStructTemplate"
                    />
                </h5>
                <field-table ref="fieldTableRef" :data="originTableStatus.data" @change="changeEdit(true)"></field-table>
            </section>
            <span
                v-bk-tooltips="{
                    content: $t('表单页面自动生成的数据表不可以编辑'),
                    disabled: !originTableStatus.disableEdit
                }">
                <bk-button
                    theme="primary"
                    class="mr5"
                    :loading="isSaving"
                    :disabled="!hasEdit || originTableStatus.disableEdit"
                    @click="submit"
                >{{ $t('提交') }}</bk-button>
            </span>
            <bk-button @click="goBack" :disabled="isSaving">{{ $t('取消') }}</bk-button>
        </main>

        <confirm-dialog
            :is-show.sync="showConfirmDialog"
            :sql="sql"
            :is-loading="isSaving"
            @confirm="confirmSubmit"
        ></confirm-dialog>
    </article>
</template>

<script lang="ts">
    import {
        defineComponent,
        onBeforeMount
    } from '@vue/composition-api'
    import {
        useTableStatus
    } from './composables/table-info'
    import {
        DataParse,
        StructJsonParser,
        StructSqlParser,
        handleImportStruct,
        normalizeJson,
        BASE_COLUMNS
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
                    title: window.i18n.t('确认离开当前页面？'),
                    subTitle: window.i18n.t('当前页面内容未保存，离开修改的内容将会丢失'),
                    confirmFn,
                    cancelFn
                })
            } else {
                confirmFn()
            }
        },

        setup () {
            const {
                tableStatus: originTableStatus,
                sql,
                isLoading,
                isSaving,
                showConfirmDialog,
                hasEdit,
                basicFormRef,
                fieldTableRef
            } = useTableStatus()

            const {
                tableStatus: finalTableStatus
            } = useTableStatus()

            let id = ''

            const goBack = () => {
                router.push({ name: 'showTable', query: { id } })
            }

            const changeEdit = (val) => {
                hasEdit.value = val
            }

            const submit = () => {
                Promise.all([
                    basicFormRef.value.validate(),
                    fieldTableRef.value.validate()
                ]).then(([basicInfo, tableList]) => {
                    // 基于用户修改的表格生成 sql
                    const originTable = {
                        ...originTableStatus.basicInfo,
                        columns: originTableStatus.data.map(val => normalizeJson(val)),
                        id
                    }
                    const modifyTable = {
                        ...basicInfo,
                        columns: tableList,
                        id
                    }
                    const dataParse = new DataParse([originTable])
                    const structJsonParser = new StructJsonParser([modifyTable])
                    const structSqlParser = new StructSqlParser()
                    // 写入数据
                    sql.value = dataParse.import(structJsonParser).export(structSqlParser)
                    Object.assign(finalTableStatus.basicInfo, basicInfo)
                    finalTableStatus.data = tableList
                    showConfirmDialog.value = true
                }).catch((error) => {
                    messageError(error.message || error)
                })
            }

            const confirmSubmit = () => {
                const projectId = router?.currentRoute?.params?.projectId
                const dataTable = {
                    tableName: finalTableStatus.basicInfo.tableName,
                    comment: finalTableStatus.basicInfo.comment,
                    id,
                    projectId,
                    columns: finalTableStatus.data
                }
                const record = {
                    projectId,
                    sql: sql.value,
                    tableId: id
                }
                const postData = {
                    dataTable,
                    record
                }
                isSaving.value = true
                return store.dispatch('dataSource/modifyOnlineDb', record).then(() => {
                    return store.dispatch('dataSource/edit', postData).then(() => {
                        messageSuccess(window.i18n.t('编辑表成功'))
                        changeEdit(false)
                        goBack()
                    })
                }).catch((error) => {
                    messageError(error.message || error)
                }).finally(() => {
                    isSaving.value = false
                })
            }

            const getDetail = () => {
                isLoading.value = true
                store.dispatch('dataSource/findOne', router?.currentRoute?.query).then((data) => {
                    originTableStatus.basicInfo.tableName = data.tableName
                    originTableStatus.basicInfo.comment = data.comment
                    originTableStatus.data = data.columns
                    originTableStatus.disableEdit = data.source === 'nocode'
                    id = data.id
                }).catch((error) => {
                    messageError(error.message || error)
                }).finally(() => {
                    isLoading.value = false
                })
            }
            // 解析导入的表结构
            const parseImport = ({ data, type }) => {
                return new Promise((resolve, reject) => {
                    try {
                        const [tableInfo] = handleImportStruct([data], type)
                        const columns = [
                            ...BASE_COLUMNS(),
                            ...tableInfo.columns.filter(column => !BASE_COLUMNS().find(baseColumn => baseColumn.name === column.name))
                        ]
                        // 过滤掉基础字段设置，使用系统内置
                        resolve({
                            data: columns,
                            message: window.i18n.t('解析到【{0}】个字段，请点击导入后修改字段配置', [columns.length])
                        })
                    } catch (error) {
                        reject(error)
                    }
                })
            }
            // 执行导入
            const handleImport = (data) => {
                originTableStatus.data = data
                return Promise.resolve()
            }

            onBeforeMount(getDetail)

            return {
                isSaving,
                isLoading,
                showConfirmDialog,
                sql,
                basicFormRef,
                fieldTableRef,
                originTableStatus,
                hasEdit,
                goBack,
                submit,
                confirmSubmit,
                changeEdit,
                downloadStructTemplate,
                parseImport,
                handleImport
            }
        }
    })
</script>

<style lang="postcss" scoped>
    @import "@/css/mixins/scroller";
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
        height: calc(100% - 52px);
        overflow-y: auto;
        @mixin scroller;
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
