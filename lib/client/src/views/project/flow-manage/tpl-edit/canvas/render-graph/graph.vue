<template>
    <div class="render-graph">
        <Tools v-if="instance" class="tools-container" />
        <Dnd v-if="instance" class="dnd-container" :instance="instance" />
        <div ref="renderGraphRef" class="graph-canvas-container"></div>
    </div>
</template>
<script>
    import { defineComponent, ref, onMounted } from '@vue/composition-api'
    import { Graph } from '@antv/x6';
    import { Snapline } from '@antv/x6-plugin-snapline'
    import { registryNode } from './registry'
    import { GET_GRAPH_CONFIG } from './constants'
    import Dnd from './dnd.vue'
    import Tools from './tools.vue'

    export default defineComponent({
        name: 'RenderGraph',
        components: {
            Dnd,
            Tools
        },
        props: {
            nodes: {
                type: Array,
                default: () => []
            },
            edges: {
                type: Array,
                default: () => []
            }
        },
        setup (props, ctx) {
            const renderGraphRef = ref(null)
            const instance = ref(null)

            onMounted(() => {
                initGraph()
            })

            const initGraph = () => {
                instance.value = new Graph(GET_GRAPH_CONFIG(renderGraphRef.value))

                // 节点对齐线
                instance.value.use(
                    new Snapline({
                        enabled: true
                    })
                )

                registryNode({ delete: handleDeleteNode })
                setGraphEvents()
                updateGraph()
            }

            const setGraphEvents = () => {
                // 控制连接桩显示/隐藏
                instance.value.on('node:mouseenter', ({ cell }) => {
                    const ports = cell.getPorts()
                    ports.forEach((item) => {
                        cell.setPortProp(item.id, 'attrs/circle/style/visibility', 'visible')
                    })
                })
                instance.value.on('node:mouseleave', ({ cell }) => {
                    const ports = cell.getPorts()
                    ports.forEach((item) => {
                        cell.setPortProp(item.id, 'attrs/circle/style/visibility', 'hidden')
                    })
                })
                // 节点停止移动
                instance.value.on('node:moved', ({ node }) => ctx.emit('node:moved', node))
                // 新增节点
                instance.value.on('node:added', ({ node }) => ctx.emit('node:added', node))
                // 鼠标点击
                instance.value.on('cell:click', ({ node }) => ctx.emit('node:click', node));
                // 新增边
                instance.value.on('edge:connected', ({ edge }) => ctx.emit('edge:added', edge));
            }

            const updateGraph = () => {
                const cells = []
                props.nodes.forEach(node => {
                    const { id, axis, type } = node
                    const { x, y } = axis
                    const shape = ['Start', 'End'].includes(type) ? 'custom-circle' : 'custom-rect'
                    cells.push(instance.value.createNode({
                        shape,
                        id,
                        x,
                        y,
                        data: node
                    }))
                })
                props.edges.forEach(edge => {
                    cells.push(instance.value.createEdge({
                        shape: 'edge',
                        ...edge,
                        attrs: {
                            line: {
                                stroke: '#a9adb6',
                                strokeWidth: 2,
                                targetMarker: {
                                    name: 'block',
                                    width: 6,
                                    height: 8,
                                },
                            },
                        },
                        zIndex: 0,
                        router: {
                            name: 'manhattan',
                            args: {
                                padding: 1,
                            },
                        }
                    }))
                })
                instance.value.resetCells(cells)
            }

            const handleDeleteNode = (node) => {
                instance.value.removeNode(node.id)
                ctx.emit('node:deleted', node)
            }

            return {
                renderGraphRef,
                instance
            }
        }
    })
</script>
<style lang="postcss" scoped>
    .render-graph {
        position: relative;
        display: flex;
        align-items: flex-start;
        width: 100%;
        height: 100%;
        overflow: hidden;
        .dnd-container {}
        .tools-container {
            position: absolute;
            top: 20px;
            left: 100px;
            z-index: 1;
        }
        .graph-canvas-container {
            height: 100%;
            flex: 1;
            cursor: -webkit-grab;
        }
    }
</style>
