<template>
    <bk-button
        v-bk-tooltips="{ content: $t('复用表单模式下表单不可编辑'), disabled: editable, placement: 'bottom-end' }"
        theme="primary"
        :loading="pending"
        :class="{ disabled: !editable }"
        @click="handleClick">
        {{ $t('保存') }}
    </bk-button>
</template>
<script>
    import { defineComponent, ref } from '@vue/composition-api'
    import { useStore } from '@/store'
    import { useRoute } from '@/router'
    import { uuid } from '@/common/util'

    export default defineComponent ({
        name: 'SaveBtn',
        props: {
            editable: {
                type: Boolean,
                default: true
            },
            tplId: Number,
            nodeId: String,
            fields: {
                type: Array,
                default: () => []
            },
            formId: Number,
            formName: String,
            formType: String,
            tableName: String
        },
        setup (props, { emit }) {
            const store = useStore()
            const route = useRoute()

            const pending = ref(false)

            const handleClick = async() => {
                if (!props.editable) return
                
                const fieldList = props.fields.map(item => {
                    const fieldItem = { ...item }
                    delete fieldItem.unsaved
                    return fieldItem
                })
                const common = {
                    content: fieldList,
                    formName: props.formName,
                    componentId: `flow-tpl-${props.tplId}-${props.nodeId}`,
                    projectId: route.params.projectId
                }
                try {
                    pending.value = true
                    let formId = props.formId
                    let tableName = props.tableName
                    if (props.formId) {
                        await store.dispatch('form/updateForm', { ...common, id: formId, tableName })
                    } else {
                        const res = await store.dispatch('form/createForm', { ...common, tableName: `manual_node_${props.tplId}_${props.nodeId}_${uuid(4)}` })
                        formId = res.id
                        tableName = res.tableName
                    }
    
                    emit('saved', { formId, formType: props.formType, tableName })
                } catch (e) {
                    console.error(e)
                } finally {
                    pending.value = false
                }

            }

            return {
                pending,
                handleClick
            }
        }
    })
</script>
<style lang="postcss" scoped>
    .bk-button {
        min-width: 88px;
        &.disabled {
            background-color: #dcdee5;
            border-color: #dcdee5;
            color: #fff;
        }
    }
</style>