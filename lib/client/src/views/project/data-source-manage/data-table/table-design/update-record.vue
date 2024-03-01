<template>
    <article>
        <render-header>
            <span class="table-header">
                <i class="bk-drag-icon bk-drag-arrow-back" @click="goBack"></i>
                {{ $t('表结构变更记录') }} </span>
        </render-header>

        <main class="table-main">
            <bk-date-picker
                class="mr10 filter-item"
                :placeholder="$t('选择日期范围')"
                type="datetimerange"
                v-model="recordStatus.timeRange"
                @change="getRecordList"
            ></bk-date-picker>
            <bk-input
                clearable
                class="filter-item"
                :placeholder="$t('输入执行人员')"
                right-icon="bk-icon icon-search"
                v-model="recordStatus.createUser"
                @change="getRecordList"
            ></bk-input>

            <bk-table
                class="record-table g-hairless-table"
                v-bkloading="{ isLoading: recordStatus.isLoading }"
                :outer-border="false"
                :data="recordStatus.list"
                :header-border="false"
                :header-cell-style="{ background: '#f0f1f5' }"
            >
                <bk-table-column :label="$t('table_变更时间')" prop="createTime" show-overflow-tooltip :formatter="timeFormatter"></bk-table-column>
                <bk-table-column :label="$t('table_执行人员')" prop="createUser"></bk-table-column>
                <bk-table-column :label="$t('table_变更内容')" prop="sql" show-overflow-tooltip>
                    <template slot-scope="props">
                        <bk-button :text="true" title="primary" @click="showSql(props.row.sql)">{{ $t('查看') }}</bk-button>
                    </template>
                </bk-table-column>
                <empty-status slot="empty" :type="emptyType" @clearSearch="handlerClearSearch"></empty-status>
            </bk-table>
        </main>

        <confirm-dialog
            :is-show.sync="recordStatus.showConfirmDialog"
            :sql="recordStatus.sql"
            :title="$t('变更详情')"
            :tips="thirdPartDBId ? $t('变更的 SQL 详情：') : ''"
        ></confirm-dialog>
    </article>
</template>

<script lang="ts">
    import {
        defineComponent,
        onBeforeMount,
        reactive,
        ref
    } from '@vue/composition-api'
    import {
        messageError
    } from '@/common/bkmagic'
    import router from '@/router'
    import store from '@/store'
    import dayjs from 'dayjs'
    import renderHeader from '../common/header'
    import confirmDialog from '../common/confirm-dialog.vue'

    export default defineComponent({
        components: {
            renderHeader,
            confirmDialog
        },

        setup () {
            const recordStatus = reactive({
                list: [],
                isLoading: false,
                timeRange: [],
                createUser: '',
                showConfirmDialog: false,
                sql: ''
            })
            const emptyType = ref('noData')
            const id = router?.currentRoute?.query?.id
            const thirdPartDBId = router?.currentRoute?.query?.thirdPartDBId
            const projectId = router?.currentRoute?.params?.projectId

            const goBack = () => {
                router.back()
            }

            const timeFormatter = (obj, con, val) => {
                return val ? dayjs(val).format('YYYY-MM-DD HH:mm:ss') : ''
            }

            const showSql = (sql) => {
                recordStatus.showConfirmDialog = true
                recordStatus.sql = sql
            }

            const getRecordList = () => {
                recordStatus.isLoading = true
                emptyType.value = (recordStatus.timeRange.length > 0 || recordStatus.createUser) ? 'search' : 'noData'
                const filterData = {
                    id,
                    timeRange: recordStatus.timeRange.map(x => timeFormatter(null, null, x)),
                    createUser: recordStatus.createUser,
                    projectId: projectId
                }
                store.dispatch('dataSource/tableRecordList', filterData).then((data) => {
                    recordStatus.list = data
                }).catch((error) => {
                    messageError(error.message || error)
                }).finally(() => {
                    recordStatus.isLoading = false
                })
            }
            const handlerClearSearch = () => {
                recordStatus.createUser = ''
                recordStatus.timeRange = []
                emptyType.value = 'noData'
                getRecordList()
            }

            onBeforeMount(getRecordList)

            return {
                recordStatus,
                emptyType,
                thirdPartDBId,
                goBack,
                timeFormatter,
                showSql,
                getRecordList,
                handlerClearSearch
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
        .filter-item {
            width: 400px;
        }
        .record-table {
            margin-top: 16px;
        }
    }
</style>
