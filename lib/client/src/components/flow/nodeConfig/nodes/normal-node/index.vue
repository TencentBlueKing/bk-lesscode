<template>
    <div class="normal-node-nodeDetail">
        <form-section :title="$t('基础配置')">
            <bk-form
                ref="basicForm"
                style="width: 656px"
                form-type="vertical"
                :rules="rules"
                :model="nodeData">
                <bk-form-item :label="$t('form_节点名称')" property="name" :required="true">
                    <bk-input :value="nodeData.name" @change="handleNameChange"></bk-input>
                </bk-form-item>
                <bk-form-item :label="$t('处理人')" :required="true">
                    <processors
                        ref="processorsForm"
                        :value="processorData"
                        :workflow-id="nodeData.workflow"
                        :node-id="nodeData.id"
                        :exclude-type="excludeRoleType"
                        @change="handleProcessorChange">
                    </processors>
                </bk-form-item>
            </bk-form>
        </form-section>
        <form-section :title="$t('表单配置')" style="margin-top: 16px;" v-bkloading="{ isLoading: formContentLoading }">
            <node-form-setting
                ref="formSetting"
                :form-content-loading="formContentLoading"
                :workflow-id="workflowId"
                @close="$emit('close')">
            </node-form-setting>
        </form-section>
    </div>
</template>
<script>
    import { mapState, mapGetters } from 'vuex'
    import { messageError } from '@/common/bkmagic'
    
    import FormSection from '../../components/form-section.vue'
    import Processors from '../../components/processors.vue'
    import NodeFormSetting from './node-form-setting/index.vue'

    export default {
        name: 'NormalNode',
        components: {
            FormSection,
            Processors,
            NodeFormSetting
        },
        props: {
            workflowId: Number
        },
        data () {
            return {
                formContentLoading: false,
                rules: {
                    name: [
                        {
                            required: true,
                            message: this.$t('节点名称为必填项'),
                            trigger: 'blur'
                        }
                    ]
                }
            }
        },
        computed: {
            ...mapGetters('nocode/flow/', ['flowNodeForms']),
            ...mapGetters('nocode/nodeConfig', ['processorData']),
            ...mapState('nocode/flow', ['flowConfig']),
            ...mapState('nocode/nodeConfig', [
                'nodeData',
                'formConfig'
            ]),
            excludeRoleType () {
                const typeList = ['CMDB', 'GENERAL', 'EMPTY', 'BY_ASSIGNOR', 'IAM', 'API', 'ORGANIZATION']
                if (!this.nodeData.is_first_state) {
                    typeList.push('OPEN')
                }
                return typeList
            }
        },
        created () {
            if (this.nodeData.id in this.flowNodeForms) {
                // 已生成表单配置
                // @todo 如果流程服务保存失败，这里的type会有问题
                const type = this.nodeData.extras.formConfig.type || 'NEW_FORM'
                const id = this.flowNodeForms[this.nodeData.id]
                this.$store.commit('nocode/nodeConfig/setFormConfig', { id, type })
                this.getFormDetail()
            }
            // webhook节点处理人不能为不限，但是创建节点时默认返回的不限，需要在编辑时清除
            if (this.excludeRoleType.includes(this.processorData.type)) {
                this.handleProcessorChange({ type: '', processors: '' })
            }
        },
        methods: {
            // 加载form配置详情
            async getFormDetail () {
                try {
                    this.formContentLoading = true
                    const id = this.flowNodeForms[this.nodeData.id]
                    const data = await this.$store.dispatch('nocode/form/formDetail', { formId: id })
                    const content = JSON.parse(data.content).map(item => {
                        return { ...item, disabled: true }
                    })
                    const { tableName: code, formName } = data

                    this.$store.commit('nocode/nodeConfig/setFormConfig', { content, code, formName })
                    this.$store.commit('nocode/nodeConfig/setInitialFieldIds', content)
                    this.formContentLoading = false
                } catch (e) {
                    messageError(e.message || e)
                }
            },
            handleNameChange (val) {
                this.$store.commit('nocode/nodeConfig/setNodeName', val)
            },
            handleProcessorChange (val) {
                this.$store.commit('nocode/nodeConfig/updateProcessor', val)
            },
            validate () {
                return Promise.all([
                    this.$refs.basicForm.validate(),
                    this.$refs.processorsForm.validate(),
                    this.$refs.formSetting.validate()
                ]).then((result) => {
                    return result.every(item => item === true)
                }).catch((e) => {
                    return false
                })
            }
        }
    }
</script>
