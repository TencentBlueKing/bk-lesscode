<template>
    <div class="node-config-panel" v-bkloading="{ isLoading: nodeDetailLoading }">
        <div class="header-wrapper">
            <bk-button size="small" @click="handleClose">返回</bk-button>
            <h3 class="config-title">{{ typeName }}配置</h3>
        </div>
        <!-- <div class="config-form-wrapper">
            <div class="form-content-area">
                <bk-form ref="configForm" form-type="vertical" :rules="rules" :model="{ name }">
                    <bk-form-item label="节点名称" property="name" error-display-type="normal" :required="true">
                        <bk-input v-model="name" :disabled="!editable"></bk-input>
                    </bk-form-item>
                    <bk-form-item v-if="nodeDetail.type !== 'DATA-PROC' && funcType !== 'DETAIL'" label="处理人" :required="true">
                        <processors
                            ref="processorForm"
                            v-model="processorData"
                            :editable="editable"
                            :app-id="appId"
                            :flow-id="flowId"
                            :node-id="nodeId"
                            :exclude-list="nodeDetail.type === 'APPROVAL' ? ['OPEN'] : []"
                            :disable-type="nodeDetail.type === 'SIGN'">
                        </processors>
                    </bk-form-item>
                    <template v-if="['APPROVAL','SIGN','NORMAL'].includes(nodeDetail.type) && !nodeDetail.is_builtin">
                        <bk-form-item
                            label="是否支持转派"
                            error-display-type="normal"
                            :required="true"
                        >
                            <bk-radio-group v-model="formData.isTrans">
                                <bk-radio :value="true">
                                    是
                                </bk-radio>
                                <bk-radio :value="false">
                                    否
                                </bk-radio>
                            </bk-radio-group>
                        </bk-form-item>
                        <bk-form-item
                            label="转派范围"
                            error-display-type="normal"
                            :required="true"
                            v-if="formData.isTrans"
                            :desc-type="isTransTypeVariable ? 'icon' : ''"
                            :desc-icon="isTransTypeVariable ? 'icon-info-circle' : ''"
                            :desc="isTransTypeVariable ? '只能引用字段类型为”人员选择类“且属性为“必填“的字段' : ''">
                            <processors
                                ref="processorForm"
                                v-model="formData.processorData"
                                :editable="editable"
                                :app-id="appId"
                                :flow-id="flowId"
                                :node-id="nodeId"
                                :exclude-list="nodeDetail.type === 'APPROVAL' ? ['OPEN'] : []">
                            </processors>
                        </bk-form-item>
                    </template>
                </bk-form>
            </div>
        </div> -->
        <div class="config-content-wrapper">
            <component
                ref="nodeForm"
                :is="formCompDict[nodeDetail.type]"
                :config="nodeDetail"
                @updateFieldIds="nodeDetail.fields = $event"
                @change="handleNodeFormChange">
            </component>
            <div class="extend-setting-btn">
                <span class="trigger-area" @click="extendSettingOpen = !extendSettingOpen">
                    高级配置
                    <i :class="['bk-icon', 'icon-angle-double-down', { opened: extendSettingOpen }]"></i>
                </span>
            </div>
            <form-section v-show="extendSettingOpen" title="触发器" desc="（可以定义当满足条件时，要执行的特定动作）">
                <div>触发器内容</div>
            </form-section>
            <div class="actions-wrapper">
                <bk-button
                    theme="primary"
                    :loading="savePending"
                    :disabled="nodeDetailLoading"
                    @click="handleSaveClick">
                    保存
                </bk-button>
                <bk-button @click="handleClose" style="margin-left: 8px">取消</bk-button>
            </div>
        </div>
    </div>
</template>
<script>
    import cloneDeep from 'lodash.clonedeep'
    import { NODE_TYPE_LIST } from '../constants/nodes.js'
    import { messageError } from '@/common/bkmagic'
    import NormalNode from './nodes/normalNode.vue'
    import DataProcessNode from './nodes/dataProcessNode.vue'
    import ApiNode from './nodes/apiNode.vue'
    import ApprovalNode from './nodes/approvalNode.vue'
    import FormSection from './components/form-section.vue'

    export default {
        name: 'NodeConfig',
        components: {
            NormalNode,
            DataProcessNode,
            ApiNode,
            ApprovalNode,
            FormSection
        },
        props: {
            nodeId: Number,
            flowConfig: {
                type: Object,
                default: () => ({})
            },
            serviceData: {
                type: Object,
                default: () => ({})
            },
            editable: {
                type: Boolean,
                default: true
            }
        },
        data () {
            return {
                name: '',
                formData: {
                    isTrans: false,
                    transMethod: 2,
                    processorData: {
                        type: '',
                        processors: ''
                    }
                },
                transList: [{ id: 2, name: '指定范围转派' }],
                nodeDetail: {},
                nodeDetailLoading: true,
                processorData: {
                    type: '',
                    processors: ''
                },
                savePending: false,
                formCompDict: {
                    NORMAL: 'NormalNode',
                    WEBHOOK: 'DataProcessNode',
                    TASK: 'ApiNode',
                    SIGN: 'SignNode',
                    APPROVAL: 'ApprovalNode'
                },
                rules: {
                    name: [
                        {
                            required: true,
                            message: '节点名称为必填项',
                            trigger: 'blur'
                        }
                    ]
                },
                extendSettingOpen: false
            }
        },
        computed: {
            typeName () {
                if (this.nodeDetail.type) {
                    return NODE_TYPE_LIST.find(item => item.type === this.nodeDetail.type).name
                }
                return ''
            },
            isTransTypeVariable () {
                return this.formData.processorData.type === 'VARIABLE'
            }
        },
        created () {
            this.getNodeDetail()
        },
        methods: {
            async getNodeDetail () {
                try {
                    this.nodeDetailLoading = true
                    this.nodeDetail = await this.$store.dispatch('nocode/flow/getNodeConfig', this.nodeId)
                    const {
                        name, type, processors_type: processorsType, processors, can_deliver: canDeliver,
                        delivers_type: deliversType, delivers
                    } = this.nodeDetail
                    this.name = name
                    this.processorData = {
                        type: type === 'SIGN' ? 'PERSON' : processorsType,
                        processors: cloneDeep(processors)
                    }
                    if (['APPROVAL', 'SIGN', 'NORMAL'].includes(type)) {
                        this.formData.isTrans = canDeliver
                        if (canDeliver) {
                            this.formData.processorData.type = deliversType
                            this.formData.processorData.processors = delivers
                        }
                    }
                } catch (e) {
                    messageError(e.message || e)
                } finally {
                    this.nodeDetailLoading = false
                }
            },
            handleNodeFormChange (type, value) {
                console.log(type, value)
            },
            handleSaveClick () {
                this.$refs.configForm
                    .validate()
                    .then(async () => {
                        // let processorValid = true
                        // if (this.$refs.processorForm) {
                        //     processorValid = this.$refs.processorForm.validate()
                        // }
                        // if (!processorValid) {
                        //     return
                        // }

                        // const configValidate = this.$refs.nodeForm.validate
                        // if (configValidate) {
                        //     // 节点表单校验
                        //     const result = await configValidate()
                        //     if (result) {
                        //         this.saveNodeConfig()
                        //     }
                        // } else {
                        //     this.saveNodeConfig()
                        // }
                    })
                    .catch(e => console.error(e))
            },
            async saveNodeConfig () {
                try {
                    this.savePending = true
                    const { type: processorsType, processors } = this.processorData
                    const { type, id, fields } = this.nodeDetail
                    const params = {
                        id,
                        type,
                        workflow: this.serviceData.workflow_id,
                        name: this.name,
                        is_draft: false,
                        is_terminable: false,
                        delivers_type: 'EMPTY',
                        distribute_type: 'PROCESS',
                        processors_type: processorsType,
                        processors,
                        fields
                    }
                    if (['APPROVAL', 'SIGN', 'NORMAL'].includes(this.nodeDetail.type)) {
                        const { isTrans } = this.formData
                        const { type: processorsType, processors } = this.formData.processorData
                        params.can_deliver = isTrans
                        if (isTrans) {
                            params.delivers = processors
                            params.delivers_type = processorsType
                        }
                    }
                    if (type === 'WEBHOOK') {
                        params.extras = {
                            dataManager: this.$refs.nodeForm.getData()
                        }
                    } else if (type === 'APPROVAL') {
                        params.is_multi = this.$refs.nodeForm.getData()
                    } else if (type === 'SIGN') {
                        const data = this.$refs.nodeForm.getData()
                        const { isSequential, finishCondition } = data
                        params.is_multi = true
                        params.is_sequential = isSequential
                        params.finish_condition = finishCondition
                    } else if (type === 'TASK') {
                        const data = this.$refs.nodeForm.getData()
                        const { api_info: apiInfo, variables } = data
                        params.api_info = apiInfo
                        params.variables = variables
                    }
                    await this.$store.dispatch('setting/updateFlowNode', params)
                    this.$bkMessage({
                        theme: 'success',
                        message: '保存成功'
                    })
                    this.$emit('save')
                } catch (e) {
                    messageError(e.message || e)
                } finally {
                    this.savePending = false
                }
            },
            handleClose () {
                this.$bkInfo({
                    title: '此操作会导致您的编辑没有保存，确认吗？',
                    type: 'warning',
                    width: 500,
                    confirmFn: () => {
                        this.$emit('close')
                    }
                })
            }
        }
    }
</script>
<style lang="postcss" scoped>
@import '@/css/mixins/scroller.css';

.node-config-panel {
  height: calc(100% - 52px);
  background: #fafbfd;
}
.header-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  padding: 0 48px;
  height: 48px;
  background: #eaebf0;
  .config-title {
    margin-left: 16px;
    font-size: 14px;
    font-weight: bold;
    color: #313238;
  }
}
.config-content-wrapper {
  padding: 24px;
  .extend-setting-btn {
      margin: 16px 0 24px;
      padding: 0 130px;
  }
  .trigger-area {
      display: inline-flex;
      align-items: center;
      font-size: 12px;
      color: #3a84ff;
      cursor: pointer;
      i {
          font-size: 18px;
          transition: transform 0.2s ease;
          &.opened {
              transform: rotate(-180deg);
          }
      }
  }
}
.actions-wrapper {
    margin-top: 24px;
    padding: 0 130px;
    .bk-button {
        min-width: 88px;
    }
}
</style>
