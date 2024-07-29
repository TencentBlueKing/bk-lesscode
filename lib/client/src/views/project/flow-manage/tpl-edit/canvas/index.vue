<template>
    <div class="flow-tpl-canvas">
        <RenderGraph
            :nodes="nodes"
            :edges="edges"
            @node:added="handleNodeAdded"
            @node:moved="handleNodeMoved"
            @node:deleted="handleNodeDeleted"
            @edge:added="handleEdgeAdded"
            @edge:deleted="handleEdgesDeleted" />
    </div>
</template>
<script>
    import { defineComponent, ref, watch, onMounted } from '@vue/composition-api';
    import { useStore } from '@/store'
    import RenderGraph from './render-graph/graph.vue'

    export default defineComponent({
        name: 'FlowTplCanvas',
        components: {
            RenderGraph
        },
        props: {
            tplDetail: {
                type: Object,
                default: () => ({})
            }
        },
        setup (props, ctx) {
            const store = useStore()

            const nodes = ref([])
            const edges = ref([])

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
            const handleNodeDeleted = async (node) => {
                await store.dispatch('flow/tpl/deleteNode', { id: props.tplDetail.id, nodeId: node.id })
                const index = nodes.value.find(n => n.id === node.id)
                if (index > -1) {
                    nodes.value.splice(index, 1)
                }
            }
            const handleEdgeAdded = async(edge) => {
                const { id, source, target } = edge
                await store.dispatch('flow/tpl/createEdge', { id: props.tplDetail.id, data: { id, source, target } })
                edges.value.push(edge)
            }

            const handleEdgesDeleted = async (edgeIds) => {
                await store.dispatch('flow/tpl/deleteEdges', { id: props.tplDetail.id, edgeIds })
                edgeIds.value.forEach(id => {
                    const index = edges.value.find(n => n.id === id)
                    if (index > -1) {
                        edges.value.splice(index, 1)
                    }
                })
            }

            return {
                nodes,
                edges,
                handleNodeAdded,
                handleNodeMoved,
                handleNodeDeleted,
                handleEdgeAdded,
                handleEdgesDeleted
            }
        }
    })
</script>
<style lang="postcss" scoped>
    .flow-tpl-canvas {
        height: 100%;
    }
</style>
