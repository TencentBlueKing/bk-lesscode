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
    <section class="flow-edit-wrapper">
        <div class="page-header-container">
            <div class="nav-container">
                <back-btn
                    :from-page-list="fromPageList"
                    :flow-config="flowConfig"
                    :deploy-pending="deployPending"
                    @deploy="handleDeploy">
                </back-btn>
                <flow-selector
                    :list="flowList"
                    :list-loading="listLoading"
                    :flow-config="flowConfig">
                </flow-selector>
            </div>
            <div class="steps-container">
                <menu-item
                    v-for="item in steps"
                    :key="item.id"
                    :item="item"
                    :class="{ active: $route.name === item.id }">
                </menu-item>
            </div>
            <div class="genarate-action">
                <generate-data-manage-page v-if="!flowConfigLoading"></generate-data-manage-page>
            </div>
        </div>
        <div v-if="!serviceDataLoading" class="flow-edit-main">
            <router-view
                :service-data="serviceData"
                :deploy-pending="deployPending"
                @deploy="handleDeploy">
            </router-view>
        </div>
    </section>
</template>
<script>
    import { mapState, mapGetters } from 'vuex'
    import { messageError } from '@/common/bkmagic'
    import MenuItem from '@/views/index/components/action-tool/components/menu-item'
    import BackBtn from './components/back-btn.vue'
    import FlowSelector from './components/flow-selector.vue'
    import GenerateDataManagePage from './components/generate-data-manage-page.vue'

    export default {
        name: 'flowEdit',
        components: {
            MenuItem,
            BackBtn,
            FlowSelector,
            GenerateDataManagePage
        },
        data () {
            return {
                steps: [
                    { id: 'flowConfig', icon: 'bk-drag-icon bk-drag-flow-fill', text: this.$t('流程设计'), func: this.handleStepChange('flowConfig') },
                    { id: 'flowAdvancedConfig', icon: 'bk-drag-icon bk-drag-set', text: this.$t('流程设置'), func: this.handleStepChange('flowAdvancedConfig') }
                ],
                flowId: this.$route.params.flowId,
                listLoading: true,
                flowList: [],
                flowConfigLoading: true,
                serviceDataLoading: true,
                serviceData: {},
                deployPending: false,
                fromPageList: false // 是否由页面列表页进入
            }
        },
        computed: {
            ...mapState('nocode/flow', ['flowConfig']),
            ...mapGetters('projectVersion', { versionId: 'currentVersionId' }),
            projectId () {
                return this.$route.params.projectId
            }
        },
        watch: {
            '$route.params.flowId' (val, oldVal) {
                console.log(val, oldVal)
                if (val !== oldVal) {
                    this.flowId = val
                    this.getflowConfig()
                }
            }
        },
        async created () {
            this.getFlowList()
            await this.getflowConfig()
            this.getServiceData()
        },
        beforeRouteEnter (to, from, next) {
            next(vm => {
                if (from.name === 'pageList') {
                    vm.fromPageList = true
                }
            })
        },
        beforeDestroy () {
            this.$store.commit('nocode/flow/clearFlowConfig')
        },
        methods: {
            async getFlowList () {
                this.listLoading = true
                try {
                    const res = await this.$store.dispatch('nocode/flow/getFlowList', {
                        projectId: this.projectId
                    })
                    this.flowList = res.list
                } catch (err) {
                    messageError(err.message || err)
                } finally {
                    this.listLoading = false
                }
            },
            async getflowConfig () {
                try {
                    this.flowConfigLoading = true
                    const [flowConfig] = await Promise.all([
                        this.$store.dispatch('nocode/flow/getFlowData', { id: this.flowId }),
                        this.$store.dispatch('route/getProjectPageRoute', { projectId: this.projectId, versionId: this.versionId })
                    ])
                    this.$store.commit('nocode/flow/setFlowConfig', flowConfig)
                } catch (e) {
                    messageError(e.message || e)
                } finally {
                    this.flowConfigLoading = false
                }
            },
            // 获取存到itsm的流程配置
            async getServiceData () {
                try {
                    this.serviceDataLoading = true
                    this.serviceData = await this.$store.dispatch('nocode/flow/getServiceData', this.flowConfig.itsmId)
                } catch (e) {
                    messageError(e.message || e)
                } finally {
                    this.serviceDataLoading = false
                }
            },
            handleStepChange (name) {
                return function () {
                    this.$router.push({ name })
                }.bind(this)
            },
            // 保存流程配置数据，部署流程之前需要调用
            async updateItsmServiceData () {
                const {
                    is_supervise_needed, notify, notify_freq, notify_rule, revoke_config, supervise_type, supervisor
                } = this.serviceData
                const data = {
                    can_ticket_agency: false,
                    display_type: 'INVISIBLE',
                    workflow_config: {
                        is_supervise_needed,
                        notify,
                        notify_freq,
                        notify_rule,
                        revoke_config,
                        supervise_type,
                        supervisor,
                        is_revocable: this.serviceData.revoke_config.type !== 0,
                        is_auto_approve: false
                    }
                }
                return new Promise((resolve, reject) => {
                    this.$store.dispatch('nocode/flow/updateServiceData', { id: this.flowConfig.itsmId, data })
                        .then(() => {
                            resolve()
                        }).catch((error) => {
                            const h = this.$createElement
                            this.$bkMessage({
                                theme: 'error',
                                ellipsisLine: 3,
                                message: error.message
                            })
                            reject(error.message)
                        })
                })
            },
            // 部署流程
            async deployItsmFlow () {
                return new Promise((resolve, reject) => {
                    this.$store.dispatch('nocode/flow/deployFlow', this.flowConfig.itsmId)
                        .then(() => {
                            resolve()
                        }).catch((error) => {
                            const h = this.$createElement
                            this.$bkMessage({
                                theme: 'error',
                                message: error.message
                            })
                            reject(error.message)
                        })
                })
            },
            async handleDeploy () {
                try {
                    this.deployPending = true
                    await this.updateItsmServiceData()
                    await this.deployItsmFlow()
                    await this.$store.dispatch('nocode/flow/editFlow', { id: this.flowConfig.id, deployed: 1 })
                    this.$store.commit('nocode/flow/setFlowConfig', { deployed: 1 })
                    this.$bkMessage({
                        theme: 'success',
                        message: window.i18n.t('流程部署成功')
                    })
                } catch (e) {
                    console.error(e.message || e)
                } finally {
                    this.deployPending = false
                }
            }
        }
    }
</script>
<style lang="postcss" scoped>
.flow-edit-wrapper {
    height: 100%;
}
.page-header-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 52px;
    background: #ffffff;
    box-shadow: 0 3px 4px 0 rgba(0, 0, 0, 0.04);
    z-index: 1;
    .nav-container {
        position: absolute;
        top: 10px;
        left: 0;
        display: flex;
        align-items: center;
        .go-back-icon-wrapper {
            margin: 0 21px;
        }
    }
    .steps-container {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 360px;
        height: 100%;
    }
    .genarate-action {
        position: absolute;
        top: 0;
        right: 20px;
        height: 100%;
    }
}
.flow-edit-main {
    height: calc(100% - 53px);
}
</style>
