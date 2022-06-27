<template>
    <div class="data-process-node">
        <form-section title="基础配置">
            <bk-form
                ref="dataForm"
                form-type="vertical"
                class="data-process-node-form"
                :rules="rules"
                :model="dataProcessConfig">
                <bk-form-item label="节点名称" property="name" :required="true">
                    <bk-input v-model="dataProcessConfig.name"></bk-input>
                </bk-form-item>
                <bk-form-item label="处理人" :required="true">
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
                    <bk-form-item label="节点动作" property="action" :required="true">
                        <bk-select :value="dataProcessConfig.action" :clearable="false" :disabled="!editable" @selected="handleSelectAction">
                            <bk-option v-for="item in actions" :key="item.id" :id="item.id" :name="item.name"></bk-option>
                        </bk-select>
                    </bk-form-item>
                    <bk-form-item label="目标表单" property="worksheet_id" :required="true">
                        <bk-select
                            :value="dataProcessConfig.worksheet_id"
                            :clearable="false"
                            :loading="formListLoading"
                            :disabled="formListLoading || !editable"
                            @selected="handleSelectForm">
                            <bk-option
                                v-for="item in formList"
                                :key="item.id"
                                :id="item.id"
                                :name="`${item.formName}(${item.tableName})`">
                            </bk-option>
                        </bk-select>
                    </bk-form-item>
                </div>
                <bk-form-item label="字段映射规则">
                    <template v-if="dataProcessConfig.action && dataProcessConfig.worksheet_id !== ''">
                        <!-- 满足条件，删除、更新动作存在 -->
                        <div v-if="['DELETE', 'EDIT'].includes(dataProcessConfig.action)" class="rules-section">
                            <div class="logic-radio">
                                <label>{{ dataProcessConfig.action === 'DELETE' ? '删除条件' : '满足条件' }}</label>
                                <bk-radio-group :value="dataProcessConfig.conditions.connector">
                                    <bk-radio value="and" :disabled="!editable">且</bk-radio>
                                    <bk-radio value="or" :disabled="!editable">或</bk-radio>
                                </bk-radio-group>
                            </div>
                            <div v-if="dataProcessConfig.conditions.expressions.length > 0" class="condition-list">
                                <div class="condition-item" v-for="(expression, index) in dataProcessConfig.conditions.expressions" :key="index">
                                    <bk-select
                                        v-model="expression.key"
                                        placeholder="目标表字段"
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
                                        placeholder="逻辑"
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
                                        placeholder="值类型"
                                        style="width: 100px; margin-right: 8px"
                                        :clearable="false"
                                        :disabled="!editable"
                                        @selected="expression.value = ''">
                                        <bk-option id="const" name="值"></bk-option>
                                        <bk-option id="field" name="引用变量"></bk-option>
                                        <bk-option id="department" name="组织架构"></bk-option>
                                        <template v-if="
                                            fieldList.length > 0 &&
                                                expression.key &&
                                                fieldList.find(i => i.key === expression.key).type === 'INT'
                                        ">
                                            <bk-option id="increment" name="增加"></bk-option>
                                            <bk-option id="reduction" name="减少"></bk-option>
                                        </template>
                                        <template v-if="
                                            fieldList.length > 0 &&
                                                expression.key &&
                                                ['STRING', 'TEXT', 'DATE', 'DATETIME', 'SELECT', 'RADIO'].includes(
                                                    fieldList.find(i => i.key === expression.key).type
                                                )
                                        ">
                                            <bk-option id="system" name="系统变量"></bk-option>
                                            <bk-option id="approver" name="审批人"></bk-option>
                                            <bk-option id="leader" name="指定上级"></bk-option>
                                        </template>
                                    </bk-select>
                                    <bk-select
                                        v-if="expression.type === 'field'"
                                        v-model="expression.value"
                                        placeholder="选择变量"
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
                                        <bk-option id="date" name="当前日期"></bk-option>
                                        <bk-option id="start_time" name="单据创建时间"></bk-option>
                                        <bk-option id="creator" name="提单人"></bk-option>
                                        <bk-option id="leader" name="提单人上级"></bk-option>
                                        <bk-option id="sn" name="单号"></bk-option>
                                    </bk-select>
                                    <bk-select
                                        v-else-if="expression.type === 'approver'"
                                        v-model="expression.value"
                                        placeholder="选择审批节点"
                                        style="width: 190px"
                                        :clearable="false"
                                        :loading="approvalNodeListLoading"
                                        :disabled="approvalNodeListLoading || !editable">
                                        <bk-option v-for="item in approvalNodeList" :key="item.id" :id="item.id" :name="item.name"></bk-option>
                                    </bk-select>
                                    <bk-select
                                        v-else-if="expression.type === 'leader'"
                                        v-model="expression.value"
                                        placeholder="选择人员类型变量"
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
                            <div v-else :class="['data-empty', { disabled: !editable }]" @click="handleAddExpression(-1)">点击添加</div>
                        </div>
                        <!-- 映射规则，增加、更新动作存在 -->
                        <div v-if="['ADD', 'EDIT'].includes(dataProcessConfig.action)" class="rules-section">
                            <label>{{ dataProcessConfig.action === 'ADD' ? '插入规则' : '则更新' }}</label>
                            <div v-if="dataProcessConfig.mapping.length > 0" class="mapping-list">
                                <div class="condition-item" v-for="(mapping, index) in dataProcessConfig.mapping" :key="index">
                                    <bk-select
                                        v-model="mapping.key"
                                        placeholder="目标表字段"
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
                                        placeholder="值类型"
                                        style="width: 100px; margin-right: 8px"
                                        :clearable="false"
                                        :disabled="!editable"
                                        @selected="(val) => handleSelectMapValue(mapping,val)">
                                        <bk-option id="const" name="值"></bk-option>
                                        <bk-option id="field" name="引用变量"></bk-option>
                                        <bk-option id="department" name="组织架构"></bk-option>
                                        <template v-if="
                                            targetFields.length > 0 &&
                                                mapping.key &&
                                                targetFields.find(i => i.key === mapping.key).type === 'INT'
                                        ">
                                            <bk-option id="increment" name="增加"></bk-option>
                                            <bk-option id="reduction" name="减少"></bk-option>
                                            <bk-option v-if="dataProcessConfig.action === 'EDIT'" id="field_increment" name="加指定变量"></bk-option>
                                            <bk-option v-if="dataProcessConfig.action === 'EDIT'" id="field_reduction" name="减指定变量"></bk-option>
                                        </template>
                                        <template v-if="
                                            targetFields.length > 0 &&
                                                mapping.key &&
                                                ['STRING', 'TEXT', 'DATE', 'DATETIME', 'SELECT', 'RADIO'].includes(
                                                    fieldList.find(i => i.key === mapping.key).type
                                                )
                                        ">
                                            <bk-option id="system" name="系统变量"></bk-option>
                                            <bk-option id="approver" name="审批人"></bk-option>
                                            <bk-option id="leader" name="指定上级"></bk-option>
                                        </template>
                                    </bk-select>
                                    <bk-select
                                        v-if="['field', 'field_increment', 'field_reduction'].includes(mapping.type)"
                                        v-model="mapping.value"
                                        placeholder="选择变量"
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
                                        <bk-option id="date" name="当前日期"></bk-option>
                                        <bk-option id="start_time" name="单据创建时间"></bk-option>
                                        <bk-option id="creator" name="提单人"></bk-option>
                                        <bk-option id="leader" name="提单人上级"></bk-option>
                                        <bk-option id="sn" name="单号"></bk-option>
                                    </bk-select>
                                    <bk-select
                                        v-else-if="mapping.type === 'approver'"
                                        v-model="mapping.value"
                                        placeholder="选择审批节点"
                                        style="width: 268px"
                                        :clearable="false"
                                        :loading="approvalNodeListLoading"
                                        :disabled="approvalNodeListLoading || !editable">
                                        <bk-option v-for="item in approvalNodeList" :key="item.id" :id="item.id" :name="item.name"></bk-option>
                                    </bk-select>
                                    <bk-select
                                        v-else-if="mapping.type === 'leader'"
                                        v-model="mapping.value"
                                        placeholder="选择人员类型变量"
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
                            <div v-else :class="['data-empty', { disabled: !editable }]" @click="handleAddMapping(-1)">点击添加</div>
                        </div>
                    </template>
                    <bk-exception v-else class="no-data" type="empty" scene="part">请选择节点动作和目标表单</bk-exception>
                    <p v-if="errorTips" class="error-tips">请检查字段映射规则</p>
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
    import { CONDITION_RELATIONS } from '@/components/flow-form-comp/form/constants/forms.js'
    import { getFieldConditions } from '@/components/render-nocode/common/form.js'
    import FieldValue from '@/components/render-nocode/form/components/form-edit/fieldValue.vue'

    export default {
        name: 'DataProcessNode',
        components: {
            Processors,
            FieldValue,
            FormSection
        },
        props: {
            createTicketNodeId: Number,
            editable: {
                type: Boolean,
                default: true
            }
        },
        data () {
            return {
                actions: [
                    { id: 'ADD', name: '插入' },
                    { id: 'EDIT', name: '更新' },
                    { id: 'DELETE', name: '删除' }
                ],
                dataProcessConfig: {},
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
                            message: '节点名称为必填项',
                            trigger: 'blur'
                        }
                    ],
                    action: [
                        {
                            required: true,
                            message: '必填项',
                            trigger: 'blur'
                        }
                    ],
                    worksheet_id: [
                        {
                            required: true,
                            message: '必填项',
                            trigger: 'blur'
                        }
                    ]
                }
            }
        },
        computed: {
            ...mapGetters('projectVersion', { versionId: 'currentVersionId' }),
            ...mapState('nocode/nodeConfig', ['nodeData']),
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
                    this.$store.commit('nocode/nodeConfig/setDataProcessConfig', val)
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
            await this.getFormList()
            if (typeof this.nodeData.extras.dataManager?.worksheet_id === 'number') {
                this.getFieldList(this.nodeData.extras.dataManager.worksheet_id)
                this.dataProcessConfig = { name: this.nodeData.name, ...cloneDeep(this.nodeData.extras.dataManager) }
            } else {
                const dataManager = {
                    conditions: {
                        connector: 'and',
                        expressions: []
                    },
                    mapping: [],
                    action: '',
                    worksheet_id: '',
                    name: this.nodeData.name
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
            getFieldList (id) {
                let fieldData = []
                const form = this.formList.find(item => item.id === id)
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
                                        id: `$\{param_${key}}`
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
                    worksheet_id: this.dataProcessConfig.worksheet_id,
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
            handleProcessorChange (val) {
                this.$store.commit('nocode/nodeConfig/updateProcessor', val)
            },
            // 切换表单
            handleSelectForm (val) {
                this.getFieldList(val)
                this.dataProcessConfig = {
                    action: this.dataProcessConfig.action,
                    worksheet_id: val,
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
            flex: 1;
            margin-top: 0;
            &:first-child {
                margin-right: 16px;
            }
        }
    }
    & > .bk-form-item {
        margin-top: 15px;
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
