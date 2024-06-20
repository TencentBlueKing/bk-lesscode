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
                <i :class="panel.icon" v-if="panel.icon" />
                <img :src="panel.img" class="tab-img" v-else>
            </div>
        </template>
    </div>
</template>
<script>
    import aiImg from '../../../../../../images/ai-logo.png'
    import { mapGetters } from 'vuex'
    import LC from '@/element-materials/core'

    export default {
        props: {
            value: String
        },
        computed: {
            ...mapGetters('ai', ['isAiAvailable']),

            panelList () {
                const list = [
                    {
                        key: 'component',
                        tips: window.i18n.t('页面编辑器'),
                        icon: 'bk-drag-icon bk-drag-custom-comp-default'
                    },
                    {
                        key: 'formEngine',
                        tips: window.i18n.t('表单编辑器'),
                        icon: 'bk-drag-icon bk-drag-biaodan'
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

                if (this.isAiAvailable) {
                    list.push({
                        key: 'BK-GPT',
                        tips: window.i18n.t('AI开发助手小鲸'),
                        img: aiImg
                    })
                }

                return list
            }
        },
        mounted () {
            LC.addEventListener('active', this.changePanelCallBack)
            LC.addEventListener('activeClear', this.changePanelCallBack)
            LC.addEventListener('activeElementUpdate', this.changePanelCallBack)
        },
        beforeDestroy () {
            LC.removeEventListener('active', this.changePanelCallBack)
            LC.removeEventListener('activeClear', this.changePanelCallBack)
            LC.addEventListener('activeElementUpdate', this.changePanelCallBack)
        },
        methods: {
            changePanelCallBack () {
                // 如果当前在 tree Panle，不做切换响应
                if (this.value === 'tree') return

                const activeNode = LC.getActiveNode()
                const activeElement = LC.getActiveElement()

                // 当 form 表单激活时，左侧面板自动切换到表单编辑器; 否则自动切换到组件编辑器
                if (activeNode?.type === 'widget-form-container' || activeElement) {
                    this.handleChange('formEngine')
                } else {
                    this.handleChange('component')
                }
            },
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
            .tab-img {
                width: 14px;
                height: 14px;
            }
        }
    }
</style>
