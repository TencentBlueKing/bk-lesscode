<template>
    <article class="data-base-main">
        <section class="data-base-section">
            <h5 class="section-title">
                {{ $t('基础信息') }}
                <bk-button
                    size="small"
                    class="section-btn"
                    @click="handleEditForm"
                >
                    {{ $t('编辑') }}
                </bk-button>
            </h5>

            <ul class="info-database">
                <li
                    v-for="displayDataBaseInfo in displayDataBaseInfos"
                    :key="displayDataBaseInfo.label"
                    class="database-field"
                >
                    <span class="field-label">{{ displayDataBaseInfo.label }}</span>：
                    <span class="field-value">{{ displayDataBaseInfo.value }}</span>
                </li>
            </ul>
        </section>

        <section
            class="data-base-section"
            v-bkloading="{ isLoading: listStatus.isTableLoading }"
        >
            <h5 class="section-title">
                {{ $t('数据表') }}
            </h5>
            <bk-button
                theme="primary"
                @click="goToDataDesign"
            >
                {{ $t('新建表') }}
            </bk-button>
            <bk-table
                v-bkloading="{ isloading: listStatus.isTableLoading }"
                class="g-hairless-table mt-20"
                :data="listStatus.list"
                :pagination="listStatus.pagination"
                :outer-border="false"
                :header-border="false"
                :header-cell-style="{ background: '#f0f1f5' }"
                @page-change="handlePageChange"
                @page-limit-change="handlePageLimitChange"
            >
                <bk-table-column :label="$t('table_表名')" prop="tableName" show-overflow-tooltip></bk-table-column>
                <bk-table-column :label="$t('table_存储引擎')" min-width="100">InnoDB</bk-table-column>
                <bk-table-column :label="$t('table_字符集')" min-width="100">utf8mb4</bk-table-column>
                <bk-table-column :label="$t('备注')" prop="summary" show-overflow-tooltip></bk-table-column>
                <bk-table-column :label="$t('table_更新人')" prop="updateUser" show-overflow-tooltip></bk-table-column>
                <bk-table-column :label="$t('table_更新时间')" prop="updateTime" width="160" :formatter="timeFormatter" show-overflow-tooltip></bk-table-column>
                <bk-table-column :label="$t('操作')" width="260">
                    <template slot-scope="props">
                        <bk-button class="mr10" theme="primary" text @click="goToDataDesign(props.row)">{{ $t('表结构设计') }}</bk-button>
                        <bk-button class="mr10" theme="primary" text @click="goToDataManage(props.row)">{{ $t('数据管理') }}</bk-button>
                        <span
                            v-bk-tooltips="{
                                content: calcDisableInfo(props.row).tips,
                                disabled: !calcDisableInfo(props.row).disabled
                            }">
                            <bk-button
                                class="mr10"
                                theme="primary"
                                text
                                :disabled="calcDisableInfo(props.row).disabled"
                                @click="deleteTable([props.row])"
                            >{{ $t('删除') }}</bk-button>
                        </span>
                    </template>
                </bk-table-column>
                <empty-status slot="empty"></empty-status>
            </bk-table>
        </section>

        <render-sideslider
            :title="$t('编辑数据库')"
            :is-show="formStatus.isShow"
            :form="formStatus.editForm"
            :is-saving="formStatus.isSaving"
            @close="handleCloseForm"
            @submit="handleSubmitForm"
        />

        <confirm-dialog
            :title="$t('确认删除')"
            :tips="$t('确认后将会删除该表，且使用到该表的接口会受到影响。请确认 SQL')"
            :is-show.sync="deleteStatus.showConfirmDialog"
            :sql="deleteStatus.sql"
            :is-loading="deleteStatus.isSaving"
            @confirm="confirmDelete"
        ></confirm-dialog>
    </article>
</template>

<script>
    import { mapActions } from 'vuex'
    import dayjs from 'dayjs'
    import { messageError } from '@/common/bkmagic'
    import RenderSideslider from './render-sideslider.vue'
    import ConfirmDialog from '../../../../common/confirm-dialog.vue'
    import {
        DataParse,
        StructJsonParser,
        StructSqlParser
    } from 'shared/data-source'

    export default {
        components: {
            RenderSideslider,
            ConfirmDialog
        },
        props: {
            dataBaseInfo: Object
        },
        data () {
            return {
                formStatus: {
                    isShow: false,
                    editForm: {
                        host: '',
                        port: '',
                        username: '',
                        password: '',
                        dbName: ''
                    },
                    isSaving: false
                },
                listStatus: {
                    isTableLoading: false,
                    list: [],
                    pagination: {
                        current: 1,
                        count: 0,
                        limit: 10
                    }
                },
                deleteStatus: {
                    showConfirmDialog: false,
                    sql: '',
                    isSaving: false,
                    deleteData: {}
                }
            }
        },
        computed: {
            projectId () {
                return this.$route.params.projectId
            },
            displayDataBaseInfos () {
                return [
                    { label: this.$t('数据库名称'), value: this.dataBaseInfo.dbName },
                    { label: this.$t('域名'), value: this.dataBaseInfo.host },
                    { label: this.$t('端口'), value: this.dataBaseInfo.port },
                    { label: this.$t('用户名'), value: this.dataBaseInfo.username }
                ]
            }
        },
        watch: {
            'dataBaseInfo.id': {
                handler () {
                    this.getTables()
                },
                immediate: true
            }
        },
        methods: {
            ...mapActions('thirdPartDB', [
                'updateDatabase'
            ]),
            ...mapActions('dataSource', [
                'list',
                'modifyOnlineDb',
                'delete'
            ]),

            handleCloseForm () {
                window.leaveConfirm = false
                this.formStatus.isShow = false
            },

            handleEditForm () {
                this.formStatus.editForm = {
                    ...this.dataBaseInfo,
                    password: ''
                }
                this.formStatus.isShow = true
            },

            async handleSubmitForm (editForm) {
                try {
                    this.formStatus.isSaving = true
                    const postData = {
                        ...editForm,
                        projectId: this.projectId,
                        password: btoa(editForm.password)
                    }
                    await this.updateDatabase(postData)
                    this.handleCloseForm()
                    this.$emit('update', postData)
                } catch (error) {
                    console.error(error)
                } finally {
                    this.formStatus.isSaving = false
                }
            },

            handlePageChange (newPage) {
                this.listStatus.pagination.current = newPage
                this.getTables()
            },

            handlePageLimitChange (limit) {
                this.listStatus.pagination.limit = limit
                this.getTables()
            },

            getTables () {
                this.listStatus.isTableLoading = true
                this.list({
                    projectId: this.projectId,
                    thirdPartDBId: this.dataBaseInfo.id,
                    pageSize: this.listStatus.pagination.limit,
                    page: this.listStatus.pagination.current,
                    dataSourceType: 'third-part'
                }).then((res) => {
                    this.listStatus.list = res.list
                    this.listStatus.pagination.count = res.count
                }).catch((err) => {
                    messageError(err.message || err)
                }).finally(() => {
                    this.listStatus.isTableLoading = false
                })
            },

            goToDataDesign (row) {
                if (row.id) {
                    this.$router.push({
                        name: 'showTable',
                        query: {
                            id: row.id,
                            thirdPartDBId: this.dataBaseInfo.id,
                            tab: 'thirdPartDB'
                        }
                    })
                } else {
                    this.$router.push({
                        name: 'createTable',
                        query: {
                            thirdPartDBId: this.dataBaseInfo.id,
                            tab: 'thirdPartDB'
                        }
                    })
                }
            },

            goToDataManage (row) {
                this.$router.push({
                    name: 'dataManage',
                    query: {
                        tableName: row?.tableName,
                        thirdPartDBId: this.dataBaseInfo.id,
                        tab: 'thirdPartDB'
                    }
                })
            },

            deleteTable (rows) {
                const ids = []
                const records = []
                rows.forEach((row) => {
                    const table = {
                        tableName: row.tableName
                    }
                    const dataParse = new DataParse([table])
                    const structJsonParser = new StructJsonParser()
                    const structSqlParser = new StructSqlParser()
                    const record = {
                        projectId: this.projectId,
                        sql: dataParse.set(structJsonParser).export(structSqlParser),
                        tableId: row.id
                    }
                    records.push(record)
                    ids.push(row.id)
                })

                this.deleteStatus.sql = records.map(x => x.sql).join('\n')
                this.deleteStatus.showConfirmDialog = true
                this.deleteStatus.deleteData = {
                    ids,
                    records,
                    thirdPartDBId: this.dataBaseInfo.id
                }
            },

            confirmDelete () {
                this.deleteStatus.isSaving = true
                const execPerviewSql = {
                    projectId: this.projectId,
                    sql: this.deleteStatus.sql,
                    thirdPartDBId: this.dataBaseInfo.id
                }
                return this.modifyOnlineDb(execPerviewSql).then(() => {
                    return this.delete(this.deleteStatus.deleteData).then(() => {
                        this.deleteStatus.showConfirmDialog = false
                        this.getTables()
                    })
                }).catch((err) => {
                    messageError(err.message || err)
                }).finally(() => {
                    this.deleteStatus.isSaving = false
                })
            },

            timeFormatter (obj, con, val) {
                return val ? dayjs(val).format('YYYY-MM-DD HH:mm:ss') : '--'
            },

            calcDisableInfo (row) {
                const result = {
                    disabled: false,
                    tips: ''
                }
                if (row.source === 'nocode') {
                    result.disabled = true
                    result.tips = window.i18n.t('表单页面自动生成的数据表不可以删除')
                }
                return result
            }
        }
    }
</script>

<style lang="postcss" scoped>
.data-base-main {
    height: 100%;
    padding: 20px 24px;
    background-color: #fafbfd;
    .data-base-section {
        background: #ffffff;
        box-shadow: 0px 2px 4px 0px rgba(25,25,41,0.05);
        padding: 16px 24px 25px;
        margin-bottom: 23px;
    }
    .section-title {
        font-weight: 700;
        text-align: left;
        color: #313238;
        line-height: 19px;
        font-size: 14px;
        margin: 0 0 12px;
        .section-btn {
            font-weight: normal;
            margin-left: 10px;
        }
    }
}
.info-database {
    .database-field {
        float: left;
        line-height: 36px;
        font-size: 12px;
        width: 260px;
        margin-right: 10px;
        display: flex;
        width: calc(50% - 10px);
    }
    .field-label {
        display: inline-block;
    }
    .field-value {
        width: calc(100% - 100px);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    &:after {
        content: '';
        display: table;
        clear: both;
    }
}
.mt-20 {
    margin-top: 20px;
}
</style>
