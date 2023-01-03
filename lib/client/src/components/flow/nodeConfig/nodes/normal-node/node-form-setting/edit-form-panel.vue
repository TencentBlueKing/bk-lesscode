<template>
    <div class="edit-form-panel">
        <div class="content-edit-container">
            <div class="edit-header">
                <div class="nav-area">
                    <i class="bk-drag-icon bk-drag-arrow-back back-icon" @click="close"></i>
                    <div class="split-line"></div>
                    <breadcrumb-nav :flow-config="flowConfig" @close="close" @closeNode="$emit('closeNode')"></breadcrumb-nav>
                </div>
                <div
                    id="toolActionBox"
                    class="function-and-tool">
                    <operation-select v-model="operationType" :hide-setting="hideSetting" :hide-func="hideSetting"></operation-select>
                    <!-- 保存、预览、快捷键等tool单独抽离 -->
                    <action-tool
                        :custom-save="true"
                        :hide-save="hideSave"
                        :hide-preview="hidePreview"
                        :hide-func="hidePreview"
                        :hide-clear="hideClear"
                        @save="$emit('save', $event)">
                    </action-tool>
                </div>
                <extra-links></extra-links>
            </div>
            <div class="edit-content-wrapper">
                <nocode-form
                    v-show="operationType === 'edit'"
                    page-type="FLOW"
                    :content="formConfig.content"
                    :disabled="formConfig.type === 'USE_FORM'">
                </nocode-form>
                <page-setting v-if="operationType === 'setting'"></page-setting>
                <page-function v-if="operationType === 'pageFunction'"></page-function>
                <page-json v-else-if="operationType === 'jsonSource'" style="height: 100%;" nocode-type="FLOW"></page-json>
            </div>
        </div>
    </div>
</template>
<script>
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
            hideSave: Boolean,
            hidePreview: Boolean,
            hideClear: Boolean,
            flowConfig: {
                type: Object,
                default: () => ({})
            },
            formConfig: {
                type: Object,
                default: () => ({})
            }
        },
        data () {
            return {
                operationType: 'edit'
            }
        },
        created () {
            this.$store.commit('nocode/formSetting/setFieldsList', this.formConfig.content)
        },
        methods: {
            close () {
                this.$emit('update:editFormPanelShow', false)
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .edit-form-panel {
        position: fixed;
        /* 全局导航高度 */
        top: 52px;
        right: 0;
        bottom: 0;
        left: 0;
        background: #fafbfd;
        z-index: 3000;
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
