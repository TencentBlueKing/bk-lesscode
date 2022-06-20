<template>
    <div class="data-manange-comp">
        <form-data
            v-if="type === 'FORM_MANAGE'"
            :view-mode="true"
            :config="config"
            :fields="fields">
        </form-data>
        <flow-data v-if="type === 'FLOW_MANGE'"></flow-data>
    </div>
</template>
<script>
    import { messageError } from '@/common/bkmagic'
    import FormData from '@/components/flow-form-comp/components/form-data.vue'
    import FlowData from '@/components/flow-form-comp/components/flow-data.vue'

    export default {
        name: 'DataManageComp',
        components: {
            FormData,
            FlowData
        },
        props: {
            type: {
                type: String,
                default: ''
            },
            formIds: [Number, Object], // 普通表单数据管理为单个id值，流程数据管理为{ nodeId: id }
            serviceId: Number, // itsm流程的id
            config: {
                type: Object,
                default: () => ({})
            }
        },
        data () {
            return {
                fields: [],
                formDetailLoading: true
            }
        },
        created () {
            if (this.type === 'FORM_MANAGE') {
                this.getFormDetail()
            }
        },
        methods: {
            async getFormDetail () {
                try {
                    this.formDetailLoading = true
                    const formDetail = await this.$store.dispatch('nocode/form/formDetail', { formId: this.formIds })
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
<style lang="postcss" scoped>
    .data-manange-comp {
        height: 100%;
        padding: 24px;
        background: #ffffff;
    }
</style>
