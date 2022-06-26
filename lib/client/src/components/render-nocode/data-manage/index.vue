<template>
    <draw-layout>
        <layout>
            <div class="data-manage-page-wrapper">
                <form-data v-if="nocodeType === 'FORM_MANAGE'">
                </form-data>
                <flow-data v-else-if="nocodeType === 'FLOW_MANAGE'"></flow-data>
            </div>
        </layout>
        <div class="data-manage-setting-wrapper" slot="right">
            <layout-setting :template-data="curTemplateData" />
        </div>
    </draw-layout>
</template>
<script>
    import DrawLayout from '@/views/index/components/draw-layout'
    import Layout from '@/components/render/pc/widget/layout'
    import FormData from './form-data.vue'
    import FlowData from './flow-data/index.vue'
    import LayoutSetting from '@/element-materials/modifier/template'
    import { mapGetters } from 'vuex'
    export default {
        name: 'DataManage',
        components: {
            DrawLayout,
            Layout,
            FormData,
            FlowData,
            LayoutSetting
        },
        props: {
            nocodeType: {
                type: String,
                default: ''
            }
        },
        computed: {
            ...mapGetters('drag', ['curTemplateData'])
        },
        watch: {
            // template没有指定面板，则展示form属性面板
            curTemplateData (curTemplateData) {
                if (curTemplateData.panelActive) {
                    this.editType = 'LAYOUT'
                } else {
                    this.editType = 'FORM'
                }
            }
        }
    }
</script>
<style lang="postcss">
    .data-manage-page-wrapper {
        padding: 24px;
        height: 100%;
        min-height: calc(100vh - 190px);
        background: #ffffff;
    }
    .data-manage-setting-wrapper{
      height: 100%;
    }
</style>
