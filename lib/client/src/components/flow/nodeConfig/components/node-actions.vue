<template>
    <div class="actions-wrapper">
        <bk-button
            v-if="showCreatePageBtn"
            theme="primary"
            :loading="createPagePending"
            :disabled="loading || savePending"
            @click="handleSaveClick(true)">
            {{ $t('保存并生成提单页') }} </bk-button>
        <bk-button
            :theme="showCreatePageBtn ? 'default' : 'primary'"
            :loading="savePending"
            :disabled="loading || createPagePending"
            @click="handleSaveClick(false)">
            {{ $t('保存') }} </bk-button>
        <create-page-dialog
            ref="createPageDialog"
            platform="PC"
            nocode-type="FLOW"
            :init-page-data="pageData"
            @save="handleCreatePageConfirm">
        </create-page-dialog>
    </div>
</template>
<script>
    import cloneDeep from 'lodash.clonedeep'
    import dayjs from 'dayjs'
    import { mapState, mapGetters } from 'vuex'
    import { METHODS_WITHOUT_DATA } from 'shared/api'
    import CreatePageDialog from '@/components/project/create-page-dialog.vue'

    export default {
        name: 'NodeActions',
        components: {
            CreatePageDialog
        },
        props: {
            loading: Boolean,
            serviceData: {
                type: Object,
                default: () => ({})
            }
        },
        data () {
            return {
                createPagePending: false,
                savePending: false
            }
        },
        computed: {
            ...mapGetters('projectVersion', { versionId: 'currentVersionId' }),
            ...mapState('nocode/nodeConfig', ['nodeData', 'formConfig', 'initialFieldIds']),
            ...mapState('nocode/flow', ['flowConfig']),
            projectId () {
                return this.$route.params.projectId
            },
            // 第一个提单节点并且未生成提单页
            showCreatePageBtn () {
                return this.nodeData.is_first_state && this.nodeData.type === 'NORMAL' && !this.flowConfig.pageId
            },
            pageData () {
                const { id: formId } = this.formConfig
                const { id: flowId } = this.flowConfig
                return {
                    formId,
                    flowId,
                    pageCode: `flowpage${this.flowConfig.id}${dayjs().format('HHmmss')}`,
                    pageName: this.$t('{0}_提单页面', [this.flowConfig.flowName])
                }
            }
        },
        methods: {
            // 更新itsm节点数据
            updateItsmNode () {
                const data = cloneDeep(this.nodeData)
                // 流程服务校验desc字段不为空，节点上没有可配置desc的地方，故先删除
                delete data.desc
                data.is_draft = false
                if (data.type === 'APPROVAL') {
                    if (!data.is_multi) {
                        data.finish_condition = {}
                    }
                } else if (data.type === 'TASK') {
                    if (METHODS_WITHOUT_DATA.includes(data.extras.api_info.method)) {
                        data.extras.api_info.body = {
                            children: [],
                            code: '',
                            showChildren: true,
                            valueType: 'value'
                        }
                    } else {
                        data.extras.api_info.query = []
                    }
                }
                return this.$store.dispatch('nocode/flow/updateNode', data)
            },
            async handleSaveClick (createPage = false) {
                try {
                    const result = await this.$parent.validate()
                    if (!result) {
                        return
                    }
                    if (createPage) {
                        this.createPagePending = true
                        this.$refs.createPageDialog.isShow = true
                        return
                    }
                    this.savePending = true
                    await this.updateItsmNode()
                    await this.$store.dispatch('nocode/flow/editFlow', { id: this.flowConfig.id, deployed: 0 })
                    this.$store.commit('nocode/flow/setFlowConfig', { deployed: 0 })
                    this.$store.commit('nocode/nodeConfig/setNodeDataChangeStatus', false)

                    this.$bkMessage({
                        message: this.$t('节点保存成功'),
                        theme: 'success'
                    })
                } catch (e) {
                    console.error(e || e.message)
                } finally {
                    this.createPagePending = false
                    this.savePending = false
                }
            },
            // 创建提单页
            async handleCreatePageConfirm () {
                try {
                    const pageData = await this.$refs.createPageDialog.save()
                    if (pageData) {
                        this.$store.commit('nocode/flow/setFlowConfig', { pageId: pageData.id })
                        await this.$store.dispatch('nocode/flow/editFlow', { id: this.flowConfig.id, pageId: pageData.id, deployed: 0 })
                        this.$store.commit('nocode/flow/setFlowConfig', { deployed: 0 })
                        this.$store.commit('nocode/nodeConfig/setNodeDataChangeStatus', false)
                        this.$store.commit('nocode/nodeConfig/setCreateTicketPageData', pageData)
                        this.$refs.createPageDialog.isShow = false
                        await this.updateItsmNode()
                        this.$bkMessage({
                            message: this.$t('节点保存并创建提单页成功'),
                            theme: 'success'
                        })
                    }
                } catch (e) {
                    console.error(e || e.message)
                } finally {
                    this.createPagePending = false
                }
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .bk-button {
        margin-right: 4px;
        min-width: 88px;
    }
</style>
