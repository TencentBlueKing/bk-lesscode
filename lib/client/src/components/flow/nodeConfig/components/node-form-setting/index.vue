<template>
    <section class="node-form-setting">
        <div
            v-if="formConfig.type !== ''"
            v-bkloading="{ isLoading: formContentLoading || pageContextLoading }"
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
                        {{ pageDetail.pageName || '--' }}
                    </span>
                    <i
                        v-if="hasCreatedTicketPage"
                        v-bk-tooltips="{ content: '无删除权限', disabled: getDeletePagePerm() }"
                        :class="['bk-icon', 'icon-delete', 'delete-page-icon', { 'g-no-permission': !getDeletePagePerm() }]"
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
            :edit-form-panel-show.sync="editFormPanelShow"
            :hide-setting="!isFirstNormalNode || !hasCreatedTicketPage"
            :hide-preview="!isFirstNormalNode || !hasCreatedTicketPage"
            :hide-save="formConfig.type === 'USE_FORM'"
            :hide-clear="formConfig.type === 'USE_FORM'"
            :flow-config="flowConfig"
            :form-config="formConfig"
            @save="hanadleSaveFormContent"
            @closeNode="$emit('close')">
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
    import { NOCODE_TYPE_MAP } from '@/common/constant'

    export default {
        name: 'NodeFormSetting',
        components: {
            EditFormPanel,
            SelectFormDialog,
            PreviewFormDialog
        },
        props: {
            formContentLoading: Boolean
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
                pageContextLoading: false,
                selectedType: this.$store.state.nocode.nodeConfig.formConfig.type,
                editFormPanelShow: false, // 表单编辑
                selectFormDialogShow: false, // 选择表单弹窗
                previewFormContent: [], // 预览表单字段
                previewFormDialogShow: false, // 预览弹窗
                isUnset: false
            }
        },
        computed: {
            ...mapGetters(['user']),
            ...mapState('nocode/nodeConfig', ['nodeData', 'formConfig']),
            ...mapState('nocode/flow', ['flowConfig', 'delCreateTicketPageId']),
            ...mapGetters('page', ['pageDetail']),
            ...mapGetters('projectVersion', { versionId: 'currentVersionId' }),
            projectId () {
                return this.$route.params.projectId
            },
            userPerm () {
                return this.$store.getters['member/userPerm'] || { roleId: 2 }
            },
            isFirstNormalNode () {
                return this.nodeData.type === 'NORMAL' && this.nodeData.is_first_state
            },
            // 是否生成提单页
            // 该节点为第一个节点提单节点，生成了提单页，并且没有再编辑时删除
            hasCreatedTicketPage () {
                return this.isFirstNormalNode && this.flowConfig.pageId && !this.delCreateTicketPageId
            }
        },
        watch: {
            'flowConfig.pageId' (val) {
                if (val) {
                    this.getPageDetail()
                }
            }
        },
        created () {
            // 如果流程生成了提单页并且当前节点为第一个人工节点，则加载页面详情的上下文数据
            if (this.nodeData.is_first_state && this.flowConfig.pageId) {
                this.getPageDetail()
            }
        },
        beforeDestroy () {
            this.clearContext()
        },
        methods: {
            async getPageDetail () {
                try {
                    this.pageContextLoading = true
                    const [pageDetail] = await Promise.all([
                        this.$store.dispatch('page/detail', { pageId: this.flowConfig.pageId }),
                        this.$store.dispatch('layout/getPageLayout', { pageId: this.flowConfig.pageId }),
                        this.$store.dispatch('route/getProjectPageRoute', { projectId: this.projectId, versionId: this.versionId }),
                        this.$store.dispatch('page/getPageSetting', {
                            pageId: this.flowConfig.pageId,
                            projectId: this.projectId,
                            versionId: this.versionId
                        })
                    ])

                    this.$store.commit('page/setPageDetail', pageDetail || {})
                } catch (e) {
                    console.error(e)
                } finally {
                    this.pageContextLoading = false
                }
            },
            getDeletePagePerm () {
                return this.userPerm.roleId === 1 || this.user.username === this.pageDetail.createUser
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
            handleSetForm (val) {
                this.selectedType = val
                if (val === 'NEW_FORM') {
                    const config = this.getNewFormConfig()
                    this.editFormPanelShow = true
                    this.updateFormConfig({ ...config, content: [] })
                } else {
                    this.selectFormDialogShow = true
                }
            },
            // 删除流程提单页
            handleDelCreatePage () {
                if (!this.getDeletePagePerm()) return
                const h = this.$createElement
                const { pageName, id } = this.pageDetail

                this.$bkInfo({
                    width: 422,
                    extCls: 'delete-page-dialog',
                    title: '确认删除该流程提单页页面',
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
                        }, `页面：${pageName}`),
                        h('div', {
                            style: {
                                'color': '#63656E',
                                'margin-top': '10px',
                                'text-align': 'left',
                                'font-size': '14px'
                            }
                        }, NOCODE_TYPE_MAP.deleteTips['FLOW'])
                    ]),
                    theme: 'danger',
                    confirmFn: () => {
                        this.$store.commit('nocode/flow/setDeletedPageId', id)
                        this.clearContext()
                    }
                })
            },
            // 编辑表单内容
            handleEditClick () {
                this.editFormPanelShow = true
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
                this.isUnset = true
                this.updateFormConfig({ id: '', type: '', code: '', formName: '', content: [] })
                if (this.flowConfig.pageId) {
                    this.$store.commit('nocode/flow/setDeletedPageId', this.flowConfig.pageId)
                    this.clearContext()
                }
            },
            // 选择引用或复用表单
            handleSelectForm (form) {
                const { id, content, tableName: code, formName } = form
                const contentArr = JSON.parse(content)
                this.isUnset = false
                this.selectFormDialogShow = false
                if (this.selectedType === 'COPY_FORM') {
                    const config = this.getNewFormConfig()
                    this.updateFormConfig({ ...config, content: contentArr, type: this.selectedType })
                } else {
                    this.updateFormConfig({ id, code, formName, content: contentArr, type: this.selectedType })
                }
            },
            // 保存表单配置
            hanadleSaveFormContent (content) {
                this.isUnset = false
                this.updateFormConfig({ content, type: this.selectedType })
                this.$bkMessage({
                    message: '保存成功',
                    theme: 'success'
                })
            },
            // 流程提单页点击
            handlePageClick () {
                if (this.flowConfig.pageId) {
                    this.editFormPanelShow = true
                }
            },
            // 关联数据表点击
            handleTableClick () {
                if (this.formConfig.code) {
                    const route = this.$router.resolve({ name: 'dataManage', query: { tableName: this.formConfig.code } })
                    window.open(route.href, '__blank')
                }
            },
            updateFormConfig (data) {
                this.$store.commit('nocode/nodeConfig/setFormConfig', data)
            },
            // 清除page以及layout相关的上下文数据
            clearContext () {
                this.$store.commit('page/setPageDetail', {})
                this.$store.commit('layout/setPageLayout', {})
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
    .error-tips {
        font-size: 12px;
        color: #ea3636;
        line-height: 18px;
        margin: 2px 0 0;
    }
</style>
