<template>
    <bk-dropdown-menu
        class="select-base-component"
        ref="dropdownMenuComp"
        trigger="click"
        @show="handleToggleSelectPanel(true)"
        @hide="handleToggleSelectPanel(false)">
        <div slot="dropdown-trigger">
            <span class="tab-item-label" v-bk-tooltips="{ content: componentNameText ,distance: 8 }">
                {{ componentNameText }}
            </span>
            <i
                class="bk-drag-icon toggle-icon"
                :class="{
                    'bk-drag-angle-down-fill': isShowSelectPanel,
                    'bk-drag-angle-up-fill': !isShowSelectPanel
                }" />
        </div>
        <div
            slot="dropdown-content"
            class="base-component-list">
            <div class="base-component-item"
                v-for="item in componentList"
                :key="item.key"
                :class="{
                    'selected': value === item.key
                }">
                <div @click="handleChange(item.key)">
                    <span style="margin-right: 4px;">{{ item.name }}</span>
                    <i class="bk-drag-icon bk-drag-vesion-fill"
                        v-bk-tooltips="{
                            content: item.tooltip,
                            placements: ['bottom-end'],
                            allowHtml: true
                        }" />
                </div>
            </div>
        </div>
    </bk-dropdown-menu>
</template>
<script>
    import { mapGetters } from 'vuex'
    export default {
        name: '',
        props: {
            value: {
                type: String,
                default: 'vant'
            }
        },
        data () {
            return {
                isShowSelectPanel: false,
                list: {
                    PC: [
                        {
                            key: 'bk',
                            name: window.i18n.t('蓝鲸基础组件 (Vue)'),
                            tooltip: window.i18n.t('当前组件库版本为') + '“2.4.15”，<a target="_blank" href="https://magicbox.bk.tencent.com/static_api/v3/components_vue/2.0/example/index.html#/changelog" style="cursor: pointer;color: #3a84ff">' + window.i18n.t('查看更新日志') + '</a>'
                        },
                        {
                            key: 'element',
                            name: 'Element UI (Vue)',
                            tooltip: window.i18n.t('当前组件库版本为') + '“2.15.1”，<a target="_blank" href="https://github.com/ElemeFE/element/releases" style="cursor: pointer;color: #3a84ff">' + window.i18n.t('查看更新日志') + '</a>'
                        }
                    ],
                    MOBILE: [{
                        key: 'vant',
                        name: 'Vant UI (Vue)',
                        tooltip: window.i18n.t('当前组件库版本为') + '“2.12.39”，<a target="_blank" href="https://vant-ui.github.io/vant/v2/#/zh-CN/changelog" style="cursor: pointer;color: #3a84ff">' + window.i18n.t('查看更新日志') + '</a>'
                    }]
                }
            }
        },
        computed: {
            ...mapGetters('page', ['platform']),
            componentList () {
                return this.list[this.platform]
            },
            componentNameText () {
                const currentLibrary = this.componentList.find(item => item.key === this.value)
                return currentLibrary && currentLibrary.name
            }
        },
        methods: {
            handleToggleSelectPanel () {
                this.isShowSelectPanel = true
            },
            handleChange (value) {
                this.$emit('input', value)
                this.$emit('change', value)
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .select-base-component{
        .base-component-list{
            .base-component-item{
                height: 32px;
                line-height: 33px;
                padding: 0 16px;
                color: #63656e;
                font-size: 14px;
                text-decoration: none;
                white-space: nowrap;
                &:hover,
                &.selected{
                    background-color: #eaf3ff;
                    color: #3a84ff;
                }
            }
        }
    }
</style>
