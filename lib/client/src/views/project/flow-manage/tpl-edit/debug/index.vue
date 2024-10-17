<template>
    <div class="debug-canvas-container">
        <div class="debug-header">
            <div class="header-left">
                <i class="bk-drag-icon bk-drag-arrow-back back-icon" @click="close"></i>
                <span class="title">{{ $t('测试执行流程') }}</span>
                <span class="name">{{ tplDetail.name }}</span>
            </div>
            <div class="header-right">
                <bk-button @click="close">{{ $t('退出测试') }}</bk-button>
                <bk-button
                    theme="primary"
                    :disabled="taskId > 0"
                    @click="handleCreateAndExecute">
                    {{ $t('执行') }}
                </bk-button>
            </div>
        </div>
        <div class="debug-canvas-wrapper">
            <RenderGraph
                ref="renderGraphRef"
                :view-mode="true"
                :nodes="nodes"
                :edges="edges"
                @node:click="handleNodeClick" />
        </div>
        <node-operate-sideslider
            :show="isShowNodeOperate"
            :task-id="taskId"
            :node-data="crtNode"
            @submitted="handleSubmitted"
            @close="close" />
    </div>
</template>
<script>
    import { defineComponent, ref, watch, getCurrentInstance, onMounted, onBeforeUnmount } from '@vue/composition-api'
    import { useStore } from '@/store'
    import RenderGraph from '../canvas/render-graph/graph.vue'
    import NodeOperateSideslider from './node-operate-sideslider.vue'

    export default defineComponent({
        name: 'DebugCanvas',
        components: {
            RenderGraph,
            NodeOperateSideslider
        },
        props: {
            tplDetail: {
                type: Object,
                default: () => ({})
            }
        },
        setup (props, { emit }) {
            const instance = getCurrentInstance()

            const store = useStore()

            const renderGraphRef = ref(null)
            const nodes = ref([])
            const edges = ref([])
            const taskId = ref(32)
            const isShowNodeOperate = ref(false)
            const crtNode = ref({})
            const timer = ref(null)

            watch(() => props.tplDetail, val => {
                if (val) {
                    nodes.value = JSON.parse(val.nodes)
                    edges.value = JSON.parse(val.edges)
                }
            }, { immediate: true })

            onMounted(() => {
                getTaskStatusDetail()
            })

            onBeforeUnmount(() => {
                if (timer.value) {
                    clearTimeout(timer.value)
                }
            })

            const handleNodeClick = (node) => {
                const data = node.getData()
                if (data.type === 'Manual' && data.status === 'RUNNING') {
                    crtNode.value = data
                    isShowNodeOperate.value = true
                }
            }

            const handleCreateAndExecute = async () => {
                const res = await store.dispatch('flow/task/createAndExecuteTask', props.tplDetail.id)
                taskId.value = res.data.id
                getTaskStatusDetail()
                instance.proxy.$bkMessage({
                    theme: 'success',
                    message: window.i18n.t('流程任务已创建并开始执行')
                })
            }

            const getTaskStatusDetail = async () => {
                const res = await store.dispatch('flow/task/getTaskStatusDetail', taskId.value)
                nodes.value = JSON.parse(res.data.nodes)
                edges.value = JSON.parse(res.data.edges)
                nodes.value.forEach(node => {
                    if (node.status) {
                        renderGraphRef.value.updateNode({ id: node.id, status: node.status })
                    }
                })
                if (res.data.status === 'RUNNING') {
                    setPollingTimer()
                }
            }

            const setPollingTimer = () => {
                timer.value = setTimeout(() => {
                    getTaskStatusDetail()
                }, 3000);
            }

            const handleSubmitted = () => {
                close()
                if (timer) {
                    clearTimeout(timer.value)
                }
                getTaskStatusDetail()
            }

            const close = () => {
                isShowNodeOperate.value = false
            }

            return {
                renderGraphRef,
                nodes,
                edges,
                taskId,
                isShowNodeOperate,
                crtNode,
                handleNodeClick,
                handleCreateAndExecute,
                handleSubmitted,
                close
            }
        }
    })
</script>
<style lang="postcss" scoped>
.debug-canvas-container {
    height: 100%;
}
.debug-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 21px;
    height: 52px;
    background: #ffffff;
    box-shadow: 0 3px 4px 0 rgba(0, 0, 0, 0.04);
    .header-left {
        display: flex;
        align-items: center;
        .back-icon {
            margin-right: 20px;
            color: #3a84ff;
            cursor: pointer;
        }
        .title {
            margin-right: 12px;
            color: #313238;
        }
        .name {
            padding-left: 12px;
            line-height: 20px;
            border-left: 1px solid #e6e6e6;
        }
    }
    .header-right {
        .bk-button {
            margin-left: 8px;
        }
    }
}
.debug-canvas-wrapper {
    height: calc(100% - 52px);
}
</style>
