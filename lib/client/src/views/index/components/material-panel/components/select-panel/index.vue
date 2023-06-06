<template>
    <div class="select-panel">
        <template v-for="panel in panelList">
            <div :key="panel.key"
                class="tab-item"
                :class="{
                    active: value === panel.key
                }"
                v-bk-tooltips.right="panel.tips"
                :role="`${panel.key}-panel-tab`"
                @click="handleChange(panel.key)">
                <i :class="panel.icon" />
            </div>
        </template>
    </div>
</template>
<script>
    export default {
        props: {
            value: String
        },
        data () {
            return {
                panelList: [
                    {
                        key: 'component',
                        tips: window.i18n.t('组件库'),
                        icon: 'bk-drag-icon bk-drag-custom-comp-default'
                    },
                    {
                        key: 'template',
                        tips: window.i18n.t('页面模板管理'),
                        icon: 'bk-drag-icon bk-drag-template-fill'
                    },
                    {
                        key: 'icon',
                        tips: window.i18n.t('图标'),
                        icon: 'bk-icon icon-smile-shape'
                    },
                    {
                        key: 'tree',
                        tips: window.i18n.t('页面组件树'),
                        icon: 'bk-drag-icon bk-drag-level-down'
                    }
                ]
            }
        },
        methods: {
            handleChange (value) {
                this.$emit('input', value)
                this.$emit('change', value)
            }
        }
    }
</script>
<style lang="postcss" scoped>
    @import "@/css/mixins/scroller";
    
    .select-panel{
        font-size: 14px;
        border-right: 1px solid #dcdee5;
        @mixin scroller;

        .tab-item{
            width: 100%;
            height: 42px;
            position: relative;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #979BA5;
            &:hover{
                color: #3a84ff;
            }
            &.active{
                background-color: #e1ecff;
                color: #3a84ff;
            }
        }
    }
</style>
