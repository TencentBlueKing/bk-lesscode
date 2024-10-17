<template>
    <bk-sideslider
        :is-show="show"
        :width="600"
        quick-close="false"
        beforeClose="close">
        <template #header>
            <div class="task-detail-header-title" >
                <span class="title-name">{{ $t('流程节点执行详情') }}</span>
                <span class="node-name">{{ nodeName }}</span>
            </div>
        </template>
        <template #content>
            <div class="task-detail-content">
                <div class="manual-node-form-wrapper"></div>
            </div>
        </template>
    </bk-sideslider>
</template>
<script>
    import { defineComponent, ref, watch } from '@vue/composition-api'
    import { useStore } from '@/store'

    export default defineComponent({
        name: 'NodeOperateSideslider',
        props: {
            show: {
                type: Boolean,
                default: false
            },
            id: Number
        },
        setup(props, { emit }) {

            const store = useStore()

            const detailLoading = ref(true)
            const formLoading = ref(true)
            const taskDetail = ref({})
            const nodeName = ref('')
            const nodeId = ref('')
            const fields = ref([])

            watch(() => props.show, val => {
                if (val) {
                    getTaskDetail()
                }
            })

            const getTaskDetail = async() => {
                detailLoading.value = true
                const res = await store.dispatch('flow/task/getTaskDetail', props.id)
                const nodes = JSON.parse(res.data.nodes || '[]')
                taskDetail.value = res.data
                // 有正在执行的人工节点，展示第一个节点的表单
                if (res.data.runningNodeIds.length > 0) {
                    const runningNode = nodes.find(v => v.id === res.data.runningNodeIds[0])
                    if (runningNode?.type === 'Manual') {
                        const { name, formType, formId, relatedId } = runningNode.config
                        const id = formType === 'USE_FORM' ? relatedId : formId
                        nodeName.value = name
                        nodeId.value = runningNode.id
                        getFormDetail(id)
                    }
                }
                detailLoading.value = false
            }

            const getFormDetail = async(id) => {
                formLoading.value = true
                const res = await http.get('nocode/formDdetail', id)
                fields.value = JSON.parse(res.data.content || '[]')
                formLoading.value = false
            }

            const close = () => {
                emit('close')
            }

            return {
                close
            }
        }
    }
</script>
<style lang="postcss" scoped></style>