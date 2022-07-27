<template>
    <div class="generate-data-manage-page-btn">
        <bk-button
            size="small"
            :text="true"
            :disabled="!!flowConfig.deleteFlag && !flowConfig.managePageIds"
            @click="handleCreateClick">
            {{ flowConfig.managePageIds ? '编辑' : '生成' }}数据管理页
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
                    pageCode: `flowdatamanage${id}`,
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
            }
        }
    }
</script>
