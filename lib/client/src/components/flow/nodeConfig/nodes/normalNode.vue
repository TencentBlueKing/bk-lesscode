<template>
    <div class="normal-node-config">
        <form-section title="基础配置">
            <bk-form form-type="vertical" style="width: 656px">
                <bk-form-item label="节点名称" property="name" :required="true">
                    <bk-input v-model="nodeData.name"></bk-input>
                </bk-form-item>
                <bk-form-item label="处理人" :required="true">
                    <processors
                        ref="processorForm"
                        v-model="processorData"
                        :flow-id="nodeData.workflow"
                        :node-id="nodeData.id">
                    </processors>
                </bk-form-item>
            </bk-form>
        </form-section>
        <form-section title="表单配置" desc="（执行审批节点时，需要填写的字段信息）" style="margin-top: 16px;">
            <node-form-setting></node-form-setting>
        </form-section>
    </div>
</template>
<script>
    import cloneDeep from 'lodash.clonedeep'
    import FormSection from '../components/form-section.vue'
    import Processors from '../components/processors.vue'
    import NodeFormSetting from '../components/node-form-setting/index.vue'

    export default {
        name: 'NormalNode',
        components: {
            FormSection,
            Processors,
            NodeFormSetting
        },
        props: {
            config: {
                type: Object,
                default: () => ({})
            }
        },
        data () {
            return {
                nodeData: cloneDeep(this.config),
                processorData: {}
            }
        },
        watch: {
            config (val) {
                this.nodeData = cloneDeep(val)
            }
        }
    }
</script>
<style lang="postcss" scoped>

</style>
