<template>
    <section class="flow-config" style="height: 100%">
        <div class="flow-container" v-bkloading="{ isLoading: flowDataLoading }">
            <flow-canvas
                v-if="!flowDataLoading"
                :nodes="flowData.nodes"
                :lines="flowData.lines"
                :flow-id="id"
                @onNodeClick="handleNodeClick">
            </flow-canvas>
        </div>
        <div class="action-wrapper">
            <bk-button @click="$router.push({ name: 'flowList' })">
                取消
            </bk-button>
            <bk-button
                theme="primary"
                :loading="flowPending"
                :disabled="flowDataLoading"
                @click="handleNextStep">
                下一步
            </bk-button>
        </div>
        <div v-if="nodeConfigPanelShow" class="node-config-wrapper">
            <node-config-panel
                :node-id="crtNode"
                :flow-id="id"
                :create-ticket-node-id="createTicketNodeId"
                @close="closeConfigPanel"
                @save="handleConfigSave">
            </node-config-panel>
        </div>
    </section>
</template>
<script>
    import { messageError } from '@/common/bkmagic'
    import FlowCanvas from '@/components/flow/flow-canvas/index.vue'
    import NodeConfigPanel from '@/components/flow/nodeConfig/nodeConfigPanel.vue'
    export default {
        name: 'FunctionFlow',
        components: {
            FlowCanvas,
            NodeConfigPanel
        },
        props: {
            id: Number // itsm存的流程id
        },
        data () {
            return {
                flowDataLoading: false,
                flowPending: false,
                flowData: { nodes: [], lines: [] },
                createTicketNodeId: '',
                nodeConfigPanelShow: false,
                crtNode: null
            }
        },
        created () {
            this.getFlowStructData()
        },
        methods: {
            // 获取流程图结构详情
            async getFlowStructData () {
                try {
                    this.flowDataLoading = true
                    const res = await Promise.all([
                        this.$store.dispatch('nocode/flow/getFlowNodes', { workflow: this.id }),
                        this.$store.dispatch('nocode/flow/getFlowLines', { workflow: this.id, page_size: 1000 })
                    ])
                    this.flowData = {
                        nodes: res[0],
                        lines: res[1].items
                    }
                    this.createTicketNodeId = res[0].find(item => item.is_first_state && item.is_builtin).id
                } catch (e) {
                    messageError(e.message || e)
                } finally {
                    this.flowDataLoading = false
                }
            },
            // 节点单击
            handleNodeClick (node) {
                if (['START', 'END', 'ROUTER-P', 'COVERAGE'].includes(node.type)) {
                    return
                }
                this.nodeConfigPanelShow = true
                this.crtNode = node.id
            },
            closeConfigPanel () {
                this.nodeConfigPanelShow = false
                this.crtNode = null
            },
            handleConfigSave () {
                this.closeConfigPanel()
                this.getFlowStructData()
            },
            handleNextStep () {
                this.$router.push({ name: 'flowAdvancedConfig' })
            }
        }
    }
</script>
<style lang="postcss" scoped>
.flow-config {
  position: relative;
}
.flow-container {
  height: 100%;
  position: relative;
}
.action-wrapper {
  position: absolute;
  bottom: 0;
  left: 56px;
  right: 0;
  padding: 0 24px;
  height: 52px;
  line-height: 52px;
  text-align: right;
  background: #fafbfd;
  border-top: 1px solid #dcdee5;
  .bk-button {
    margin-left: 4px;
    min-width: 88px;
  }
}
.node-config-wrapper {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  z-index: 1100;
}

.tip-box {
  display: flex;
  position: absolute;
  margin-bottom: 24px;
  width: 800px;
  padding: 4px 10px;
  border: 1px solid #C5DAFF;
  border-radius: 2px;
  background: #F0F8FF;
  font-size: 12px;
  color: #63656E;
  line-height: 32px;
  z-index: 100;
  top: 12px;
  left: 72px;
  .info {
    top: 24px;
    margin: 0 8px 0 11px;
    color: #3A84FF;
    font-size: 14px ;
    line-height: 32px;
  }
  .icon-close{
    display: inline-block;
    font-size: 16px;
    margin-top: 8px;
  }
}
</style>
