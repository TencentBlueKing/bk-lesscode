<template>
    <div class="processing-rule-edit">
        <!-- 满足条件，删除、更新操作时存在 -->
        <div v-if="['DELETE', 'EDIT'].includes(nodeData.config.action)" class="rules-section">
            <div class="logic-radio">
                <label>{{ nodeData.config.action === 'DELETE' ? $t('删除条件') : $t('满足条件') }}</label>
                <bk-radio-group :value="conditions.connector">
                    <bk-radio value="and">{{ $t('且') }}</bk-radio>
                    <bk-radio value="or">{{ $t('或') }}</bk-radio>
                </bk-radio-group>
            </div>
            <div v-if="conditions.expressions.length > 0" class="condition-list">
                <div class="expression-item" v-for="(expression, index) in conditions.expressions" :key="index">
                    <bk-select
                        v-model="expression.key"
                        class="field-select"
                        :placeholder="$t('目标表字段')"
                        :clearable="false"
                        :searchable="true"
                        :loading="formListLoading"
                        @selected="handleSelectField(expression)">
                        <bk-option
                            v-for="field in getSelectableField(expression.key, 'condition')"
                            :key="field.id"
                            :id="field.id"
                            :name="field.name">
                        </bk-option>
                    </bk-select>
                    <bk-select
                        v-model="expression.condition"
                        class="logic-select"
                        :placeholder="$t('逻辑')"
                        :clearable="false"
                        @selected="change">
                        <bk-option
                            v-for="item in getLogicConditionOptions(expression.key)"
                            :key="item.id"
                            :id="item.id"
                            :name="item.name">
                        </bk-option>
                    </bk-select>
                    <bk-select
                        v-model="expression.type"
                        class="value-type-select"
                        :placeholder="$t('值类型')"
                        :clearable="false"
                        @selected="handleValueTypeChange(expression, $event)">
                        <bk-option id="const" :name="$t('值')"></bk-option>
                        <bk-option id="field" :name="$t('引用变量')"></bk-option>
                    </bk-select>
                    <div class="value-form">
                        <bk-select
                            v-if="expression.type === 'field'"
                            v-model="expression.value"
                            :placeholder="$t('选择变量')"
                            :clearable="false"
                            :searchable="true"
                            :loading="relationListLoading"
                            :disabled="relationListLoading"
                            @change="handleValueChange(expression, $event)">
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
                                    :name="item.name">
                                </bk-option>
                            </bk-option-group>
                        </bk-select>
                        <default-value
                            v-else
                            :field="getFieldConfig(expression.key)"
                            :value="expression.value"
                            :placeholder="$t('请输入')"
                            @change="handleValueChange(expression, $event)" />
                    </div>
                    <div class="operate-btns" style="margin-left: 8px">
                        <i class="bk-drag-icon bk-drag-add-fill" @click="handleAddExpression(index)"></i>
                        <i class="bk-drag-icon bk-drag-reduce-fill" @click="handleDeleteExpression(index)"> </i>
                    </div>
                </div>
            </div>
            <div v-else :class="['data-empty']" @click="handleAddExpression(-1)">{{ $t('点击添加') }}</div>
        </div>
        <!-- 写入数据的规则，增加、更新操作时存在 -->
        <div v-if="['ADD', 'EDIT'].includes(nodeData.config.action)" class="rules-section">
            <label>{{ nodeData.config.action === 'ADD' ? $t('插入规则') : $t('则更新') }}</label>
            <div v-if="mapping.length > 0" class="mapping-list">
                <div class="mapping-item" v-for="(mapping, index) in mapping" :key="index">
                    <bk-select
                        v-model="mapping.key"
                        class="field-select"
                        :placeholder="$t('目标表字段')"
                        :clearable="false"
                        :searchable="true"
                        :loading="formListLoading"
                        @selected="handleSelectField(mapping)">
                        <bk-option
                            v-for="field in getSelectableField(mapping.key, 'mapping')"
                            :key="field.id"
                            :id="field.id"
                            :name="field.name">
                        </bk-option>
                    </bk-select>
                    <bk-select
                        v-model="mapping.type"
                        class="value-type-select"
                        :placeholder="$t('值类型')"
                        :clearable="false"
                        @selected="handleValueTypeChange(mapping, $event)">
                        <bk-option id="const" :name="$t('值')"></bk-option>
                        <bk-option id="field" :name="$t('引用变量')"></bk-option>
                    </bk-select>
                    <div class="value-form">
                        <bk-select
                            v-if="['field', 'field_increment', 'field_reduction'].includes(mapping.type)"
                            v-model="mapping.value"
                            :placeholder="$t('选择变量')"
                            :clearable="false"
                            :searchable="true"
                            :loading="relationListLoading"
                            :disabled="relationListLoading"
                            @change="handleValueChange(mapping, $event)">
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
                                    :name="item.name">
                                </bk-option>
                            </bk-option-group>
                        </bk-select>
                        <default-value
                            v-else
                            :field="getFieldConfig(mapping.key)"
                            :value="mapping.value"
                            @change="handleValueChange(mapping, $event)" />
                    </div>
                    <div class="operate-btns" style="margin-left: 8px">
                        <i class="bk-drag-icon bk-drag-add-fill" @click="handleAddMapping(index)"></i>
                        <i class="bk-drag-icon bk-drag-reduce-fill" @click="handleDeleteMapping(index)"> </i>
                    </div>
                </div>
            </div>
            <div v-else :class="['data-empty']" @click="handleAddMapping(-1)">{{ $t('点击添加') }}</div>
        </div>
    </div>
</template>
<script>
    import { defineComponent, ref, computed, watch } from '@vue/composition-api'
    import { getFieldDefaultVal } from '@/form-engine/utils/index'
    import DefaultValue from '@/form-engine/setter/common/default-value.vue'

    export default defineComponent ({
        name: 'ProcessingRuleEdit',
        components: {
            DefaultValue
        },
        props: {
            nodeData: {
                type: Object,
                default: () => ({})
            },
            formFields: {
                type: Array,
                default: () => []
            },
            formList: {
                type: Array,
                default: () => []
            },
            formListLoading: {
                type: Boolean,
                default: false
            },
            fieldVarList: {
                type: Array,
                default: () => []
            }
        },
        setup (props, { emit }) {
            const targetFields = ref([])
            const relationList = ref([])
            const relationListLoading = ref(false)

            const conditions = ref(JSON.parse(JSON.stringify(props.nodeData.config.conditions)))
            const mapping = ref(JSON.parse(JSON.stringify(props.nodeData.config.mapping)))

            // 作为设置条件的可选择目标表字段
            const expressionFieldList = computed(() => {
                // 数据表内置的id字段也可以作为条件字段
                const fields = [{ configure: { key: 'id', name: 'id' } }, ...props.formFields]
                return fields.filter(field => conditions.value.expressions.findIndex(item => item.key === field.configure.key) === -1)
                                .map(item => ({ id: item.configure.key, name: `${item.configure.name || item.configure.key}(${item.configure.key})` }))
            })

            // 需要写数据的可选择目标表字段
            const mappingFieldList = computed(() => {
                return props.formFields.filter(field => mapping.value.findIndex(item => item.key === field.configure.key) === -1)
                                        .map(item => ({ id: item.configure.key, name: `${item.configure.name || item.configure.key}(${item.configure.key})` }))
            })

            watch(() => props.nodeData.config.conditions, (val) => {
                conditions.value = JSON.parse(JSON.stringify(val))
            })

            watch(() => props.nodeData.config.mapping, (val) => {
                mapping.value = JSON.parse(JSON.stringify(val))
            })

            // 可选择的目标表字段，已选择的字段不能重复选择，当前选中的字段，需要添加到选项中
            const getSelectableField = (key, type) => {
                const remainSelectableFields = type === 'condition' ? expressionFieldList.value : mappingFieldList.value
                if (key === 'id') {
                    return [{ id: 'id', name: 'id' }, ...remainSelectableFields]
                } else {
                    const field = props.formFields.find(item => item.configure.key === key)
                    if (field) {
                        return [{ id: field.configure.key, name: `${field.configure.name || field.configure.key}(${field.configure.key})` }, ...remainSelectableFields]
                    }
    
                    return remainSelectableFields
                }
            }

            // 可选择的逻辑选项
            // 根据所选择的目标表字段类型，动态计算支持的逻辑运算列表
            const getLogicConditionOptions = (key) => {
                const field = props.formFields.find(item => item.configure.key === key)
                if (key === 'id' || field) {
                    if (key === 'id' || ['int', 'rate'].includes(field.type)) {
                        return [
                            { id: '==', name: '等于' },
                            // { id: '!=', name: '不等于' },
                            { id: '>', name: '大于' },
                            { id: '<', name: '小于' },
                            { id: '>=', name: '大于等于' },
                            { id: '<=', name: '小于等于' }
                        ]
                    } else {
                        return[
                            { id: '==', name: '等于' },
                            { id: 'in', name: '包含' }
                        ]
                    }
                }
                return []
            }

            // 流程中所有人工节点包含的字段列表，按照节点分组，其中目标表字段为int类型时，只能选节点中为int类型的字段
            const getAvailableRelationList = () => {
                return props.fieldVarList
            }

            // 选择目标表字段后，将值类型设置为const，将逻辑条件清空，并根据字段的类型设置默认值
            const handleSelectField = (ruleItem) => {
                ruleItem.type = 'const'
                if (ruleItem.condition) {
                    ruleItem.condition = ''
                }
                setRuleDefaultVal(ruleItem)
                change()
            }

            const getFieldConfig = (key) => {
                if (key === 'id') {
                    return { id: 'id', type: 'int', configure: { key: 'id', name: 'id' } }
                } else {
                    const field = props.formFields.find(item => item.configure.key === key)
                    return field || {}
                }
            }

            const setRuleDefaultVal = (ruleItem) => {
                let type
                if (ruleItem.key === 'id') {
                    type = 'int'
                } else {
                    const field = props.formFields.find(item => item.configure.key === ruleItem.key)
                    if (field) {
                        type = field.type
                    }
                }
                ruleItem.value = getFieldDefaultVal(type)
            }

            const handleAddExpression = (index) => {
                conditions.value.expressions.splice(index + 1, 0, {
                    key: '',
                    type: 'const',
                    condition: '',
                    value: ''
                })
                change()
            }

            const handleDeleteExpression = (index) => {
                conditions.value.expressions.splice(index, 1)
                change()
            }

            const handleAddMapping = (index) => {
                mapping.value.splice(index + 1, 0, {
                    key: '',
                    type: 'const',
                    value: ''
                })
                change()
            }

            const handleDeleteMapping = (index) => {
                mapping.value.splice(index, 1)
                change()
            }

            const handleValueChange = (ruleItem, val) => {
                ruleItem.value = val
                change()
            }

            const handleValueTypeChange = (ruleItem, val) => {
                ruleItem.type = val
                setRuleDefaultVal(ruleItem)
                change()
            }

            const change = () => {
                emit('change', conditions.value, mapping.value)
            }

            return {
                conditions,
                mapping,
                targetFields,
                relationList,
                relationListLoading,
                expressionFieldList,
                getSelectableField,
                getLogicConditionOptions,
                getAvailableRelationList,
                getFieldConfig,
                handleSelectField,
                handleAddExpression,
                handleDeleteExpression,
                handleAddMapping,
                handleDeleteMapping,
                handleValueTypeChange,
                handleValueChange,
                change
            }
        }
    })
</script>
<style lang="postcss" scoped>
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
        .expression-item,
        .mapping-item {
            display: flex;
            align-items: center;
            margin-top: 16px;
        }
        .expression-item {
            .field-select {
                margin-right: 8px;
                width: 150px;
            }
            .logic-select {
                margin-right: 8px;
                width: 100px;
            }
            .value-type-select {
                margin-right: 8px;
                width: 100px;
            }
            .value-form {
                width: 190px
            }
        }
        .mapping-item {
            .field-select {
                margin-right: 8px;
                width: 180px;
            }
            .value-type-select {
                width: 100px;
                margin-right: 8px;
            }
            .value-form {
                width: 268px;
            }
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
        .bk-select {
            background: #ffffff;
        }
    }
</style>