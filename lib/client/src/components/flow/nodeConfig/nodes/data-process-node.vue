<template>
    <div class="data-process-node">
        <form-section :title="$t('基础配置')">
            <bk-form
                ref="dataForm"
                form-type="vertical"
                class="data-process-node-form"
                :rules="rules"
                :model="dataProcessConfig">
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
                <div class="action-select-area">
                    <bk-form-item :label="$t('form_节点动作')" property="action" :required="true">
                        <bk-select :value="dataProcessConfig.action" :clearable="false" :disabled="!editable" @selected="handleSelectAction">
                            <bk-option v-for="item in actions" :key="item.id" :id="item.id" :name="item.name"></bk-option>
                        </bk-select>
                    </bk-form-item>
                    <bk-form-item :label="$t('form_目标表单')" property="tableName" class="target-form" :required="true">
                        <bk-select
                            :value="dataProcessConfig.tableName"
                            :clearable="false"
                            :loading="formListLoading"
                            :disabled="formListLoading || !editable"
                            @selected="handleSelectForm">
                            <bk-option
                                v-for="item in formList"
                                :key="item.tableName"
                                :id="item.tableName"
                                :name="`${item.formName}(${item.tableName})`">
                            </bk-option>
                        </bk-select>
                        <!-- 如果数据处理节点由人工节点生成，则提供同步按钮 -->
                        <i
                            v-if="normalNodeData.id"
                            v-bk-tooltips="{ content: $t('将设置【{0}（{1}）】节点的表单为目标表单，并自动生成插入动作及字段映射规则', [normalNodeData.name, normalNodeData.id]), maxWidth: 400 }"
                            class="bk-drag-icon bk-drag-refill sync-btn"
                            @click="handleSyncNormalNodeFields">
                        </i>
                    </bk-form-item>
                </div>
                <bk-form-item :label="$t('form_字段映射规则')">
                    <template v-if="dataProcessConfig.action && dataProcessConfig.tableName !== ''">
                        <!-- 满足条件，删除、更新动作存在 -->
                        <div v-if="['DELETE', 'EDIT'].includes(dataProcessConfig.action)" class="rules-section">
                            <div class="logic-radio">
                                <label>{{ dataProcessConfig.action === 'DELETE' ? $t('删除条件') : $t('满足条件') }}</label>
                                <bk-radio-group :value="dataProcessConfig.conditions.connector">
                                    <bk-radio value="and" :disabled="!editable">{{ $t('且') }}</bk-radio>
                                    <bk-radio value="or" :disabled="!editable">{{ $t('或') }}</bk-radio>
                                </bk-radio-group>
                            </div>
                            <div v-if="dataProcessConfig.conditions.expressions.length > 0" class="condition-list">
                                <div class="condition-item" v-for="(expression, index) in dataProcessConfig.conditions.expressions" :key="index">
                                    <bk-select
                                        v-model="expression.key"
                                        :placeholder="$t('目标表字段')"
                                        style="width: 150px; margin-right: 8px"
                                        :clearable="false"
                                        :searchable="true"
                                        :loading="formListLoading"
                                        :disabled="formListLoading || !editable"
                                        @selected="handleSelectField(expression)">
                                        <bk-option
                                            v-for="item in getSelectableField(fieldList, expression.key, 'condition')"
                                            :key="item.key"
                                            :id="item.key"
                                            :name="`${item.name}(${item.key})`">
                                        </bk-option>
                                    </bk-select>
                                    <bk-select
                                        v-model="expression.condition"
                                        :placeholder="$t('逻辑')"
                                        style="width: 100px; margin-right: 8px"
                                        :clearable="false"
                                        :disabled="!editable">
                                        <bk-option
                                            v-for="item in getConditionOptions(expression.key)"
                                            :key="item.id"
                                            :id="item.id"
                                            :name="item.name">
                                        </bk-option>
                                    </bk-select>
                                    <bk-select
                                        v-model="expression.type"
                                        :placeholder="$t('值类型')"
                                        style="width: 100px; margin-right: 8px"
                                        :clearable="false"
                                        :disabled="!editable"
                                        @selected="expression.value = ''">
                                        <bk-option id="const" :name="$t('值')"></bk-option>
                                        <bk-option id="field" :name="$t('引用变量')"></bk-option>
                                        <!-- <bk-option id="department" name="组织架构"></bk-option> -->
                                        <template v-if="
                                            fieldList.length > 0 &&
                                                expression.key &&
                                                fieldList.find(i => i.key === expression.key).type === 'INT'
                                        ">
                                            <bk-option id="increment" :name="$t('增加')"></bk-option>
                                            <bk-option id="reduction" :name="$t('减少')"></bk-option>
                                        </template>
                                        <template v-if="
                                            fieldList.length > 0 &&
                                                expression.key &&
                                                ['STRING', 'TEXT', 'DATE', 'DATETIME', 'SELECT', 'RADIO'].includes(
                                                    fieldList.find(i => i.key === expression.key).type
                                                )
                                        ">
                                            <bk-option id="system" :name="$t('系统变量')"></bk-option>
                                            <bk-option id="approver" :name="$t('审批人')"></bk-option>
                                            <bk-option id="leader" :name="$t('指定上级')"></bk-option>
                                        </template>
                                    </bk-select>
                                    <bk-select
                                        v-if="expression.type === 'field'"
                                        v-model="expression.value"
                                        :placeholder="$t('选择变量')"
                                        style="width: 190px"
                                        :clearable="false"
                                        :searchable="true"
                                        :loading="relationListLoading"
                                        :disabled="relationListLoading || !editable">
                                        <bk-option-group
                                            v-for="(group, gIdx) in getAvailableRelationList(expression)"
                                            :key="gIdx"
                                            :name="group.name"
                                            :show-collapse="true"
                                            :is-collapse="!group.fields.some(fItm => fItm.id === expression.value)">
                                            <bk-option
                                                v-for="item in group.fields"
                                                :key="item.id"
                                                :id="item.id"
                                                :name="`${item.name}(${item.key})`">
                                            </bk-option>
                                        </bk-option-group>
                                    </bk-select>
                                    <bk-select
                                        v-else-if="expression.type === 'system'"
                                        v-model="expression.value"
                                        style="width: 190px"
                                        :clearable="false"
                                        :disabled="!editable">
                                        <bk-option id="date" :name="$t('当前日期')"></bk-option>
                                        <bk-option id="start_time" :name="$t('单据创建时间')"></bk-option>
                                        <bk-option id="creator" :name="$t('提单人')"></bk-option>
                                        <bk-option id="leader" :name="$t('提单人上级')"></bk-option>
                                        <bk-option id="sn" :name="$t('单号')"></bk-option>
                                    </bk-select>
                                    <bk-select
                                        v-else-if="expression.type === 'approver'"
                                        v-model="expression.value"
                                        :placeholder="$t('选择审批节点')"
                                        style="width: 190px"
                                        :clearable="false"
                                        :loading="approvalNodeListLoading"
                                        :disabled="approvalNodeListLoading || !editable">
                                        <bk-option v-for="item in approvalNodeList" :key="item.id" :id="item.id" :name="item.name"></bk-option>
                                    </bk-select>
                                    <bk-select
                                        v-else-if="expression.type === 'leader'"
                                        v-model="expression.value"
                                        :placeholder="$t('选择人员类型变量')"
                                        style="width: 190px"
                                        :clearable="false"
                                        :loading="relationListLoading"
                                        :disabled="relationListLoading || !editable">
                                        <bk-option
                                            v-for="item in memberRelationFields"
                                            :key="item.id"
                                            :id="item.id"
                                            :name="item.name">
                                        </bk-option>
                                    </bk-select>
                                    <field-value
                                        v-else
                                        style="width: 190px; background: #ffffff;"
                                        :field="fieldList.length > 0 && fieldList.find(i => i.key === expression.key)"
                                        :value="expression.value"
                                        :editable="editable"
                                        @change="expression.value = $event">
                                    </field-value>
                                    <div class="operate-btns" style="margin-left: 8px">
                                        <i class="bk-drag-icon bk-drag-add-fill" @click="handleAddExpression(index)"></i>
                                        <i class="bk-drag-icon bk-drag-reduce-fill" @click="handleDeleteExpression(index)"> </i>
                                    </div>
                                </div>
                            </div>
                            <div v-else :class="['data-empty', { disabled: !editable }]" @click="handleAddExpression(-1)">{{ $t('点击添加') }}</div>
                        </div>
                        <!-- 映射规则，增加、更新动作存在 -->
                        <div v-if="['ADD', 'EDIT'].includes(dataProcessConfig.action)" class="rules-section">
                            <label>{{ dataProcessConfig.action === 'ADD' ? $t('插入规则') : $t('则更新') }}</label>
                            <div v-if="dataProcessConfig.mapping.length > 0" class="mapping-list">
                                <div class="condition-item" v-for="(mapping, index) in dataProcessConfig.mapping" :key="index">
                                    <bk-select
                                        v-model="mapping.key"
                                        :placeholder="$t('目标表字段')"
                                        style="width: 180px; margin-right: 8px"
                                        :clearable="false"
                                        :searchable="true"
                                        :loading="formListLoading"
                                        :disabled="formListLoading || !editable"
                                        @selected="handleSelectField(mapping)">
                                        <bk-option
                                            v-for="item in getSelectableField(targetFields, mapping.key, 'mapping')"
                                            :key="item.key"
                                            :id="item.key"
                                            :name="`${item.name}(${item.key})`">
                                        </bk-option>
                                    </bk-select>
                                    <bk-select
                                        v-model="mapping.type"
                                        :placeholder="$t('值类型')"
                                        style="width: 100px; margin-right: 8px"
                                        :clearable="false"
                                        :disabled="!editable"
                                        @selected="(val) => handleSelectMapValue(mapping,val)">
                                        <bk-option id="const" :name="$t('值')"></bk-option>
                                        <bk-option id="field" :name="$t('引用变量')"></bk-option>
                                        <!-- <bk-option id="department" name="组织架构"></bk-option> -->
                                        <template v-if="
                                            targetFields.length > 0 &&
                                                mapping.key &&
                                                targetFields.find(i => i.key === mapping.key).type === 'INT'
                                        ">
                                            <bk-option id="increment" :name="$t('增加')"></bk-option>
                                            <bk-option id="reduction" :name="$t('减少')"></bk-option>
                                            <bk-option v-if="dataProcessConfig.action === 'EDIT'" id="field_increment" name="$t('加指定变量')"></bk-option>
                                            <bk-option v-if="dataProcessConfig.action === 'EDIT'" id="field_reduction" name="$t('减指定变量')"></bk-option>
                                        </template>
                                        <template v-if="
                                            targetFields.length > 0 &&
                                                mapping.key &&
                                                ['STRING', 'TEXT', 'DATE', 'DATETIME', 'SELECT', 'RADIO'].includes(
                                                    fieldList.find(i => i.key === mapping.key).type
                                                )
                                        ">
                                            <bk-option id="system" :name="$t('系统变量')"></bk-option>
                                            <bk-option id="approver" :name="$t('审批人')"></bk-option>
                                            <bk-option id="leader" :name="$t('指定上级')"></bk-option>
                                        </template>
                                    </bk-select>
                                    <bk-select
                                        v-if="['field', 'field_increment', 'field_reduction'].includes(mapping.type)"
                                        v-model="mapping.value"
                                        :placeholder="$t('选择变量')"
                                        style="width: 268px"
                                        :clearable="false"
                                        :searchable="true"
                                        :loading="relationListLoading"
                                        :disabled="relationListLoading || !editable">
                                        <bk-option-group
                                            v-for="(group, gIdx) in getAvailableRelationList(mapping)"
                                            :key="gIdx"
                                            :name="group.name"
                                            :show-collapse="true"
                                            :is-collapse="!group.fields.some(fItm => fItm.id === mapping.value)">
                                            <bk-option
                                                v-for="item in group.fields"
                                                :key="item.id"
                                                :id="item.id"
                                                :name="`${item.name}(${item.key})`">
                                            </bk-option>
                                        </bk-option-group>
                                    </bk-select>
                                    <bk-select
                                        v-else-if="mapping.type === 'system'"
                                        v-model="mapping.value"
                                        style="width: 268px"
                                        :clearable="false"
                                        :disabled="!editable">
                                        <bk-option id="date" :name="$t('当前日期')"></bk-option>
                                        <bk-option id="start_time" :name="$t('单据创建时间')"></bk-option>
                                        <bk-option id="creator" :name="$t('提单人')"></bk-option>
                                        <bk-option id="leader" :name="$t('提单人上级')"></bk-option>
                                        <bk-option id="sn" :name="$t('单号')"></bk-option>
                                    </bk-select>
                                    <bk-select
                                        v-else-if="mapping.type === 'approver'"
                                        v-model="mapping.value"
                                        :placeholder="$t('选择审批节点')"
                                        style="width: 268px"
                                        :clearable="false"
                                        :loading="approvalNodeListLoading"
                                        :disabled="approvalNodeListLoading || !editable">
                                        <bk-option v-for="item in approvalNodeList" :key="item.id" :id="item.id" :name="item.name"></bk-option>
                                    </bk-select>
                                    <bk-select
                                        v-else-if="mapping.type === 'leader'"
                                        v-model="mapping.value"
                                        :placeholder="$t('选择人员类型变量')"
                                        style="width: 268px"
                                        :clearable="false"
                                        :loading="relationListLoading"
                                        :disabled="relationListLoading || !editable">
                                        <bk-option
                                            v-for="item in memberRelationFields"
                                            :key="item.id"
                                            :id="item.id"
                                            :name="item.name">
                                        </bk-option>
                                    </bk-select>
                                    <field-value
                                        v-else-if="targetFields.length > 0"
                                        style="width: 268px; background: #ffffff;"
                                        :field=" targetFields.find(i => i.key === mapping.key)"
                                        :value="mapping.value"
                                        :editable="editable"
                                        @change="mapping.value = $event">
                                    </field-value>
                                    <div class="operate-btns" style="margin-left: 8px">
                                        <i class="bk-drag-icon bk-drag-add-fill" @click="handleAddMapping(index)"></i>
                                        <i class="bk-drag-icon bk-drag-reduce-fill" @click="handleDeleteMapping(index)"> </i>
                                    </div>
                                </div>
                            </div>
                            <div v-else :class="['data-empty', { disabled: !editable }]" @click="handleAddMapping(-1)">{{ $t('点击添加') }}</div>
                        </div>
                    </template>
                    <bk-exception v-else class="no-data" type="empty" scene="part">{{ $t('请选择节点动作和目标表单') }}</bk-exception>
                    <p v-if="errorTips" class="error-tips">{{ $t('请检查字段映射规则') }}</p>
                </bk-form-item>
            </bk-form>
        </form-section>
    </div>
</template>
<script>
    import cloneDeep from 'lodash.clonedeep'
    import { mapState, mapGetters } from 'vuex'
    import FormSection from '../components/form-section.vue'
    import Processors from '../components/processors.vue'
    import { CONDITION_RELATIONS } from '../../constants/nodes.js'
    import { getFieldConditions } from '@/components/render-nocode/common/form.js'
    import FieldValue from '@/components/render-nocode/form/components/form-edit/fieldValue.vue'

    const CAN_NOT_USE_CITE_VAR_TYPE = [
        'TABLE', 'LINK', 'IMAGE', 'DESC', 'DIVIDER', 'FORMULA', 'AUTO-NUMBER'
    ]

    export default {
        name: 'DataProcessNode',
        components: {
            Processors,
            FieldValue,
            FormSection
        },
        props: {
            editable: {
                type: Boolean,
                default: true
            }
        },
        data () {
            return {
                actions: [
                    { id: 'ADD', name: this.$t('插入') },
                    { id: 'EDIT', name: this.$t('更新') },
                    { id: 'DELETE', name: this.$t('删除') }
                ],
                dataProcessConfig: {},
                normalNodeData: { // 自动生成的数据处理节点关联的人工节点相关数据
                    id: '',
                    name: '',
                    tableName: '',
                    fieldList: [],
                    loading: false
                },
                isDepartMent: '',
                conditionRelations: CONDITION_RELATIONS,
                formListLoading: false,
                formList: [],
                fieldList: [],
                approvalNodeListLoading: false,
                approvalNodeList: [],
                relationListLoading: false,
                relationList: [],
                errorTips: false,
                excludeRoleType: ['CMDB', 'GENERAL', 'EMPTY', 'OPEN', 'BY_ASSIGNOR', 'IAM', 'API', 'ORGANIZATION'],
                rules: {
                    name: [
                        {
                            required: true,
                            message: this.$t('节点名称为必填项'),
                            trigger: 'blur'
                        }
                    ],
                    action: [
                        {
                            required: true,
                            message: this.$t('必填项'),
                            trigger: 'blur'
                        }
                    ],
                    tableName: [
                        {
                            required: true,
                            message: this.$t('必填项'),
                            trigger: 'blur'
                        }
                    ]
                }
            }
        },
        computed: {
            ...mapGetters('projectVersion', { versionId: 'currentVersionId' }),
            ...mapState('nocode/nodeConfig', ['nodeData']),
            ...mapGetters('project', ['projectDetail']),
            ...mapGetters('nocode/flow/', ['flowNodeForms', 'flowNodes']),
            ...mapGetters('nocode/nodeConfig', ['processorData']),
            projectId () {
                return this.$route.params.projectId
            },
            targetFields () {
                const tempKey = this.dataProcessConfig?.mapping.filter(item => item.type === 'department').map(item => item.key)
                const targetFiled = this.fieldList.filter(item => !['id', 'ids'].includes(item.key)).map((el) => {
                    if (tempKey.includes(el.key)) {
                        return { ...el, type: 'MEMBER' }
                    }
                    return el
                })
                return targetFiled
            },
            // 值类型为指定上级时，可选值为引用变量中的单选人员变量
            memberRelationFields () {
                const list = []
                this.relationList.forEach((group) => {
                    const memberTypeFields = group.fields.filter(item => item.type === 'MEMBER')
                    if (memberTypeFields.length > 0) {
                        list.push({ name: group.name, fields: memberTypeFields })
                    }
                })
                return list
            }
        },
        watch: {
            dataProcessConfig: {
                handler (val) {
                    this.$store.commit('nocode/nodeConfig/setDataProcessConfig', { projectId: this.projectId, data: val })
                },
                deep: true
            }
        },
        async created () {
            // webhook节点处理人不能为不限，但是创建节点时默认返回的不限，需要在编辑时清除
            if (this.excludeRoleType.includes(this.processorData.type)) {
                this.handleProcessorChange({ type: '', processors: '' })
            }
            this.getRelationList()
            this.getApprovalNode()
            if (this.nodeData.extras.data_source_id) {
                const normalNode = this.flowNodes.find(item => item.id === this.nodeData.extras.data_source_id)
                if (normalNode) {
                    this.normalNodeData.id = normalNode.id
                    this.normalNodeData.name = normalNode.name
                    this.getNormalNodeForm()
                }
            }
            await this.getFormList()
            if (this.nodeData.extras.dataManager?.tableName) {
                this.getFieldList(this.nodeData.extras.dataManager.tableName)
                this.dataProcessConfig = cloneDeep(this.nodeData.extras.dataManager)
            } else {
                const dataManager = {
                    conditions: {
                        connector: 'and',
                        expressions: []
                    },
                    mapping: [],
                    action: '',
                    tableName: ''
                }
                this.dataProcessConfig = dataManager
            }
        },
        methods: {
            async getFormList () {
                try {
                    this.formListLoading = true
                    const params = {
                        projectId: this.projectId,
                        versionId: this.versionId
                    }
                    this.formList = await this.$store.dispatch('nocode/form/getFormList', params)
                } catch (e) {
                    console.error(e)
                } finally {
                    this.formListLoading = false
                }
            },
            getFieldList (tableName) {
                let fieldData = []
                const form = this.formList.find(item => item.tableName === tableName)
                if (form) {
                    fieldData = JSON.parse(form.content)
                }
                fieldData.unshift({ key: 'id', name: 'id', type: 'INT' })
                if (this.dataProcessConfig.action === 'DELETE') {
                    fieldData.unshift({ key: 'ids', name: 'ids', type: 'INT' })
                }
                this.fieldList = fieldData
            },
            // 获取节点字段列表
            async getRelationList () {
                try {
                    this.relationListLoading = true
                    const res = await this.$store.dispatch('nocode/flow/getGroupedNodeVars', this.nodeData.id)
                    const groupedList = []
                    res.forEach((group) => {
                        if (group.fields.length > 0) {
                            groupedList.push({
                                name: group.state_name,
                                fields: group.fields.map((item) => {
                                    const { key, name, type } = item
                                    return {
                                        type,
                                        name,
                                        key,
                                        id: `{{${key}}}`
                                    }
                                })
                            })
                        }
                    })
                    this.relationList = groupedList
                } catch (e) {
                    console.error(e)
                } finally {
                    this.relationListLoading = false
                }
            },
            async getApprovalNode () {
                try {
                    this.approvalNodeListLoading = true
                    this.approvalNodeList = await this.$store.dispatch('nocode/flow/getApprovalNode', this.nodeData.id)
                } catch (e) {
                    console.error(e)
                } finally {
                    this.approvalNodeListLoading = false
                }
            },
            // 获取人工节点字段列表
            async getNormalNodeForm () {
                const id = this.flowNodeForms[this.normalNodeData.id]
                if (id) {
                    this.normalNodeData.loading = true
                    const data = await this.$store.dispatch('nocode/form/formDetail', { formId: id })
                    this.normalNodeData.fieldList = JSON.parse(data.content)
                    this.normalNodeData.tableName = data.tableName
                    this.normalNodeData.loading = false
                }
            },
            getConditionOptions (key) {
                if (key) {
                    const field = this.fieldList.find(i => i.key === key)
                    return field ? getFieldConditions(field.type) : []
                }
                return []
            },
            // 可选择的目标表字段
            getSelectableField (fieldList, crtKey, type) {
                const data = type === 'condition' ? this.dataProcessConfig.conditions.expressions : this.dataProcessConfig.mapping
                const usedKeys = []
                data.forEach((item) => {
                    if (item.key && item.key !== crtKey) {
                        usedKeys.push(item.key)
                    }
                })
                return fieldList.filter(item => !usedKeys.includes(item.key))
            },
            // 切换动作
            handleSelectAction (val) {
                const idsFieldIdx = this.fieldList.findIndex(item => item.key === 'ids')
                this.dataProcessConfig = {
                    action: val,
                    tableName: this.dataProcessConfig.tableName,
                    conditions: {
                        connector: 'and',
                        expressions: []
                    },
                    mapping: []
                }
                if (val === 'DELETE') {
                    if (idsFieldIdx === -1) {
                        this.fieldList.splice(0, 0, { key: 'ids', name: 'ids' })
                    }
                } else {
                    if (idsFieldIdx > -1) {
                        this.fieldList.splice(idsFieldIdx, 1)
                    }
                }
            },
            // 将人工节点的字段默认设置为插入，并设置引用
            handleSyncNormalNodeFields () {
                const { id, name, tableName, fieldList } = this.normalNodeData
                if (!tableName || fieldList.length === 0) {
                    this.$bkMessage({
                        theme: 'warning',
                        message: `【${name}（${id}）】${window.i18n.t('节点表单字段为空，请先配置表单')}`
                    })
                    return
                }
                this.getFieldList(tableName)
                const mapping = fieldList.filter(item => !CAN_NOT_USE_CITE_VAR_TYPE.includes(item.type)).map(field => {
                    return {
                        key: field.key,
                        type: 'field',
                        value: `{{${field.key}}}`
                    }
                })
                this.dataProcessConfig = {
                    action: 'ADD',
                    tableName: tableName,
                    conditions: {
                        connector: 'and',
                        expressions: []
                    },
                    mapping
                }
            },
            handleNameChange (val) {
                this.$store.commit('nocode/nodeConfig/setNodeName', val)
            },
            handleProcessorChange (val) {
                this.$store.commit('nocode/nodeConfig/updateProcessor', val)
            },
            // 切换表单
            handleSelectForm (val) {
                this.getFieldList(val)
                this.dataProcessConfig = {
                    action: this.dataProcessConfig.action,
                    tableName: val,
                    conditions: {
                        connector: 'and',
                        expressions: []
                    },
                    mapping: []
                }
            },
            handleAddExpression (index) {
                if (!this.editable) {
                    return
                }
                this.dataProcessConfig.conditions.expressions.splice(index + 1, 0, {
                    key: '',
                    type: 'const',
                    condition: '',
                    value: ''
                })
            },
            handleDeleteExpression (index) {
                if (!this.editable) {
                    return
                }
                this.dataProcessConfig.conditions.expressions.splice(index, 1)
            },
            handleAddMapping (index) {
                if (!this.editable) {
                    return
                }
                this.dataProcessConfig.mapping.splice(index + 1, 0, {
                    key: '',
                    type: 'const',
                    value: ''
                })
            },
            handleDeleteMapping (index) {
                if (!this.editable) {
                    return
                }
                this.dataProcessConfig.mapping.splice(index, 1)
            },
            // 数字类型的变量如果指定值类型为减指定变量、加指定变量，可选变量需要过滤
            getAvailableRelationList (exp) {
                if (this.targetFields.length > 0) {
                    const field = this.fieldList.find(i => i.key === exp.key)
                    if (field && field.type === 'INT' && ['field_increment', 'field_reduction'].includes(exp.type)) {
                        const list = []
                        this.relationList.forEach((group) => {
                            const fields = []
                            group.fields.forEach((item) => {
                                if (item.type === 'INT') {
                                    fields.push(item)
                                }
                            })
                            if (fields.length > 0) {
                                list.push({ name: group.name, fields })
                            }
                        })
                        return list
                    }
                }
                return this.relationList
            },
            // 选择表单字段，修改对应值的数据类型
            handleSelectField (data) {
                const field = this.fieldList.find(item => item.key === data.key)
                data.type = 'const'
                if (data.condition) {
                    data.condition = ''
                }
                switch (field.type) {
                    case 'INT':
                        data.value = 0
                        break
                    case 'MULTISELECT':
                    case 'CHECKBOX':
                        data.value = []
                        break
                    default:
                        data.value = ''
                }
            },
            validateConditions () {
                return this.$refs.dataForm
                    .validate()
                    .then(() => {
                        const { expressions = [] } = this.dataProcessConfig.conditions
                        const expInValid = expressions.some(item => item.key === '' || item.condition === '' || item.value === '')
                        const mapInValid = (this.dataProcessConfig.mapping || []).some(item => item.key === '' || item.value === '')
                        this.errorTips = expInValid || mapInValid
                        if (expInValid || mapInValid) {
                            this.errorTips = true
                            return false
                        }
                        this.errorTips = false
                        return true
                    })
                    .catch(() => false)
            },
            validate () {
                return Promise.all([
                    this.$refs.dataForm.validate(),
                    this.$refs.processorsForm.validate(),
                    this.validateConditions()
                ]).then((result) => {
                    return result.every(item => item === true)
                }).catch((e) => {
                    return false
                })
            },
            handleSelectMapValue (mapping, val) {
                mapping.value = ''
                val === 'department' ? this.isDepartMent = true : this.isDepartMent = false
            }
        }
    }
</script>
<style lang="postcss" scoped>
.data-process-node-form {
    width: 656px;
    .action-select-area {
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
    & > .bk-form-item {
        margin-top: 15px;
        >>> .bk-label {
            width: auto !important;
        }
    }
    .sync-btn {
        position: absolute;
        top: 0;
        right: -40px;
        padding: 3px;
        font-size: 24px;
        color: #c4c6cc;
        border: 1px solid #c4c6cc;
        border-radius: 2px;
        cursor: pointer;
        &:hover {
            color: #3a84ff;
            border-color: #3a84ff;
        }
    }
    .bk-select {
        background: #ffffff;
    }
    .logic-radio {
        display: flex;
        align-items: center;
        height: 20px;
        & > label {
            margin-right: 30px;
            white-space: nowrap;
            color: #63656e;
            font-size: 14px;
        }
    }
    .rules-section {
        margin-top: 16px;
        padding: 16px;
        background: #f5f6fa;
        border-radius: 2px;
        & > label {
            color: #63656e;
            font-size: 14px;
        }
        .condition-item {
            display: flex;
            align-items: center;
            margin-top: 16px;
        }
        .operate-btns {
            user-select: none;
            i {
                color: #c4c6cc;
                cursor: pointer;
                &:hover {
                    color: #979ba5;
                }
                &.disabled {
                    color: #dcdee5;
                    cursor: not-allowed;
                }
            }
        }
        .data-empty {
            margin-top: 16px;
            padding: 24px 0;
            font-size: 12px;
            text-align: center;
            color: #dcdee5;
            border: 1px dashed #dcdee5;
            cursor: pointer;
            &:not(.disabled):hover {
                border-color: #3a84ff;
                color: #3a84ff;
            }
            &.disabled {
                cursor: not-allowed;
            }
        }
        .bk-form-radio {
            margin-right: 64px;
        }
    }
    .error-tips {
        font-size: 12px;
        color: #ea3636;
        line-height: 18px;
        margin: 2px 0 0;
    }
}
</style>
