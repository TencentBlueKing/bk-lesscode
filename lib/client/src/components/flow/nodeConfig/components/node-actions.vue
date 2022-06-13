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
        <bk-button @click="$emit('close')">取消</bk-button>
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
    import { mapState, mapGetters } from 'vuex'
    import { messageError } from '@/common/bkmagic'
    import CreatePageDialog from '@/components/project/create-page-dialog.vue'

    export default {
        name: 'NodeActions',
        components: {
            CreatePageDialog
        },
        props: {
            loading: Boolean,
            flowConfig: {
                type: Object,
                default: () => ({})
            },
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
            ...mapState('nocode/nodeConfig', ['nodeData', 'formConfig']),
            projectId () {
                return this.$route.params.projectId
            },
            // 第一个提单节点并且未生成提单页
            showCreatePageBtn () {
                return this.nodeData.is_first_state && this.nodeData.type === 'NORMAL' && typeof this.flowConfig.pageId !== 'number'
            },
            pageData () {
                const { id } = this.formConfig
                return {
                    formId: id,
                    pageCode: `createTicket${this.flowConfig.id}`,
                    pageName: `${this.flowConfig.flowName}_提单页面`
                }
            }
        },
        methods: {
            async handleSaveClick (createPage) {
                const result = await this.$parent.validate()
                if (!result) {
                    return
                }
                // 点击保存并创建提单页
                if (createPage) {
                    this.$refs.createPageDialog.isShow = true
                } else {
                    this.saveConfig()
                }
            },
            handleCreatePageConfirm () {
                this.createPagePending = true
                this.saveConfig(true)
            },
            // 表单字段保存到itsm
            saveItsmFields () {
                const fields = this.formConfig.content.map(item => {
                    const field = cloneDeep(item)
                    field.workflow = this.serviceData.workflow_id
                    field.id = null
                    field.state_id = this.nodeData.id
                    delete field.api_instance_id
                    return field
                })
                const params = {
                    fields,
                    state_id: this.nodeData.id,
                    delete_ids: []
                }
                return this.$store.dispatch('nocode/flow/batchSaveFields', params)
            },
            // 表单配置保存到form表
            saveFormConfig () {
                const params = {
                    // pageId,
                    id: this.flowConfig.id,
                    nodeId: this.nodeData.id,
                    projectId: this.projectId,
                    versionId: this.versionId,
                    formData: this.formConfig
                }
                return this.$store.dispatch('nocode/flow/editFlowNode', params)
            },
            // 更新itsm节点数据
            updateItsmNode () {
                const data = cloneDeep(this.nodeData)
                // 流程服务校验desc字段不为空，节点上没有可配置desc的地方，故先删除
                delete data.desc
                data.is_draft = false
                if (data.type === 'WEBHOOK') {
                    // @todo 处理人为不限后台校验不通过，暂时用固定值
                    data.processors_type = 'STARTER'
                    data.processors = ''
                } else if (data.type === 'APPROVAL') {
                    if (!data.is_multi) {
                        data.finish_condition = {}
                    }
                }
                return this.$store.dispatch('nocode/flow/updateNode', data)
            },
            async saveConfig (createPage = false) {
                try {
                    if (createPage) {
                        this.createPagePending = true
                    } else {
                        this.savePending = true
                    }
                    if (this.nodeData.type === 'NORMAL') {
                        await this.saveItsmFields()
                        await this.saveFormConfig()
                        if (createPage) {
                            await this.$refs.createPageDialog.save()
                        }
                        await this.updateItsmNode()
                    } else {
                        await this.updateItsmNode()
                    }
                    this.$bkMessage({
                        message: '节点保存成功',
                        theme: 'success'
                    })
                    this.$emit('save')
                } catch (e) {
                    messageError(e.message || e)
                } finally {
                    this.createPagePending = false
                    this.savePending = false
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
