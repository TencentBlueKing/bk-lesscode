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
    <div class="material-modifier" :style="{ '--width': tabLabelItemWidth }">
        <template v-if="renderKey">
            <bk-tab
                :active="tabPanelActive"
                type="unborder-card"
                class="king-tab"
                v-enClass="'en-king-tab'"
                @tab-change="handleModifier">
                <bk-tab-panel
                    v-for="(tabPanel, panelIndex) in tabPanels"
                    v-bind="tabPanel"
                    :key="panelIndex" />
            </bk-tab>
            <div
                ref="container"
                class="material-modifier-container">
                <div
                    v-if="tabPanelActive === 'styles'"
                    class="style-setting-tips">
                    {{ $t('样式面板中设置的样式将覆盖组件自带的默认样式，请谨慎调整') }} </div>
                <template v-for="(com, index) in modifierComList">
                    <component
                        :is="com"
                        :key="`${renderKey}_${index}`" />
                </template>
                <div
                    v-if="isModifierEmpty"
                    class="empty">
                    {{ $t('配置项为空') }} </div>
            </div>
        </template>
        <div
            v-else
            class="empty">
            <span>{{ $t('请选择组件') }}</span>
        </div>
    </div>
</template>
<script>
    import LC from '@/element-materials/core'
    import ModifierStyles from './styles'
    import ModifierSlots from './slots'
    import ModifierGird from './gird'
    import ModifierForm from './form'
    import ModifierTab from './tab'
    import ModifierProps from './props'
    import ModifierEvents from './events'
    import ModifierDirectives from './directives'
    import ModifierAlign from './align'
    import H5Page from './h5-page'
    import ModifierPerms from './perms'

    export default {
        name: '',
        inheritAttrs: false,
        data () {
            return {
                tabPanels: [
                    { name: 'styles', label: this.$t('样式-styles'), count: 40 },
                    { name: 'props', label: this.$t('属性-props'), count: 30 },
                    { name: 'events', label: this.$t('事件-events'), count: 20 },
                    { name: 'directives', label: this.$t('指令-directives'), count: 10 }
                ],
                tabPanelActive: 'props',
                currentTabPanelType: 'unborder-card',
                renderKey: '',
                isModifierEmpty: false,
                tabLabelItemWidth: '25%'
            }
        },
        computed: {
            modifierComList () {
                // 当前属性面板的编辑组件
                const comMap = {
                    styles: [ModifierAlign, ModifierStyles],
                    props: [ModifierGird, H5Page, ModifierForm, ModifierTab, ModifierSlots, ModifierProps],
                    events: [ModifierEvents],
                    directives: [ModifierDirectives],
                    perms: [ModifierPerms]
                }
                return comMap[this.tabPanelActive]
            }
        },

        created () {
            this.activeComponentNode = null
            const activeCallback = ({ target }) => {
                this.tabPanelActive = target.tabPanelActive || 'props'
                this.renderKey = target.renderKey
                this.activeComponentNode = target
                this.checkChildrenComponentInstance()

                // 目前只有 button 按钮有权限面板
                if (target.type === 'bk-button') {
                    this.tabLabelItemWidth = this.$store.state.Language === 'en' ? '21%' : '20%'
                    this.tabPanels.splice(0, this.tabPanels.length, ...[
                        { name: 'styles', label: this.$t('样式-styles'), count: 40 },
                        { name: 'props', label: this.$t('属性-props'), count: 30 },
                        { name: 'events', label: this.$t('事件-events'), count: 20 },
                        { name: 'directives', label: this.$t('指令-directives'), count: 10 },
                        { name: 'perms', label: this.$t('权限-perms'), count: 10 }
                    ])
                } else {
                    this.tabLabelItemWidth = '25%'
                    this.tabPanels.splice(0, this.tabPanels.length, ...[
                        { name: 'styles', label: this.$t('样式-styles'), count: 40 },
                        { name: 'props', label: this.$t('属性-props'), count: 30 },
                        { name: 'events', label: this.$t('事件-events'), count: 20 },
                        { name: 'directives', label: this.$t('指令-directives'), count: 10 }
                    ])
                }
            }

            const activeClearCallback = () => {
                this.tabPanelActive = 'props'
                this.renderKey = ''
                this.activeComponentNode = null
            }

            // 默认有选中的节点
            const activeNode = LC.getActiveNode()
            if (activeNode && activeNode.parentNode) {
                activeCallback({ target: activeNode })
            }

            LC.addEventListener('active', activeCallback)
            LC.addEventListener('activeClear', activeClearCallback)
            this.$once('hook:beforeDestroy', () => {
                LC.removeEventListener('active', activeCallback)
                LC.removeEventListener('activeClear', activeClearCallback)
            })
        },
        methods: {
            checkChildrenComponentInstance () {
                this.isModifierEmpty = false
                setTimeout(() => {
                    if (this.$refs.container) {
                        this.isModifierEmpty = this.$refs.container.children.length < 1
                    }
                })
            },
            handleModifier (tabPanelActive) {
                this.tabPanelActive = tabPanelActive
                if (this.activeComponentNode) {
                    this.activeComponentNode.setProperty('tabPanelActive', tabPanelActive)
                }
                this.checkChildrenComponentInstance()
            }
        }
    }
</script>
<style lang='postcss'>
    @import "@/css/mixins/scroller";
    @import "@/css/variable";

    .material-modifier {
        .bk-tab.king-tab {
            .bk-tab-header {
                height: 47px;
                border-bottom: 1px solid $boxBorderColor;
                .bk-tab-label-wrapper {
                    background: #fff;
                    .bk-tab-label-list {
                        width: 100%;
                        height: 100%;
                        padding: 0 20px;
                        .bk-tab-label-item {
                            width: calc(var(--width));
                            line-height: 46px;
                            min-width: auto;
                            padding: 0 2px;
                            &.active::after {
                                left: 16%;
                                width: 68%;
                            }
                        }
                    }
                }
            }
            .bk-tab-section {
                padding: 0;
            }

        }
        .bk-tab.en-king-tab {
            .bk-tab-header {
                .bk-tab-label-wrapper {
                    .bk-tab-label-list {
                        padding-left: 2px;
                        padding-right: 12px;
                    }
                }
            }

        }
        .material-modifier-container {
            @mixin scroller;
            height: calc(100vh - 167px - 93px);
            padding-bottom: 20px;
            overflow-y: auto;
            position: relative;
        }
        /* bk-input 前后的 slot 文本样式 */
        .common-input-slot-text {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 32px;
            height: 100%;
            font-size: 14px;
            line-height: 20px;
            background: #fafbfd;
        }

        /* 属性校验失败的提示文本样式 */
        .modifier-input-error-text {
            color: $newRedColor;
            font-size: 12px;
            line-height: 16px;
        }

        /* 属性/样式输入框校验失败边框变红警告样式 */
        .king-input-modifier-style-error {
            input, textarea {
                border-color: $newRedColor !important;
                &:focus {
                    border-color: $newRedColor !important;
                }
            }
        }
        textarea.king-input-modifier-style-error, input.king-input-modifier-style-error {
            border-color: $newRedColor !important;
            &:focus {
                border-color: $newRedColor !important;
            }
        }
        .empty {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
        .style-setting-tips{
            font-size: 12px;
            margin: 10px 5px 5px 14px;
        }
    }
</style>
