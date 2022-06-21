<template>
    <draw-layout>
        <layout>
            <div class="data-manage-page-wrapper">
                <form-data v-if="nocodeType === 'FORM_MANAGE'">
                </form-data>
                <flow-data v-else-if="nocodeType === 'FLOW_MANAGE'"></flow-data>
            </div>
        </layout>
        <!-- <div class="data-manage-setting-wrapper" slot="right">
            数据管理页配置组件
        </div> -->
    </draw-layout>
</template>
<script>
    import DrawLayout from '@/views/index/components/draw-layout'
    import Layout from '@/components/render/pc/widget/layout'
    import FormData from './form-data.vue'
    import FlowData from './flow-data/index.vue'

    export default {
        name: 'DataManage',
        components: {
            DrawLayout,
            Layout,
            FormData,
            FlowData
        },
        props: {
            nocodeType: {
                type: String,
                default: ''
            }
        }
    }
</script>
<style lang="postcss">
    .data-manage-page-wrapper {
        padding: 24px;
        height: 100%;
        min-height: calc(100vh - 200px);
        /* background: #ffffff; */
    }
</style>
