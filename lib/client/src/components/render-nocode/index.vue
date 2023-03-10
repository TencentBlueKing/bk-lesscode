<template>
    <div class="render-content">
        <!-- 表单页面 -->
        <render-form v-if="nocodeType === 'FORM'" @update="$emit('update', $event)" />
        <render-markdown v-else-if="nocodeType === 'MARKDOWN'"></render-markdown>
        <!-- 表单数据管理和流程管理 -->
        <render-data-manage v-else-if="['FORM_MANAGE', 'FLOW_MANAGE'].includes(nocodeType)" type="edit" :nocode-type="nocodeType"></render-data-manage>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex'
    import RenderMarkdown from './markdown'
    import RenderForm from './form'
    import RenderDataManage from './data-manage'

    export default {
        name: 'RenderNocode',
        components: {
            RenderForm,
            RenderDataManage,
            RenderMarkdown
        },
        data () {
            return {
                type: 'edit'
            }
        },
        computed: {
            ...mapGetters('page', ['pageDetail']),
            nocodeType () {
                return this.pageDetail.nocodeType || ''
            }
        },
        created () {
            this.$route.name === 'editNocode' ? this.type = 'edit' : this.type = 'use'
        }

    }
</script>
<style lang="postcss" scoped>
.render-content{
  height: 100%;
}
</style>
