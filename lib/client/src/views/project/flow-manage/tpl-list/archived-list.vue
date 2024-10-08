<template>
    <div class="flow-archived-list">
        <header class="breadcrumbs">
            <div class="header-content">
                <i class="bk-drag-icon bk-drag-arrow-back" @click="$router.push({ name: 'flowTplList' })"></i>
                {{ $t('流程归档列表') }} </div>
        </header>
        <main class="archived-list-content">
            <div class="search-wrapper">
                <bk-input
                    v-model="keyword"
                    style="width: 360px;"
                    :placeholder="$t('请输入流程名称')"
                    right-icon="icon-search"
                    :clearable="true"
                    @change="handleKeywordChange"
                    @clear="handleSearch"
                    @enter="handleSearch">
                </bk-input>
            </div>
            <bk-table
                v-bkloading="{ isLoading: listLoading }"
                class="g-hairless-table"
                :data="flowList"
                :pagination="pagination"
                :outer-border="false"
                :header-border="false"
                :header-cell-style="{ background: '#f0f1f5' }"
                @page-change="handlePageChange"
                @page-limit-change="handlePageLimitChange">
                <bk-table-column :label="$t('table_流程名称')" property="name" show-overflow-tooltip :min-width="120">
                    <template slot-scope="{ row }">
                        <span>{{ row.name }}</span>
                    </template>
                </bk-table-column>
                <bk-table-column :label="$t('table_流程描述')" property="summary" show-overflow-tooltip :min-width="100">
                    <template slot-scope="{ row }">{{ row.summary || '--' }}</template>
                </bk-table-column>
                <bk-table-column :label="$t('table_创建人')" property="createUser"></bk-table-column>
                <bk-table-column :label="$t('table_创建时间')" show-overflow-tooltip>
                    <template slot-scope="{ row }">
                        {{ row.createTime | timeFormatter }}
                    </template>
                </bk-table-column>
                <bk-table-column :label="$t('操作')" width="140">
                    <template slot-scope="{ row }">
                        <bk-popconfirm
                            trigger="click"
                            width="350"
                            :title="$t('确认恢复改流程')"
                            @confirm="handleRestoreConfirm">
                            <bk-button
                                theme="primary"
                                :text="true"
                                @click="restoreId = row.id">
                                {{ $t('恢复') }} </bk-button>
                        </bk-popconfirm>
                    </template>
                </bk-table-column>
                <empty-status slot="empty" :type="emptyType" @clearSearch="handlerClearSearch"></empty-status>
            </bk-table>
        </main>
    </div>
</template>
<script>
    import dayjs from 'dayjs'
    import { messageError } from '@/common/bkmagic'
    import { renderHeaderAddTitle } from '@/common/util'

    export default {
        name: 'ArchivedList',
        filters: {
            timeFormatter (val) {
                return val ? dayjs(val).format('YYYY-MM-DD HH:mm:ss') : '--'
            }
        },
        data () {
            return {
                flowList: [],
                listLoading: false,
                keyword: '',
                restoreId: '',
                pagination: {
                    current: 1,
                    count: 0,
                    limit: 10
                },
                emptyType: 'noData'
            }
        },
        computed: {
            projectId () {
                return this.$route.params.projectId
            }
        },
        mounted () {
            this.getFlowList()
        },
        methods: {
            async getFlowList () {
                this.listLoading = true
                const params = {
                    projectId: this.projectId,
                    pageSize: this.pagination.limit,
                    page: this.pagination.current,
                    deleteFlag: 1
                }
                if (this.keyword) {
                    params.name = this.keyword.trim()
                    this.emptyType = 'search'
                } else {
                    this.emptyType = 'noData'
                }
                try {
                    const res = await this.$store.dispatch('flow/tpl/getTplList', params)
                    const { list, count } = res
                    this.flowList = list
                    this.pagination.count = count
                } catch (err) {
                    messageError(err.message || err)
                } finally {
                    this.listLoading = false
                }
            },
            async handleRestoreConfirm () {
                try {
                    const params = {
                        id: this.restoreId,
                        deleteFlag: 0
                    }
                    await this.$store.dispatch('flow/tpl/archiveFlowTpl', params)
                    this.restoreId = ''
                    if (this.flowList.length === 1 && this.pagination.current > 1) {
                        this.pagination.current -= 1
                    }
                    this.getFlowList()
                } catch (e) {
                    messageError(e.message || e)
                }
            },
            handlePageChange (val) {
                this.pagination.current = val
                this.getFlowList()
            },
            handlePageLimitChange (val) {
                this.pagination.current = 1
                this.pagination.limit = val
                this.getFlowList()
            },
            // 删除搜索关键字
            handleKeywordChange (val) {
                if (!val) {
                    this.handleSearch()
                }
            },
            handleSearch () {
                this.pagination.current = 1
                this.getFlowList()
            },
            handlerClearSearch () {
                this.keyword = ''
                this.handleSearch()
            },
            renderHeaderAddTitle
        }
    }
</script>
<style lang="postcss" scoped>
    .flow-archived-list {}
    .header-content {
        display: flex;
        align-items: center;
        font-size: 16px;
        color: #313238;
        i {
            margin-right: 10px;
            font-size: 14px;
            color: #3a84ff;
            cursor: pointer;
        }
    }
    .archived-list-content {
        padding: 20px 24px;
    }
    .search-wrapper {
        margin-bottom: 16px;
    }
    .link-btn {
        color: #3a84ff;
    }
</style>
