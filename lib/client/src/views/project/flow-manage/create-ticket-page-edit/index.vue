<template>
    <div v-bkloading="{ isLoading: loading }" class="create-ticket-page-edit">
        <edit-form-panel
            v-if="!loading"
            :workflow-id="serviceData.workflow_id"
            @save="deployFlow"
            @back="handleBack"
            @backToNode="handleBackToNode"
            @backToFlow="handleBackToFlow">
        </edit-form-panel>
    </div>
</template>
<script>
    import { mapState, mapGetters } from 'vuex'
    import EditFormPanel from '@/components/flow/nodeConfig/nodes/normal-node/node-form-setting/edit-form-panel.vue'
    import { syncVariableValue } from '@/views/index/components/utils'

    export default {
        name: 'createTicketPageEdit',
        components: {
            EditFormPanel
        },
        data () {
            return {
                loading: true,
                serviceData: {}
            }
        },
        computed: {
            ...mapState('nocode/flow', ['flowConfig']),
            ...mapState('nocode/nodeConfig', ['nodeData', 'formConfig', 'initialFieldIds']),
            ...mapGetters('projectVersion', { versionId: 'currentVersionId' }),
            projectId () {
                return this.$route.params.projectId
            },
            flowId () {
                return this.$route.params.flowId
            }
        },
        async mounted () {
            this.loading = true
            // 获取流程配置
            const flowConfig = await this.$store.dispatch('nocode/flow/getFlowData', { id: this.flowId })
            this.$store.commit('nocode/flow/setFlowConfig', flowConfig)
            // 获取存到itsm的流程配置
            this.serviceData = await this.$store.dispatch('nocode/flow/getServiceData', this.flowConfig.itsmId)
            // 获取页面详情数据
            await Promise.all([this.getPageDetail(), this.getNodeDetail(), this.getFormDetail()])
            this.loading = false
        },
        beforeDestroy () {
            this.$store.commit('nocode/flow/clearFlowConfig')
            this.$store.commit('page/setPageDetail', {})
            this.$store.commit('layout/setPageLayout', {})
            this.$store.commit('nocode/nodeConfig/clearNodeConfigData')
        },
        methods: {
            // 加载页面编辑数据
            async getPageDetail () {
                const [pageDetail, functionData] = await Promise.all([
                    this.$store.dispatch('page/detail', { pageId: this.flowConfig.pageId }),
                    this.$store.dispatch('functions/getAllGroupAndFunction', {
                        projectId: this.projectId,
                        versionId: this.versionId
                    }),
                    this.$store.dispatch('layout/getPageLayout', { pageId: this.flowConfig.pageId }),
                    this.$store.dispatch('route/getProjectPageRoute', { projectId: this.projectId, versionId: this.versionId }),
                    this.$store.dispatch('page/getPageSetting', {
                        pageId: this.flowConfig.pageId,
                        projectId: this.projectId,
                        versionId: this.versionId
                    })
                ])

                const variableList = await this.$store.dispatch('variable/getAllVariable', {
                    projectId: this.projectId,
                    pageCode: pageDetail.pageCode,
                    versionId: this.versionId,
                    effectiveRange: 0
                })

                this.$store.commit('page/setPageDetail', pageDetail || {})
                this.$store.commit('functions/setFunctionData', functionData)
                syncVariableValue(pageDetail.content, variableList)
            },
            // 获取节点配置详情
            async getNodeDetail () {
                const resp = await this.$store.dispatch('nocode/flow/getNodeConfig', this.serviceData.first_state_id)
                const { id, type } = resp.extras.formConfig
                this.$store.commit('nocode/nodeConfig/setNodeData', resp)
                this.$store.commit('nocode/nodeConfig/setFormConfig', { id, type })
            },
            // 获取表单详情
            async getFormDetail () {
                const formIds = JSON.parse(this.flowConfig.formIds)
                const id = formIds[this.serviceData.first_state_id]
                const data = await this.$store.dispatch('nocode/form/formDetail', { formId: id })
                const content = JSON.parse(data.content).map(item => {
                    return { ...item, disabled: true }
                })
                const { tableName: code, formName } = data

                this.$store.commit('nocode/nodeConfig/setFormConfig', { content, code, formName })
                this.$store.commit('nocode/nodeConfig/setInitialFieldIds', content)
            },
            // 部署流程
            // 流程提单页编辑保存时，调用部署接口，流程接口不合法则提示用户回到流程编辑界面修改
            async deployFlow () {
                const {
                    is_supervise_needed, notify, notify_freq, notify_rule, revoke_config, supervise_type, supervisor
                } = this.serviceData
                const data = {
                    can_ticket_agency: false,
                    display_type: 'INVISIBLE',
                    workflow_config: {
                        is_supervise_needed,
                        notify,
                        notify_freq,
                        notify_rule,
                        revoke_config,
                        supervise_type,
                        supervisor,
                        is_revocable: this.serviceData.revoke_config.type !== 0,
                        is_auto_approve: false
                    }
                }
                await this.$store.dispatch('nocode/flow/updateServiceData', { id: this.flowConfig.itsmId, data })
                await this.$store.dispatch('nocode/flow/deployFlow', this.flowConfig.itsmId)
                await this.$store.dispatch('nocode/flow/editFlow', { id: this.flowConfig.id, deployed: 1 })
                this.$store.commit('nocode/flow/setFlowConfig', { deployed: 1 })
                this.$bkMessage({
                    theme: 'success',
                    message: '流程部署成功'
                })
            },
            handleBack () {
                this.$router.push({
                    name: 'pageList',
                    params: {
                        projectId: this.projectId
                    }
                })
            },
            handleBackToNode () {
                const { projectId, flowId } = this.$route.params
                this.$router.push({ name: 'flowConfig', params: { projectId, flowId}, query: { nodeId: this.serviceData.first_state_id } })
            },
            handleBackToFlow () {
                const { projectId, flowId } = this.$route.params
                this.$router.push({ name: 'flowConfig', params: { projectId, flowId } })
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .create-ticket-page-edit {
        height: 100%;
    }
</style>