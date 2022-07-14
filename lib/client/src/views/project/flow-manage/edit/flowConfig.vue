<!--
  Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
  Copyright (C) 2017-2019 THL A29 Limited, a Tencent company. All rights reserved.
  Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
  http://opensource.org/licenses/MIT
  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
  an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
  specific language governing permissions and limitations under the License.
-->
<template>
    <section class="flow-config" style="height: 100%">
        <div class="flow-container" v-bkloading="{ isLoading: canvasDataLoading }">
            <flow-canvas
                v-if="!canvasDataLoading"
                :nodes="canvasData.nodes"
                :lines="canvasData.lines"
                :flow-id="serviceData.workflow_id"
                :editable="editable"
                @onNodeClick="handleNodeClick">
            </flow-canvas>
        </div>
        <div class="action-wrapper">
            <bk-button @click="$router.push({ name: 'flowList' })">
                取消
            </bk-button>
            <bk-button
                theme="primary"
                :loading="flowPending || nextPending"
                :disabled="canvasDataLoading || nextPending"
                @click="handleNextStep">
                下一步
            </bk-button>
        </div>
        <div v-if="nodeConfigPanelShow" class="node-config-wrapper">
            <node-config
                :node-id="crtNode"
                :flow-config="flowConfig"
                :service-data="serviceData"
                :create-ticket-node-id="createTicketNodeId"
                @close="closeConfigPanel">
            </node-config>
        </div>
    </section>
</template>
<script>
    import { mapState } from 'vuex'
    import { messageError } from '@/common/bkmagic'
    import FlowCanvas from '@/components/flow/flow-canvas/index.vue'
    import NodeConfig from '@/components/flow/nodeConfig/index.vue'

    export default {
        name: 'FlowConfig',
        components: {
            FlowCanvas,
            NodeConfig
        },
        props: {
            serviceData: {
                type: Object,
                default: () => ({})
            }
        },
        data () {
            return {
                canvasDataLoading: false,
                flowPending: false,
                nextPending: false,
                canvasData: { nodes: [], lines: [] },
                createTicketNodeId: '',
                nodeConfigPanelShow: false,
                crtNode: null
            }
        },
        computed: {
            ...mapState('nocode/flow', ['flowConfig']),
            editable () {
                return this.flowConfig.deleteFlag === 0
            }
        },
        created () {
            this.getFlowStructData()
        },
        methods: {
            // 获取流程图结构详情
            async getFlowStructData () {
                try {
                    this.canvasDataLoading = true
                    const res = await Promise.all([
                        this.$store.dispatch('nocode/flow/getFlowNodes', { workflow: this.serviceData.workflow_id, page_size: 1000 }),
                        this.$store.dispatch('nocode/flow/getFlowLines', { workflow: this.serviceData.workflow_id, page_size: 1000 })
                    ])
                    this.canvasData = {
                        nodes: res[0].items,
                        lines: res[1].items
                    }
                    this.createTicketNodeId = res[0].items.find(item => item.is_first_state && item.is_builtin).id
                } catch (e) {
                    messageError(e.message || e)
                } finally {
                    this.canvasDataLoading = false
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
                this.getFlowStructData()
            },
            async handleNextStep () {
                try {
                    this.nextPending = true
                    const data = {
                        can_ticket_agency: false,
                        display_type: 'OPEN',
                        workflow_config: {
                            ...this.serviceData,
                            is_revocable: this.serviceData.revoke_config.type !== 0,
                            is_auto_approve: false
                        }
                    }
                    await this.$store.dispatch('nocode/flow/updateServiceData', { id: this.flowConfig.itsmId, data })
                    this.$router.push({ name: 'flowAdvancedConfig' })
                } catch (e) {
                    messageError(e.message || e)
                } finally {
                    this.nextPending = false
                }
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
    background: #fafbfd;
    z-index: 120;
}
</style>
