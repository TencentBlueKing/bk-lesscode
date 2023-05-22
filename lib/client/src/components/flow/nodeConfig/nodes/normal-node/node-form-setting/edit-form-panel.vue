<template>
    <div class="edit-form-panel">
        <div class="content-edit-container">
            <div class="edit-header">
                <div class="nav-area">
                    <i class="bk-drag-icon bk-drag-arrow-back back-icon" @click="handleBack('back')"></i>
                    <div class="split-line"></div>
                    <breadcrumb-nav
                        :flow-config="flowConfig"
                        :editable="!isUseForm"
                        @backToFlow="handleBack('backToFlow')"
                        @backToNode="handleBack('backToNode')">
                    </breadcrumb-nav>
                </div>
                <div
                    id="toolActionBox"
                    class="function-and-tool">
                    <operation-select v-model="operationType" :hide-setting="!isCreateTicketPage" :hide-func="!isCreateTicketPage"></operation-select>
                    <!-- 保存、预览、快捷键等tool单独抽离 -->
                    <action-tool
                        :custom-save="true"
                        :hide-preview="!isCreateTicketPage"
                        :hide-func="!isCreateTicketPage"
                        :disabled="isUseForm"
                        :disabled-tips="isUseForm ? '复用表单模式下表单不可编辑' : ''"
                        :custom-loading="savePending"
                        @save="handleSave">
                    </action-tool>
                </div>
                <extra-links></extra-links>
            </div>
            <div class="edit-content-wrapper">
                <nocode-form
                    v-show="operationType === 'edit'"
                    page-type="FLOW"
                    :content="formConfig.content"
                    :disabled="isUseForm">
                </nocode-form>
                <page-setting v-if="operationType === 'setting'"></page-setting>
                <page-function v-if="operationType === 'pageFunction'"></page-function>
                <page-json v-else-if="operationType === 'jsonSource'" style="height: 100%;" nocode-type="FLOW"></page-json>
            </div>
        </div>
    </div>
</template>
<script>
    import { mapState, mapGetters } from 'vuex'
    import cloneDeep from 'lodash.clonedeep'
    import BreadcrumbNav from './breadcrumb-nav.vue'
    import ExtraLinks from '@/components/ui/extra-links'
    import OperationSelect from '@/views/edit-nocode/components/operation-select'
    import ActionTool from '@/views/edit-nocode/components/action-tool'
    import NocodeForm from '@/components/render-nocode/form/index.vue'
    import PageSetting from '@/views/index/components/operation-area/components/page-setting'
    import PageFunction from '@/views/index/components/operation-area/components/page-function'
    import PageJson from '@/views/index/components/operation-area/components/page-json'

    export default {
        name: 'EditFormPanel',
        components: {
            BreadcrumbNav,
            ExtraLinks,
            OperationSelect,
            ActionTool,
            NocodeForm,
            PageSetting,
            PageFunction,
            PageJson
        },
        props: {
            hideSetting: Boolean,
            hidePreview: Boolean,
            workflowId: Number,
            isCreateTicketPage: Boolean
        },
        data () {
            return {
                operationType: 'edit',
                savePending: false
            }
        },
        computed: {
            ...mapState('nocode/nodeConfig', ['nodeData', 'formConfig', 'initialFieldIds']),
            ...mapState('nocode/flow', ['flowConfig']),
            ...mapGetters('projectVersion', { versionId: 'currentVersionId' }),
            projectId () {
                return this.$route.params.projectId
            },
            // 是否为复用表单
            isUseForm () {
                return this.formConfig.type === 'USE_FORM'
            }
        },
        created () {
            this.$store.commit('nocode/formSetting/setFieldsList', this.formConfig.content)
        },
        methods: {
            // 表单字段保存到itsm
            saveItsmFields (content) {
                const fields = content.map(item => {
                    const field = cloneDeep(item)
                    if (typeof item.id !== 'number') {
                        field.id = null // itsm新建的字段需要传null
                    }
                    if (field.source_type === 'WORKSHEET') {
                        field.source_type = 'CUSTOM_API'
                        field.meta.data_config.source_type = 'WORKSHEET'
                    }
                    field.workflow = this.workflowId
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
            saveFormConfig () {
                const params = {
                    pageId: this.flowConfig.pageId,
                    id: this.flowConfig.id,
                    nodeId: this.nodeData.id,
                    projectId: this.projectId,
                    versionId: this.versionId,
                    formData: this.formConfig
                }
                return this.$store.dispatch('nocode/flow/editFlowNode', params)
            },
            // 更新itsm节点数据
            updateItsmNode (formId) {
                const fields = this.formConfig.content.map(field => field.id)
                // itsm新建服务时,提单节点默认生成一个标题字段，需要保留，默认放到第一个
                if (this.nodeData.is_first_state) {
                    fields.unshift(this.nodeData.fields[0])
                }
                const params = {
                    id: this.nodeData.id,
                    data: {
                        is_draft: false, // 提单节点置为已配置状态，传到itsm做标记
                        extras: {
                            formConfig: {
                                id: formId,
                                type: this.formConfig.type
                            }
                        },
                        fields
                    }
                }

                return this.$store.dispatch('nocode/flow/patchNodeData', params)
            },
            // 更新表单的名称
            updateFormName () {
                const params = {
                    id: this.formConfig.id,
                    formName: this.formConfig.formName
                }
                return this.$store.dispatch('nocode/form/updateForm', params)
            },
            // 页面保存
            async handleSave (content) {
                this.savePending = true
                try {
                    const itsmFields = await this.saveItsmFields(content)
                    const fields = []
                    itsmFields.forEach(field => {
                        if (this.nodeData.is_first_state && field.id === this.nodeData.fields[0]) {
                            return
                        }
                        field.columnId = field.meta.columnId
                        field.disabled = true
                        delete field.meta.columnId
                        if (field.meta.data_config?.source_type === 'WORKSHEET') {
                            field.source_type = 'WORKSHEET'
                        }
                        fields.push(field)
                    })
                    this.$store.commit('nocode/nodeConfig/setFormConfig', { content: fields })
                    this.$store.commit('nocode/nodeConfig/setInitialFieldIds', itsmFields)
                    const res = await this.saveFormConfig()
                    this.$store.commit('nocode/nodeConfig/setFormConfig', { id: res.formId })
                    this.$store.commit('nocode/flow/setFlowNodeFormId', { nodeId: this.nodeData.id, formId: res.formId })
                    const nodeConfig = await this.updateItsmNode(this.formConfig.id)
                    this.$store.commit('nocode/nodeConfig/setNodeData', nodeConfig)
                    await this.updateFormName()
                    this.$bkMessage({
                        message: '表单保存成功，表单配置关联数据表变更成功',
                        theme: 'success'
                    })
                    this.$emit('save')
                } catch (e) {
                    console.error(e)
                } finally {
                    this.savePending = false
                }
            },
            handleBack (type) {
                this.$bkInfo({
                    title: this.$t('确认离开'),
                    subTitle: this.$t('您将离开画布编辑页面，请确认相应修改已保存'),
                    confirmFn: async () => {
                        this.$emit(type)
                    }
                })
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .edit-form-panel {
        height: 100%;
        overflow: auto;
    }
    .content-edit-container {
        /* 和表单画布编辑页最小宽度保持一致 */
        min-width: 1366px;
        height: 100%;
        overflow: auto;
    }
    .edit-header {
        position: relative;
        display: flex;
        justify-content: space-between;
        height: 52px;
        background: #fff;
        &:after{
            content: '';
            position: absolute;
            right: 0;
            bottom: 0;
            left: 0;
            z-index: 99;
            height: 1px;
            box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.1);
        }
        .nav-area {
            display: flex;
            align-items: center;
            padding: 0 18px;
            height: 52px;
        }
        .back-icon {
            font-size: 13px;
            color: #3a84ff;
            cursor: pointer;
        }
        .split-line {
            margin-left: 14px;
            margin-right: 11px;
            width: 1px;
            height: 16px;
            background: #d8d8d8;
        }
        .function-and-tool {
            position: relative;
            display: flex;
            flex: 1;
            justify-content: center;
            align-items: center;
        }
        .spilt-line {
            height: 22px;
            width: 1px;
            margin: 0 5px;
            background-color: #dcdee5;
        }
        .page-operate-area {
            display: flex;
            align-items: center;
            padding: 0 16px;
            height: 100%;
        }
    }
    .edit-content-wrapper {
        height: calc(100% - 52px);
        .lesscode-editor-page-content {
            height: 100%;
        }
    }
</style>
