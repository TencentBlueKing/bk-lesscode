<template>
    <section class="node-form-setting">
        <div
            v-if="formConfig.type !== ''"
            v-bkloading="{ isLoading: formContentLoading || pageDetailLoading }"
            class="edit-form-card">
            <div class="card-header">
                <h5>{{ formConfig.formName }}</h5>
                <div class="type-label">{{ typeNameMap[formConfig.type] }}</div>
            </div>
            <div class="related-info">
                <template v-if="nodeData.is_first_state && nodeData.type === 'NORMAL'">
                    {{ $t('流程提单页：') }} <span
                        :class="['related-item-name', { 'not-empty': hasCreatedTicketPage }]"
                        @click="handlePageClick">
                        {{ hasCreatedTicketPage ? createTicketPage.pageName : '--' }}
                    </span>
                    <i
                        v-if="hasCreatedTicketPage"
                        :class="['bk-icon', 'icon-delete', 'delete-page-icon']"
                        @click="handleDelCreateTicketPageClick">
                    </i>
                </template>
                {{ $t('关联数据表：') }} <span
                    :class="['related-item-name', { 'not-empty': formConfig.id }]"
                    @click="handleTableClick">
                    {{ typeof formConfig.id === 'number' ? formConfig.code : '--' }}
                </span>
            </div>
            <div class="operate-area">
                <i
                    class="bk-drag-icon bk-drag-edit"
                    style="font-size: 20px; margin-right: 10px;"
                    @click="handleEditClick">
                </i>
                <i
                    v-bk-tooltips.top="$t('预览表单内容')"
                    class="bk-drag-icon bk-drag-visible-eye"
                    style="font-size: 16px; margin-right: 14px;"
                    @click="handlePreviewClick(formConfig.content)">
                </i>
                <i
                    class="bk-icon icon-delete"
                    style="font-size: 12px;"
                    @click="handleDelFormConfigClick">
                </i>
            </div>
        </div>
        <div v-else class="create-form-methods">
            <div
                v-for="item in createFormMethods"
                class="create-method-item"
                :key="item.id"
                @click="handleSetForm(item.id)">
                <i class="bk-drag-icon bk-drag-crosshair"></i>
                {{ item.name }}
            </div>
        </div>
        <p v-if="isUnset" class="error-tips">{{ $t('请选择配置表单') }}</p>
        <edit-form-panel
            v-if="editFormPanelShow"
            class="node-config-fields-panel"
            :workflow-id="workflowId"
            @save="isUnset = false"
            @backToFlow="$emit('close')"
            @backToNode="handleBackToNode"
            @back="handleBackToNode">
        </edit-form-panel>
        <select-form-dialog
            :type="selectedType"
            :show.sync="selectFormDialogShow"
            :workflowId="workflowId"
            @preview="handlePreviewClick"
            @confirm="isUnset = false">
        </select-form-dialog>
        <preview-form-dialog
            :fields="previewFormContent"
            :show="previewFormDialogShow"
            @close="handlePreviewClose">
        </preview-form-dialog>
    </section>
</template>
<script>
    import { mapState, mapGetters } from 'vuex'
    import pinyin from 'pinyin'
    import { uuid } from '@/common/util'
    import EditFormPanel from './edit-form-panel.vue'
    import SelectFormDialog from './select-form-dialog.vue'
    import PreviewFormDialog from './preview-form-dialog.vue'

    export default {
        name: 'NodeFormSetting',
        components: {
            EditFormPanel,
            SelectFormDialog,
            PreviewFormDialog
        },
        props: {
            formContentLoading: Boolean,
            workflowId: Number
        },
        data () {
            return {
                createFormMethods: [
                    { id: 'NEW_FORM', name: this.$t('新建空白表单') },
                    { id: 'COPY_FORM', name: this.$t('引用已有表单') },
                    { id: 'USE_FORM', name: this.$t('复用已有表单') }
                ],
                typeNameMap: {
                    NEW_FORM: this.$t('新建表单'),
                    COPY_FORM: this.$t('引用表单'),
                    USE_FORM: this.$t('复用表单')
                },
                selectedType: this.$store.state.nocode.nodeConfig.formConfig.type,
                pageDetailLoading: false,
                editFormPanelShow: false, // 表单编辑
                selectFormDialogShow: false, // 选择表单弹窗
                previewFormContent: [], // 预览表单字段
                previewFormDialogShow: false, // 预览弹窗
                isUnset: false // 人工节点是否配置表单
            }
        },
        computed: {
            ...mapGetters(['user']),
            ...mapState('nocode/nodeConfig', ['nodeData', 'formConfig', 'createTicketPage']),
            ...mapState('nocode/flow', ['flowConfig']),
            ...mapGetters('projectVersion', { versionId: 'currentVersionId' }),

            projectId () {
                return this.$route.params.projectId
            },
            isFirstNormalNode () {
                return this.nodeData.type === 'NORMAL' && this.nodeData.is_first_state
            },
            // 该节点是否为第一个节点提单节点，并生成了提单页
            hasCreatedTicketPage () {
                return this.isFirstNormalNode && !!this.flowConfig.pageId
            }
        },
        created () {
            // 如果流程生成了提单页并且当前节点为第一个人工节点，则加载页面详情的上下文数据
            if (this.isFirstNormalNode && this.flowConfig.pageId) {
                this.getPageDetail()
            }
        },
        methods: {
            async getPageDetail () {
                try {
                    this.pageDetailLoading = true
                    const res = await this.$store.dispatch('page/detail', { pageId: this.flowConfig.pageId })
                    this.$store.commit('nocode/nodeConfig/setCreateTicketPageData', res)
                } catch (e) {
                    console.error(e)
                } finally {
                    this.pageDetailLoading = false
                }
            },
            // 删除流程提单页
            async delCreateTicketPage () {
                return Promise.all([
                    this.$store.dispatch('page/delete', { pageId: this.createTicketPage.id }),
                    this.$store.dispatch('nocode/flow/editFlow', { id: this.flowConfig.id, pageId: 0 })
                ]).then(() => {
                    this.$store.commit('nocode/flow/setFlowConfig', { pageId: 0 })
                    this.$store.commit('nocode/nodeConfig/setCreateTicketPageData', {})
                })
            },
            // 删除节点的表单配置
            delFormConfig () {
                this.$store.commit('nocode/flow/delFlowNodeFormId', this.nodeData.id)
                return Promise.all([
                    this.$store.dispatch('nocode/flow/editFlow', { id: this.flowConfig.id, formIds: this.flowConfig.formIds, deployed: 0 }),
                    this.$store.dispatch('nocode/flow/patchNodeData', { id: this.nodeData.id, data: { is_draft: true } }),
                    this.$store.dispatch('nocode/flow/batchSaveFields', { fields: [], delete_ids: this.nodeData.fields, state_id: this.nodeData.id, })
                ]).then(() => {
                    this.$store.commit('nocode/flow/setFlowConfig', { pageId: 0, deployed: 0 })
                    this.updateFormConfig({ id: '', type: '', code: '', formName: '', content: [] })
                    this.isUnset = true
                })
            },
            // 新建空白或者引用表单时的初始化配置
            getNewFormConfig () {
                // 新建空白表单
                const cnName = pinyin(this.nodeData.name, {
                    style: pinyin.STYLE_NORMAL,
                    heteronym: false
                }).join('_')

                const formName = this.$t('{0}_表单', [this.nodeData.name])
                const code = `${cnName}_${this.nodeData.id}_${uuid(4)}`
                return {
                    id: '',
                    code,
                    formName
                }
            },
            // 设置表单的使用类型
            handleSetForm (val) {
                this.selectedType = val
                if (val === 'NEW_FORM') {
                    const config = this.getNewFormConfig()
                    this.editFormPanelShow = true
                    this.updateFormConfig({ ...config, type: 'NEW_FORM', content: [] })
                } else {
                    this.selectFormDialogShow = true
                }
            },
            // 单独删除流程提单页
            handleDelCreateTicketPageClick () {
                const h = this.$createElement
                this.$bkInfo({
                    width: 500,
                    extCls: 'delete-page-dialog',
                    title: this.$t('确认删除流程提单页面？'),
                    subTitle: this.$t('删除该流程提单页面，对应的流程数据不会删除'),
                    theme: 'danger',
                    confirmLoading: true,
                    confirmFn: async() => {
                        await this.delCreateTicketPage()
                        return true
                    }
                })
            },
            // 编辑表单内容
            handleEditClick () {
                if (this.hasCreatedTicketPage) {
                    this.handlePageClick()
                } else {
                    this.editFormPanelShow = true
                }
            },
            // 预览表单内容
            handlePreviewClick (content) {
                this.previewFormContent = content
                this.previewFormDialogShow = true
            },
            handlePreviewClose () {
                this.previewFormDialogShow = false
                this.previewFormContent = []
            },
            // 删除节点的表单配置，删除节点和表单的绑定关系，如果是提单节点并且有生成提单页则需要同时删除提单
            handleDelFormConfigClick () {
                let tips = this.$t('已生成的关联数据表及表数据将继续保留')
                if (this.hasCreatedTicketPage) {
                    tips = this.$t('流程提单页将同步被删除，') + tips
                }
                const h = this.$createElement
                this.$bkInfo({
                    width: 600,
                    extCls: 'delete-page-dialog',
                    title: this.$t('确认删除表单配置？'),
                    subTitle: tips,
                    theme: 'danger',
                    confirmLoading: true,
                    confirmFn: async() => {
                        if (this.nodeData.is_first_state && this.createTicketPage.id) {
                            await this.delCreateTicketPage()
                        }
                        await this.delFormConfig()
                        return true
                    }
                })
            },
            // 流程提单页点击跳转
            handlePageClick () {
                if (this.hasCreatedTicketPage) {
                    const { projectId, flowId } = this.$route.params
                    this.$router.push({
                        name: 'createTicketPageEdit',
                        params: { projectId, flowId, pageId: this.flowConfig.pageId },
                        query: { from: 'node' }
                    })
                }
            },
            // 关联数据表点击
            handleTableClick () {
                if (this.formConfig.code) {
                    const route = this.$router.resolve({ name: 'dataManage', query: { tableName: this.formConfig.code } })
                    window.open(route.href, '_blank')
                }
            },
            handleBackToNode () {
                if (this.isUnset) {
                    this.updateFormConfig({ id: '', type: '', code: '', formName: '', content: [] })
                }
                this.editFormPanelShow = false
            },
            updateFormConfig (data) {
                this.$store.commit('nocode/nodeConfig/setFormConfig', data)
            },
            validate () {
                this.isUnset = this.formConfig.type === ''
                return !this.isUnset
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .node-form-setting {
        margin-top: 24px;
    }
    .create-method-item {
        display: inline-block;
        margin-right: 12px;
        width: 240px;
        height: 40px;
        line-height: 40px;
        text-align: center;
        font-size: 12px;
        color: #63656e;
        border: 1px solid #c4c6cc;
        border-radius: 2px;
        cursor: pointer;
        &:hover {
            color: #3a84ff;
            border-color: #3a84ff;
        }
        i {
            font-size: 16px;
        }
    }
    .edit-form-card {
        position: relative;
        width: 656px;
        padding: 10px 100px 12px 24px;
        border: 1px solid #c4c6cc;
        border-radius: 2px;
        .card-header {
            display: flex;
            align-items: center;
            h5 {
                margin: 0;
                font-size: 12px;
                color: #63656e;
                max-width: 420px;
                line-height: 16px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .type-label {
                padding: 2px 6px;
                font-size: 12px;
                color: #3a84ff;
                background: #edf4ff;
                border: 1px solid rgba(58,132,255,0.30);
                border-radius: 2px;
                transform: scale(0.83);
            }
        }
        .related-info {
            display: flex;
            align-items: center;
            margin-top: 4px;
            font-size: 12px;
            color: #63656e;
            .related-item-name {
                min-width: 80px;
                max-width: 168px;
                white-space: nowrap;
                text-overflow: ellipsis;
                overflow: hidden;
                &.not-empty {
                    color: #3a84ff;
                    cursor: pointer;
                }
            }
            .delete-page-icon {
                margin: 0 20px 0 8px;
                cursor: pointer;
                &:hover {
                    color: #3a84ff;
                }
            }
        }
        .operate-area {
            position: absolute;
            top: 50%;
            right: 24px;
            display: flex;
            align-items: center;
            transform: translateY(-50%);
            i {
                cursor: pointer;
                &:hover {
                    color: #3a84ff;
                }
            }
        }
    }
    .node-config-fields-panel {
        position: fixed;
        /* 全局导航高度 */
        top: 52px;
        right: 0;
        bottom: 0;
        left: 59px;
        background: #fafbfd;
        z-index: 3000;
    }
    .error-tips {
        font-size: 12px;
        color: #ea3636;
        line-height: 18px;
        margin: 2px 0 0;
    }
</style>
<style lang="postcss">
    .delete-page-dialog .bk-dialog .bk-dialog-sub-header {
        padding-left: 24px;
        padding-right: 24px;
    }
</style>
