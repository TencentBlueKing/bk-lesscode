<template>
    <div class="normal-node-nodeDetail">
        <form-section title="基础配置">
            <bk-form
                ref="basicForm"
                style="width: 656px"
                form-type="vertical"
                :rules="rules"
                :model="nodeData">
                <bk-form-item label="节点名称" property="name" :required="true">
                    <bk-input :value="nodeData.name" @change="handleNameChange"></bk-input>
                </bk-form-item>
                <bk-form-item label="处理人" :required="true">
                    <processors
                        ref="processorForm"
                        :value="processorData"
                        :workflow-id="nodeData.workflow"
                        :node-id="nodeData.id"
                        :exclude-type="excludeRoleType"
                        @change="handleProcessorChange">
                    </processors>
                </bk-form-item>
            </bk-form>
        </form-section>
        <form-section title="表单配置" style="margin-top: 16px;">
            <node-form-setting
                ref="formSetting"
                :flow-config="flowConfig"
                :form-content-loading="formContentLoading"
                @close="$emit('close')">
            </node-form-setting>
        </form-section>
    </div>
</template>
<script>
    import { mapState, mapGetters } from 'vuex'
    import pinyin from 'pinyin'
    import { messageError } from '@/common/bkmagic'
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
            flowConfig: {
                type: Object,
                default: () => ({})
            }
        },
        data () {
            return {
                formContentLoading: false,
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
                'processorData'
            ]),
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
            if (typeof this.nodeData.extras.formConfig?.id === 'number') {
                // 已生成表单配置
                this.getFormDetail()
                const { id, type } = this.nodeData.extras.formConfig
                this.$store.commit('nocode/nodeConfig/setFormConfig', { id, type })
            } else {
                // 新建空白表单
                const cnName = pinyin(this.nodeData.name, {
                    style: pinyin.STYLE_NORMAL,
                    heteronym: false
                }).join('_')

                const formName = `${this.flowConfig.flowName}_提单页`
                const code = `${cnName}_${this.nodeData.id}`
                this.$store.commit('nocode/nodeConfig/setFormConfig', { code, formName })
            }
        },
        methods: {
            // 加载form配置详情
            async getFormDetail () {
                try {
                    this.formContentLoading = true
                    const { id } = this.nodeData.extras.formConfig
                    const data = await this.$store.dispatch('nocode/form/formDetail', { formId: id })
                    const content = JSON.parse(data.content)
                    const code = data.tableName
                    const formName = data.formName || '默认添加的提单页'
                    this.$store.commit('nocode/nodeConfig/setFormConfig', { content, code, formName })
                    this.formContentLoading = false
                } catch (e) {
                    messageError(e.message || e)
                }
            },
            handleNameChange (val) {
                this.$store.commit('nocode/nodeConfig/setNodeData', { ...this.nodeData, name: val })
            },
            handleProcessorChange (val) {
                this.$store.commit('nocode/nodeConfig/updateProcessor', val)
            },
            validate () {
                return this.$refs.basicForm.validate().then(() => {
                    if (this.$refs.processorForm.validate()) {
                        return this.$refs.formSetting.validate()
                    } else {
                        return false
                    }
                }).catch(() => {
                    return false
                })
            }
        }
    }
</script>
