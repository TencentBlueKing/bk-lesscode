<template>
    <div class="generate-data-manage-page-btn">
        <bk-button
            size="small"
            :text="true"
            @click="handleCreateClick">
            生成数据管理页
        </bk-button>
        <create-page-dialog
            ref="createPageDialog"
            platform="PC"
            nocode-type="FLOW_MANAGE"
            :init-page-data="pageData">
        </create-page-dialog>
    </div>
</template>
<script>
    import { mapState } from 'vuex'
    import CreatePageDialog from '@/components/project/create-page-dialog.vue'

    export default {
        name: 'GenerateDataManagePage',
        components: {
            CreatePageDialog
        },
        computed: {
            ...mapState('nocode/flow', ['flowConfig']),
            pageData () {
                const { id, flowName } = this.flowConfig
                return {
                    flowId: id,
                    pageCode: `flowDataManage${id}`,
                    pageName: `${flowName}_数据管理页面`
                }
            }
        },
        methods: {
            handleCreateClick () {
                this.$refs.createPageDialog.isShow = true
            }
        }
    }
</script>
