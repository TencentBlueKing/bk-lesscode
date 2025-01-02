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
            :form-type="config.formType"
            :form-id="config.formId"
            :related-id="config.relatedId"
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
            nodes: {
                type: Array,
                default: () => []
            },
            config: {
                type: Object,
                default: () => ({})
            }
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
