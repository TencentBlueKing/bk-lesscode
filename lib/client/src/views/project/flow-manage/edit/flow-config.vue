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
            <bk-alert
                v-if="!canvasDataLoading && showDeployTips"
                class="deploy-tips"
                type="warning">
                <div class="tips-content" slot="title">
                    {{ $t('当前流程未部署，需部署后，预览环境才生效；如果需要该流程在应用预发布环境或生产环境生效，需将整个应用部署至对应环境，') }}
                    <bk-button style="padding: 0; height: 12px; line-height: 12px;" size="small" :text="true" :disabled="deployPending" @click="$emit('deploy')">
                        {{ $t('立即部署流程') }}</bk-button>
                    {{ $t('或') }}
                    <router-link class="deploy-project-btn" :to="{ name: 'release', params: { projectId } }">{{ $t('部署应用') }}</router-link>
                </div>
            </bk-alert>
            <flow-canvas
                v-if="!canvasDataLoading"
                :nodes="canvasData.nodes"
                :lines="canvasData.lines"
                :flow-id="serviceData.workflow_id"
                :editable="editable"
                @preview="handleCreateTicktetPagePreview"
                @onNodeClick="handleNodeClick">
            </flow-canvas>
        </div>
        <div class="action-wrapper">
            <bk-button
                theme="primary"
                style="min-width: 88px"
                :loading="flowPending || deployPending"
                :disabled="canvasDataLoading || deployPending"
                @click="$emit('deploy')">
                {{ $t('部署') }} </bk-button>
        </div>
        <div v-if="nodeConfigPanelShow" class="node-config-wrapper">
            <node-config
                :node-id="crtNode"
                :service-data="serviceData"
                @close="closeConfigPanel">
            </node-config>
        </div>
    </section>
</template>
<script>
    import { mapState } from 'vuex'
    import { getRouteFullPath } from 'shared/route'
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
            },
            deployPending: Boolean
        },
        data () {
            return {
                canvasDataLoading: false,
                flowPending: false,
                canvasData: { nodes: [], lines: [] },
                nodeConfigPanelShow: false,
                crtNode: null
            }
        },
        computed: {
            ...mapState('nocode/flow', ['flowConfig']),
            ...mapState('route', ['layoutPageList']),
            projectId () {
                return this.$route.params.projectId
            },
            editable () {
                return this.flowConfig.deleteFlag === 0
            },
            showDeployTips () {
                return this.flowConfig.deployed === 0
            }
        },
        async created () {
            await this.getFlowStructData()
            if (this.$route.query.nodeId) {
                const nodeId = Number(this.$route.query.nodeId)
                if (this.canvasData.nodes.find(node => node.id === nodeId)) {
                    this.crtNode = nodeId
                    this.nodeConfigPanelShow = true
                }
            }
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
                    this.$store.commit('nocode/flow/setFlowNodes', this.canvasData.nodes)
                } catch (e) {
                    console.error(e.message || e)
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
                const { projectId, flowId } = this.$route.params
                this.$router.push({ name: 'flowConfig', params: { projectId, flowId }, query: { nodeId: node.id } })
            },
            closeConfigPanel () {
                this.nodeConfigPanelShow = false
                this.crtNode = null
                this.getFlowStructData()
            },
            handleCreateTicktetPagePreview () {
                const pageRoute = this.layoutPageList.find(({ pageId }) => pageId === Number(this.flowConfig.pageId))
                if (pageRoute) {
                    const fullPath = getRouteFullPath(pageRoute)
                    const routerUrl = `/preview/project/${this.projectId}${fullPath}?pageCode=${this.flowConfig.pageCode}`
                    window.open(routerUrl, '_blank')
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
    position: relative;
    height: 100%;
}
.deploy-tips {
    position: absolute;
    top: 14px;
    left: 70px;
    right: 70px;
    z-index: 110;
    >>> .bk-alert-wraper {
        display: flex;
        align-items: center;
    }
}
.deploy-project-btn {
    color: #3a84ff;
    &:hover {
        color: #699df4;
    }
}
.action-wrapper {
    position: absolute;
    bottom: 0;
    left: 56px;
    right: 0;
    padding: 0 24px;
    height: 52px;
    line-height: 52px;
    text-align: center;
    background: #fafbfd;
    border-top: 1px solid #dcdee5;
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
