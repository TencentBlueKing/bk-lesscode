<template>
    <section class="nodes-container"></section>
</template>

<script>
    import {
        Graph
    } from '@antv/x6'
    import {
        register
    } from '../x6-render-vue/registry.js'
    import {
        onMounted,
        defineComponent
    } from '@vue/composition-api'
    import RenderParentNode from './render-parent-node.vue'
    import RenderChildNode from './render-child-node.vue'

    register({
        shape: 'parent-node',
        width: 260,
        height: 60,
        component: RenderParentNode
    })

    register({
        shape: 'child-node',
        width: 219,
        height: 36,
        component: RenderChildNode
    })

    export default defineComponent({
        setup () {
            let graph
            const childNodeOffset = 40
            const childNodeHeight = 36
            const childNodeMarginTop = 12
            const parentNodeWidth = 260
            const parentNodeHeight = 60
            const parentNodeOffset = 50
            const parentLineOffset = 5
            const taskOffset = 45
            const smoothOffset = 20

            const getLineColor = (status) => {
                const colorMap = {
                    success: '#1CAB88',
                    fail: '#EA3636'
                }
                return colorMap[status] || '#979BA5'
            }

            const initGraph = () => {
                graph = new Graph({
                    container: document.querySelector('.nodes-container'),
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
            }

            // 初始化节点/边
            const initNodes = (data) => {
                // 当前绘制的起始坐标
                let x = 150
                let y = 150

                let maxX = 0
                const finalTasks = []

                data.tasks.forEach((task) => {
                    x = 150
                    let maxTask = 0

                    task.forEach((item, index) => {
                        x += (parentNodeWidth + parentNodeOffset)
                        // calc max task height
                        const taskHeight = parentNodeHeight + (item?.children?.length * (childNodeHeight + childNodeMarginTop) || 0)
                        if (taskHeight > maxTask) {
                            maxTask = taskHeight
                        }
                        // parent node
                        graph.addNode({
                            x,
                            y,
                            shape: 'parent-node',
                            data: item
                        })
                        item?.children.map((child, index) => {
                            const childX = x + childNodeOffset
                            const childY = y + parentNodeHeight + childNodeMarginTop + index * (childNodeHeight + childNodeMarginTop)
                            graph.addNode({
                                x: childX,
                                y: childY,
                                shape: 'child-node',
                                data: child
                            })

                            graph.addEdge({
                                source: { x: x + parentLineOffset, y: y + parentNodeHeight },
                                target: { x: childX, y: childY + childNodeHeight / 2 },
                                vertices: [{ x: x + parentLineOffset, y: childY + childNodeHeight / 2 }],
                                attrs: {
                                    line: {
                                        stroke: '#C4C6CC',
                                        strokeWidth: 1,
                                        strokeDasharray: 3,
                                        targetMarker: {
                                            name: 'circle',
                                            r: 3,
                                            cx: 3,
                                            fill: '#fff',
                                            stroke: '#C4C6CC'
                                        }
                                    }
                                }
                            })
                        })
                        if (index > 0) {
                            graph.addEdge({
                                source: { x: x - parentNodeOffset, y: y + parentNodeHeight / 2 },
                                target: { x, y: y + parentNodeHeight / 2 },
                                attrs: {
                                    line: {
                                        stroke: getLineColor(item.status),
                                        strokeWidth: 1,
                                        targetMarker: {
                                            name: 'block',
                                            size: 7
                                        }
                                    }
                                }
                            })
                        }
                    })

                    finalTasks.push({
                        x: x + parentNodeWidth,
                        y,
                        status: task.status
                    })

                    if (x >= maxX) {
                        maxX = x
                    }
                    y += (maxTask + taskOffset)
                })

                finalTasks.forEach((item) => {
                    const sourceX = item.x
                    const sourceY = item.y + (parentNodeHeight / 2)
                    const targetX = maxX + parentNodeWidth + parentNodeOffset
                    const targetY = y / 2 + parentNodeHeight / 2
                    graph.addEdge({
                        source: { x: sourceX, y: sourceY },
                        target: { x: targetX, y: targetY },
                        connector: {
                            name: 'rounded',
                            args: {
                                radius: 30
                            }
                        },
                        vertices: [
                            { x: sourceX + smoothOffset, y: sourceY > targetY ? sourceY - smoothOffset : sourceY + smoothOffset },
                            { x: targetX - smoothOffset, y: sourceY > targetY ? targetY + smoothOffset : targetY - smoothOffset }
                        ],
                        attrs: {
                            line: {
                                stroke: getLineColor(item.status),
                                strokeWidth: 1,
                                targetMarker: null
                            }
                        }
                    })
                })

                data.others.forEach((other, index) => {
                    const otherX = maxX + (index + 1) * (parentNodeWidth + parentNodeOffset)
                    const otherY = y / 2
                    graph.addNode({
                        x: otherX,
                        y: otherY,
                        shape: 'parent-node',
                        data: other
                    })

                    if (index > 0) {
                        graph.addEdge({
                            source: { x: otherX - parentNodeOffset, y: otherY + (parentNodeHeight / 2) },
                            target: { x: otherX, y: otherY + (parentNodeHeight / 2) },
                            attrs: {
                                line: {
                                    stroke: getLineColor(other.status),
                                    strokeWidth: 1,
                                    targetMarker: {
                                        name: 'block',
                                        size: 7
                                    }
                                }
                            }
                        })
                    }
                })
            }

            // 更新节点状态
            // const updateNodes = (data) => {
            //     const updateData = (item) => {
            //         const node = graph.getCellById(item.id)
            //         node.setData(item)
            //     }
            //     data.tasks.forEach((task) => {
            //         task.forEach((item) => {
            //             updateData(item)
            //             item?.children.forEach(updateData)
            //         })
            //     })
            //     data.others.forEach(updateData)
            // }

            const data = {
                tasks: [
                    [
                        {
                            id: 1,
                            name: '需求一',
                            status: 'success',
                            children: [
                                {
                                    id: 2,
                                    name: '生成文件api',
                                    status: 'success'
                                },
                                {
                                    id: 3,
                                    name: '生成文件js',
                                    status: 'success'
                                },
                                {
                                    id: 4,
                                    name: '生成文件ppt',
                                    status: 'success'
                                }
                            ]
                        },
                        {
                            id: 5,
                            name: '任务一',
                            status: 'loading',
                            children: [
                                {
                                    id: 6,
                                    name: '生成文件api',
                                    status: 'success'
                                },
                                {
                                    id: 7,
                                    name: '生成文件js',
                                    status: 'success'
                                },
                                {
                                    id: 8,
                                    name: '生成文件ppt',
                                    status: 'loading'
                                }
                            ]
                        }
                    ],
                    [
                        {
                            id: 1,
                            name: '需求二',
                            status: 'fail',
                            children: [
                                {
                                    id: 2,
                                    name: '生成文件api',
                                    status: 'success'
                                },
                                {
                                    id: 3,
                                    name: '生成文件js',
                                    status: 'fail'
                                },
                                {
                                    id: 4,
                                    name: '生成文件ppt',
                                    status: 'success'
                                }
                            ]
                        },
                        {
                            id: 5,
                            name: '任务一',
                            status: 'fail',
                            children: [
                                {
                                    id: 6,
                                    name: '生成文件api',
                                    status: 'success'
                                },
                                {
                                    id: 7,
                                    name: '生成文件js',
                                    status: 'loading'
                                },
                                {
                                    id: 8,
                                    name: '生成文件ppt',
                                    status: null
                                }
                            ]
                        },
                        {
                            id: 5,
                            name: '任务一',
                            status: 'fail',
                            children: [
                                {
                                    id: 6,
                                    name: '生成文件api',
                                    status: 'success'
                                },
                                {
                                    id: 7,
                                    name: '生成文件js',
                                    status: 'loading'
                                },
                                {
                                    id: 8,
                                    name: '生成文件ppt',
                                    status: null
                                }
                            ]
                        },
                        {
                            id: 5,
                            name: '任务一',
                            status: 'fail',
                            children: [
                                {
                                    id: 6,
                                    name: '生成文件api',
                                    status: 'success'
                                },
                                {
                                    id: 7,
                                    name: '生成文件js',
                                    status: 'loading'
                                },
                                {
                                    id: 8,
                                    name: '生成文件ppt',
                                    status: null
                                }
                            ]
                        },
                        {
                            id: 5,
                            name: '任务一',
                            status: 'fail',
                            children: [
                                {
                                    id: 6,
                                    name: '生成文件api',
                                    status: 'success'
                                },
                                {
                                    id: 7,
                                    name: '生成文件js',
                                    status: 'loading'
                                },
                                {
                                    id: 8,
                                    name: '生成文件ppt',
                                    status: null
                                }
                            ]
                        }
                    ]
                ],
                others: [
                    {
                        id: '456',
                        name: '集成框架',
                        status: 'success',
                        downloadUrl: ''
                    },
                    {
                        id: '422',
                        name: '开发环境启动',
                        status: 'success'
                    },
                    {
                        id: '14124',
                        name: '测试预览',
                        url: 'api doc url',
                        status: 'success'
                    }
                ]
            }

            onMounted(() => {
                initGraph()
                initNodes(data)
            })
        }
    })
</script>

<style lang="postcss" scoped>
.node {
    display: flex;
    align-items: center;
    width: 100%;
    height: 100%;
    background-color: #fff;
    border: 1px solid #c2c8d5;
    border-left: 4px solid #5F95FF;
    border-radius: 4px;
    box-shadow: 0 2px 5px 1px rgba(0, 0, 0, 0.06);
}
.node img {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    margin-left: 8px;
}
.node .label {
    display: inline-block;
    flex-shrink: 0;
    width: 104px;
    margin-left: 8px;
    color: #666;
    font-size: 12px;
}
.node .status {
    flex-shrink: 0;
}
.node.success {
    border-left: 4px solid #52c41a;
}
.node.failed {
    border-left: 4px solid #ff4d4f;
}
.node.running .status img {
    animation: spin 1s linear infinite;
}
.x6-node-selected .node {
    border-color: #1890ff;
    border-radius: 2px;
    box-shadow: 0 0 0 4px #d4e8fe;
}
.x6-node-selected .node.success {
    border-color: #52c41a;
    border-radius: 2px;
    box-shadow: 0 0 0 4px #ccecc0;
}
.x6-node-selected .node.failed {
    border-color: #ff4d4f;
    border-radius: 2px;
    box-shadow: 0 0 0 4px #fedcdc;
}
.x6-edge:hover path:nth-child(2){
    stroke: #1890ff;
    stroke-width: 1px;
}

.x6-edge-selected path:nth-child(2){
    stroke: #1890ff;
    stroke-width: 1.5px !important;
}

@keyframes running-line {
    to {
        stroke-dashoffset: -1000;
    }
}
@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}
</style>
