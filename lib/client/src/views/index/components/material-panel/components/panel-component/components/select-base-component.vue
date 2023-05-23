<template>
    <bk-dropdown-menu
        class="select-base-component"
        ref="dropdownMenuComp"
        trigger="click"
        @show="handleToggleSelectPanel(true)"
        @hide="handleToggleSelectPanel(false)">
        <div slot="dropdown-trigger" style="height:42px;">
            <span class="tab-item-label" v-bk-tooltips="{ content: componentNameText ,distance: 8 }">
                {{ componentNameText }}
            </span>
            <i
                style="margin-left: 4px"
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
                }"
                @click="handleChange(item.key)">
                <span style="margin-right: 4px;">{{ item.name }}</span>
                <div class="icon-tags">
                    <i class="bk-drag-icon bk-drag-info-tips"
                        v-bk-tooltips.light="{
                            content: item.tooltip,
                            placements: ['top-end'],
                            allowHtml: true
                        }" />
                    <span>{{item.type}}</span>
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
                            name: 'BKUI-VUE2',
                            type: 'Vue',
                            tooltip: '当前组件库版本为“2.4.14，<a target="_blank" href="https://magicbox.bk.tencent.com/static_api/v3/components_vue/2.0/example/index.html#/changelog?anchor=2.4.14" style="cursor: pointer;color: #3a84ff">查看更新日志</a>'
                        },
                        {
                            key: 'element',
                            name: 'Element UI',
                            type: 'Vue',
                            tooltip: '当前组件库版本为“2.15.1”，<a target="_blank" href="https://github.com/ElemeFE/element/releases/tag/v2.15.1" style="cursor: pointer;color: #3a84ff">查看更新日志</a>'
                        }
                    ],
                    MOBILE: [{
                        key: 'vant',
                        name: 'Vant UI',
                        type: 'Vue',
                        tooltip: '当前组件库版本为“2.12.39”，<a target="_blank" href="https://vant-ui.github.io/vant/v2/#/zh-CN/changelog" style="cursor: pointer;color: #3a84ff">查看更新日志</a>'
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
                return currentLibrary && `${currentLibrary.name} (${currentLibrary.type})`
            }
        },
        methods: {
            handleToggleSelectPanel (val) {
                this.isShowSelectPanel = val
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
            width: 200px;
            .base-component-item{
                display: flex;
                align-items: center;
                justify-content: space-between;
                height: 32px;
                line-height: 32px;
                padding: 0 8px 0 12px;
                color: #63656e;
                font-size: 12px;
                &:hover,
                &.selected {
                    background-color: #E1ECFF;
                    color: #3a84ff;
                    .icon-tags i,.icon-tags span {
                        background-color: #EDF4FF;
                        color: #3a84ff;
                    }
                }
                .icon-tags {
                    display: flex;
                    align-items: center;
                    .bk-drag-info-tips {
                        display: inline-block;
                        margin-right: 2px;
                    }
                    i,span {
                        padding: 0px 3px;
                        line-height: 18px;
                        color: #979BA5;
                        background: #F5F7FA;
                        border-radius: 2px;
                    }
                }
            }
        }
    }
</style>
