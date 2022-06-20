<template>
    <draw-layout>
        <layout>
            <div class="data-manage-page-wrapper">
                <form-data
                    v-if="nocodeType === 'FORM_MANAGE' && !formDetailLoading"
                    :config="config"
                    :fields="fields">
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
    import { mapGetters } from 'vuex'
    import DrawLayout from '@/views/index/components/draw-layout'
    import Layout from '@/components/render/pc/widget/layout'
    import FormData from '@/components/flow-form-comp/components/form-data.vue'
    import FlowData from '@/components/flow-form-comp/components/flow-data.vue'
    import { messageError } from '@/common/bkmagic'

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
        },
        data () {
            return {
                config: {
                    filters: [],
                    tableConfig: []
                },
                fields: [],
                formDetailLoading: true
            }
        },
        computed: {
            ...mapGetters('page', ['pageDetail'])
        },
        created () {
            if (Object.keys(this.pageDetail.content).length > 0) {
                this.config = this.pageDetail.content
            }
            this.getFormDetail()
        },
        methods: {
            async getFormDetail () {
                try {
                    this.formDetailLoading = true
                    const formDetail = await this.$store.dispatch('nocode/form/formDetail', { formId: this.pageDetail.formId })
                    this.fields = JSON.parse(formDetail.content)
                } catch (e) {
                    messageError(e.message || e)
                } finally {
                    this.formDetailLoading = false
                }
            }
        }
    }
</script>
<style lang="postcss">
    .data-manage-page-wrapper {
        padding: 24px;
        height: 100%;
        background: #ffffff;
    }
</style>
