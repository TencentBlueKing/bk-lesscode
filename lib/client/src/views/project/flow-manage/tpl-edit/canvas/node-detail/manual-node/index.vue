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
                        :tpl-id="tplId"
                        :node-id="nodeData.id"
                        :nodes="nodes"
                        :config="nodeData.config"
                        :container-pages="containerPages"
                        :is-first-and-manual-node="isFirstAndManualNode"
                        @edit="handleOpenNodeFieldsEdit"
                        @select="handleSelectBinding"
                        @delete="handleDeleteBinding"
                        @updateContainerPages="handleUpdateContainerPages" />
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
            @backToFlow="emit('close')"
            @close="nodeFieldsCanvasData.show = false"
            @saved="handleFieldsCanvasFormSaved" />
    </div>
</template>
<script>
    import { inject, defineComponent, ref, onMounted, onUnmounted, getCurrentInstance } from 'vue'
    import { difference, cloneDeep } from 'lodash'
    import FormSection from '../components/form-section.vue'
    import NodeName from '../components/node-name.vue'
    import NodeProcessor from '../components/node-processor.vue'
    import FormBindingConfig from './form-binding-config/index.vue'
    import NodeFieldsCanvas from './node-fields-canvas/index.vue'
    import { useStore } from '@/store'
    import { useRoute } from '@/router'
    import { uuid } from '@/common/util'
    import { createNode } from '@/element-materials/core/static/create-node'

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
            },
            isFirstAndManualNode: Boolean
        },
        setup (props, { emit }) {
            const { register, unregister } = inject('saveContext')

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
            const relatedPages = ref({ // 关联页面原数据
                formContainer: [],
                dataManageContainer: []
            })
            const relatedPagesLoading = ref(false)
            const containerPages = ref({ // 关联页面编辑数据
                formContainer: [],
                dataManageContainer: []
            })
            const nodeFieldsCanvasData = ref({
                show: false,
                data: {
                    type: '',
                    id: 0,
                    relatedId: 0
                }
            })

            onMounted(() => {
                getRelatedPages()
                register(saveRelatedPages)
            })
            onUnmounted(() => {
                unregister(saveRelatedPages)
            })

            const handleOpenNodeFieldsEdit = ({ formType, formId, relatedId }) => {
                nodeFieldsCanvasData.value = {
                    show: true,
                    data: { formType, formId, relatedId }
                }
            }

            // 引用或复用表单
            const handleSelectBinding = async ({ formType, id, fields, tableName }) => {
                const formName = nodeData.value.config.name || window.i18n.t('人工节点')
                if (formType === 'CITE_FORM') {
                    const res = await store.dispatch('form/createForm', {
                        projectId: route.params.projectId,
                        content: fields,
                        componentId: `flow-tpl-${props.tplId}-${nodeData.value.id}`,
                        formName,
                        tableName: tableName || `manual_node_${uuid(8, 16, true)}`
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
                    subTitle: window.i18n.t('已生成的关联表单页容器组件将被移除，关联数据管理页容器组件、关联数据表及表数据将继续保留'),
                    theme: 'danger',
                    confirmLoading: true,
                    confirmFn: async () => {
                        nodeData.value.config.formType = ''
                        nodeData.value.config.formId = 0
                        nodeData.value.config.relatedId = 0
                        nodeData.value.isDraft = true
                        updateNodeBinding(true)
                        // 移除关联页面对应的表单容器
                        containerPages.value.formContainer = []
                        saveRelatedPages()
                        return true
                    }
                })
            }

             // 获取关联页面列表
             const getRelatedPages = async() => {
                relatedPagesLoading.value = true
                const res = await store.dispatch('flow/tpl/getRelatedPages', {
                    tplId: props.tplId,
                    params: {
                        versionId: store.getters['projectVersion/currentVersionId'],
                        containers: ['formContainer', 'dataManageContainer'],
                        nodeId: nodeData.value.id
                    }
                })

                relatedPages.value = {
                    formContainer: (res.formContainer || []).map(item => item.id),
                    dataManageContainer: (res.dataManageContainer || []).map(item => item.id)
                }
                containerPages.value = cloneDeep(relatedPages.value)
                relatedPagesLoading.value = false
            }

            const handleUpdateContainerPages = ({ pages, refresh }) => {
                containerPages.value = pages
                if (refresh) {
                    relatedPages.value = cloneDeep(containerPages.value)
                }
            }

            const getPagesDiffConfig = async () => {
                const diff = {
                    added: {},
                    removed: {
                        formContainer: [],
                        dataManageContainer: []
                    }
                }
                const { formType, formId, relatedId } = nodeData.value.config
                const nodeFormId = formType === 'USE_FORM' ? relatedId : formId 

                const formList = await store.dispatch('nocode/form/getNewFormList', {
                    projectId: route.params.projectId,
                    versionId: store.getters['projectVersion/currentVersionId'],
                })
                const formDetail = formList.find(form => form.id === formId)
                for (let containerType in containerPages.value) {
                    const addedIds = difference(containerPages.value[containerType], relatedPages.value[containerType])
                    const removedIds = difference(relatedPages.value[containerType], containerPages.value[containerType])
                    if (addedIds.length > 0) {

                        addedIds.forEach(pageId => {
                            const type = containerType === 'formContainer' ? 'widget-form-container' : 'widget-data-manage-container'
                            const config = createNode(type, store.getters['project/projectDetail'].framework).toJSON()

                            if (containerType === 'formContainer') {
                                const dataSource = {
                                    action: 'executeFlow',
                                    flowTplId: props.tplId,
                                    nodeId: nodeData.value.id,
                                    type: "USE_FORM",
                                    relatedId: nodeFormId,
                                    id: '',
                                    tableName: ''
                                }
                                const fields = JSON.parse(formDetail.content || '[]')
                                config.renderProps.dataSource.code = dataSource
                                config.renderProps.dataSource.renderValue = dataSource
                                config.renderProps.fields.code = fields
                                config.renderProps.fields.renderValue = fields
                            } else {
                                config.renderProps.flowTplId.code = props.tplId
                                config.renderProps.flowTplId.renderValue = props.tplId
                                config.renderProps.nodeId.code = nodeData.value.id
                                config.renderProps.nodeId.renderValue = nodeData.value.id
                                config.renderProps.formId.code = nodeFormId
                                config.renderProps.formId.renderValue = nodeFormId
                            }

                            if (!diff.added[pageId]) {
                                diff.added[pageId] = [config]
                            } else {
                                diff.added[pageId].push(config)
                            }
                        })
                    }
                    if (removedIds.length > 0) {
                        diff.removed[containerType] = removedIds.map(id => ({
                            pageId: id,
                            nodeId: nodeData.value.id
                        }))
                    }
                }
                return diff
            }

            const saveRelatedPages = async() => {
                const pagesDiffConfig = await getPagesDiffConfig()

                await store.dispatch('flow/tpl/updateRelatedPages', {
                    tplId: props.tplId,
                    params: {
                        versionId: store.getters['projectVersion/currentVersionId'],
                        added: pagesDiffConfig.added,
                        removed: pagesDiffConfig.removed
                    }
                })
                relatedPages.value = cloneDeep(containerPages.value)
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
                emit('change', nodeData.value)
            }

            const updateNodeBinding = async (isDelete = false) => {
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
                containerPages,
                relatedPagesLoading,
                nodeFieldsCanvasData,
                handleSelectBinding,
                handleDeleteBinding,
                handleOpenNodeFieldsEdit,
                handleUpdateContainerPages,
                handleFieldsCanvasFormSaved,
                handleChange,
                validate,
                emit
            }
        }
    })
</script>
<style lang="postcss" scoped>
    .bk-form-item {
        width: 656px;
    }
</style>
