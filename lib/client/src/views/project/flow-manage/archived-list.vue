<template>
    <div class="flow-archived-list">
        <header class="breadcrumbs">
            <div class="header-content">
                <i class="bk-drag-icon bk-drag-arrow-back" @click="$router.push({ name: 'flowList' })"></i>
                流程归档列表
            </div>
        </header>
        <main class="archived-list-content">
            <div class="search-wrapper">
                <bk-input
                    v-model="keyword"
                    style="width: 360px;"
                    placeholder="请输入流程名称"
                    right-icon="icon-search"
                    :clearable="true"
                    @change="handleKeywordChange"
                    @clear="handleSearch"
                    @enter="handleSearch">
                </bk-input>
            </div>
            <bk-table
                v-bkloading="{ isLoading: listLoading }"
                :data="flowList"
                :pagination="pagination"
                :outer-border="false"
                :header-border="false"
                :header-cell-style="{ background: '#f0f1f5' }"
                @page-change="handlePageChange"
                @page-limit-change="handlePageLimitChange">
                <bk-table-column label="流程名称" property="flowName" show-overflow-tooltip :min-width="120">
                    <template slot-scope="{ row }">
                        <router-link
                            class="link-btn"
                            :to="{ name: 'flowConfig', params: { projectId, flowId: row.id } }">
                            {{ row.flowName }}
                        </router-link>
                    </template>
                </bk-table-column>
                <bk-table-column label="流程描述" property="summary" show-overflow-tooltip></bk-table-column>
                <bk-table-column label="流程表单页">--</bk-table-column>
                <bk-table-column label="流程数据管理页">--</bk-table-column>
                <bk-table-column label="创建人" property="createUser"></bk-table-column>
                <bk-table-column label="创建时间" show-overflow-tooltip>
                    <template slot-scope="{ row }">
                        {{ row.createTime | timeFormatter }}
                    </template>
                </bk-table-column>
                <bk-table-column label="操作" width="140">
                    <template slot-scope="{ row }">
                        <bk-button
                            style="margin-left: 17px;"
                            theme="primary"
                            :text="true"
                            @click="handleRestoreClick(row.id, $event)">
                            恢复
                        </bk-button>
                    </template>
                </bk-table-column>
            </bk-table>
        </main>
    </div>
</template>
<script>
    import dayjs from 'dayjs'
    import { messageError } from '@/common/bkmagic'

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
                pagination: {
                    current: 1,
                    count: 0,
                    limit: 10
                }
            }
        },
        computed: {
            projectId () {
                return this.$route.params.projectId
            },
            versionId () {
                return this.$store.state.projectVersion.currentVersion.id
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
                    versionId: this.versionId,
                    pageSize: this.pagination.limit,
                    page: this.pagination.current,
                    deleteFlag: 0
                }
                if (this.keyword) {
                    params.flowName = this.keyword.trim()
                }
                try {
                    const res = await this.$store.dispatch('nocode/flow/getFlowList', params)
                    const { list, count } = res
                    this.flowList = list
                    this.pagination.count = count
                } catch (err) {
                    messageError(err.message || err)
                } finally {
                    this.listLoading = false
                }
            },
            handleRestoreClick () {},
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
            }
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
