<template>
    <div class="form-binding-config">
        <create-binding
            v-if="config.formType === ''"
            :nodes="nodes"
            @preview="handleOpenPreview"
            @edit="emit('edit', $event)"
            @selected="emit('select', $event)" />
        <bound-detail
            v-else
            :tpl-id="tplId"
            :node-id="nodeId"
            :form-type="config.formType"
            :form-id="config.formId"
            :related-id="config.relatedId"
            :container-pages="containerPages"
            :is-first-and-manual-node="isFirstAndManualNode"
            @updateContainerPages="emit('updateContainerPages', $event)"
            @preview="handleOpenPreview"
            @edit="handleOpenEdit"
            @delete="emit('delete')" />
        <preview-form-dialog v-bind="previewDialogData" @close="previewDialogData.show = false" />
    </div>
</template>
<script>
    import { defineComponent, ref } from 'vue'
    import CreateBinding from './create-binding.vue'
    import BoundDetail from './bound-detail.vue';
    import PreviewFormDialog from './preview-form-dialog.vue'

    export default defineComponent({
        name: 'FormBindingConfig',
        components: {
            CreateBinding,
            BoundDetail,
            PreviewFormDialog,
        },
        props: {
            tplId: Number,
            nodeId: String,
            nodes: {
                type: Array,
                default: () => []
            },
            containerPages: {
                type: Object,
                default: () => ({
                    formContainer: [],
                    dataManageContainer: []
                })
            },
            config: {
                type: Object,
                default: () => ({})
            },
            isFirstAndManualNode: Boolean
        },
        setup (props, { emit }) {
            const previewDialogData = ref({
                show: false,
                fields: []
            })

            const handleOpenPreview = (id) => {
                previewDialogData.value = {
                    show: true,
                    id
                }
            }

            const handleOpenEdit = () => {
                const { formType, formId, relatedId } = props.config
                emit('edit', { formType, formId, relatedId })
            }

            return {
                previewDialogData,
                handleOpenPreview,
                handleOpenEdit,
                emit
            }
        }
    })
</script>
<style lang="postcss" scoped>
    .form-binding-config {
        width: 656px;
    }
</style>
