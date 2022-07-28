<template>
    <div class="generate-data-manage-page-btn">
        <div v-if="flowConfig.managePageIds" class="manage-page-edit">
            关联的数据管理页面:
            <span class="page-name">
                {{ flowConfig.managePageNames }}
            </span>
            <bk-popover
                style="margin-left: 4px;"
                ext-cls="manage-page-popover"
                placement="bottom-end"
                :tippy-options="{ arrow: false }"
                theme="light">
                <i class="bk-drag-icon bk-drag-more-dot operate-icon"></i>
                <div slot="content" class="manage-page-actions">
                    <div class="action-item" @click="handleEditPage">编辑</div>
                    <div class="action-item" @click="handleDeletePage">删除</div>
                </div>
            </bk-popover>
        </div>
        <bk-button
            v-else
            size="small"
            :text="true"
            :disabled="!!flowConfig.deleteFlag"
            @click="handleCreateClick">
            生成数据管理页
        </bk-button>
        <create-page-dialog
            ref="createPageDialog"
            platform="PC"
            nocode-type="FLOW_MANAGE"
            :init-page-data="pageData"
            @save="handleCreatePageConfirm">
        </create-page-dialog>
    </div>
</template>
<script>
    import { mapState } from 'vuex'
    import dayjs from 'dayjs'
    import { messageError } from '@/common/bkmagic'
    import CreatePageDialog from '@/components/project/create-page-dialog.vue'

    export default {
        name: 'GenerateDataManagePage',
        components: {
            CreatePageDialog
        },
        computed: {
            ...mapState('nocode/flow', ['flowConfig']),
            pageData () {
                const { id, flowName } = this.flowConfig
                return {
                    flowId: id,
                    pageCode: `flowdatamanage${id}${dayjs().format('HHmmss')}`,
                    pageName: `${flowName}_流程数据管理页面`
                }
            },
            projectId () {
                return this.$route.params.projectId
            }
        },
        methods: {
            // 更新流程数据管理页id
            updateDataManageId (id) {
                const params = {
                    managePageIds: id,
                    id: this.flowConfig.id
                }
                return this.$store.dispatch('nocode/flow/editFlow', params)
            },
            handleCreateClick () {
                if (this.flowConfig.managePageIds) {
                    const route = this.$router.resolve({
                        name: 'editNocode',
                        params: {
                            projectId: this.projectId,
                            pageId: this.flowConfig.managePageIds
                        }
                    })
                    window.open(route.href, '__blank')
                } else {
                    this.$refs.createPageDialog.isShow = true
                }
            },
            async handleCreatePageConfirm () {
                try {
                    const pageId = await this.$refs.createPageDialog.save()
                    if (typeof pageId === 'number') {
                        this.$store.commit('nocode/flow/setFlowConfig', { managePageIds: pageId })
                        await this.updateDataManageId(pageId)
                        this.$bkMessage({
                            theme: 'success',
                            message: '新建页面成功'
                        })
                        this.$router.push({
                            name: 'editNocode',
                            params: {
                                projectId: this.projectId,
                                pageId
                            }
                        })
                    }
                } catch (e) {
                    messageError(e.message || e)
                }
            },
            handleEditPage () {
                const route = this.$router.resolve({
                    name: 'editNocode',
                    params: {
                        projectId: this.projectId,
                        pageId: this.flowConfig.managePageIds
                    }
                })
                window.open(route.href, '__blank')
            },
            handleDeletePage () {
                this.$bkInfo({
                    width: 422,
                    extCls: 'delete-page-dialog',
                    title: '确认删除该流程数据管理页？',
                    theme: 'danger',
                    confirmFn: async () => {
                        await this.$store.dispatch('page/delete', {
                            pageId: this.flowConfig.managePageIds
                        })
                        await this.$store.dispatch('nocode/flow/editFlow', { id: this.flowConfig.id, managePageIds: null })
                        this.$store.commit('nocode/flow/setFlowConfig', { managePageIds: null })
                        this.$bkMessage({
                            theme: 'success',
                            message: '删除数据管理页成功'
                        })
                    }
                })
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .generate-data-manage-page-btn {
        display: flex;
        align-items: center;
        height: 100%;
    }
    .manage-page-edit {
        display: flex;
        align-items: center;
        height: 100%;
        font-size: 12px;
        .page-name {
            margin-left: 4px;
            max-width: 200px;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
            color: #3a84ff;
        }
    }
    .operate-icon {
        color: #63656e;
        cursor: pointer;
        &:hover {
            color: #3a84ff;
        }
    }
</style>
<style lang="postcss">
    .manage-page-popover {
        .tippy-tooltip {
            padding: 0;
        }
        .manage-page-actions {
            padding: 4px 0;
            width: 58px;
            .action-item {
                padding: 0 12px;
                line-height: 32px;
                color: #636563;
                cursor: pointer;
                &:hover {
                    color: #3a84ff;
                    background: #e1ecff;
                }
            }
        }
    }
</style>
