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
                <div class="go-back-icon-wrapper">
                    <i class="bk-drag-icon bk-drag-arrow-back" @click="handleBackClick"></i>
                </div>
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
                    :class="{ 'menu-actived': $route.name === item.id }">
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
    import FlowSelector from './components/flow-selector.vue'
    import GenerateDataManagePage from './components/generate-data-manage-page.vue'

    export default {
        name: 'flowEdit',
        components: {
            MenuItem,
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
                fromPageList: false, // 是否由页面列表页进入
                allowExitRoute: false // 是否可以离开页面
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
        beforeRouteLeave (to, from, next) {
            if (this.flowConfig.deployed || this.allowExitRoute  || to.name === 'createTicketPageEdit') {
                next()
                return
            }
            let instance
            const h = this.$createElement
            const deployFlow = async() => {
                await this.handleDeploy()
                instance.close()
            }
            const deployApp = () => {
                instance.close()
                this.allowExitRoute = true
                this.$router.push({ name: 'release', params: { projectId: this.projectId } })
            }
            const leave = () => {
                next()
                instance.close()
            }
            instance = this.$bkInfo({
                title: window.i18n.t('流程未部署，确认离开？'),
                width: 420,
                extCls: 'leave-flow-page-tips',
                subHeader: h('div', { class: 'tips-content' }, [
                    window.i18n.t('当前流程未部署，需部署后，预览环境方可生效；如果需要该流程在应用预发布环境或生产环境生效，需将整个应用部署至对应环境。'),
                    h('div', { class: 'action-btns' }, [
                        h('bk-button', { props: { theme: 'primary' }, on: { click: deployFlow } }, window.i18n.t('部署流程')),
                        h('bk-button', { on: { click: deployApp } }, window.i18n.t('部署应用')),
                        h('bk-button', { on: { click: leave } }, window.i18n.t('离开'))
                    ])
                ])
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
            },
            handleBackClick () {
                if (this.fromPageList) {
                    this.$router.push({ name: 'pageList' })
                } else {
                    this.$router.push({ name: 'flowList' })
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
            i {
                color: #3a84ff;
                cursor: pointer;
                font-size: 13px;
            }
        }
    }
    .steps-container {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 360px;
        height: 100%;
        .menu-actived {
            background: #e1ecff;
            color: #3a84ff;
        }
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
<style lang="postcss">
    .leave-flow-page-tips.bk-dialog-wrapper {
        .tips-content {
            color: #63656e;
            font-size: 14px;
            text-align: left;
        }
        .action-btns {
            margin-top: 30px;
            text-align: center;
            .bk-button:not(:last-of-type) {
                margin-right: 4px;
            }
        }
        .bk-info-box .bk-dialog-sub-header {
            padding: 3px 24px 26px;
        }
        .bk-dialog-footer {
            display: none;
        }
    }
</style>
