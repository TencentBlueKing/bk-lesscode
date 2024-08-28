<template>
    <div class="flow-tpl-canvas">
        <bk-alert class="deploy-tips" type="warning">
            <div class="tips-content" slot="title">
                {{ $t('当前流程未部署，需部署后，预览环境才生效；如果需要该流程在应用预发布环境或生产环境生效，需将整个应用部署至对应环境，') }}
                <bk-button style="padding: 0; height: 12px; line-height: 12px;" size="small" :text="true" :disabled="deployPending" @click="$emit('deploy')">
                    {{ $t('立即部署流程') }}</bk-button>
                {{ $t('或') }}
                <router-link class="deploy-project-btn" :to="{ name: 'release', params: { projectId } }">{{ $t('部署应用') }}</router-link>
            </div>
        </bk-alert>
        <RenderGraph
            ref="renderGraphRef"
            :nodes="nodes"
            :edges="edges"
            @node:added="handleNodeAdded"
            @node:moved="handleNodeMoved"
            @node:deleted="handleNodeDeleted"
            @node:click="handleNodeClick"
            @edge:added="handleEdgeAdded"
            @edge:deleted="handleEdgeDeleted" />
        <NodeDetail
            v-if="nodeDetailPanelData.show"
            :tpl-id="tplDetail.id"
            :detail="nodeDetailPanelData"
            @update="handleDetailUpdate"
            @close="handleDetailClose" />
    </div>
</template>
<script>
    import { defineComponent, ref, watch, computed, onMounted } from '@vue/composition-api';
    import { useStore } from '@/store'
    import { useRoute } from '@/router'
    import RenderGraph from './render-graph/graph.vue'
    import NodeDetail from './node-detail/index.vue'

    export default defineComponent({
        name: 'FlowTplCanvas',
        components: {
            RenderGraph,
            NodeDetail
        },
        props: {
            tplDetail: {
                type: Object,
                default: () => ({})
            }
        },
        setup (props) {
            const store = useStore()
            const route = useRoute()

            const renderGraphRef = ref(null)
            const nodes = ref([])
            const edges = ref([])
            const nodeDetailPanelData = ref({ show: false, data: {} })
            const deployPending = ref(false)

            const projectId = computed(() => route.params.id)

            watch(() => props.tplDetail, val => {
                if (val) {
                    nodes.value = JSON.parse(val.nodes)
                    edges.value = JSON.parse(val.edges)
                }
            }, { immediate: true })

            const handleNodeAdded = async (node) => {
                const { x, y } = node.position()
                const nodeData = { ...node.data, axis: { x, y } }
                store.dispatch('flow/tpl/createNode', { id: props.tplDetail.id, data: nodeData })
                nodes.value.push(nodeData)
            }
            const handleNodeMoved = async (node) => {
                const { x, y } = node.position()
                const nodeData = nodes.value.find(n => n.id === node.id)
                const data = { ...nodeData, axis: { x, y } }
                store.dispatch('flow/tpl/updateNode', { id: props.tplDetail.id, data })
                nodes.value.push(data)
            }
            const handleNodeDeleted = async (node, edgeIds) => {
                await store.dispatch('flow/tpl/deleteNode', { id: props.tplDetail.id, nodeId: node.id })
                const index = nodes.value.find(n => n.id === node.id)
                if (index > -1) {
                    nodes.value.splice(index, 1)
                }
                edges.value = edges.value.filter(e => !edgeIds.includes(e.id))
            }
            const handleEdgeAdded = async(edge) => {
                const { id, source, target } = edge
                await store.dispatch('flow/tpl/createEdge', { id: props.tplDetail.id, data: { id, source, target } })
                edges.value.push(edge)
            }

            const handleEdgeDeleted = async (edge) => {
                const index = edges.value.find(e => e.id === edge.id)

                if (index > -1) {
                    await store.dispatch('flow/tpl/deleteEdge', { id: props.tplDetail.id, edgeId: edge.id })
                    edges.value.splice(index, 1)
                }
            }

            const handleNodeClick = ({ id }) => {
                const node = nodes.value.find(n => n.id === id)
                if (node) {
                    nodeDetailPanelData.value = { show: true, data: node }
                }
            }

            const handleDetailUpdate = (data) => {
                if (data) {
                    const index = nodes.value.findIndex(n => n.id === data.id)
                    if (index > -1) {
                        nodes.value.splice(index, 1, data)
                        renderGraphRef.value.updateNode(data)
                    }
                }
            }

            const handleDetailClose = () => {
                nodeDetailPanelData.value = { show: false, data: {} }
            }

            return {
                renderGraphRef,
                nodes,
                edges,
                nodeDetailPanelData,
                deployPending,
                projectId,
                handleNodeAdded,
                handleNodeMoved,
                handleNodeDeleted,
                handleEdgeAdded,
                handleEdgeDeleted,
                handleNodeClick,
                handleDetailUpdate,
                handleDetailClose
            }
        }
    })
</script>
<style lang="postcss" scoped>
    .flow-tpl-canvas {
        position: relative;
        height: 100%;
        .deploy-tips {
            position: absolute;
            top: 14px;
            left: 70px;
            right: 70px;
            z-index: 110;
        }
        .deploy-project-btn {
            color: #3a84ff;
        }
        .node-detail-panel {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            z-index: 1000;
            >>> .form-section:not(:last-child) {
                margin-bottom: 16px;
            }
        }
    }
</style>
