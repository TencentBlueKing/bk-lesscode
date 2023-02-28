<template>
    <draw-layout :hide-right-slot="false">
        <layout>
            <div class="data-manage-page-wrapper">
                <!-- 表单数据管理页面 -->
                <form-data v-if="nocodeType === 'FORM_MANAGE'"></form-data>
                <!-- 流程管理页面 -->
                <flow-data v-else-if="nocodeType === 'FLOW_MANAGE'"></flow-data>
            </div>
        </layout>
        <div class="data-manage-setting-wrapper" slot="right">
            <layout-setting v-if="editType === 'LAYOUT'" :template-data="curTemplateData" />
            <operate-setting v-else></operate-setting>
        </div>
    </draw-layout>
</template>
<script>
    import { mapGetters } from 'vuex'
    import DrawLayout from '@/views/index/components/draw-layout'
    import Layout from '@/components/render/pc/widget/layout'
    import FormData from './form-data.vue'
    import FlowData from './flow-data/index.vue'
    import LayoutSetting from '@/element-materials/modifier/template'
    import OperateSetting from './components/operate-setting'

    export default {
        name: 'DataManage',
        components: {
            DrawLayout,
            Layout,
            FormData,
            FlowData,
            LayoutSetting,
            OperateSetting
        },
        props: {
            nocodeType: {
                type: String,
                default: ''
            }
        },
        data () {
            return {
                editType: 'FORM'
            }
        },
        computed: {
            ...mapGetters('layout', ['pageLayout']),
            ...mapGetters('drag', ['curTemplateData'])
        },
        watch: {
            // template没有指定面板，则展示form属性面板
            curTemplateData (curTemplateData) {
                if (curTemplateData.panelActive) {
                    this.editType = 'LAYOUT'
                    this.$store.commit('nocode/dataManage/setSelectedComp')
                } else {
                    this.editType = 'FORM'
                }
            }
        },
        mounted () {
            this.$refs.dataManageContent.addEventListener('click', this.clearSelectedComp)
        },
        beforeDestroy () {
            this.$refs.dataManageContent.removeEventListener('click', this.clearSelectedComp)
            this.$store.commit('nocode/dataManage/resetPageConfig')
        },
        methods: {
            clearSelectedComp () {
                this.$store.commit('nocode/dataManage/setSelectedComp')
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
