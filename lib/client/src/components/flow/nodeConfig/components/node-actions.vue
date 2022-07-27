<template>
    <div class="actions-wrapper">
        <bk-button
            v-if="showCreatePageBtn"
            theme="primary"
            :loading="createPagePending"
            :disabled="loading || savePending"
            @click="handleSaveClick(true)">
            保存并生成提单页
        </bk-button>
        <bk-button
            :theme="showCreatePageBtn ? 'default' : 'primary'"
            :loading="savePending"
            :disabled="loading || createPagePending"
            @click="handleSaveClick(false)">
            保存
        </bk-button>
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
            ...mapState('nocode/flow', ['flowConfig', 'delCreateTicketPageId']),
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
                    pageName: `${this.flowConfig.flowName}_提单页面`
                }
            }
        },
        methods: {
            // 表单字段保存到itsm
            saveItsmFields () {
                const fields = this.formConfig.content.map(item => {
                    const field = cloneDeep(item)
                    if (typeof item.id !== 'number') {
                        field.id = null // itsm新建的字段需要传null
                    }
                    field.workflow = this.serviceData.workflow_id
                    field.state = this.nodeData.id
                    field.meta.columnId = field.columnId // 表单字段需要保存columnId，itsm不支持直接添加，存到meta里
                    delete field.api_instance_id
                    delete field.columnId
                    return field
                })
                const deletedIds = []
                this.initialFieldIds.forEach(id => {
                    if (!fields.find(item => item.id === id)) {
                        deletedIds.push(id)
                    }
                })
                const params = {
                    fields,
                    state_id: this.nodeData.id,
                    delete_ids: deletedIds
                }
                return this.$store.dispatch('nocode/flow/batchSaveFields', params)
            },
            // 表单配置保存到form表
            saveFormConfig (pageId = null) {
                const params = {
                    pageId,
                    id: this.flowConfig.id,
                    nodeId: this.nodeData.id,
                    projectId: this.projectId,
                    versionId: this.versionId,
                    formData: this.formConfig
                }
                return this.$store.dispatch('nocode/flow/editFlowNode', params)
            },
            // 更新流程提单页面pageId
            updateFlowPageId (pageId) {
                const params = {
                    pageId,
                    id: this.flowConfig.id
                }
                return this.$store.dispatch('nocode/flow/editFlow', params)
            },
            // 更新itsm节点数据
            updateItsmNode (formId) {
                const data = cloneDeep(this.nodeData)
                // 流程服务校验desc字段不为空，节点上没有可配置desc的地方，故先删除
                delete data.desc
                data.is_draft = false
                if (data.type === 'APPROVAL') {
                    if (!data.is_multi) {
                        data.finish_condition = {}
                    }
                } else if (data.type === 'NORMAL') {
                    const formFieldsId = this.formConfig.content.map(field => field.id)
                    data.fields = [...formFieldsId]
                    // itsm新建服务时,提单节点默认生成一个标题字段，需要保留，默认放到第一个
                    if (this.nodeData.is_first_state) {
                        data.fields.unshift(this.nodeData.fields[0])
                    }
                    data.extras.formConfig = {
                        id: formId,
                        type: this.formConfig.type
                    }
                }
                return this.$store.dispatch('nocode/flow/updateNode', data)
            },
            // 更新表单的名称
            updateFormName () {
                const params = {
                    id: this.formConfig.id,
                    formName: this.formConfig.formName
                }
                return this.$store.dispatch('nocode/form/updateForm', params)
            },
            // 删除流程提单页
            deleteCreateTicketPage () {
                return this.$store.dispatch('page/delete', { pageId: this.delCreateTicketPageId })
            },
            async handleSaveClick (createPage = false) {
                try {
                    const result = await this.$parent.validate()
                    if (!result) {
                        return
                    }
                    if (createPage) {
                        this.createPagePending = true
                    } else {
                        this.savePending = true
                    }
                    if (this.nodeData.type === 'NORMAL') {
                        const itsmFields = await this.saveItsmFields()
                        const content = []
                        itsmFields.forEach(field => {
                            if (field.id !== this.nodeData.fields[0]) {
                                field.columnId = field.meta.columnId
                                delete field.meta.columnId
                                content.push(field)
                            }
                        })
                        this.$store.commit('nocode/nodeConfig/setFormConfig', { content })
                        this.$store.commit('nocode/nodeConfig/setInitialFieldIds', itsmFields)
                        const res = await this.saveFormConfig(this.flowConfig.pageId)
                        this.$store.commit('nocode/nodeConfig/setFormConfig', { id: res.formId })
                        this.$store.commit('nocode/flow/setFlowNodeFormId', { nodeId: this.nodeData.id, formId: res.formId })
                        await this.updateItsmNode(this.formConfig.id)
                        await this.updateFormName()
                        if (createPage) {
                            this.$refs.createPageDialog.isShow = true
                            return
                        } else if (this.delCreateTicketPageId) { // 流程提单页被删除
                            await this.deleteCreateTicketPage()
                            await this.updateFlowPageId()
                            this.$store.commit('nocode/flow/setDeletedPageId', null)
                            this.$store.commit('nocode/flow/setFlowConfig', { pageId: 0 })
                        }
                    } else {
                        await this.updateItsmNode()
                    }

                    this.$store.commit('nocode/nodeConfig/setNodeDataChangeStatus', false)
                    this.$store.commit('nocode/flow/setFlowConfig', { deployed: 0 })

                    this.$bkMessage({
                        message: this.nodeData.type === 'NORMAL' ? '节点保存成功，表单配置关联数据表变更成功' : '节点保存成功',
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
                    const pageId = await this.$refs.createPageDialog.save()
                    if (pageId) {
                        this.$store.commit('nocode/flow/setFlowConfig', { pageId })
                        await this.updateFlowPageId(pageId)
                        this.$refs.createPageDialog.isShow = false
                        this.$bkMessage({
                            message: '节点保存并创建提单页成功',
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
