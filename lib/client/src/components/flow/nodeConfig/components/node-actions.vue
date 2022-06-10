<template>
    <div class="actions-wrapper">
        <bk-button
            v-if="showCreatePageBtn"
            theme="primary"
            :loading="savePending"
            :disabled="loading"
            @click="handleSaveClick(true)">
            保存并生成提单页
        </bk-button>
        <bk-button
            :theme="showCreatePageBtn ? 'default' : 'primary'"
            :loading="savePending"
            :disabled="loading"
            @click="handleSaveClick(false)">
            保存
        </bk-button>
        <bk-button @click="$emit('close')">取消</bk-button>
        <create-page-dialog
            ref="createPageDialog"
            platform="PC"
            nocode-type="FLOW"
            :init-page-data="pageData"
            @save="handlePageCreated">
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
                    this.saveConfig(this.flowConfig.pageId)
                }
            },
            handlePageCreated (pageId) {
                this.saveConfig(pageId)
            },
            async saveConfig (pageId = '') {
                const data = cloneDeep(this.nodeData)
                // 流程服务校验desc字段不为空，节点上没有可配置desc的地方，故先删除
                delete data.desc
                try {
                    if (data.type === 'NORMAL') {
                        const params = {
                            pageId,
                            id: this.flowConfig.id,
                            nodeId: data.id,
                            projectId: this.projectId,
                            versionId: this.versionId,
                            formData: this.formConfig
                        }
                        this.savePending = true
                        await this.$store.dispatch('nocode/flow/editFlowNode', params)
                        const node = await this.$store.dispatch('nocode/flow/updateNode', data)
                        this.$bkMessage({
                            message: '节点保存成功',
                            theme: 'success'
                        })
                        this.$emit('save', node)
                    }
                } catch (e) {
                    messageError(e.message || e)
                } finally {
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
