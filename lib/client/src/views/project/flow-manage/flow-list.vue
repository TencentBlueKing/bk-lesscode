<template>
    <div class="flow-manage-home">
        <div class="operation-area">
            <bk-button theme="primary" @click="isCreateDialogShow = true">新建</bk-button>
            <div class="search-wrapper">
                <bk-input
                    v-model="keyword"
                    placeholder="请输入流程名称"
                    style="width: 360px;"
                    right-icon="bk-icon icon-search"
                    :clearable="true"
                    @change="handleKeywordChange"
                    @clear="handleSearch"
                    @enter="handleSearch">
                </bk-input>
                <div class="archived-icon" @click="$router.push({ name: 'flowArchivedList' })">
                    <i class="bk-drag-icon bk-drag-countdown" v-bk-tooltips="'已归档流程'"></i>
                </div>
            </div>
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
            <bk-table-column label="流程描述" property="summary" show-overflow-tooltip>
                <template slot-scope="{ row }">{{ row.summary || '--' }}</template>
            </bk-table-column>
            <bk-table-column label="流程表单页" property="pageName" show-overflow-tooltip>
                <template slot-scope="{ row }">{{ row.pageName || '--' }}</template>
            </bk-table-column>
            <bk-table-column label="流程数据管理页" property="managePageNames" show-overflow-tooltip>
                <template slot-scope="{ row }">{{ row.managePageNames || '--' }}</template>
            </bk-table-column>
            <bk-table-column label="创建人" property="createUser"></bk-table-column>
            <bk-table-column label="创建时间" show-overflow-tooltip>
                <template slot-scope="{ row }">
                    {{ row.createTime | timeFormatter }}
                </template>
            </bk-table-column>
            <bk-table-column label="操作" width="140">
                <template slot-scope="{ row }">
                    <router-link
                        class="link-btn"
                        :to="{ name: 'flowConfig', params: { projectId, flowId: row.id } }">
                        编辑
                    </router-link>
                    <bk-popconfirm
                        trigger="click"
                        width="350"
                        @confirm="handleArchiveConfirm">
                        <bk-button
                            style="margin-left: 17px;"
                            theme="primary"
                            :text="true"
                            @click="archiveId = row.id">
                            归档
                        </bk-button>
                        <div slot="content" class="archive-tips-content">
                            <h4>确认归档该流程？</h4>
                            <p>1. 流程归档后，将不能使用，流程的提单页面将会被删除，请谨慎操作！</p>
                            <p>2. 后续可通过归档列表恢复使用。</p>
                        </div>
                    </bk-popconfirm>
                </template>
            </bk-table-column>
        </bk-table>
        <create-flow-dialog :show.sync="isCreateDialogShow"></create-flow-dialog>
    </div>
</template>
<script>
    import dayjs from 'dayjs'
    import { messageError } from '@/common/bkmagic'
    import CreateFlowDialog from './create-flow-dialog.vue'

    export default {
        name: 'flowList',
        filters: {
            timeFormatter (val) {
                return val ? dayjs(val).format('YYYY-MM-DD HH:mm:ss') : '--'
            }
        },
        components: {
            CreateFlowDialog
        },
        data () {
            return {
                flowList: [],
                listLoading: true,
                pagination: {
                    current: 1,
                    count: 0,
                    limit: 10
                },
                keyword: '',
                archiveId: null,
                archivePopover: null,
                isCreateDialogShow: false
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
                    page: this.pagination.current
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
            async handleArchiveConfirm () {
                try {
                    const params = {
                        id: this.archiveId,
                        deleteFlag: 1
                    }
                    await this.$store.dispatch('nocode/flow/archiveFlow', params)
                    this.archiveId = ''
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
            handleSearch (val) {
                this.pagination.current = 1
                this.getFlowList()
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .flow-manage-home {
        padding: 16px 24px;
        height: 100%;
    }
    .operation-area {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
    }
    .search-wrapper {
        display: flex;
        align-items: center;
        .archived-icon {
            margin-left: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            background: #ffffff;
            border: 1px solid #c4c6cc;
            border-radius: 2px;
            cursor: pointer;
            &:hover {
                i {
                    color: #3a84ff;
                }
            }
            i {
                font-size: 14px;
                transform: rotateY(180deg);
                color: #63656e;
            }
        }
    }
    .archive-tips-content {
        h4 {
            margin: 0 0 10px;
            font-size: 16px;
            font-weight: normal;
            color: #313238;
        }
        p {
            color: #63656e;
            font-size: 12px;
            &:last-child {
                margin-bottom: 16px;
            }
        }
    }
    .link-btn {
        color: #3a84ff;
    }
</style>
