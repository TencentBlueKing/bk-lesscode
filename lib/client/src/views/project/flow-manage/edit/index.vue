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
                <back-btn :from-page-list="fromPageList"></back-btn>
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
                :flow-config="flowConfig"
                :service-data="serviceData">
            </router-view>
        </div>
    </section>
</template>
<script>
    import { mapState } from 'vuex'
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
                    { id: 'flowConfig', icon: 'bk-drag-icon bk-drag-flow-fill', text: '流程设计', func: this.handleStepChange('flowConfig') },
                    { id: 'flowAdvancedConfig', icon: 'bk-drag-icon bk-drag-set', text: '流程设置', func: this.handleStepChange('flowAdvancedConfig') }
                ],
                flowId: this.$route.params.flowId,
                listLoading: true,
                flowList: [],
                flowConfigLoading: true,
                serviceDataLoading: true,
                serviceData: {},
                fromPageList: false // 是否由页面列表页进入
            }
        },
        computed: {
            ...mapState('nocode/flow', ['flowConfig']),
            projectId () {
                return this.$route.params.projectId
            }
        },
        watch: {
            '$route.params.flowId' (val) {
                this.flowId = val
                this.getflowConfig()
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
                    const res = await this.$store.dispatch('nocode/flow/getFlowData', { id: this.flowId })
                    this.$store.commit('nocode/flow/setFlowConfig', res)
                } catch (e) {
                    messageError(e.message || e)
                } finally {
                    this.flowConfigLoading = false
                }
            },
            // 保存到流程服务的配置
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
    .nav-container {
        position: absolute;
        top: 10px;
        left: 35px;
        display: flex;
        align-items: center;
        .go-back-icon-wrapper {
            margin-right: 10px;
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
