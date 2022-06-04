<template>
    <section class="node-form-setting">
        <div class="create-form-methods">
            <div
                v-for="item in createFormMethods"
                class="create-method-item"
                :key="item.id"
                @click="handleCreateForm(item.id)">
                <i class="bk-icon icon-plus"></i>
                {{ item.name }}
            </div>
        </div>
        <!-- <div class="edit-form-card">
            <div class="card-header">
                <h5>差旅补贴申请</h5>
                <div class="type-label">引用表单</div>
            </div>
            <p class="created-page">是否生成流程提单页：否</p>
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
        </div> -->
        <select-form-dialog
            :method="createMethod"
            :show.sync="selectFormDialogShow">
        </select-form-dialog>
    </section>
</template>
<script>
    import SelectFormDialog from './select-form-dialog.vue'

    export default {
        name: 'NodeFormSetting',
        components: {
            SelectFormDialog
        },
        data () {
            return {
                createFormMethods: [
                    { id: 'new', name: '创建空白表单' },
                    { id: 'cite', name: '引用已有表单' },
                    { id: 'use', name: '复用已有表单' }
                ],
                createMethod: '',
                selectFormDialogShow: false
            }
        },
        methods: {
            handleCreateForm (val) {
                this.selectFormDialogShow = true
                this.createMethod = val
            },
            handleEditClick () {},
            handlePreviewClick () {},
            handleDelClick () {}
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
        p {
            margin-top: 4px;
            line-height: 16px;
            font-size: 12px;
            color: #63656e;
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
