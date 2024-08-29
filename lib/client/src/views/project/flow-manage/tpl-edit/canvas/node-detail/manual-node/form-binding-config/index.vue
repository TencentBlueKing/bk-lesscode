<template>
    <div class="form-binding-config">
        <create-binding
            v-if="config.formType === ''"
            :nodes="nodes"
            @preview="handleOpenPreview"
            @selected="emit('update', $event)" />
        <bound-detail v-else :form-type="config.formType" :form-id="config.formId" />
        <preview-form-dialog v-bind="previewDialogData" @close="previewDialogData.show = false" />
    </div>
</template>
<script>
    import { defineComponent, ref } from '@vue/composition-api'
    import CreateBinding from './create-binding.vue'
    import BoundDetail from './bound-detail.vue';
    import PreviewFormDialog from './preview-form-dialog.vue'

    export default defineComponent({
        name: 'FormBindingConfig',
        components: {
            CreateBinding,
            BoundDetail,
            PreviewFormDialog
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

            const handleOpenPreview = (fields) => {
                previewDialogData.value = {
                    show: true,
                    fields
                }
            }

            return {
                previewDialogData,
                handleOpenPreview,
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
