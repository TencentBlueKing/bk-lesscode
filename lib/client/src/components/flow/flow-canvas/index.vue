<template>
    <div class="process-canvas-wrapper">
        <bk-flow
            ref="flowCanvas"
            selector="entry-item"
            :data="canvasData"
            :show-palette="showPalette"
            :show-tool="showTool"
            :editable="editable"
            :endpoint-options="endpointOptions"
            :connector-options="connectorOptions"
            :node-options="nodeOptions"
            @onNodeMoveStop="handleNodeMoveStop"
            @onCreateNodeAfter="handleCreateNode"
            @onBeforeDrop="onBeforeDrop"
            @onConnection="onConnection"
            @onOverlayClick="onOverlayClick">
            <template slot="palettePanel">
                <palette-panel></palette-panel>
            </template>
            <template slot="toolPanel">
                <tool-panel @onZoomIn="onZoomIn" @onZoomOut="onZoomOut" @onResetPosition="onResetPosition"> </tool-panel>
            </template>
            <template slot="nodeTemplate" slot-scope="{ node }">
                <node-template
                    ref="templateNode"
                    :node="node"
                    :editable="editable"
                    @fastCreateNode="handleFastCreateNode"
                    @cloneNode="handleCloneNode"
                    @onNodeClick="handleNodeClick"
                    @delete="handleDeleteNode"
                    @preview="$emit('preview')">
                </node-template>
            </template>
        </bk-flow>
        <bk-sideslider
            :title="$t('线条配置')"
            :width="700"
            :quick-close="false"
            :is-show="showLineConfigPanel"
            :before-close="hanldeLineConfigPanelClose">
            <line-config
                slot="content"
                :line="lineConfig"
                :flow-id="flowId"
                :save-pending="lineSavePending"
                :delete-pending="lineDeletePending"
                @save="handleLineSave"
                @delete="handleLineDelete"
                @close="hanldeLineConfigPanelClose">
            </line-config>
        </bk-sideslider>
    </div>
</template>
<script>
    import cloneDeep from 'lodash.clonedeep'
    import { mapGetters, mapState } from 'vuex'
    import { uuid } from '@/common/util.js'
    import { NODE_TYPE_LIST } from '../constants/nodes.js'
    import BkFlow from './flow.js'
    import PalettePanel from './palettePanel.vue'
    import NodeTemplate from './nodeTemplate.vue'
    import ToolPanel from './toolPanel.vue'
    import LineConfig from './lineConfig.vue'

    const endpointOptions = {
        endpoint: 'Dot',
        // connector: ['Flowchart', { stub: [10, 16], alwaysRespectStub: true, gap: 2, cornerRadius: 10 }],
        connector: ['Bezier', { curviness: 10 }],
        connectorOverlays: [['PlainArrow', { width: 8, length: 6, location: 1, id: 'arrow' }]],
        paintStyle: { fill: 'rgba(0, 0, 0, 0)', stroke: '', strokeWidth: 1, radius: 6 },
        hoverPaintStyle: { fill: '#EE8F62', stroke: '#EE8F62', radius: 8 },
        cssClass: 'template-canvas-endpoint',
        hoverClass: 'template-canvas-endpoint-hover',
        isSource: true, // 端点是否可以作为拖动源
        isTarget: true, // 端点是否可以作为拖动目标
        maxConnections: -1
    }
    const nodeOptions = {
        grid: [5, 5]
    }
    const connectorOptions = {
        paintStyle: { fill: 'transparent', stroke: '#a9adb6', strokeWidth: 1 },
        hoverPaintStyle: { fill: 'transparent', stroke: '#3a84ff', strokeWidth: 2 },
        cssClass: 'flow-connector',
        hoverClass: 'flow-connector-hover',
        detachable: true // 是否可以通过鼠标拖动连线
    }
    export default {
        name: 'FlowCanvas',
        components: {
            BkFlow,
            PalettePanel,
            NodeTemplate,
            ToolPanel,
            LineConfig
        },
        props: {
            nodes: {
                type: Array,
                default () {
                    return []
                }
            },
            lines: {
                type: Array,
                default () {
                    return []
                }
            },
            showPalette: {
                type: Boolean,
                default: true
            },
            type: { type: String },
            showTool: {
                type: Boolean,
                default: true
            },
            disableEditLine: {
                type: Boolean,
                default: false
            },
            editable: {
                type: Boolean,
                default: true
            },
            flowId: Number
        },
        data () {
            return {
                endpointOptions,
                connectorOptions,
                nodeOptions,
                canvasData: {
                    nodes: [],
                    lines: []
                },
                showLineConfigPanel: false,
                lineConfig: {},
                lineSavePending: false,
                lineDeletePending: false
            }
        },
        computed: {
            ...mapGetters('nocode/flow', ['flowNodeForms', 'flowNodes']),
            ...mapState('nocode/flow', ['flowConfig'])
        },
        watch: {
            nodes () {
                this.transNodeData()
            },
            lines () {
                this.transLineData()
            }
        },
        created () {
            this.transNodeData()
            this.transLineData()
        },
        mounted () {
            this.lines.forEach((item) => {
                const { id, name, from_state: sId, to_state: tId } = item
                this.addOverlay({
                    id,
                    name,
                    sourceId: `node_${sId}`,
                    targetId: `node_${tId}`
                })
            })
        },
        methods: {
            // 将数据转换为画布组件要求格式
            transNodeData () {
                const nodes = []
                this.nodes.forEach((item, index) => {
                    const xValue = item.axis.x ? item.axis.x : 165 + index * 250
                    const yValue = item.axis.y ? item.axis.y : 195 + (index % 2 === 1 ? 5 : 0)
                    nodes.push({
                        id: `node_${item.id}`,
                        x: xValue,
                        y: yValue,
                        type: item.type,
                        name: item.name,
                        nodeInfo: cloneDeep(item)
                    })
                })
                this.canvasData.nodes = nodes
            },
            transLineData () {
                const lines = []
                this.lines.forEach((item) => {
                    lines.push({
                        source: {
                            arrow: item.axis.start || 'Right',
                            id: `node_${item.from_state}`
                        },
                        target: {
                            arrow: item.axis.end || 'Left',
                            id: `node_${item.to_state}`
                        },
                        lineInfo: item,
                        options: {
                            paintStyle: {
                                fill: 'transparent',
                                stroke: item.lineStatus === 'SUCCESS' ? '#2DCB56' : '#a9adb6',
                                strokeWidth: 1
                            }
                        }
                    })
                })
                this.canvasData.lines = lines
            },
            // 注册线条的Label
            addOverlay (line) {
                const sNode = this.canvasData.nodes.find(item => item.id === line.sourceId)
                if (sNode && sNode.type === 'START') {
                    return
                }
                const lineConfig = {
                    source: { id: line.sourceId },
                    target: { id: line.targetId },
                    id: line.id
                }
                const value = {
                    id: `label_${line.id}`,
                    type: 'Label',
                    name: `<span class="bk-label-test-name">${line.name || window.i18n.t('默认')}</span>`,
                    cls: 'label-test',
                    location: 0.5
                }

                this.$refs.flowCanvas.addLineOverlay(lineConfig, value)
            },
            // 计算传入的 x +- delta, y +- delta 坐标上是否有节点
            isNodeIndividual (x, y, delta = 10) {
                return this.canvasData.nodes.some(item => item.x + delta > x && item.x - delta < x && item.y + delta > y && item.y - delta < y)
            },
            handleNodeClick (node) {
                this.$emit('onNodeClick', node.nodeInfo)
            },
            handleFastCreateNode (id, type) {
                const crtNode = this.canvasData.nodes.find(item => item.nodeInfo.id === id)
                const { x: nodeX, y: nodeY } = crtNode
                const x = nodeX + 340
                let y = nodeY
                while (this.isNodeIndividual(x, y)) {
                    y += 50
                }
                const node = {
                    id: `n${uuid(32)}`,
                    x,
                    y,
                    type
                }
                this.$refs.flowCanvas.createNode(node)
                this.$nextTick(() => {
                    this.updateStoreNodes()
                })
            },
            handleNodeMoveStop (node) {
                try {
                    const { x, y } = node
                    const params = {
                        id: node.nodeInfo.id,
                        data: {
                            axis: { x, y }
                        }
                    }
                    this.$store.dispatch('nocode/flow/patchNodeData', params)
                } catch (e) {
                    console.error(e)
                }
            },
            // 拖入节点或者快速创建节点执行保存
            async handleCreateNode (node) {
                if (node.nodeInfo && 'id' in node.nodeInfo) {
                    return false
                }
                const res = await this.saveNode(node)
                const { axis, type: nodeType, name: nodeName } = res
                const addedNode = {
                    id: node.id,
                    x: axis.x,
                    y: axis.y,
                    type: nodeType,
                    name: nodeName,
                    nodeInfo: cloneDeep(res)
                }
                const index = this.canvasData.nodes.findIndex(item => item.id === node.id)
                this.canvasData.nodes.splice(index, 1, addedNode)
                this.updateStoreNodes()
                if (node.type === 'NORMAL') {
                    const { x, y } = node
                    const procNode = await this.saveNode({ x: x + 340, y, type: 'DATA_PROC' }, res.id)
                    const { id, axis, type, name } = procNode
                    const dataProcNode = {
                        id: `node_${id}`,
                        x: axis.x,
                        y: axis.y,
                        type,
                        name,
                        nodeInfo: cloneDeep(procNode)
                    }
                    this.$refs.flowCanvas.createNode(dataProcNode)
                    this.$nextTick(() => { // 等自动添加的节点dom更新完毕
                        this.$refs.flowCanvas.createConnector({
                            source: {
                                arrow: 'Right',
                                id: addedNode.id
                            },
                            target: {
                                arrow: 'Left',
                                id: `node_${procNode.id}`
                            }
                        })
                        this.updateStoreNodes()
                    })
                }
                this.setFlowUnDeployed()
            },
            async saveNode (node, dataSourceId) {
                try {
                    const { x, y, type } = node
                    const nodeDesc = NODE_TYPE_LIST.find(item => item.type === type)
                    const name = nodeDesc ? nodeDesc.name : this.$t('新增节点')
                    const params = {
                        name,
                        type,
                        extras: {},
                        is_terminable: false, // @待确认是否需要
                        axis: { x, y },
                        workflow: this.flowId
                    }
                    if (type === 'NORMAL') {
                        // 人工节点需要保存使用表单的配置
                        params.extras.formConfig = {
                            type: '',
                            id: ''
                        }
                    } else if (type === 'DATA_PROC') {
                        params.extras.node_type = 'DATA_PROC'
                        params.extras.dataManager = {
                            conditions: {
                                connector: 'and',
                                expressions: []
                            },
                            mapping: [],
                            action: '',
                            worksheet_id: ''
                        }
                        params.extras.webhook_info = {}
                        if (dataSourceId) {
                            params.extras.data_source_id = dataSourceId
                        }
                    } else if (type === 'TASK') {
                        params.extras.node_type = 'TASK'
                        params.extras.api_info = {}
                        params.extras.webhook_info = {}
                    }
                    return this.$store.dispatch('nocode/flow/createNode', params)
                } catch (e) {
                    console.error(e)
                }
            },
            async handleCloneNode (nodeId) {
                try {
                    const res = await this.$store.dispatch('nocode/flow/cloneFlowNode', nodeId)
                    this.setFlowUnDeployed()
                    const { id, axis, type, name } = res
                    const addedNode = {
                        id: `node_${id}`,
                        x: axis.x,
                        y: axis.y,
                        type,
                        name,
                        nodeInfo: cloneDeep(res)
                    }
                    this.$refs.flowCanvas.createNode(addedNode)
                    this.$nextTick(() => {
                        this.updateStoreNodes()
                    })
                } catch (e) {
                    console.error(e)
                }
            },
            // 创建连线
            async createLine (line) {
                const { source, target } = line
                if (this.canvasData.lines.find(item => item.source.id === source.id && item.target.id === target.id)) {
                    return
                }
                const sNode = this.canvasData.nodes.find(item => item.id === source.id)
                const tNode = this.canvasData.nodes.find(item => item.id === target.id)

                try {
                    const params = {
                        workflow: this.flowId,
                        name: this.$t('默认'),
                        axis: {
                            start: source.anchor,
                            end: target.anchor
                        },
                        from_state: sNode.nodeInfo.id,
                        to_state: tNode.nodeInfo.id
                    }
                    const res = await this.$store.dispatch('nocode/flow/createLine', params)
                    this.setFlowUnDeployed()
                    const lineData = {
                        source: {
                            arrow: res.axis.start,
                            id: source.id
                        },
                        target: {
                            arrow: res.axis.end,
                            id: target.id
                        },
                        lineInfo: res,
                        options: {
                            paintStyle: {
                                fill: 'transparent',
                                stroke: res.lineStatus === 'SUCCESS' ? '#2DCB56' : '#a9adb6',
                                strokeWidth: 1
                            }
                        }
                    }
                    this.addOverlay({ id: res.id, sourceId: sNode.id, targetId: tNode.id })
                    this.canvasData.lines.push(lineData)
                } catch (e) {
                    this.$refs.flowCanvas.removeConnector({
                        source: { id: sNode.id },
                        target: { id: tNode.id }
                    })
                    // this.$refs.flowCanvas.removeNode(addedNode);
                    console.error(e)
                }
            },
            async handleDeleteNode (node) {
                try {
                    this.$refs.flowCanvas.removeNode(node)
                    await this.$store.dispatch('nocode/flow/delNode', node.nodeInfo.id)
                    if (node.nodeInfo.id in this.flowNodeForms) {
                        this.$store.commit('nocode/flow/delFlowNodeFormId', node.nodeInfo.id)
                        this.$store.dispatch('nocode/flow/editFlow', {
                            id: this.flowConfig.id,
                            formIds: JSON.stringify(this.flowNodeForms)
                        })
                    }
                    this.setFlowUnDeployed()
                    this.$nextTick(() => {
                        this.updateStoreNodes()
                    })
                } catch (e) {
                    console.log(e)
                }
            },
            // 校验连线是否合法
            checkLineValid (connection) {
                let result = true
                let message = ''
                const { sourceId, targetId } = connection
                const sNode = this.canvasData.nodes.find(item => item.id === sourceId)
                const tNode = this.canvasData.nodes.find(item => item.id === targetId)
                if (sourceId === targetId) {
                    result = false
                    message = this.$t('节点自身不能相连')
                } else {
                    // 开始节点只能输出（且只能单一输出），结束节点只能输入
                    if (sNode.type === 'START') {
                        if (this.canvas.lines.find(item => item.sourceId === sNode.id)) {
                            result = false
                            message = this.$t('开始节点只能单一输出！')
                        }
                    }
                    if (tNode.type === 'START') {
                        result = false
                        message = this.$t('开始节点只能输出！')
                    }
                    if (sNode.type === 'END') {
                        result = false
                        message = this.$t('结束节点只能输入！')
                    }
                    if (sNode.type === 'START' && tNode.type === 'END') {
                        result = false
                        message = this.$t('开始节点和结束节点不能直接相连！')
                    }
                }
                // 已存在相同的连线不能相连
                for (let i = 0; i < this.canvasData.lines.length; i++) {
                    if (sourceId === this.canvasData.lines[i].source.id && targetId === this.canvasData.lines[i].target.id) {
                        result = false
                        message = this.$t('已存在的连线相同连线！')
                    }
                }
                if (message) {
                    this.$bkMessage({
                        message,
                        theme: 'warning'
                    })
                }
                return result
            },
            onBeforeDrop (connection) {
                return this.checkLineValid(connection)
            },
            onConnection (connection) {
                const { sourceId, targetId, sourceEndpoint, targetEndpoint } = connection
                const line = {
                    source: {
                        id: sourceId,
                        anchor: sourceEndpoint.anchor.type
                    },
                    target: {
                        id: targetId,
                        anchor: targetEndpoint.anchor.type
                    }
                }
                this.createLine(line)
            },
            onOverlayClick (overlay) {
                if (!this.editable || this.disableEditLine) {
                    return
                }
                // 获取点击线条的实例
                const lineId = Number(overlay.id.split('_')[1])
                const crtLine = this.canvasData.lines.find(item => item.lineInfo.id === lineId)
                const sNode = this.canvasData.nodes.find(item => item.nodeInfo.id === crtLine.lineInfo.from_state)
                const tNode = this.canvasData.nodes.find(item => item.nodeInfo.id === crtLine.lineInfo.to_state)
                const sNodeLines = this.$refs.flowCanvas.getConnectorsByNodeId(sNode.id)
                const outgoingLines = sNodeLines.filter(item => item.sourceId === sNode.id)
                this.lineConfig = {
                    ...crtLine.lineInfo,
                    sNode,
                    tNode,
                    canSetCondition: outgoingLines.length > 1
                }
                this.showLineConfigPanel = true
            },
            onZoomIn () {
                this.$refs.flowCanvas.zoomIn(1.1, 0, 0)
            },
            onZoomOut () {
                this.$refs.flowCanvas.zoomOut(0.9, 0, 0)
            },
            onResetPosition () {
                this.$refs.flowCanvas.resetPosition()
            },
            async handleLineSave (data) {
                try {
                    this.lineSavePending = true
                    const res = await this.$store.dispatch('nocode/flow/updateLine', data)
                    this.setFlowUnDeployed()
                    const line = this.canvasData.lines.find(item => item.lineInfo.id === data.id)
                    this.$refs.flowCanvas.removeLineOverlay(
                        { source: { id: line.source.id }, target: { id: line.target.id } },
                        `label_${data.id}`
                    )
                    this.addOverlay({ id: data.id, name: res.name, sourceId: line.source.id, targetId: line.target.id })
                    const index = this.canvasData.lines.findIndex(item => item.lineInfo.id === data.id)
                    this.canvasData.lines.splice(index, 1, {
                        source: {
                            arrow: res.axis.start,
                            id: `node_${res.from_state}`
                        },
                        target: {
                            arrow: res.axis.end,
                            id: `node_${res.to_state}`
                        },
                        lineInfo: res,
                        options: {
                            paintStyle: {
                                fill: 'transparent',
                                stroke: res.lineStatus === 'SUCCESS' ? '#2dcb56' : '#a9adb6',
                                strokeWidth: 1
                            }
                        }
                    })
                    this.hanldeLineConfigPanelClose()
                } catch (e) {
                    console.error(e)
                } finally {
                    this.lineSavePending = false
                }
            },
            async handleLineDelete () {
                try {
                    this.lineDeletePending = true
                    await this.$store.dispatch('nocode/flow/deleteLine', this.lineConfig.id)
                    this.setFlowUnDeployed()
                    this.$refs.flowCanvas.removeConnector({
                        source: { id: this.lineConfig.sNode.id },
                        target: { id: this.lineConfig.tNode.id }
                    })
                    const index = this.canvasData.lines.findIndex(item => item.lineInfo.id === this.lineConfig.id)
                    this.canvasData.lines.splice(index, 1)
                    this.hanldeLineConfigPanelClose()
                } catch (e) {
                    console.error(e)
                } finally {
                    this.lineDeletePending = false
                }
            },
            async setFlowUnDeployed () {
                await this.$store.dispatch('nocode/flow/editFlow', { id: this.flowConfig.id, deployed: 0 })
                this.$store.commit('nocode/flow/setFlowConfig', { deployed: 0 })
            },
            hanldeLineConfigPanelClose () {
                this.showLineConfigPanel = false
            },
            updateStoreNodes () {
                const nodes = this.canvasData.nodes.map(item => item.nodeInfo)
                this.$store.commit('nocode/flow/setFlowNodes', nodes)
            }
        }
    }
</script>
<style lang="postcss" scoped>
.process-canvas-wrapper {
  width: 100%;
  height: 100%;
  background-size: 16px 16px;
  background-image:
    linear-gradient(to right, #f0f1f5 1px, transparent 1px),
    linear-gradient(to bottom, #f0f1f5 1px, transparent 1px);
  /deep/ .jsflow {
    border: none;
    .palette-panel-wrap {
      width: 56px;
      height: 100%;
      background-color: #fff;
      border-right: 1px solid #dcdee5;
    }
    .tool-panel-wrap {
      top: 14px;
      right: 20px;
      left: auto;
      padding: 0;
      width: 42px;
      background: #ffffff;
      border: 1px solid #dcdee5;
      border-radius: 2px;
      overflow: hidden;
      z-index: 110;
    }
    .jtk-endpoint {
      z-index: 103;
      cursor: default;
    }
    .jsflow-node {
      z-index: 101;
    }
    .icon-choose-node {
      font-size: 20px;
    }
    .label-test {
      padding: 20px;
      &:hover {
        .bk-label-test-delete {
          opacity: 1;
        }
      }
    }
    .bk-label-test-name {
      padding: 0 20px;
      display: inline-block;
      border: 1px solid #c4c6cc;
      border-radius: 11px;
      color: #979ba5;
      font-size: 12px;
      padding: 0 8px;
      line-height: 22px;
      background-color: #fff;
      white-space: nowrap;
      cursor: pointer;
      &:hover {
        border: 1px solid #3a84ff;
        color: #3a84ff;
      }
    }
    .bk-label-test-delete {
      font-size: 14px;
      color: #ff5757;
      background: #ffffff;
      border-radius: 50%;
      width: 16px;
      height: 16px;
      background-color: #ff5757;
      line-height: 15px;
      color: #fff;
      float: left;
      opacity: 0;
      text-align: center;
      cursor: pointer;
    }
    .label-test {
      z-index: 20;
    }
    .label-success {
      border-color: #2dcb56;
      color: #2dcb56;
    }

    .canvas-flow-wrap .selected .common-node,
    .canvas-flow-wrap .selected .common-branch,
    .canvas-flow-wrap .selected .startpoint,
    .canvas-flow-wrap .selected .endpoint {
      border: 1px dashed #3a84ff;
    }
    .canvas-flow-wrap .bk-error-flow .common-node,
    .canvas-flow-wrap .bk-error-flow .common-branch,
    .canvas-flow-wrap .bk-error-flow .startpoint,
    .canvas-flow-wrap .bk-error-flow .endpoint {
      border: 1.5px dashed #ff5656;
    }
  }
}
</style>
