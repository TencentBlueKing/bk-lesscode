<template>
    <div ref="flowGraphRef" class="flow-graph-container"></div>
</template>
<script>
    import { defineComponent, onMounted } from '@vue/composition-api'
    import { Graph } from '@antv/x6';
    import { registryNode, registryEvents } from './registry';

    export default defineComponent({
        name: 'FlowGraph',
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
            console.log('props: ', props)
            console.log('ctx: ', ctx)

            const flowGraphRef = ref(null)
            const instance = ref(null)

            onMounted(() => {
                initGraph()
            })

            const initGraph = () => {
                instance.value = new Graph({
                    container: flowGraphRef.value,
                    color: '#F5F7FA',
                    autoResize: true,
                    interacting: false,
                    panning: {
                        enabled: true,
                        eventTypes: ['leftMouseDown', 'mouseWheel']
                    },
                    mousewheel: {
                        enabled: true,
                        modifiers: 'ctrl',
                        factor: 1.1,
                        maxScale: 3,
                        minScale: 0.5
                    },
                    highlighting: {
                        magnetAdsorbed: {
                            name: 'stroke',
                            args: {
                                attrs: {
                                    fill: '#fff',
                                    stroke: '#31d0c6',
                                    strokeWidth: 4
                                }
                            }
                        }
                    },
                    connecting: {
                        snap: true,
                        allowBlank: false,
                        allowLoop: false,
                        highlight: true,
                        connectionPoint: 'anchor',
                        anchor: 'center',
                        validateMagnet () {
                            return false
                        },
                        validateEdge () {
                            return false
                        }
                    }
                })

                registryNode()
                registryEvents(instance.value)
                renderNodes()
                renderEdges()
            }

            const renderNodes = () => {
                this.nodes.forEach(node => {
                    instance.value.addNode(node)
                })
            }

            const renderEdges = () => {
                this.edges.forEach(edge => {
                    instance.value.addEdge(edge)
                })
            }
        }
    })
</script>