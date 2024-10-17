<template>
    <bk-sideslider
        :is-show="show"
        :width="600"
        :transfer="true"
        :quick-close="false"
        :beforeClose="close">
        <template #header>
            <div class="task-detail-header-title" >
                <span class="title-name">{{ $t('流程节点执行详情') }}</span>
                <span class="node-name">{{ nodeData.config && nodeData.config.name }}</span>
            </div>
        </template>
        <template #content>
            <div v-if="!formLoading" class="task-detail-content">
                <div class="manual-node-form-wrapper">
                    <manual-node :id="taskId" :node-id="nodeData.id" :fields="fields" @submitted="emit('submitted')" @close="emit('close')
" />
                </div>
            </div>
        </template>
    </bk-sideslider>
</template>
<script>
    import { defineComponent, ref, watch, getCurrentInstance } from '@vue/composition-api'
    import { useStore } from '@/store'
    import ManualNode from './manual-node.js'

    export default defineComponent({
        name: 'NodeOperateSideslider',
        components: {
            ManualNode
        },
        props: {
            show: {
                type: Boolean,
                default: false
            },
            taskId: Number,
            nodeData: {
                type: Object,
                default: () => ({})
            }
        },
        setup(props, { emit }) {
            const instance = getCurrentInstance()

            const store = useStore()

            const formLoading = ref(true)
            const fields = ref([])
            const formContainerRef = ref()
            const pending = ref(false)

            watch(() => props.show, val => {
                if (val) {
                    getFormDetail()
                }
            })

            const getFormDetail = async() => {
                formLoading.value = true
                const { formType, formId, relatedId } = props.nodeData.config
                const id = formType === 'USE_FORM' ? relatedId : formId
                const res = await store.dispatch('nocode/form/formDetail', { formId: id })
                fields.value = JSON.parse(res.content || '[]')
                formLoading.value = false
            }

            const handleSumitClick = () => {
                formContainerRef.value.handleSubmit()
            }

            const submitFormData = async(data) => {
                try {
                    pending.value = true
                    await store.dispatch(`flow/task/submitExecuteManualNode`, { id: props.taskId, nodeId: props.nodeData.id, data })
                    close()
                    instance.proxy.$bkMessage({
                        theme: 'success',
                        message: window.i18n.t('提交成功')
                    })
                } catch (e) {
                    console.error(e)
                } finally {
                    pending.value = false
                }
            }

            return {
                fields,
                pending,
                formLoading,
                submitFormData,
                handleSumitClick,
                emit
            }
        }
    })
</script>
<style lang="postcss" scoped>
.task-detail-header-title {
    display: flex;
    align-items: center;
    .title-name {
        flex-shrink: 0;
    }
    .node-name {
        flex: 1;
        margin-left: 8px;
        padding-left: 8px;
        height: 18px;
        line-height: 18px;
        color: #979ba5;
        font-size: 12px;
        border-left: 1px solid #dcdee5;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
}
.task-detail-content {
    height: calc(100vh - 52px);
    .task-detail-content-footer {
        margin-top: 20px;
        .bk-button {
            margin-right: 8px;
        }
    }
}
.manual-node-form-wrapper {
    height: 100%;
    .bkform-engine-renderer {
        max-height: calc(100% - 72px);
    }
    .task-detail-content-footer {
        padding: 0 32px;
    }
}
</style>
