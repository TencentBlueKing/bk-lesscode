<template>
    <div class="flow-tpl-canvas">
        <bk-alert v-if="tplDetail.deployed === 0" class="deploy-tips" type="warning">
            <div class="tips-content" slot="title">
                {{ $t('当前流程未部署，需部署后，预览环境才生效；如果需要该流程在应用预发布环境或生产环境生效，需将整个应用部署至对应环境，') }}
                <bk-button
                    class="deploy-btn"
                    size="small"
                    :text="true"
                    :disabled="deployPending"
                    @click="$emit('deploy')">
                    {{ $t('立即部署流程') }}
                </bk-button>
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
            :tpl-name="tplDetail.name"
            :nodes="nodes"
            :edges="edges"
            :detail="nodeDetailPanelData"
            @update="handleDetailUpdate"
            @close="handleDetailClose" />
    </div>
</template>
<script>
    import { defineComponent, ref, watch, computed, onMounted } from 'vue'
    import { useStore } from '@/store'
    import { useRoute } from '@/router'
    import RenderGraph from './render-graph/graph.vue'
    import NodeDetail from './node-detail/index.vue'
    import { GET_NODE_DEFAULT_CONFIG } from './render-graph/constants'
    import { uuid } from '@/common/util'

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
        setup (props, { emit }) {
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

            // 新增节点
            const handleNodeAdded = async (node) => {
                const { x, y } = node.position()
                const nodeData = { ...node.data, axis: { x, y } }
                await store.dispatch('flow/tpl/createNode', { id: props.tplDetail.id, data: nodeData })
                nodes.value.push(nodeData)
                if (nodeData.type === 'Manual') {
                    addDefaultDataProcessingNode(nodeData)
                }
                emit('updateDeployStatus', 0)
            }

            // 拖入人工节点后，自动添加一个数据处理节点
            const addDefaultDataProcessingNode = async (manualNode) => {
                const dataProcessingNode = {
                    ...GET_NODE_DEFAULT_CONFIG('DataProcessing', {
                        sourceManualNode: manualNode.id,
                        axis: {
                            x: manualNode.axis.x + 335,
                            y: manualNode.axis.y
                        },
                        isAutoAdd: true
                    })
                }
                const edge = {
                    id: `edge${uuid(12)}`,
                    source: {
                        cell: manualNode.id,
                        port: 'port_right'
                    },
                    target: {
                        cell: dataProcessingNode.id,
                        port: 'port_left'
                    }
                }

                await store.dispatch('flow/tpl/createNode', { id: props.tplDetail.id, data: dataProcessingNode })
                await store.dispatch('flow/tpl/createEdge', { id: props.tplDetail.id, data: edge })
                nodes.value.push(dataProcessingNode)
                edges.value.push(edge)
                renderGraphRef.value.updateGraph()
            }

            // 移动节点位置
            const handleNodeMoved = async (node) => {
                const { x, y } = node.position()
                const nodeData = nodes.value.find(n => n.id === node.id)
                const data = { ...nodeData, axis: { x, y } }
                await store.dispatch('flow/tpl/updateNode', { id: props.tplDetail.id, data })
                emit('updateDeployStatus', 0)
                const index = nodes.value.findIndex(n => n.id === node.id)
                if (index > -1) {
                    nodes.value.splice(index, 1, data)
                }
            }

            // 删除节点
            const handleNodeDeleted = async (node, edgeIds) => {
                await store.dispatch('flow/tpl/deleteNode', { id: props.tplDetail.id, nodeId: node.id })
                emit('updateDeployStatus', 0)
                const index = nodes.value.findIndex(n => n.id === node.id)
                if (index > -1) {
                    nodes.value.splice(index, 1)
                }
                edges.value = edges.value.filter(e => !edgeIds.includes(e.id))
            }

            // 新增边
            const handleEdgeAdded = async (edge) => {
                const { id, source, target } = edge
                await store.dispatch('flow/tpl/createEdge', { id: props.tplDetail.id, data: { id, source, target } })
                emit('updateDeployStatus', 0)
                edges.value.push(edge)
            }

            // 删除边
            const handleEdgeDeleted = async (edge) => {
                const index = edges.value.findIndex(e => e.id === edge.id)

                if (index > -1) {
                    await store.dispatch('flow/tpl/deleteEdge', { id: props.tplDetail.id, edgeId: edge.id })
                    console.log('edge delete: ', edge.id)
                    emit('updateDeployStatus', 0)
                    edges.value.splice(index, 1)
                }
            }

            const handleNodeClick = ({ id }) => {
                const node = nodes.value.find(n => n.id === id)
                if (node && !['Start', 'End'].includes(node.type)) {
                    nodeDetailPanelData.value = { show: true, data: node }
                }
            }

            const handleDetailUpdate = (data) => {
                if (data) {
                    const index = nodes.value.findIndex(n => n.id === data.id)
                    if (index > -1) {
                        nodes.value.splice(index, 1, data)
                        renderGraphRef.value.updateNode(data)
                        emit('updateDeployStatus', 0)
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
        .deploy-btn {
            padding: 0;
            height: 12px;
            line-height: 12px;
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
            z-index: 120;
            >>> .form-section:not(:last-child) {
                margin-bottom: 16px;
            }
        }
    }
</style>
