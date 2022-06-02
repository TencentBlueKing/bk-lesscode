<template>
    <div class="project-template-modifier">
        <div class="header" v-if="!isComplexSide">{{ templateData.showName }}</div>
        <div class="main" :class="{ 'is-complex-side': isComplexSide }">
            <editor-prop
                v-if="!isComplexSide"
                v-bind="templateData"
                @on-change="handleChange" />
            <div ref="container" class="container">
                <component
                    :is="panelCom"
                    v-bind="templateData"
                    @on-change="handleChange" />
            </div>
        </div>
    </div>
</template>
<script>
    import { bus } from '@/common/bus'
    import EditorProp from './editor/prop'
    import RenderInfo from './info'
    import RenderMenu from './side-menu'
    import RenderTopMenu from './top-menu'
    import RenderComplexTop from './complex-top'
    import RenderComplexSide from './complex-side'

    const panelComMap = {
        info: RenderInfo,
        menu: RenderMenu,
        topMenu: RenderTopMenu,
        complexTop: RenderComplexTop,
        complexSide: RenderComplexSide
    }

    export default {
        components: {
            EditorProp
        },
        props: {
            templateData: {
                type: Object,
                required: true
            }
        },
        data () {
            return {
            }
        },
        computed: {
            panelCom () {
                return panelComMap[this.templateData.panelActive] || ''
            },
            isComplexSide () {
                return this.templateData.panelActive === 'complexSide'
            }
        },
        methods: {
            handleChange (field, value) {
                bus.$emit('on-template-change', {
                    ...this.templateData,
                    [field]: value
                })
            }
        }
    }
</script>
<style lang='postcss'>
    @import "@/css/mixins/scroller";

    .project-template-modifier {
        display: flex;
        flex-direction: column;
        height: 100%;
        background: #fff;

        .header {
            height: 46px;
            font-size: 14px;
            line-height: 46px;
            text-align: center;
            border-bottom: 1px solid #dcdee5;
        }
        .main {
            padding-top: 20px;
            height: calc(100% - 46px);
            overflow: auto;
            @mixin scroller;
            &.is-complex-side {
                height: 100%
            }
        }
        .container {
            padding: 0 10px;
        }
        .action-title {
            margin-bottom: 10px;
            font-size: 12px;
            font-weight: bold;
            color: #63656E;
            line-height: 16px;
        }
    }
    .menu-ghost-item {
        border: 1px dashed #3a84ff;
        background: #fff;
        color: #fff !important;
        height: 80px;
        .template-menu-edit, .template-menu-box, .bk-icon, .bk-drag-icon, .menu-children-box:before {
            display: none;
        }
    }
</style>
