<template>
    <div ref="containerRef" class="graph-dnd">
        <ul class="node-list">
            <li
                v-for="node in NODES"
                :key="node.type"
                :class="['node-item', 'bk-drag-icon', GET_NODE_ICON(node.type), ['Manual', 'DataProcessing'].includes(node.type) ? '' : 'disabled']"
                :data-type="node.type"
                @mousedown="startDrag">
                    <div v-if="['Start', 'End'].includes(node.type)" class="circle-node">
                        <span class="text">{{ node.name }}</span>
                    </div>
                </li>
        </ul>
    </div>
</template>
<script>
    import { defineComponent, ref, onMounted } from '@vue/composition-api'
    import { Graph } from '@antv/x6';
    import { Dnd } from "@antv/x6-plugin-dnd"
    import { NODES, GET_NODE_ICON, IS_CIRCLE_NODE, GET_NODE_DEFAULT_CONFIG } from './constants'
    import { uuid } from '@/common/util'

    export default defineComponent({
        name: 'GraphDnd',
        props: {
            instance: Graph
        },
        setup (props) {
            const dndIns = ref(null)
            const containerRef = ref(null)

            onMounted (() => {
                dndIns.value = new Dnd({
                    target: props.instance,
                    scaled: false,
                    dndContainer: containerRef.value,
                    nodeDragging: (e, node) => handleNodeDragging(e, node),
                    nodeDragEnd: (e, node) => handleNodeDragEnd(e, node),
                    getDragNode: node => node.clone({ keepId: true }),
                    getDropNode: node => node.clone({ keepId: true })
                })
                
            })

            const startDrag = (e) => {
                const target = e.currentTarget
                const type = target.getAttribute('data-type')
                const isCircleNode = IS_CIRCLE_NODE(type)
                const nodeData = GET_NODE_DEFAULT_CONFIG(type)
                const node = props.instance.createNode({
                    id: nodeData.id,
                    shape: isCircleNode ? 'custom-circle' : 'custom-rect',
                    data: nodeData
                })

                dndIns.value.start(node, e)
            }

            const handleNodeDragging = () => {}

            const handleNodeDragEnd = (e, node) => {
                console.log(node)
            }

            return {
                NODES,
                containerRef,
                GET_NODE_ICON,
                startDrag
            }
        }
    })
</script>
<style lang="postcss" scoped>
    .graph-dnd {
        width: 56px;
        height: 100%;
        background-color: #fff;
        border-right: 1px solid #dcdee5;
        .node-item {
            padding: 12px 0;
            width: 100%;
            color: #979ba5;
            user-select: none;
            cursor: move;
            &.bk-drag-icon {
                font-size: 20px;
            }
            &:hover {
                background: #e1ecff;
                color: #3a84ff;
            }
            &.disabled {
                pointer-events: none;
                cursor: not-allowed;
                opacity: 0.3;
            }
            .circle-node {
                display: inline-flex;
                justify-content: center;
                align-items: center;
                width: 20px;
                height: 20px;
                border: 2px solid #979ba5;
                border-radius: 50%;
                .text {
                    display: block;
                    font-size: 12px;
                    color: #979ba5;
                    transform: scale(0.5);
                    white-space: nowrap;
                }
            }
        }
    }
</style>
