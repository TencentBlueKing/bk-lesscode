<template>
    <div class="flow-manage-home">
        <bk-alert
            style="margin-bottom: 16px;"
            type="warning"
            :title="$t('流程设计完成后需要手动部署，预览环境方可生效；如果需要该流程在应用预发布环境或生产环境生效，需将整个应用部署至对应环境。')"
            :closable="true">
        </bk-alert>
        <div class="operation-area">
            <div class="btns-wrapper">
                <bk-button theme="primary" @click="isCreateDialogShow = true">{{ $t('新建') }}</bk-button>
                <bk-select
                    v-model="workbenchRelatedIds"
                    multiple
                    searchable
                    class="workbench-related-select"
                    @toggle="handleWorkbenchSelectToggle">
                    <bk-button slot="trigger" :loading="workbenchPagesLoading">{{ `${$t('关联流程工作台页')}（${workbenchPages.length}）` }}</bk-button>
                    <bk-option v-for="option in pageListOptions" :key="option.pageId" :id="option.pageId" :name="option.pageName" />
                    <div slot="extension" class="selector-extension" @click="$refs.createPageDialogRef.isShow = true">
                        <i class="bk-icon icon-plus-circle"></i>
                        {{ $t('新建关联') }}
                    </div>
                </bk-select>
            </div>
            <div class="search-wrapper">
                <bk-input
                    v-model="keyword"
                    :placeholder="$t('请输入流程名称')"
                    style="width: 360px;"
                    right-icon="bk-icon icon-search"
                    :clearable="true"
                    @change="handleKeywordChange"
                    @clear="handleSearch"
                    @enter="handleSearch">
                </bk-input>
                <div class="archived-icon" @click="$router.push({ name: 'flowTplArchivedList' })">
                    <i class="bk-drag-icon bk-drag-countdown" v-bk-tooltips="$t('已归档流程')"></i>
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
            <bk-table-column :label="$t('table_流程名称')" property="name" show-overflow-tooltip :min-width="120">
                <template slot-scope="{ row }">
                    <router-link
                        class="link-btn"
                        :to="{ name: 'flowTplCanvas', params: { projectId, tplId: row.id } }">
                        {{ row.name }}
                    </router-link>
                </template>
            </bk-table-column>
            <bk-table-column :label="$t('table_流程描述')" :render-header="renderHeaderAddTitle" property="summary" show-overflow-tooltip>
                <template slot-scope="{ row }">{{ row.summary || '--' }}</template>
            </bk-table-column>
            <bk-table-column :label="$t('table_预览环境部署状态')" :render-header="renderHeaderAddTitle" min-width="100px">
                <template slot-scope="{ row }">
                    <div class="deploy-status">
                        <span :class="['deploy-status-icon', { 'deployed': row.deployed }]"></span>
                        {{ row.deployed ? $t('已部署') : $t('未部署') }}
                    </div>
                </template>
            </bk-table-column>
            <bk-table-column :label="$t('关联流程管理页')">
                <template slot-scope="{ row }">
                    <TagsViewer
                        v-if="row.flowManagePages.length"
                        :tags="row.flowManagePages.map(item => item.name)"
                        @tagClick="handlePageClick($event, row.flowManagePages)" />
                    <template v-else>--</template>
                </template>
            </bk-table-column>
            <bk-table-column :label="$t('table_创建人')" property="createUser"></bk-table-column>
            <bk-table-column :label="$t('table_创建时间')" show-overflow-tooltip>
                <template slot-scope="{ row }">
                    {{ row.createTime | timeFormatter }}
                </template>
            </bk-table-column>
            <bk-table-column :label="$t('操作')" fixed="right" width="140">
                <template slot-scope="{ row }">
                    <router-link
                        class="link-btn"
                        :to="{ name: 'flowTplCanvas', params: { projectId, tplId: row.id } }">
                        {{ $t('编辑') }} </router-link>
                    <bk-popconfirm
                        trigger="click"
                        width="350"
                        @confirm="handleArchiveConfirm">
                        <bk-button
                            style="margin-left: 17px;"
                            theme="primary"
                            :text="true"
                            @click="archiveId = row.id">
                            {{ $t('归档') }} </bk-button>
                        <div slot="content" class="archive-tips-content">
                            <h4>{{ $t('确认归档该流程') }}</h4>
                            <p>1. {{ $t('流程归档后，将不能使用，请谨慎操作') }}</p>
                            <p>2. {{ $t('后续可通过归档列表恢复使用') }}</p>
                        </div>
                    </bk-popconfirm>
                </template>
            </bk-table-column>
            <empty-status slot="empty" :type="emptyType" @clearSearch="handlerClearSearch"></empty-status>
        </bk-table>
        <create-flow-dialog :show.sync="isCreateDialogShow"></create-flow-dialog>
        <create-page-dialog ref="createPageDialogRef" platform="PC" :use-custom-save="true" @save="handleCreateWorkbenchPageConfirm" />
    </div>
</template>
<script>
    import dayjs from 'dayjs'
    import { mapGetters } from 'vuex'
    import { getRouteFullPath } from 'shared/route'
    import { renderHeaderAddTitle } from '@/common/util'
    import { createNode } from '@/element-materials/core/static/create-node'
    import CreatePageDialog from '@/components/project/create-page-dialog.vue'
    import CreateFlowDialog from './create-flow-dialog.vue'
    import TagsViewer from '../tpl-edit/components/tags-viewer.vue'

    export default {
        name: 'flowList',
        filters: {
            timeFormatter (val) {
                return val ? dayjs(val).format('YYYY-MM-DD HH:mm:ss') : '--'
            }
        },
        components: {
            CreatePageDialog,
            CreateFlowDialog,
            TagsViewer,
        },
        data () {
            return {
                workbenchPagesLoading: false,
                workbenchPages: [],
                workbenchRelatedIds: [],
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
            ...mapGetters('project', { projectDetail: 'projectDetail' }),
            projectId () {
                return this.$route.params.projectId
            },
            pageListOptions () {
                const pageList = this.pageRouteList.slice()
                const pinToTopPages = []
                this.workbenchPages.forEach((page) => {
                    const index = pageList.findIndex(item => page.id === item.id)
                    if (index > -1) {
                        const page = pageList.splice(index, 1)[0]
                        pinToTopPages.push(page)
                    }
                })
                return [...pinToTopPages, ...pageList]
            }
        },
        mounted () {
            this.initData()
        },
        methods: {
            async initData () {
                await this.getWorkbenchPages()
                this.getPageRouteList()
                this.getFlowList()
            },
            async getWorkbenchPages () {
                this.workbenchPagesLoading = true
                this.workbenchPages = await this.$store.dispatch('flow/tpl/getRelatedWokbenchPages')
                this.workbenchRelatedIds = this.workbenchPages.map(page => page.id)
                this.workbenchPagesLoading = false
            },
            async getPageRouteList () {
                this.pageRouteListLoading = true
                this.pageRouteList = await this.$store.dispatch('route/query', { projectId: this.projectId, versionId: this.versionId || '' })
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
                    params.name = this.keyword.trim()
                    this.emptyType = 'search'
                } else {
                    this.emptyType = 'noData'
                }
                const res = await this.$store.dispatch('flow/tpl/getTplList', params)
                const { list, count } = res
                this.flowList = list
                this.pagination.count = count
                this.listLoading = false
            },
            handleWorkbenchPageClick (id) {
                window.open(`/project/${this.projectId}/page/${id}/`, '_blank')
            },
            async handleWorkbenchSelectToggle (val) {
                if (!val) {
                    const setA = new Set(this.workbenchPages.map(page => page.id));
                    const setB = new Set(this.workbenchRelatedIds);
                    const addedIds = Array.from(setB).filter(x => !setA.has(x));
                    const removedIds = Array.from(setA).filter(x => !setB.has(x));

                    if (addedIds.length === 0 && removedIds.length === 0) {
                        return
                    }

                    await this.$store.dispatch('flow/tpl/updateRelatedPages', {
                        params: {
                            versionId: this.versionId,
                            added: addedIds.reduce((acc, cur) => {
                                const config = createNode('widget-flow-workbench-container', this.projectDetail.framework).toJSON()
                                if (acc[cur]) {
                                    acc[cur].push(config)
                                } else {
                                    acc[cur] = [config]
                                }
                                return acc
                            }, {}),
                            removed: {
                                flowWorkbenchContainer: removedIds.map(pageId => ({ pageId })),
                            }
                        }
                    })
                    this.getWorkbenchPages()
                    this.$bkMessage({
                        theme: 'success',
                        message: this.$t('更新成功')
                    })
                }
            },
            async handleCreateWorkbenchPageConfirm () {
                // 新建页面弹窗点击确定按钮后的回调，新建页面后将容器组件配置更新到页面content字段
                const pageDetail = await this.$refs.createPageDialogRef.save()
                const config = createNode('widget-flow-workbench-container', this.projectDetail.framework).toJSON()
                await this.$store.dispatch('flow/tpl/updateRelatedPageContent', {
                    params: {
                        pageId: pageDetail.id,
                        content: JSON.stringify([config])
                    }
                })
                this.$refs.createPageDialogRef.isShow = false

                this.$store.dispatch('route/getProjectPageRoute', {
                    projectId: this.projectId,
                    versionId: this.versionId
                })

                this.getWorkbenchPages()

                const { href } = this.$router.resolve({ name: 'new', params: { project: this.projectId, pageId: pageDetail.id } })
                window.open(href, '_blank')
            },
            async handleArchiveConfirm () {
                const params = {
                    id: this.archiveId,
                    deleteFlag: 1
                }
                await this.$store.dispatch('flow/tpl/archiveFlowTpl', params)
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
            handlerClearSearch (searchName) {
                this.keyword = searchName
                this.getFlowList()
            },
            handlePageClick (val, pageList) {
                const page = pageList.find(page => page.name === val);
                if (page) {
                    // 新标签页打开页面编辑画布
                    window.open(`/project/${this.$route.params.projectId}/page/${page.id}/`, '_blank')
                }
            },
            renderHeaderAddTitle
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
        .btns-wrapper {
            display: flex;
            align-items: center;
            .bk-button:not(:last-child) {
                margin-right: 8px;
            }
            .workbench-related-select {
                border: none;
            }
        }
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
<style lang="postcss">
    .workbench-related-popover {
        .tippy-tooltip {
            padding: 0;
        }
        .popover-content {
            color: #313238;
            .page-list {
                max-height: 320px;
                background-color: #fff;
                overflow-y: auto;
                .page-item {
                    display: flex;
                    align-items: center;
                    padding: 0 8px 0 12px;
                    height: 32px;
                    font-size: 12px;
                    cursor: pointer;
                    &:hover {
                        background-color: #f0f5ff;
                        color: #3a84ff;
                    }
                }
            }
            .create-new-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                height: 40px;
                font-size: 12px;
                background: #fafbfd;
                border-top: 1px solid #dcdee5;
                cursor: pointer;
                &:hover {
                    color: #3a84ff;
                }
                i {
                    margin-right: 4px;
                }
            }
        }
    }
</style>
