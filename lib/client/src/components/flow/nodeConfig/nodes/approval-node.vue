<template>
    <div class="approval-node-form">
        <form-section title="基础配置">
            <bk-form
                ref="basicForm"
                form-type="vertical"
                style="width: 656px"
                :model="nodeData"
                :rules="rules">
                <bk-form-item label="节点名称" property="name" :required="true">
                    <bk-input :value="nodeData.name" @change="handleNameChange"></bk-input>
                </bk-form-item>
                <bk-form-item label="处理人" :required="true">
                    <processors
                        ref="processorsForm"
                        :value="processorData"
                        :flow-id="nodeData.workflow"
                        :node-id="nodeData.id"
                        :exclude-type="excludeRoleType"
                        @change="handleProcessorChange">
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
                    <bk-radio-group v-model="nodeData.can_deliver" @change="handleDeliverableChange">
                        <bk-radio :value="true">是</bk-radio>
                        <bk-radio :value="false">否</bk-radio>
                    </bk-radio-group>
                </bk-form-item>
                <bk-form-item v-if="nodeData.can_deliver" label="转单人" :required="true">
                    <processors
                        ref="deliversForm"
                        :value="deliverData"
                        :flow-id="nodeData.workflow"
                        :node-id="nodeData.id"
                        :exclude-type="excludeRoleType"
                        @change="handleDeliverChange">
                    </processors>
                </bk-form-item>
            </bk-form>
        </form-section>
    </div>
</template>
<script>
    import { mapState, mapGetters } from 'vuex'
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
        data () {
            return {
                approvalType: this.getApprovalType(this.nodeDetail),
                excludeRoleType: ['CMDB', 'GENERAL', 'OPEN', 'BY_ASSIGNOR', 'EMPTY', 'IAM', 'API'],
                rules: {
                    name: [
                        {
                            required: true,
                            message: '节点名称为必填项',
                            trigger: 'blur'
                        }
                    ]
                }
            }
        },
        computed: {
            ...mapGetters('nocode/nodeConfig', [
                'processorData',
                'deliverData'
            ]),
            ...mapState('nocode/nodeConfig', [
                'nodeData',
                'formConfig'
            ])
        },
        created () {
            // webhook节点处理人不能为不限，但是创建节点时默认返回的不限，需要在编辑时清除
            if (this.excludeRoleType.includes(this.processorData.type)) {
                this.handleProcessorChange({ type: '', processors: '' })
            }
        },
        methods: {
            getApprovalType () {
                const { is_multi: isMulti, is_sequential: isSequential } = this.$store.state.nocode.nodeConfig.nodeData
                return isMulti ? (isSequential ? 'orderCountersign' : 'randomCountersign') : 'orsign'
            },
            handleNameChange (val) {
                this.$store.commit('nocode/nodeConfig/setNodeName', val)
            },
            handleProcessorChange (val) {
                this.$store.commit('nocode/nodeConfig/updateProcessor', val)
            },
            handleApprovalChange (val) {
                let isMulti, isSequential
                if (val === 'orsign') {
                    isMulti = false
                    isSequential = false
                } else if (val === 'orderCountersign') {
                    isMulti = true
                    isSequential = true
                } else {
                    isMulti = true
                    isSequential = false
                }
                this.$store.commit('nocode/nodeConfig/setApprovalConfig', { isMulti, isSequential })
            },
            handleDeliverableChange (val) {
                if (val) {
                    this.handleDeliverChange({ type: '', processors: '' })
                } else {
                    this.handleDeliverChange({ type: 'EMPTY', processors: '' })
                }
            },
            handleDeliverChange (val) {
                this.$store.commit('nocode/nodeConfig/updateDeliver', val)
            },
            validate () {
                const validateForms = [
                    this.$refs.basicForm.validate,
                    this.$refs.processorsForm.validate
                ]
                if (this.nodeData.can_deliver) {
                    validateForms.push(this.$refs.deliversForm.validate)
                }
                return Promise.all(validateForms.map(func => func.call(this))).then((result) => {
                    return result.every(item => item === true)
                }).catch((e) => {
                    return false
                })
            }
        }
    }
</script>
<style lang="postcss" scoped>
.approval-node-form {
  margin-top: 24px;
  >>> .bk-form-item + .bk-form-item {
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
