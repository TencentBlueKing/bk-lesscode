<template>
    <form-section :title="$t('基础配置')">
        <bk-form
            ref="basicFormRef"
            form-type="vertical"
            :rules="rules"
            :model="nodeData.config">
            <node-name :value="nodeData.config.name" @change="handleChange('name', $event)"  />
            <node-processor :processor="nodeData.config.processor" @change="handleChange('processor', $event)" />
            <div class="select-action-table">
                <bk-form-item :label="$t('form_节点动作')" property="action" :required="true">
                    <bk-select :value="nodeData.config.action" :clearable="false" @selected="handleSelectAction">
                        <bk-option
                            v-for="item in ACTIONS"
                            :key="item.id"
                            :id="item.id"
                            :name="item.name" />
                    </bk-select>
                </bk-form-item>
                <bk-form-item :label="$t('form_目标表单')" property="tableName" class="target-table" :required="true">
                    <bk-select
                        :value="nodeData.config.tableName"
                        :clearable="false"
                        :loading="formListLoading"
                        @selected="handleSelectTable">
                        <bk-option
                            v-for="item in formList"
                            :key="item.tableName"
                            :id="item.tableName"
                            :name="`${item.formName}(${item.tableName})`" />
                    </bk-select>
                    <!-- 如果数据处理节点由人工节点生成，则提供同步按钮 -->
                    <!-- <i
                        v-if="normalNodeData.id"
                        v-bk-tooltips="{ content: $t('将设置【{0}（{1}）】节点的表单为目标表单，并自动生成插入动作及字段映射规则', [normalNodeData.name, normalNodeData.id]), maxWidth: 400 }"
                        class="bk-drag-icon bk-drag-refill sync-btn"
                        @click="handleSyncNormalNodeFields">
                    </i> -->
                </bk-form-item>
            </div>
            <bk-form-item :label="$t('form_字段映射规则')">
                <processing-rule-edit
                    v-if="nodeData.config.action && nodeData.config.tableName"
                    :node-data="nodeData"
                    :form-fields="formFields"
                    :form-list="formList"
                    :form-list-loading="formListLoading"
                    :field-var-list="fieldVarList"
                    @change="handleProcessingRuleChange" />
                <bk-exception
                    v-else
                    class="no-data"
                    type="empty"
                    scene="part">
                    {{ $t('请选择节点动作和目标表单') }}
                </bk-exception>
            </bk-form-item>
        </bk-form>
    </form-section>
</template>
<script>
    import { defineComponent, ref, onMounted } from '@vue/composition-api'
    import { useStore } from '@/store'
    import { useRoute } from '@/router'
    import FormSection from '../components/form-section.vue'
    import NodeName from '../components/node-name.vue'
    import NodeProcessor from '../components/node-processor.vue'
    import ProcessingRuleEdit from './processing-rule-edit.vue'

    export default defineComponent({
        name: 'DataProcessingNodeConfig',
        components: {
            FormSection,
            NodeName,
            NodeProcessor,
            ProcessingRuleEdit
        },
        props: {
            detail: {
                type: Object,
                default: () => ({})
            },
            nodes: {
                type: Array,
                default: () => []
            },
            edges: {
                type: Array,
                default: () => []
            }
        },
        setup(props, { emit }) {

            const store = useStore()
            const route = useRoute()

            const rules = {
                name: [
                    {
                        required: true,
                        message: window.i18n.t('必填项'),
                        trigger: 'blur'
                    }
                ],
                action: [
                    {
                        required: true,
                        message: window.i18n.t('必填项'),
                        trigger: 'blur'
                    }
                ],
                tableName: [
                    {
                        required: true,
                        message: window.i18n.t('必填项'),
                        trigger: 'blur'
                    }
                ]
            }

            const ACTIONS = [
                { id: 'ADD', name: '插入' },
                { id: 'EDIT', name: '更新' },
                { id: 'DELETE', name: '删除' }
            ]

            const nodeData = ref(JSON.parse(JSON.stringify(props.detail)))
            const basicFormRef = ref(null)
            const formList = ref([])
            const formListLoading = ref(false)
            const formFields = ref([])
            const fieldVarList = ref([]) // 字段变量

            onMounted(async () => {
                await getFormList()
                if (nodeData.value.config.tableName) {
                    getFormFields(nodeData.value.config.tableName)
                }
                fieldVarList.value = getGroupedVars(nodeData.value.id)
            })

            // 提取流程中在当前节点之前的人工节点表单，按照节点分组
            const getGroupedVars = (nodeId) => {
                const varList = []

                const traverse = (nodeId) => {
                    const sourceIds = props.edges.filter(edge => edge.target.cell === nodeId).map(edge => edge.source.cell)
                    sourceIds.forEach(id => {
                        const node = props.nodes.find(item => item.id === id)
                        if (node.type === 'Manual') {
                            const formId = node.config.formType === 'USE_FORM' ? node.config.relatedId : node.config.formId
                            const formDetail = formList.value.find(item => item.id === formId)
                            if (formDetail?.content) {
                                const fields = JSON.parse(formDetail.content || '[]').map(item => {
                                    const { key, name } = item.configure
                                    return { type: item.type, id: `\${callback_data_${node.id}['${key}']}`, name: `${name}(${key})` }
                                })
                                varList.push({ id: node.id, name: node.config.name, fields })
                            }
                        }
                        traverse(id)
                    })
                }

                traverse(nodeId)

                return varList
            }

            // 获取表单列表
            const getFormList = async () => {
                formListLoading.value = true
                const params = {
                    projectId: route.params.projectId,
                    versionId: store.getters['projectVersion/currentVersionId']
                }
                formList.value = await store.dispatch('nocode/form/getNewFormList', params)
                formListLoading.value = false
            }

            // 获取表单包含的字段列表
            const getFormFields = (tableName) => {
                const form = formList.value.find(item => item.tableName === tableName)
                formFields.value = form ? JSON.parse(form.content) : []
            }

            const handleSelectAction = (val) => {
                nodeData.value.config.action = val
                nodeData.value.config.conditions = {
                    connector: 'and',
                    expressions: []
                }
                nodeData.value.config.mapping = []
                emit('change', nodeData.value)
            }

            const handleSelectTable = (val) => {
                nodeData.value.config.tableName = val
                nodeData.value.config.conditions = {
                    connector: 'and',
                    expressions: []
                }
                nodeData.value.config.mapping = []
                getFormFields(val)
                emit('change', nodeData.value)
            }

            const handleChange = (key, val) => {
                nodeData.value.config[key] = val
                emit('change', nodeData.value)
            }

            const handleProcessingRuleChange = (conditions, mapping) => {
                nodeData.value.config.conditions = conditions
                nodeData.value.config.mapping = mapping
                emit('change', nodeData.value)
            }

            const validate = () => {
                return basicFormRef.value.validate()
            }

            return {
                rules,
                ACTIONS,
                nodeData,
                basicFormRef,
                formList,
                formListLoading,
                formFields,
                fieldVarList,
                handleSelectAction,
                handleSelectTable,
                handleChange,
                handleProcessingRuleChange,
                validate
            }
        }
    })
</script>
<style lang="postcss" scoped>
    .bk-form {
        width: 656px;
        .select-action-table {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 15px;
            .bk-form-item {
                width: 50%;
                margin-top: 0;
                &:first-child {
                    margin-right: 16px;
                }
            }
        }
    }
</style>
