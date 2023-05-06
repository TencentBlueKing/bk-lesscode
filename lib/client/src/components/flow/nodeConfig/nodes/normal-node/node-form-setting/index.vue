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
                    流程提单页：
                    <span
                        :class="['related-item-name', { 'not-empty': hasCreatedTicketPage }]"
                        @click="handlePageClick">
                        {{ hasCreatedTicketPage ? pageDetail.pageName : '--' }}
                    </span>
                    <i
                        v-if="hasCreatedTicketPage"
                        :class="['bk-icon', 'icon-delete', 'delete-page-icon']"
                        @click="handleDelCreatePage">
                    </i>
                </template>
                关联数据表：
                <span
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
                    v-bk-tooltips.top="'预览表单内容'"
                    class="bk-drag-icon bk-drag-visible-eye"
                    style="font-size: 16px; margin-right: 14px;"
                    @click="handlePreviewClick(formConfig.content)">
                </i>
                <i
                    class="bk-icon icon-delete"
                    style="font-size: 12px;"
                    @click="handleDelClick">
                </i>
            </div>
        </div>
        <div v-else class="create-form-methods">
            <div
                v-for="item in createFormMethods"
                class="create-method-item"
                :key="item.id"
                @click="handleSetForm(item.id)">
                <i class="bk-icon icon-plus"></i>
                {{ item.name }}
            </div>
        </div>
        <p v-if="isUnset" class="error-tips">请选择配置表单</p>
        <edit-form-panel
            v-if="editFormPanelShow"
            class="node-config-fields-panel"
            :workflow-id="workflowId"
            @save="isUnset = false"
            @backToFlow="$emit('close')"
            @backToNode="handleBackToNode"
            @back="editFormPanelShow = false">
        </edit-form-panel>
        <select-form-dialog
            :method="selectedType"
            :show.sync="selectFormDialogShow"
            @preview="handlePreviewClick"
            @confirm="handleSelectForm">
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
    import PreviewMixin from '@/views/edit-nocode/preview-mixin'

    export default {
        name: 'NodeFormSetting',
        components: {
            EditFormPanel,
            SelectFormDialog,
            PreviewFormDialog
        },
        mixins: [PreviewMixin],
        props: {
            formContentLoading: Boolean,
            workflowId: Number
        },
        data () {
            return {
                createFormMethods: [
                    { id: 'NEW_FORM', name: '新建空白表单' },
                    { id: 'COPY_FORM', name: '引用已有表单' },
                    { id: 'USE_FORM', name: '复用已有表单' }
                ],
                typeNameMap: {
                    NEW_FORM: '新建表单',
                    COPY_FORM: '引用表单',
                    USE_FORM: '复用表单'
                },
                selectedType: this.$store.state.nocode.nodeConfig.formConfig.type,
                pageDetailLoading: false,
                pageDetail: {},
                editFormPanelShow: false, // 表单编辑
                selectFormDialogShow: false, // 选择表单弹窗
                previewFormContent: [], // 预览表单字段
                previewFormDialogShow: false, // 预览弹窗
                isUnset: false // 人工节点是否配置表单
            }
        },
        computed: {
            ...mapGetters(['user']),
            ...mapState('nocode/nodeConfig', ['nodeData', 'formConfig']),
            ...mapState('nocode/flow', ['flowConfig', 'delCreateTicketPageId']),
            ...mapGetters('projectVersion', { versionId: 'currentVersionId' }),

            projectId () {
                return this.$route.params.projectId
            },
            isFirstNormalNode () {
                return this.nodeData.type === 'NORMAL' && this.nodeData.is_first_state
            },
            // 是否已生成提单页
            // 该节点为第一个节点提单节点，生成了提单页，并且没有在编辑时删除
            hasCreatedTicketPage () {
                return this.isFirstNormalNode && !!this.flowConfig.pageId && !!!this.delCreateTicketPageId
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
                    this.pageDetail = res
                } catch (e) {
                    console.error(e)
                } finally {
                    this.pageDetailLoading = false
                }
            },
            // 新建空白或者引用表单时的初始化配置
            getNewFormConfig () {
                // 新建空白表单
                const cnName = pinyin(this.nodeData.name, {
                    style: pinyin.STYLE_NORMAL,
                    heteronym: false
                }).join('_')

                const formName = `${this.nodeData.name}_表单`
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
            // 删除流程提单页
            handleDelCreatePage () {
                const h = this.$createElement
                this.$bkInfo({
                    width: 422,
                    extCls: 'delete-page-dialog',
                    title: '确认删除？',
                    subHeader: h('div', {
                        style: {
                            'text-align': 'center',
                            'margin-top': '-10px'
                        }
                    }, [
                        h('span', {
                            style: {
                                'color': '#979BA5',
                                'font-size': '12px'
                            }
                        }, `页面：${this.pageDetail.pageName}`),
                        h('div', {
                            style: {
                                'color': '#63656E',
                                'margin-top': '10px',
                                'text-align': 'left',
                                'font-size': '14px'
                            }
                        }, [
                            h('p', {}, '1.删除该流程提单页面，对应的流程数据不会删除'),
                            h('p', { style: { 'margin-top': '8px' } }, '2.确认该信息后，需“保存”该节点配置方可生效')
                        ])
                    ]),
                    theme: 'danger',
                    confirmFn: () => {
                        this.$store.commit('nocode/flow/setDeletedPageId', this.pageDetail.id)
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
            // 删除配置的表单
            // 创建/引用的方式表单配置删除后，清空保存的id、code、type、content
            handleDelClick () {
                const h = this.$createElement
                this.$bkInfo({
                    width: 422,
                    extCls: 'delete-page-dialog',
                    subHeader: h('div', {}, [
                        h('span', {
                            style: {
                                'color': '#313238',
                                'font-size': '20px'
                            }
                        }, '该删除操作将有以下影响：'),
                        h('div', {
                            style: {
                                'color': '#63656E',
                                'margin-top': '10px',
                                'text-align': 'left',
                                'font-size': '14px'
                            }
                        }, [
                            h('p', { style: { 'margin': '14px 0 0 10px' } }, '1.已生成的流程提单页将同步被删除'),
                            h('p', { style: { 'margin': '8px 0 0 10px' } }, '2.已生成的关联数据表及表数据将继续保留'),
                            h('p', { style: { 'margin': '14px 0 0 0' } }, '确认删除吗？')
                        ])
                    ]),
                    theme: 'danger',
                    confirmFn: () => {
                        this.isUnset = true
                        this.updateFormConfig({ id: '', type: '', code: '', formName: '', content: [] })
                        this.$store.commit('nocode/flow/setDeletedPageId', this.pageDetail.id)
                    }
                })
            },
            // 选择引用或复用表单
            handleSelectForm (form) {
                const { id, content, tableName: code, formName } = form
                // 引用和复用表单都需要把itsm的字段id清空，保存时重新创建新的字段
                const contentArr = JSON.parse(content).map(item => {
                    return { ...item, id: null }
                })
                this.selectFormDialogShow = false
                if (this.selectedType === 'COPY_FORM') {
                    const config = this.getNewFormConfig()
                    this.updateFormConfig({ ...config, content: contentArr, type: 'COPY_FORM' })
                } else {
                    this.updateFormConfig({ id, code, formName, content: contentArr, type: 'USE_FORM' })
                }
                this.handleEditClick()
            },
            // 流程提单页点击跳转
            handlePageClick () {
                if (this.flowConfig.pageId && !this.delCreateTicketPageId) {
                    const { projectId, flowId } = this.$route.params
                    this.$router.push({ name: 'createTicketPageEdit', params: { projectId, flowId, pageId: this.flowConfig.pageId } })
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
        left: 0;
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
