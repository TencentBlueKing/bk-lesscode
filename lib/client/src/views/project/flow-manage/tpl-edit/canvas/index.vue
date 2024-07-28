<template>
    <div class="flow-tpl-canvas">
        <RenderGraph :nodes="nodes" :edges="edges" />
    </div>
</template>
<script>
    import RenderGraph from './render-graph/graph.vue'
    import { defineComponent, watch, onMounted } from '@vue/composition-api';
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
        data () {
            return {
                nodes: [],
                edges: []
            }
        },
        setup (props, ctx) {
            const nodes = ref([])
            const edges = ref([])

            watch(() => props.tplDetail, val => {
                if (val) {
                    nodes.value = JSON.parse(val.nodes)
                    edges.value = JSON.parse(val.edges)
                }
            }, { immediate: true })

            onMounted(() => {
                console.log('nodes: ', nodes.value)
                console.log('edges: ', edges.value)
            })

            return { nodes, edges }
        }
    })
</script>
