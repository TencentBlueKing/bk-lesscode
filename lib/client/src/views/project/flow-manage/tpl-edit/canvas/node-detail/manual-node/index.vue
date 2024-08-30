<template>
    <div class="manual-node-config">
        <bk-form
            ref="basicFormRef"
            form-type="vertical"
            :rules="rules"
            :model="nodeData.config">
            <form-section :title="$t('基础配置')">
                <node-name :value="nodeData.config.name" @change="handleChange('name', $event)" />
                <node-processor :processor="nodeData.config.processor" @change="handleChange('processor', $event)" />
            </form-section>
            <form-section :title="$t('表单配置')">
                <bk-form-item>
                    <form-binding-config
                        :nodes="nodes"
                        :config="nodeData.config"
                        @edit="handleOpenNodeFieldsEdit"
                        @select="handleSelectBinding"
                        @delete="handleDeleteBinding" />
                </bk-form-item>
            </form-section>
        </bk-form>
        <node-fields-canvas
            v-if="nodeFieldsCanvasData.show"
            :tpl-id="tplId"
            :tpl-name="tplName"
            :node-id="nodeData.id"
            :node-name="nodeData.config.name"
            :form-type="nodeFieldsCanvasData.data.formType"
            :form-id="nodeFieldsCanvasData.data.formId"
            :related-id="nodeFieldsCanvasData.data.relatedId"
            @close="nodeFieldsCanvasData.show = false"
            @saved="handleFieldsCanvasFormSaved" />
    </div>
</template>
<script>
    import { defineComponent, ref, getCurrentInstance } from '@vue/composition-api'
    import FormSection from '../components/form-section.vue'
    import NodeName from '../components/node-name.vue'
    import NodeProcessor from '../components/node-processor.vue'
    import FormBindingConfig from './form-binding-config/index.vue'
    import NodeFieldsCanvas from './node-fields-canvas/index.vue'
    import { useStore } from '@/store'
    import { useRoute } from '@/router'
    import { uuid } from '@/common/util'

    export default defineComponent({
        name: 'ManualNodeConfig',
        components: {
            FormSection,
            NodeName,
            NodeProcessor,
            FormBindingConfig,
            NodeFieldsCanvas
        },
        props: {
            tplId: Number,
            tplName: String,
            nodes: {
                type: Array,
                default: () => []
            },
            detail: {
                type: Object,
                default: () => ({})
            }
        },
        setup(props, { emit }) {
            const store = useStore()
            const route = useRoute()
            const instance = getCurrentInstance()

            const rules = {
                name: [
                    {
                        required: true,
                        message: window.i18n.t('必填项'),
                        trigger: 'blur'
                    }
                ]
            }

            const nodeData = ref(JSON.parse(JSON.stringify(props.detail)))
            const basicFormRef = ref(null)
            const nodeFieldsCanvasData = ref({
                show: false,
                data: {
                    type: '',
                    id: 0,
                    relatedId: 0
                }
            })

            const handleOpenNodeFieldsEdit = ({ formType, formId, relatedId }) => {
                nodeFieldsCanvasData.value = {
                    show: true,
                    data: { formType, formId, relatedId }
                }
            }

            // 引用或复用表单
            const handleSelectBinding = async({ formType, id, fields }) => {
                const formName = nodeData.value.config.name || window.i18n.t('人工节点')
                const tableName = `manual_node_${props.tplId}_${nodeData.value.id}_${uuid(4)}`
                if (formType === 'CITE_FORM') {
                    const res = await store.dispatch('form/createForm', {
                        projectId: route.params.projectId,
                        content: fields,
                        componentId: `flow-tpl-${props.tplId}-${nodeData.value.id}`,
                        formName,
                        tableName,
                    })
                    nodeData.value.config.formId = res.id
                } else {
                    nodeData.value.config.formId = 0
                }
                nodeData.value.config.formType = formType
                nodeData.value.config.relatedId = id
                nodeData.value.isDraft = nodeData.value.config.name.length === 0
                updateNodeBinding()
            }

            // 删除表单绑定
            const handleDeleteBinding = () => {
                instance.proxy.$bkInfo({
                    width: 600,
                    extCls: 'delete-page-dialog',
                    title: window.i18n.t('确认删除表单配置？'),
                    subTitle: window.i18n.t('已生成的关联数据表及表数据将继续保留'),
                    theme: 'danger',
                    confirmLoading: true,
                    confirmFn: async() => {
                        nodeData.value.config.formType = ''
                        nodeData.value.config.formId = 0
                        nodeData.value.config.relatedId = 0
                        nodeData.value.isDraft = true
                        updateNodeBinding(true)
                        return true
                    }
                })
            }

            // 表单画布编辑后保存
            const handleFieldsCanvasFormSaved = ({ formId, formType }) => {
                nodeFieldsCanvasData.value.data.formId = formId
                nodeData.value.config.formId = formId
                nodeData.value.config.formType = formType
                nodeData.value.isDraft = nodeData.value.config.name.length === 0
                updateNodeBinding()
            }

            const handleChange = (key, val) => {
                nodeData.value.config[key] = val
                console.log('nodeData: ', nodeData.value)
                emit('change', nodeData.value)
            }

            const updateNodeBinding = async(isDelete = false) => {
                await store.dispatch('flow/tpl/updateNode', { id: props.tplId, data: nodeData.value })
                emit('update', nodeData.value)
                instance.proxy.$bkMessage({
                    theme: 'success',
                    message: isDelete ? window.i18n.t('保存成功') : window.i18n.t('表单保存成功，表单配置关联数据表变更成功')
                })
            }

            const validate = () => {
                return new Promise((resolve, reject) => {
                    basicFormRef.value.validate().then(() => {
                        resolve()
                    }).catch((err) => {
                        reject(err)
                    })
                })
            }

            return {
                rules,
                nodeData,
                basicFormRef,
                nodeFieldsCanvasData,
                handleSelectBinding,
                handleDeleteBinding,
                handleOpenNodeFieldsEdit,
                handleFieldsCanvasFormSaved,
                handleChange,
                validate
            }
        }
    })
</script>
<style lang="postcss" scoped>
    .bk-form-item {
        width: 656px;
    }
</style>
