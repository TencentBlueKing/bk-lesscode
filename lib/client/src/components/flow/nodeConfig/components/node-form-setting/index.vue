<template>
    <section class="node-form-setting">
        <div v-if="formConfig.type !== ''" class="edit-form-card">
            <div class="card-header">
                <h5>{{ formConfig.name || formConfig.id }}</h5>
                <div class="type-label">{{ typeNameMap[formConfig.type] }}</div>
            </div>
            <div class="related-info">
                流程提单页：
                <span :class="['related-item', { 'not-empty': flowConfig.pageId }]">--</span>
                关联数据表：
                <span :class="['related-item', { 'not-empty': formConfig.id }]">{{ formConfig.id }}</span>
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
        <edit-form-panel
            v-if="editFormPanelShow"
            :edit-form-panel-show.sync="editFormPanelShow"
            :has-create-ticket-page="hasCreateTicketPage"
            :form-config="formConfig"
            @save="handleCreateForm">
        </edit-form-panel>
        <select-form-dialog
            :method="selectedType"
            :show.sync="selectFormDialogShow"
            @confirm="handleSelectForm">
        </select-form-dialog>
    </section>
</template>
<script>
    import { mapState } from 'vuex'
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
            }
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
                editFormPanelShow: false, // 表单编辑
                selectFormDialogShow: false // 选择表单弹窗
            }
        },
        computed: {
            ...mapState('nocode/nodeConfig', [
                'nodeData',
                'formConfig'
            ]),
            hasCreateTicketPage () {
                return typeof this.flowConfig.pageId === 'number'
            }
        },
        methods: {
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
                this.updateFormConfig({ id: '', type: '', content: [] })
            },
            // 引用和复用
            handleSelectForm (id, content = []) {
                this.selectFormDialogShow = false
                this.updateFormConfig({ id, content, type: this.selectedType })
            },
            handleCreateForm (content) {
                this.editFormPanelShow = false
                this.updateFormConfig({ content, type: this.selectedType })
            },
            updateFormConfig (data) {
                this.$store.commit('nocode/nodeConfig/setFormConfig', data)
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
                line-height: 16px;
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
</style>
