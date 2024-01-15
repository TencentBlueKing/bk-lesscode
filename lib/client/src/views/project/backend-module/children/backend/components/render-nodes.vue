<template>
    <section v-bkloading="{ isLoading }" style="width: 100%; height: 100%;">
        <empty-status v-if="!storyList.length" type="custom" :part="false">
            <div>
                <span>{{$t('请先添加需求描述')}}</span>
            </div>
        </empty-status>
        <section class="nodes-container">
        </section>
    </section>
</template>

<script>
    import { Graph } from '@antv/x6'
    import { register } from '../x6-render-vue/registry.js'
    import { ref, computed, watch, onMounted, defineComponent, nextTick } from '@vue/composition-api'
    import { useStore } from '@/store'
    import { debounce } from 'shared/util.js'
    import { finalNodeTypes, getGraphDefaultConfig, sortNodes, getLineColor, getStatusMap } from './common'
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
        props: {
            moduleId: {
                type: Number,
                default: 0
            }
        },
        setup (props) {
            const store = useStore()
            const isLoading = ref(false)

            let socket
            const storyList = ref([])
            let saasBuilderList = []
            let runningStory = {}
            let latestStory =  {}

            const initRenderData = {
                tasks: [],
                others: [
                    {
                        id: 'MigrateProcessor',
                        name: '集成框架',
                        status: '',
                        url: ''
                    },
                    {
                        id: 'LaunchProcessor',
                        name: '开发环境启动',
                        status: '',
                        url: ''
                    },
                    {
                        id: 'PreviewProcessor',
                        name: '测试预览',
                        url: '',
                        status: ''
                    }
                ]
            }
            let renderData = {}

            const moduleId = computed(() => {
                return props.moduleId
            })

            const needUpdate = computed(() => {
                return store.getters['saasBackend/getNeedUpdate']
            })

            watch(
                moduleId,
                () => {
                    socket && socket.close()
                    fetchData()
                }
            )

            watch(
                needUpdate,
                (val) => {
                    if (val) {
                        console.log('watch needupdate', val)
                        socket && socket.close()
                        fetchData()
                        store.commit('saasBackend/setStateProperty', { key: 'needUpdate', value: false })
                    }
                }
            )

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

            const initGraph = () => {
                const graphConfig = getGraphDefaultConfig()
                graph = new Graph(graphConfig)
            }

            // 找到当前builder在图中的index
            const findTaskFromRenderData = (id) => {
                const tasks = renderData.tasks
                let taskIndex = undefined
                tasks.forEach((task, index) => {
                    if (task[0]?.id === id) {
                        taskIndex = index
                    }
                })
                return taskIndex
            }

            const debounceUpdateNodes = debounce((buildItem) => {
                updateNodes(buildItem)
            }, 1000)

            const updateNodes = (wsBuilderItem) => {
                const builderItem = JSON.parse(JSON.stringify(wsBuilderItem))
                if (builderItem?.session_id !== runningStory?.session_id) return
                const story = {
                    ...builderItem,
                    id: builderItem.session_id,
                    type: 'story',
                    children: builderItem.nodes,
                    nodes: undefined,
                    status: getStatusMap(builderItem.status)
                }
                const { task, finalNodes }= getNodeFromStory(story)

                const index = findTaskFromRenderData(builderItem.session_id)
                if (index !== undefined) {
                    renderData.tasks[index] = task
                    updateOthersData(finalNodes)
                    graph.clearCells()
                    nextTick(()=> initNodes(renderData))
                }
                if (getStatusMap(builderItem.status) !== 'running') {
                    store.commit('saasBackend/setStateProperty', { key: 'isExecuting', value: false })
                    runningStory = {}
                }
                // 更新到store里面的saasbuilderList
                const runningIndex = saasBuilderList.findIndex(builder => builder.status === 'running')
                saasBuilderList.splice(runningIndex, 1, wsBuilderItem)
                store.commit('saasBackend/setStateProperty', { key: 'saasBuilderList', value: saasBuilderList })    
            }

            const updateOthersData = (finalNodes) => {
                const others = renderData.others
                others.forEach(other => {
                    const node = finalNodes.find(node => node?.content?.type === other.id)
                    node && (other.status = getStatusMap(node.status))
                    if (other.id === 'MigrateProcessor') {
                        other.url = node?.content?.result?.edit_url
                    }
                    if (other.id === 'LaunchProcessor') {
                        other.url = node?.content?.result?.app_url
                    }
                })
            }

            // 初始化节点/边
            const initNodes = (data) => {
                console.log(data, 'updateData')
                // 找出当前running的节点， 批量删除
                if (data?.tasks.length === 0) return
                // 当前绘制的起始坐标
                let x = 0
                let y = 150

                let maxX = 0
                const finalTasks = []

                data.tasks.forEach((task) => {
                    x = 0
                    let maxTask = 0

                    // 遍历的时候，判断是正在running的那一条需求及其后面的， 重画， 否则直接return

                    task.forEach((item, index) => {
                        x += (parentNodeWidth + parentNodeOffset)
                        // calc max task height
                        const taskHeight = parentNodeHeight + (item?.children?.length * (childNodeHeight + childNodeMarginTop) || 0)
                        if (taskHeight > maxTask) {
                            maxTask = taskHeight
                        }
                        // parent node
                        graph.addNode({
                            id: item.id,
                            x,
                            y,
                            shape: 'parent-node',
                            data: item
                        })
                        item?.children?.map((child, index) => {
                            const childX = x + childNodeOffset
                            const childY = y + parentNodeHeight + childNodeMarginTop + index * (childNodeHeight + childNodeMarginTop)
                            graph.addNode({
                                id: child.id,
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

                data?.others?.forEach((other, index) => {
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

            const fetchData = async function () {
                isLoading.value = true
                renderData = JSON.parse(JSON.stringify(initRenderData))
                try {
                    storyList.value = await store.dispatch('saasBackend/getStoryList', props.moduleId)
                    saasBuilderList = await Promise.all(storyList.value.map((story) => store.dispatch('saasBackend/getSaasBuilderDetail', story.uuid)))
                    store.commit('saasBackend/setStateProperty', { key: 'saasBuilderList', value: saasBuilderList })
                    storyList.value = storyList.value.map(item => {
                        const builderItem = JSON.parse(JSON.stringify(saasBuilderList.find(builder => builder.session_id === item.uuid))) || {}
                        return {
                            ...builderItem,
                            id: builderItem.session_id,
                            type: 'story',
                            children: builderItem.nodes,
                            nodes: undefined,
                            status: getStatusMap(builderItem.status)
                        }
                    })
                    runningStory = storyList.value.find(item => (item.status === 'running'))
                    latestStory = storyList.value.reduce((prev, current) => {
                        return (new Date(prev.updated_at) > new Date(current.updated_at)) ? prev : current
                    })
                    transformBuilderData()
                    if (runningStory?.session_id) {
                        handleSocket(runningStory.session_id)
                        store.commit('saasBackend/setStateProperty', { key: 'isExecuting', value: true })
                    } else {
                        store.commit('saasBackend/setStateProperty', { key: 'isExecuting', value: false })
                    }
                    graph?.clearCells()
                    nextTick(() => initNodes(renderData))
                } catch (err) {
                    console.error(err, 'initdata')
                } finally {
                    isLoading.value = false
                }
            }

            const handleSocket = function (sessionId) {
                socket && socket.close()

                const wsPrefix = location.protocol === 'https:' ? 'wss://' : 'ws://'
                const wsUrl = `${wsPrefix}${process.env.BK_AIDEV_WEBSOCKET_HOST}/aidev/session/common/saas_builder_${sessionId}/?group_name=saas_building_events`
                socket = new WebSocket(wsUrl);

                socket.onopen = function(event) {
                    // 设置请求的 header
                    // socket.setRequestHeader('Authorization', 'Bearer myAuthToken');
                    console.log('连接成功')
                };

                socket.onmessage = function(event) {
                    // 处理收到的消息
                    let resData
                    try {
                        resData = JSON.parse(event?.data)
                    } catch (err) {
                        console.log(err)
                        resData = {}
                    }
                    if (resData?.result) {
                        const builderItem = resData?.data?.data || {}
                        if (builderItem?.session_id === runningStory?.session_id) {
                            debounceUpdateNodes(builderItem)
                        }
                    }  
                }

                socket.onclose = function(event) {
                    // 连接关闭的处理
                    console.log(event, 'error')
                };
            }

            const getNodeFromStory = function (story) {
                const task = []
                let { children, ...storyItem } = story
                task.push(storyItem)
                children = sortNodes(children, story.edges)
                const finalNodes = children.filter(item => finalNodeTypes.includes(item?.content?.type))
                children?.map(node => {
                    // 非最后三个公共节点， 才画到图里
                    const nodeType = node?.content?.type
                    if (finalNodeTypes.indexOf(nodeType) === -1) {
                        node.type = 'node'
                        node.id = node.node_id
                        node.status = getStatusMap(node.status)
                        node.children = node?.steps?.map(step => ({
                            ...step,
                            type: 'step',
                            status: getStatusMap(step.status)
                        }))
                        task.push(node)
                    }
                })
                return { task, finalNodes }
            }

            const transformBuilderData = function () {
                const tasks = renderData.tasks
                storyList.value.forEach(story => {
                    sortNodes(story.children, story.edges)
                    // 每一个需求， 需要把需求跟任务拼到一个数组
                    const { task, finalNodes } = getNodeFromStory(story)
                    tasks.push(task)
                    if (story.session_id === runningStory?.session_id) {
                        updateOthersData(finalNodes)
                    } else if (!runningStory?.session_id && story.session_id === latestStory?.session_id) {
                        updateOthersData(finalNodes)
                    }
                })
            }

            onMounted(() => {
                initGraph()
                fetchData()
            })

            return {
                needUpdate,
                isLoading,
                storyList
            }
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
