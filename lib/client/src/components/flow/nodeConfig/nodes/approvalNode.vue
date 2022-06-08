<template>
    <div class="approval-node-form">
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
                        :node-id="nodeData.id"
                        :exclude-type="['CMDB', 'GENERAL', 'OPEN', 'BY_ASSIGNOR', 'EMPTY', 'IAM', 'API']">
                    </processors>
                </bk-form-item>
                <bk-form-item label="审批方式" :required="true">
                    <bk-radio-group v-model="approvalType" class="approval-type-radios" @change="handleApprovalChange">
                        <bk-radio value="orsign" v-bk-tooltips="'任一处理人完成审批即可'">或签</bk-radio>
                        <bk-radio value="orderCountersign" v-bk-tooltips="'所有处理人按顺序进行审批'">顺序会签</bk-radio>
                        <bk-radio value="randomCountersign" v-bk-tooltips="'所有处理人随机进行审批'">随机会签</bk-radio>
                    </bk-radio-group>
                </bk-form-item>
                <bk-form-item
                    v-if="nodeData.is_multi"
                    label="提前结束条件"
                    :desc="{
                        width: 360,
                        content: '默认结束条件：所有处理人处理完成，会签自动结束；若配置了会签提前结束条件，满足条件，将提前结束'
                    }">
                    <end-condition></end-condition>
                </bk-form-item>
                <bk-form-item label="是否可转单">
                    <bk-radio-group v-model="nodeData.can_deliver">
                        <bk-radio :value="true">是</bk-radio>
                        <bk-radio :value="false">否</bk-radio>
                    </bk-radio-group>
                </bk-form-item>
                <bk-form-item v-if="nodeData.can_deliver" label="转单人" :required="true">
                    <processors
                        ref="processorForm"
                        v-model="dilverData"
                        :flow-id="nodeData.workflow"
                        :node-id="nodeData.id"
                        :exclude-type="['CMDB', 'GENERAL', 'OPEN', 'BY_ASSIGNOR', 'EMPTY', 'IAM', 'API']">
                    </processors>
                </bk-form-item>
            </bk-form>
        </form-section>
    </div>
</template>
<script>
    import cloneDeep from 'lodash.clonedeep'
    import FormSection from '../components/form-section.vue'
    import Processors from '../components/processors.vue'
    import endCondition from '../components/end-condition.vue'

    export default {
        name: 'ApprovalNode',
        components: {
            FormSection,
            Processors,
            endCondition
        },
        props: {
            nodeDetail: {
                type: Object,
                default: () => ({})
            }
        },
        data () {
            return {
                nodeData: cloneDeep(this.nodeDetail),
                processorData: {
                    type: this.nodeDetail.processors_type,
                    processors: cloneDeep(this.nodeDetail.processors)
                },
                dilverData: {
                    type: this.nodeDetail.delivers_type,
                    processors: cloneDeep(this.nodeDetail.delivers)
                },
                approvalType: this.getApprovalType(this.nodeDetail)
            }
        },
        watch: {
            nodeDetail (val) {
                this.nodeData = cloneDeep(val)
                this.processorData = {
                    type: val.processors_type,
                    processors: cloneDeep(val.processors)
                }
                this.diliverData = {
                    type: val.delivers_type,
                    processors: cloneDeep(val.delivers)
                }
                this.approvalType = this.getApprovalType(val)
            }
        },
        methods: {
            getApprovalType (nodeDetail) {
                const { is_multi: isMulti, is_sequential: isSequential } = nodeDetail
                return isMulti ? isSequential ? 'orderCountersign' : 'randomCountersign' : 'orsign'
            },
            handleApprovalChange (val) {
                if (val === 'orsign') {
                    this.nodeData.is_multi = false
                    this.nodeData.is_sequential = false
                } else if (val === 'orderCountersign') {
                    this.nodeData.is_multi = true
                    this.nodeData.is_sequential = true
                } else {
                    this.nodeData.is_multi = true
                    this.nodeData.is_sequential = false
                }
            }
        }
    }
</script>
<style lang="postcss" scoped>
.approval-node-form {
  margin-top: 24px;
  .bk-form >>> .bk-form-item + .bk-form-item {
      margin-top: 15px;
  }
}
.bk-form-radio {
    margin-right: 64px;
}
.approval-type-radios {
    >>> .bk-radio-text {
        line-height: 20px;
        border-bottom: 1px dashed #979ba5;
    }
}
</style>
