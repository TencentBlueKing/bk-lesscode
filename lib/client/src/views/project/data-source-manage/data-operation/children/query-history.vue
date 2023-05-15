<template>
    <bk-table
        v-bkloading="{ isLoading }"
        class="mt20 g-hairless-table"
        :outer-border="false"
        :header-border="false"
        :header-cell-style="{ background: '#f0f1f5' }"
        :data="data"
        :pagination="pagination"
        @row-mouse-enter="handRowMouseEnter"
        @row-mouse-leave="handRowMouseLeave"
        @page-change="handlePageChange"
        @page-limit-change="handlePageLimitChange"
    >
        <bk-table-column
            :label="$t('table_查询时间')"
            prop="createTime"
            width="170"
            :formatter="timeFormatter"
        />
        <bk-table-column
            :label="$t('状态')"
            prop="status"
            width="100"
        >
            <template slot-scope="props">
                <span v-if="+props.row.status === 0" class="query-status success">{{ $t('成功') }}</span>
                <span v-else class="query-status failed">{{ $t('失败') }}</span>
            </template>
        </bk-table-column>
        <bk-table-column
            :label="$t('table_耗时')"
            prop="spendTime"
            :width="$store.state.Language ? 130 : 100"
            :formatter="spendTimeFormatter"
        />
        <bk-table-column
            :label="$t('table_数据源')"
            prop="dataSourceType"
            width="150"
            :formatter="dataSourceTypeFormatter"
        />
        <bk-table-column
            :label="$t('table_查询描述')"
            prop="condition"
            width="140"
            show-overflow-tooltip
            :formatter="conditionFormatter"
        />
        <bk-table-column
            label="SQL"
            prop="sql"
            show-overflow-tooltip
        />
        <bk-table-column
            show-overflow-tooltip
            :label="$t('table_异常信息')"
            min-width="160"
        >
            <template slot-scope="props">
                <span>{{ props.row.message || '--' }}</span>
                <bk-button
                    :class="{
                        'history-load': true,
                        show: currentHoverRowId === props.row.id
                    }"
                    size="small"
                    theme="primary"
                    @click="handleLoad(props.row)"
                >
                    {{ $t('重新加载') }} </bk-button>
            </template>
        </bk-table-column>
        <empty-status slot="empty"></empty-status>
    </bk-table>
</template>

<script>
    import store from '@/store'
    import dayjs from 'dayjs'
    import {
        defineComponent,
        onBeforeMount,
        ref
    } from '@vue/composition-api'
    import {
        transMs2Time
    } from 'shared/util'

    export default defineComponent({
        setup (_, { emit }) {
            const isLoading = ref(false)
            const pagination = ref({
                current: 1,
                limit: 10,
                count: 0
            })
            const data = ref([])
            const currentHoverRowId = ref('')

            const getHistory = () => {
                isLoading.value = true
                store
                    .dispatch('dataSource/getQueryHistory', {
                        page: pagination.value.current,
                        pageSize: pagination.value.limit
                    })
                    .then(({ list, count }) => {
                        data.value = list
                        pagination.value.count = count
                    })
                    .finally(() => {
                        isLoading.value = false
                    })
            }

            const handRowMouseEnter = (index, event, row) => {
                currentHoverRowId.value = row.id
            }

            const handRowMouseLeave = () => {
                currentHoverRowId.value = ''
            }

            const handlePageChange = (current) => {
                pagination.value.current = current
                getHistory()
            }

            const handlePageLimitChange = (limit) => {
                pagination.value.limit = limit
                getHistory()
            }

            const handleLoad = (row) => {
                emit('load', {
                    type: row.type,
                    condition: JSON.parse(JSON.stringify(row.condition)),
                    sql: row.sql,
                    dataSourceType: row.dataSourceType
                })
            }

            // 格式化
            const showIfNotEmpty = (value, suffix) => {
                return value > 0 ? value + suffix : ''
            }

            const spendTimeFormatter = (row, column, cellValue, index) => {
                const time = transMs2Time(cellValue)
                const value = showIfNotEmpty(time.h, 'h') + showIfNotEmpty(time.m, 'm') + showIfNotEmpty(time.s, 's') + showIfNotEmpty(time.ms, 'ms')
                return value || '--'
            }

            const conditionFormatter = (row, column, cellValue, index) => {
                return cellValue ? JSON.stringify(cellValue) : '--'
            }

            const timeFormatter = (row, column, cellValue, index) => {
                return cellValue ? dayjs(cellValue).format('YYYY-MM-DD HH:mm:ss') : '--'
            }

            const dataSourceTypeFormatter = (row, column, cellValue, index) => {
                return cellValue === 'bk-base' ? window.i18n.t('BkBase 结果表') : window.i18n.t('Mysql 数据表')
            }

            onBeforeMount(getHistory)

            return {
                isLoading,
                pagination,
                data,
                currentHoverRowId,
                handRowMouseEnter,
                handRowMouseLeave,
                handlePageChange,
                handlePageLimitChange,
                handleLoad,
                spendTimeFormatter,
                conditionFormatter,
                timeFormatter,
                dataSourceTypeFormatter
            }
        }
    })
</script>

<style lang="postcss" scoped>
    .mt20 {
        margin-top: 20px;
    }
    .query-status {
        &:before {
            content: '';
            display: inline-block;
            width: 6px;
            height: 6px;
            border-radius: 100%;
            margin-right: 6px;
        }
        &.failed:before {
            background: #FFE6E6;
            border: 1px solid #EA3636;
        }
        &.success:before {
            background: #E5F6EA;
            border: 1px solid #3FC06D;
        }
    }
    .history-load {
        display: none;
        position: absolute;
        top: 8px;
        right: 5px;
        &.show {
            display: block
        }
    }
</style>
