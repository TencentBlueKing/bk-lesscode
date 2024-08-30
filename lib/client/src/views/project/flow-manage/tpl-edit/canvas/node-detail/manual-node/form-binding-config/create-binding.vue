<template>
    <div class="create-binding-section">
        <div
            v-for="item in MANUAL_NODE_BINDING_TYPES"
            class="method-item"
            :key="item.id"
            @click="handleMethodClick(item.id)">
            <i class="bk-drag-icon bk-drag-crosshair"></i>
            {{ item.name }}
        </div>
        <select-form-dialog
            v-bind="dialogData"
            :nodes="nodes"
            @selected="handleSelected"
            @preview="emit('preview', $event)"
            @close="handleClose" />
    </div>
</template>
<script>
    import { defineComponent, ref } from '@vue/composition-api'
    import SelectFormDialog from './select-form-dialog.vue'
    import { MANUAL_NODE_BINDING_TYPES } from '../../../render-graph/constants'

    export default defineComponent({
        name: 'CreateBindingSection',
        components: {
            SelectFormDialog
        },
        props: {
            nodes: {
                type: Array,
                default: () => []
            }
        },
        setup (props, { emit }) {
            const dialogData = ref({
                show: false,
                isCite: true
            })

            const handleMethodClick = (val) => {
                if (val === 'NEW_FORM') {
                    emit('edit', { formId: 0, relatedId: 0, formType: val })
                } else {
                    dialogData.value.isCite = val === 'CITE_FORM'
                    dialogData.value.show = true
                }
            }

            const handleSelected = (form) => {
                emit('selected', {
                    id: form.id,
                    fields: JSON.parse(form.content || '[]'),
                    formType: dialogData.value.isCite ? 'CITE_FORM' : 'USE_FORM',
                })
            }

            const handleClose = () => {
                dialogData.value.show = false
            }

            return {
                MANUAL_NODE_BINDING_TYPES,
                dialogData,
                handleMethodClick,
                handleSelected,
                handleClose,
                emit
            }
        }
    })
</script>
<style lang="postcss" scoped>
    .create-binding-section {
        display: flex;
        align-items: center;
        justify-content: space-between;
        .method-item {
            flex: 1;
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
            &:not(:last-child) {
                margin-right: 12px;
            }
        }
    }
</style>
