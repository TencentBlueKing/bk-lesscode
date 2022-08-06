<template>
    <div class="data-manange-comp">
        <form-data
            v-if="type === 'FORM_MANAGE'"
            :form-ids="formIds"
            :config="config"
            :view-type="viewType">
        </form-data>
        <flow-data
            v-if="type === 'FLOW_MANAGE'"
            :form-ids="formIds"
            :service-id="serviceId"
            :config="config"
            :view-type="viewType">
        </flow-data>
    </div>
</template>
<script>
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
            viewType: {
                type: String,
                default: 'projectCode'
            },
            config: {
                type: Object,
                default: () => ({})
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .data-manange-comp {
        height: 100%;
        padding: 24px;
        background: #ffffff;
        overflow: auto;
    }
</style>
