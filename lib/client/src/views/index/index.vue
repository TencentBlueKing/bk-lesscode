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
    <main
        class="lessocde-editor-page"
        v-bkloading="{
            isLoading: isContentLoading || isCustomComponentLoading
        }">
        <div v-if="!isContentLoading && !isCustomComponentLoading" class="lesscode-editor-page-header">
            <page-list :is-canvas-updated="isCanvasUpdated" />
            <div
                id="toolActionBox"
                class="function-and-tool">
                <action-tool />
            </div>
            <page-operate />
        </div>
        <!-- 编辑应用的普通页面 -->
        <template v-if="!isContentLoading && !isCustomComponentLoading">
            <draw-layout
                class="lesscode-editor-page-content">
                <material-panel slot="left" />
                <operation-area :operation="operationType" />
                <modifier-panel slot="right" />
            </draw-layout>
        </template>
        <save-template-dialog />
    </main>
</template>
<script>
    import Vue from 'vue'
    import { init, vue3Resource, registerComponent } from 'bk-lesscode-render'
    import { mapActions, mapGetters, mapState } from 'vuex'
    import { debounce } from 'shared/util.js'
    import LC from '@/element-materials/core'
    import SaveTemplateDialog from '@/components/template/save-template-dialog'
    import DrawLayout from './components/draw-layout'
    import PageList from './components/page-list'
    import PageOperate from './components/header-operate'
    import MaterialPanel from './components/material-panel'
    import ModifierPanel from './components/modifier-panel'
    import OperationArea from './components/operation-area'
    import ActionTool from './components/action-tool'
    import { syncVariableValue } from './components/utils'

    console.dir(LC)
    window.LC = LC

    export default {
        components: {
            SaveTemplateDialog,
            DrawLayout,
            PageList,
            PageOperate,
            MaterialPanel,
            ModifierPanel,
            OperationArea,
            ActionTool
        },
        data () {
            return {
                customNav: {},
                pageHasChange: false,
                isContentLoading: true,
                isCustomComponentLoading: true,
                operationType: 'edit',
                isCanvasUpdated: false
            }
        },
        computed: {
            ...mapGetters(['user']),
            ...mapGetters('drag', ['curTemplateData']),
            ...mapGetters('page', ['pageDetail', 'platform']),
            ...mapGetters('functions', ['funcGroups']),
            ...mapGetters('layout', ['pageLayout']),
            ...mapGetters('variable', ['variableList']),
            ...mapGetters('projectVersion', {
                versionId: 'currentVersionId',
                versionName: 'currentVersionName',
                getInitialVersion: 'initialVersion'
            }),
            ...mapState('route', ['layoutPageList']),
            pageRoute () {
                return this.layoutPageList.find(({ pageId }) => pageId === Number(this.pageId))
            }
        },
        watch: {
            curTemplateData: {
                handler () {
                    this.handleUpdateNavPerview()
                }
            },
            layoutPageList: {
                handler () {
                    this.handleUpdateNavPerview()
                }
            },
            variableList () {
                // 变量发生变化的时候  reload
                this.handleUpdatePreviewContent()
                this.isCanvasUpdated = true
            },
            funcGroups () {
                // 函数发生变化的时候  reload
                this.handleUpdatePreviewContent()
                this.isCanvasUpdated = true
            },
            'pageDetail.lifeCycle' () {
                // 生命周期发生变化的时候  reload
                this.handleUpdatePreviewContent()
                this.isCanvasUpdated = true
            },
            'pageDetail.styleSetting' () {
                // 页面样式发生变化的时候  reload
                this.handleUpdatePreviewContent()
                this.isCanvasUpdated = true
            }
        },
        async created () {
            this.projectId = parseInt(this.$route.params.projectId)
            this.pageId = parseInt(this.$route.params.pageId)

            this.$nextTick(() => {
                LC.addEventListener('update', this.handleUpdatePreviewContent)
                LC.addEventListener('updateCanvas', this.handleIsCanvasUpdated)
                // 更新预览区域数据
                LC.addEventListener('ready', this.initPerviewData)
            })

            // 获取并设置当前版本信息
            this.$store.commit('projectVersion/setCurrentVersion', this.getInitialVersion())

            this.fetchData()

            this.debounceUpdatePreview = debounce(this.updatePreview)

            window.addEventListener('beforeunload', this.clearPerviewData)
        },
        beforeDestroy () {
            // 路由离开的时候注销相关事件
            LC.removeEventListener('update', this.handleUpdatePreviewContent)
            // 更新预览区域数据
            LC.removeEventListener('ready', this.initPerviewData)
            // 卸载的时候，清除 storage 数据
            this.clearPerviewData()
            window.removeEventListener('beforeunload', this.clearPerviewData)
            window.removeEventListener('beforeunload', this.beforeunloadConfirm)

            // 清空 store
            this.$store.commit('page/setPageDetail', {})
            this.$store.commit('layout/setPageLayout', {})

            // 重置 platform
            LC.platform = 'PC'
        },
        beforeRouteLeave (to, from, next) {
            if (this.isCanvasUpdated) {
                this.$bkInfo({
                    title: window.i18n.t('确认离开'),
                    okText: window.i18n.t('离开'),
                    subTitle: window.i18n.t('您将离开画布编辑页面，请确认相应修改已保存'),
                    confirmFn: async () => {
                        next()
                    }
                })
            } else {
                next()
            }
        },
        methods: {
            ...mapActions(['updatePreview']),
            /**
             * @desc 注册自定义组件
             */
            registerCustomComponent (platform) {
                this.isCustomComponentLoading = true
                return new Promise((resolve, reject) => {
                    const script = document.createElement('script')
                    script.src = `/${this.projectId}/${this.pageId}/component/register.js?platform=${platform}`
                    script.onload = () => {
                        window.customCompontensPlugin.forEach((callback) => {
                            const [
                                config,
                                componentSource
                            ] = callback(LC.getFramework() === 'vue3' ? vue3Resource : Vue)
                            new Promise((resolve) => componentSource(resolve)).then((component) => {
                                registerComponent(config.type, component)
                            })
                            // 注册自定义组件 material
                            LC.registerMaterial(config.type, config, config.framework)
                        })
                        this.isCustomComponentLoading = false
                        resolve()
                    }
                    script.onerror = () => {
                        this.isCustomComponentLoading = false
                        reject(new Error(window.i18n.t('自定义组件注册失败')))
                    }
                    document.body.appendChild(script)
                    this.$once('hook:beforeDestroy', () => {
                        document.body.removeChild(script)
                    })
                })
            },
            /**
             * @desc 获取页面编辑基础数据
             */
            async fetchData () {
                try {
                    this.isContentLoading = true
                    const [pageDetail, pageList, projectDetail, functionData, apiData] = await Promise.all([
                        this.$store.dispatch('page/detail', { pageId: this.pageId }),
                        this.$store.dispatch('page/getList', {
                            projectId: this.projectId,
                            versionId: this.versionId
                        }),
                        this.$store.dispatch('project/detail', { projectId: this.projectId }),
                        this.$store.dispatch('functions/getAllGroupAndFunction', {
                            projectId: this.projectId,
                            versionId: this.versionId
                        }),
                        this.$store.dispatch('api/getCategoryAndApiList', {
                            projectId: this.projectId,
                            versionId: this.versionId
                        }),
                        this.$store.dispatch('page/pageLockStatus', { pageId: this.pageId }),
                        this.$store.dispatch('route/getProjectPageRoute', {
                            projectId: this.projectId,
                            versionId: this.versionId
                        }),
                        this.$store.dispatch('layout/getPageLayout', { pageId: this.pageId }),
                        this.$store.dispatch('components/componentNameMap'),
                        this.$store.dispatch('dataSource/list', { projectId: this.projectId }),
                        // 进入画布拉取一次权限操作，给 iam getters projectPermActionList 赋值，保存页面时，需要用到 projectPermActionList
                        this.$store.dispatch('iam/getIamAppPermAction', { projectId: this.projectId })
                    ])

                    // 初始化项目框架信息
                    LC.setFramework(projectDetail.framework)
                    init(projectDetail.framework)

                    await this.registerCustomComponent(pageDetail.pageType || 'PC')

                    await this.$store.dispatch('page/getPageSetting', {
                        pageId: this.pageId,
                        projectId: this.projectId,
                        versionId: this.versionId
                    })

                    const variableList = await this.$store.dispatch('variable/getAllVariable', {
                        projectId: this.projectId,
                        pageCode: pageDetail.pageCode,
                        versionId: this.versionId,
                        effectiveRange: 0
                    })

                    this.$store.commit('page/setPageDetail', pageDetail || {})
                    this.$store.commit('page/setPageList', pageList || [])
                    this.$store.commit('project/setCurrentProject', projectDetail || {})
                    this.$store.commit('functions/setFunctionData', functionData)
                    this.$store.commit('api/setApiData', apiData)

                    syncVariableValue(pageDetail.content, variableList)
                    // 设置初始targetData
                    LC.parseData(pageDetail.content)
                    LC.pageStyle = pageDetail.styleSetting

                    LC.platform = this.platform
                } catch (e) {
                    console.error(e)
                } finally {
                    this.isContentLoading = false
                }
            },
            /**
             * @desc 页面离开确认
             * @param { Object } event
             */
            beforeunloadConfirm (event) {
                const confirmationMessage = '...';
                (event || window.event).returnValue = confirmationMessage
                return confirmationMessage
            },
            initPerviewData () {
                // 更新导航
                this.handleUpdateNavPerview()
                // 更新内容区域
                this.handleUpdatePreviewContent()
            },
            clearPerviewData () {
                localStorage.removeItem('ONLINE_PREVIEW_CONTENT')
                localStorage.removeItem('ONLINE_PREVIEW_NAV')
            },
            handleUpdatePreviewContent (setting = {}) {
                const defaultSetting = {
                    isGenerateNav: false,
                    id: this.projectId + this.pageDetail.pageCode + this.versionId,
                    framework: LC.getFramework(),
                    curTemplateData: {},
                    storageKey: 'ONLINE_PREVIEW_CONTENT',
                    types: ['reload', 'update_style']
                }
                this.debounceUpdatePreview(Object.assign(defaultSetting, setting))

                // 导航拖拽区域更新，需要触发导航修改
                if (JSON.stringify(this.customNav) !== JSON.stringify(LC.getNavCustomCon())) {
                    console.log('drag menu change', LC.getNavCustomCon())
                    this.customNav = JSON.parse(JSON.stringify(LC.getNavCustomCon()))
                    this.handleUpdateNavPerview()
                }
            },
            handleUpdateNavPerview (setting = {}) {
                const defaultSetting = {
                    isGenerateNav: true,
                    id: this.projectId + this.pageRoute.layoutPath + this.versionId,
                    framework: LC.getFramework(),
                    curTemplateData: this.curTemplateData,
                    storageKey: 'ONLINE_PREVIEW_NAV',
                    types: ['reload', 'update_style']
                }
                this.updatePreview(Object.assign(defaultSetting, setting))
            },
            handleIsCanvasUpdated (isUpdate) {
                this.isCanvasUpdated = isUpdate
            }
        }
    }
</script>
<style lang="postcss">
    @import "@/css/mixins/scroller";
    $headerHeight: 52px;
    $pageHeaderHeight: 52px;

    .lessocde-editor-page {
        min-width: 1220px;
        height: calc(100vh - $headerHeight);
    }
    .lesscode-editor-page-header {
        position: relative;
        display: flex;
        justify-content: space-between;
        height: 52px;
        background: #fff;

        &:after{
            content: '';
            position: absolute;
            right: 0;
            bottom: 0;
            left: 0;
            z-index: 99;
            height: 1px;
            box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.1);
        }

        .function-and-tool {
            position: relative;
            display: flex;
            flex: 1;
            justify-content: center;
            align-items: center;
        }
    }
    .lesscode-editor-page-content{
        height: calc(100vh - $headerHeight - $pageHeaderHeight);
    }
    .lesscode-materials-panel-content {
        height: 100%;
        .materials-group-box-list {
            height: calc(100% - 44px);
            overflow-y: auto;
            @mixin scroller;
        }
    }
</style>
