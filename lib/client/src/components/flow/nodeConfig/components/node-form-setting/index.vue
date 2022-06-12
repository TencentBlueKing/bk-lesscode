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
                流程提单页：
                <span
                    :class="['related-item', { 'not-empty': flowConfig.pageId }]"
                    @click="handlePageClick">
                    {{ pageDetail.pageName || '--' }}
                </span>
                关联数据表：
                <span
                    :class="['related-item', { 'not-empty': formConfig.id }]"
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
                    class="bk-drag-icon bk-drag-visible-eye"
                    style="font-size: 16px; margin-right: 14px;"
                    @click="handlePreviewClick">
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
            :has-create-ticket-page="hasCreateTicketPage"
            :flow-config="flowConfig"
            :form-config="formConfig"
            @save="handleCreateForm"
            @closeNode="$emit('close')">
        </edit-form-panel>
        <select-form-dialog
            :method="selectedType"
            :show.sync="selectFormDialogShow"
            @confirm="handleSelectForm">
        </select-form-dialog>
    </section>
</template>
<script>
    import { mapState, mapGetters } from 'vuex'
    import EditFormPanel from './edit-form-panel.vue'
    import SelectFormDialog from './select-form-dialog.vue'

    export default {
        name: 'NodeFormSetting',
        components: {
            EditFormPanel,
            SelectFormDialog
        },
        props: {
            flowConfig: {
                type: Object,
                default: () => ({})
            },
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
                isUnset: false
            }
        },
        computed: {
            ...mapState('nocode/nodeConfig', ['nodeData', 'formConfig']),
            ...mapGetters('page', ['pageDetail']),
            hasCreateTicketPage () {
                return typeof this.flowConfig.pageId === 'number'
            }
        },
        created () {
            // 如果流程生成了提单页并且当前节点为第一个人工节点，则加载页面详情的上下文数据
            if (this.nodeData.is_first_state && typeof this.flowConfig.pageId === 'number') {
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
                        this.$store.dispatch('layout/getPageLayout', { pageId: this.flowConfig.pageId })
                    ])

                    this.$store.commit('page/setPageDetail', pageDetail || {})
                } catch (e) {
                    console.error(e)
                } finally {
                    this.pageContextLoading = false
                }
            },
            handleSetForm (val) {
                this.selectedType = val
                if (val === 'NEW_FORM') {
                    this.editFormPanelShow = true
                } else {
                    this.selectFormDialogShow = true
                }
            },
            handleEditClick () {
                this.editFormPanelShow = true
            },
            handlePreviewClick () {},
            handleDelClick () {
                this.isUnset = true
                this.updateFormConfig({ id: '', type: '', content: [] })
            },
            // 引用和复用
            handleSelectForm (id, content = []) {
                this.isUnset = false
                this.selectFormDialogShow = false
                this.updateFormConfig({ id, content, type: this.selectedType })
            },
            // 新建空白
            handleCreateForm (content) {
                this.isUnset = false
                this.editFormPanelShow = false
                this.updateFormConfig({ content, type: this.selectedType })
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
            // 清楚page以及layout相关的上下文数据
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
            .related-item {
                margin-right: 10px;
                width: 180px;
                white-space: nowrap;
                text-overflow: ellipsis;
                overflow: hidden;
                &.not-empty {
                    color: #3a84ff;
                    cursor: pointer;
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
