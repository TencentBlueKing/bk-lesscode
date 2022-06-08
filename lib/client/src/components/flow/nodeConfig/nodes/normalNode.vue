<template>
    <div class="normal-node-nodeDetail">
        <form-section title="基础配置">
            <bk-form form-type="vertical" style="width: 656px">
                <bk-form-item label="节点名称" property="name" :required="true">
                    <bk-input :value="nodeData.name"></bk-input>
                </bk-form-item>
                <bk-form-item label="处理人" :required="true">
                    <processors
                        ref="processorForm"
                        :value="processorData"
                        :workflow-id="nodeData.workflow"
                        :node-id="nodeData.id"
                        :exclude-type="['CMDB', 'GENERAL', 'EMPTY', 'BY_ASSIGNOR', 'IAM', 'API']"
                        @change="handleProcessorChange">
                    </processors>
                </bk-form-item>
            </bk-form>
        </form-section>
        <form-section title="表单配置" style="margin-top: 16px;">
            <node-form-setting :flow-config="flowConfig"></node-form-setting>
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
            ])
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

                const name = this.nodeData.name
                const code = `${cnName}_${this.nodeData.id}`
                this.$store.commit('nocode/nodeConfig/setFormConfig', { code, name })
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
                    const code = 'ti_dan_634'
                    const name = data.name
                    this.$store.commit('nocode/nodeConfig/setFormConfig', { content, code, name })
                    this.formContentLoading = false
                } catch (e) {
                    messageError(e.message || e)
                }
            },
            handleProcessorChange (val) {
                this.$store.commit('nocode/nodeConfig/updateProcessor', val)
            }
        }
    }
</script>
