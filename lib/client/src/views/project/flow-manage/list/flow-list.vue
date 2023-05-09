<template>
    <div class="flow-manage-home">
        <bk-alert
            style="margin-bottom: 16px;"
            type="warning"
            title="流程设计完成后需要手动部署，预览环境方可生效；如果需要该流程在应用预发布环境或生产环境生效，需将整个应用部署至对应环境。"
            :closable="true">
        </bk-alert>
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
            v-bkloading="{ isLoading: listLoading || pageRouteListLoading }"
            class="g-hairless-table"
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
                <template slot-scope="{ row }">
                    <span v-if="row.pageId" class="link-btn" @click="handlePreviewPage(row.pageId, row.pageCode)">{{ row.pageName }}</span>
                    <span v-else style="color: #3a84ff">--</span>
                </template>
            </bk-table-column>
            <bk-table-column label="流程数据管理页" min-width="100px" property="managePageNames" show-overflow-tooltip>
                <template slot-scope="{ row }">
                    <span v-if="row.managePageIds" class="link-btn" :text="true" @click="handlePreviewPage(row.managePageIds, row.managePageCodes)">{{ row.managePageNames }}</span>
                    <span v-else style="color: #3a84ff">--</span>
                </template>
            </bk-table-column>
            <bk-table-column label="预览环境部署状态" min-width="100px">
                <template slot-scope="{ row }">
                    <div class="deploy-status">
                        <span :class="['deploy-status-icon', { 'deployed': row.deployed }]"></span>
                        {{ row.deployed ? '已部署' : '未部署' }}
                    </div>
                </template>
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
            <empty-status slot="empty" :type="emptyType" @clearSearch="handlerClearSearch"></empty-status>
        </bk-table>
        <create-flow-dialog :show.sync="isCreateDialogShow"></create-flow-dialog>
    </div>
</template>
<script>
    import dayjs from 'dayjs'
    import { mapGetters } from 'vuex'
    import { getRouteFullPath } from 'shared/route'
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
                pageRouteList: [],
                listLoading: true,
                pageRouteListLoading: true,
                pagination: {
                    current: 1,
                    count: 0,
                    limit: 10
                },
                keyword: '',
                archiveId: null,
                archivePopover: null,
                isCreateDialogShow: false,
                emptyType: 'noData'
            }
        },
        computed: {
            ...mapGetters('projectVersion', { versionId: 'currentVersionId' }),
            projectId () {
                return this.$route.params.projectId
            },
            routeMap () {
                const routeMap = {}
                this.pageRouteList.forEach((route) => {
                    const { id, pageId, layoutId } = route
                    routeMap[pageId] = {
                        id,
                        pageId,
                        layoutId,
                        fullPath: id ? getRouteFullPath(route) : null
                    }
                })
                return routeMap
            }
        },
        mounted () {
            this.getPageRouteList()
            this.getFlowList()
        },
        methods: {
            async getPageRouteList () {
                this.pageRouteListLoading = true
                const res = await this.$store.dispatch('route/query', { projectId: this.projectId, versionId: this.versionId || '' })
                this.pageRouteList = res
                this.pageRouteListLoading = false
            },
            async getFlowList () {
                this.listLoading = true
                const params = {
                    projectId: this.projectId,
                    pageSize: this.pagination.limit,
                    page: this.pagination.current
                }
                if (this.keyword) {
                    params.flowName = this.keyword.trim()
                    this.emptyType = 'search'
                } else {
                    this.emptyType = 'noData'
                }
                const res = await this.$store.dispatch('nocode/flow/getFlowList', params)
                const { list, count } = res
                this.flowList = list
                this.pagination.count = count
                this.listLoading = false
            },
            async handleArchiveConfirm () {
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
            },
            handlePreviewPage (pageId, pageCode) {
                const route = this.routeMap[pageId]
                const versionPath = `${this.versionId ? `/version/${this.versionId}` : ''}`
                const routerUrl = `/preview/project/${this.projectId}${versionPath}${route.fullPath}?pageCode=${pageCode}`
                window.open(routerUrl, '_blank')
            },
            handlerClearSearch (searchName) {
                this.keyword = searchName
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
    .deploy-status {
        display: flex;
        align-items: center;
        .deploy-status-icon {
            margin-right: 10px;
            width: 8px;
            height: 8px;
            background: #ffe8c3;
            border-radius: 50%;
            border: 1px solid #ff9c01;
            &.deployed {
                background: #e5f6ea;
                border-color: #3fc06d;
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
        cursor: pointer;
    }
</style>
