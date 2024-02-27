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
    <div class="material-modifier">
        <template v-if="renderKey">
            <div class="modifier-tab-container">
                <select-tab
                    :tab-list="tabPanels"
                    :active-item="tabPanelActive"
                    :item-change="handleModifier">
                </select-tab>
            </div>
            <div class="props-search" v-if="tabPanelActive === 'props' && !isModifierEmpty">
                <bk-input
                    ext-cls="props-search-input"
                    right-icon="bk-icon icon-search"
                    :placeholder="$t('请输入属性名称')"
                    v-model="keyword"
                    :clearable="true" />
            </div>
            <empty-status type="search" v-if="tabPanelActive === 'props' && isSearchEmpty && keyword" @clearSearch="handlerClear"></empty-status>
            <div
                ref="container"
                class="material-modifier-container">
                <template v-for="(com, index) in modifierComList">
                    <component
                        :is="com"
                        :key="`${renderKey}_${index}`"
                        :keyword="keyword" />
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
    import SelectTab from '@/components/ui/select-tab'
    import ModifierStyles from './styles'
    import ModifierSlots from './slots'
    import ModifierGird from './gird'
    import ModifierForm from './form'
    import ModifierFormContainer from './form-container'
    import ModifierDataManageContainer from './data-manage-container'
    import ModifierTab from './tab'
    import ModifierProps from './props'
    import ModifierEvents from './events'
    import ModifierDirectives from './directives'
    import ModifierAlign from './align'
    import H5Page from './h5-page'
    import ModifierPerms from './perms'
    import emptyStatus from '@/components/project/empty-status.vue'
    export default {
        id: '',
        components: {
            SelectTab,
            emptyStatus
        },
        inheritAttrs: false,
        data () {
            return {
                tabPanels: [
                    { id: 'styles', name: this.$t('样式-styles') },
                    { id: 'props', name: this.$t('属性-props') },
                    { id: 'events', name: this.$t('事件-events') },
                    { id: 'directives', name: this.$t('指令-directives') }
                ],
                tabPanelActive: 'props',
                currentTabPanelType: 'unborder-card',
                renderKey: '',
                isModifierEmpty: false,
                keyword: '',
                isSearchEmpty: false
            }
        },
        computed: {
            modifierComList () {
                // 当前属性面板的编辑组件
                const comMap = {
                    styles: [ModifierAlign, ModifierStyles],
                    props: [ModifierGird, H5Page, ModifierForm, ModifierFormContainer, ModifierDataManageContainer, ModifierTab, ModifierSlots, ModifierProps],
                    events: [ModifierEvents],
                    directives: [ModifierDirectives],
                    perms: [ModifierPerms]
                }
                return comMap[this.tabPanelActive]
            }
        },
        watch: {
            keyword: {
                handler (val) {
                    setTimeout(() => {
                        if (this.$refs.container) {
                            this.isSearchEmpty = this.$refs.container.children.length < 1
                        }
                    })
                }
            }
        },
        created () {
            this.activeComponentNode = null
           
            const activeCallback = ({ target }) => {
                this.tabPanelActive = target.tabPanelActive || 'props'
                this.renderKey = target.renderKey
                this.activeComponentNode = target
                this.checkChildrenComponentInstance()
                this.keyword = ''
                // 目前只有 button 按钮有权限面板
                if (target.type === 'bk-button') {
                    this.tabPanels.splice(0, this.tabPanels.length, ...[
                        { id: 'styles', name: this.$t('样式-styles') },
                        { id: 'props', name: this.$t('属性-props') },
                        { id: 'events', name: this.$t('事件-events') },
                        { id: 'directives', name: this.$t('指令-directives') },
                        { id: 'perms', name: this.$t('权限-perms') }
                    ])
                } else {
                    this.tabPanels.splice(0, this.tabPanels.length, ...[
                        { id: 'styles', name: this.$t('样式-styles') },
                        { id: 'props', name: this.$t('属性-props') },
                        { id: 'events', name: this.$t('事件-events') },
                        { id: 'directives', name: this.$t('指令-directives') }
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
            if (activeNode) {
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
                this.handlerClear()
            },
            handlerClear () {
                this.keyword = ''
            }
        }
    }
</script>
<style lang='postcss'>
    @import "@/css/mixins/scroller";
    @import "@/css/variable";

    .material-modifier {
        height: calc(100% - 42px);
        position: relative;
        .modifier-tab-container {
            height: 49px;
            background: #fff;
            padding: 8px 12px;
            border-bottom: 1px solid $boxBorderColor;
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
            height: calc(100% - 50px - 48px);
            padding-bottom: 20px;
            overflow-y: auto;
            overflow-x: hidden;
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
    .props-search {
        padding: 8px 12px;
        .props-search-input input {
            background-color: #F5F7FA;
            border-radius: 2px;
            border: 1px solid #fff;
        &:focus {
            border: 1px solid #3a84ff;
        }
    }
    }
    
</style>
