<template>
    <div class="relation-rules-wrapper">
        <vue-draggable handle=".drag-icon" :list="localVal" :disabled="disabled" @change="change">
            <div class="rule-group" v-for="(rule, groupIndex) in localVal" :key="groupIndex">
                <template v-if="isCurrentTable">
                    <div class="rule-group-operate">
                        <i class="bk-drag-icon bk-drag-drag-small1 drag-icon"></i>
                        <i
                            v-if="localVal.length > 1"
                            class="bk-drag-icon bk-drag-close-small del-group-icon"
                            @click="handleDelGroup(groupIndex)">
                        </i>
                    </div>
                </template>
                <p v-if="isCurrentTable" style="padding: 0 8px; font-size: 14px;">{{ $t('规则') }} [{{ groupIndex + 1 }}]</p>
                <!-- 判断是不是评分组件 -->
                <template v-if="field.type === 'rate' && isCurrentTable">
                    <rate-value-rule
                        :rule="rule"
                        :disabled="disabled"
                        :is-current-table="isCurrentTable"
                        :form-list-loading="formListLoading"
                        :rel-field-list="getRelFieldList()"
                        @change="change">
                    </rate-value-rule>
                </template>
                <template v-else>
                    <div class="relations-content">
                        <div
                            class="relation-item"
                            v-for="(relation, index) in rule.relations"
                            :key="`${relation.field}_${relation.type}_${index}`">
                            {{ $t('当') }}
                            <bk-select
                                v-model="relation.field"
                                style="width: 130px;"
                                :placeholder="$t('表单字段')"
                                :loading="!isCurrentTable && formListLoading"
                                :disabled="disabled"
                                @change="change">
                                <bk-option
                                    v-for="item in getRelFieldList()"
                                    :key="item.configure.key"
                                    :id="item.configure.key"
                                    :name="item.configure.name">
                                </bk-option>
                            </bk-select>
                            <!-- 选择逻辑关系 -->
                            <bk-select
                                v-model="relation.logic"
                                style="width: 100px;"
                                :clearable="false"
                                :disabled="disabled"
                                @change="change">
                                <bk-option
                                    v-for="logic in getRelationLogics(relation.field)"
                                    :key="logic.id"
                                    :id="logic.id"
                                    :name="logic.name">
                                </bk-option>
                            </bk-select>
                            <bk-select
                                style="width: 80px;"
                                :clearable="false"
                                :placeholder="$t('请选择')"
                                :disabled="disabled"
                                :value="relation.type"
                                @change="handleRelValTypeChange(relation, $event)">
                                <bk-option id="CONST" :name="$t('常量')"></bk-option>
                                <bk-option id="VAR" :name="$t('变量')"></bk-option>
                            </bk-select>
                            <div class="field-value" style="width: 160px; line-height: initial">
                                <bk-select
                                    v-if="relation.type === 'VAR'"
                                    v-model="relation.value"
                                    :placeholder="$t('请选择')"
                                    :disabled="disabled"
                                    @change="change">
                                    <bk-option
                                        v-for="item in getRelValVarList(relation.field)"
                                        :key="item.configure.key"
                                        :id="item.configure.key"
                                        :name="item.configure.name">
                                    </bk-option>
                                </bk-select>
                                <default-value
                                    v-else
                                    :field="getDeterminValField(relation)"
                                    :disabled="disabled"
                                    :value="relation.value"
                                    @change="handleRelVarValChange(relation, $event)">
                                </default-value>
                            </div>
                            <div class="operate-btns">
                                <i class="bk-drag-icon bk-drag-add-fill" @click="handleAddRelation(groupIndex, index)"></i>
                                <i :class="['bk-drag-icon bk-drag-reduce-fill', { disabled: rule.relations.length <= 1 }]" @click="handleDelRelation(groupIndex, index)"></i>
                            </div>
                        </div>
                    </div>
                    <div class="target-value" :key="`${rule.target.type}_${rule.target_value}_${groupIndex}`">
                        <span style="white-space: nowrap;">{{ $t('值为') }}</span>
                        <bk-select
                            v-if="isCurrentTable"
                            :value="rule.target.type"
                            style="margin-left: 8px; width: 80px;"
                            :placeholder="$t('请选择')"
                            :clearable="false"
                            :disabled="disabled"
                            @change="handleTargetVarValTypeChange(rule.target, $event)">
                            <bk-option id="CONST" :name="$t('常量')"></bk-option>
                            <bk-option id="VAR" :name="$t('变量')"></bk-option>
                        </bk-select>
                        <div style="margin-left: 8px; width: 170px;">
                            <bk-select
                                v-if="rule.target.type === 'VAR'"
                                v-model="rule.target.value"
                                :placeholder="isCurrentTable ? $t('请选择本表字段') : $t('请选择他表字段')"
                                :loading="!isCurrentTable && formListLoading"
                                :disabled="disabled"
                                @change="change">
                                <bk-option
                                    v-for="item in targetValVarList"
                                    :key="item.configure.key"
                                    :id="item.configure.key"
                                    :name="item.configure.name">
                                </bk-option>
                            </bk-select>
                            <default-value
                                v-else
                                :field="field"
                                :disabled="disabled"
                                :value="rule.target.value"
                                @change="handleTargetVarValChange(rule.target, $event)">
                            </default-value>
                        </div>
                    </div>
                </template>
            </div>
        </vue-draggable>
        <bk-button
            v-if="isCurrentTable"
            :text="true"
            :disabled="disabled"
            @click="handleAddGroup()">
            {{ $t('继续添加规则') }} </bk-button>
    </div>
</template>
<script>
    import cloneDeep from 'lodash.clonedeep'
    import DefaultValue from '../../../common/default-value.vue'
    import RateValueRule from './rate-value-rule.vue'
    import { getFieldDefaultVal } from '../../../../utils/index'

    // 可以比较值是否相等的字段类型
    const COMPARABLE_VALUE_TYPES = [
        'input', 'textarea', 'int', 'date', 'datetime', 'link', 'select', 'multiple-select', 'checkbox', 'radio', 'member', 'members', 'rate'
    ]

    const MULTIPLE_VALUE_TYPES = ['multiple-select', 'checkbox', 'members', 'table']

    export default {
        name: 'RelationRules',
        components: {
            DefaultValue,
            RateValueRule
        },
        props: {
            disabled: Boolean,
            field: {
                type: Object,
                default: () => ({})
            },
            rules: {
                type: Array,
                default () {
                    return [
                        {
                            relations: [{ // 关联的字段信息
                                field: '',
                                logic: '',
                                type: '', // CONST常量、VAR变量
                                value: ''
                            }],
                            target: { // 满足规则时的联动值配置
                                type: '', // CONST常量、VAR变量
                                value: ''
                            }
                        }
                    ]
                }
            },
            formListLoading: Boolean,
            isCurrentTable: { // 是否为本表字段联动
                type: Boolean,
                default: true
            },
            currentTableFields: { // 本表字段
                type: Array,
                default: () => []
            },
            otherTableFields: { // 他表字段
                type: Array,
                default: () => []
            }
        },
        data () {
            return {
                localVal: this.getLocalVal(this.rules)
            }
        },
        computed: {
            // 满足规则的联动值类型为变量时，可选变量列表，变量分别根据当前选中的联动内容从本表字段或他表字段中取
            // 本字段为多值文本类型时，类型不限（不包括附件、图片、富文本等不可比较值的类型），为单值类型时不能选择多值类型
            // 本字段为数字时，只能选择数字、计算控件
            // 本字段为日期、时间、单选人员、多选人员时，只能选择对应的类型
            targetValVarList () {
                const fields = this.isCurrentTable ? this.currentTableFields : this.otherTableFields
                const type = this.field.type
                if (['int', 'date', 'datetime', 'member', 'members', 'rate'].includes(type)) {
                    return fields.filter(item => item.type === type)
                } else if (!MULTIPLE_VALUE_TYPES.includes(type)) {
                    return fields.filter(item => {
                        return COMPARABLE_VALUE_TYPES.includes(item.type) && !MULTIPLE_VALUE_TYPES.includes(item.type)
                    })
                }
                return fields.filter(item => COMPARABLE_VALUE_TYPES.includes(item.type))
            }
        },
        watch: {
            rules (val) {
                this.localVal = this.getLocalVal(val)
            }
        },
        methods: {
            getLocalVal (list) {
                return list.map(item => {
                    const rule = cloneDeep(item)
                    // 添加比较逻辑下拉框之前，不存在logic字段，默认填充'=='
                    rule.relations.forEach(relation => {
                        if (!('logic' in relation)) {
                            relation.logic = '=='
                        }
                    })
                    return rule
                })
            },
            // 规则字段可选列表
            getRelFieldList () {
                const fields = this.isCurrentTable ? this.currentTableFields : this.otherTableFields
                const relFieldList = fields.filter(item => {
                    // 评分组件只能选择数字类型的字段
                    return this.field.type === 'rate' ? item.type === 'int' : true
                })
                return relFieldList
            },
            getRelationLogics (key) {
                if (!key) {
                    return []
                }

                const fieldList = this.getRelFieldList()
                const field = fieldList.find(item => item.configure.key === key)
                if (field) {
                    if (['input', 'textarea', 'date', 'datetime', 'select', 'multiple-select', 'member', 'members', 'rich-text', 'description', 'link'].includes(field.type)) {
                        return [
                            { id: '==', name: window.i18n.t('等于') },
                            { id: 'in', name: window.i18n.t('包含') }
                        ]
                    }
                    return [
                        { id: '==', name: window.i18n.t('等于') },
                        { id: '>', name: window.i18n.t('大于') },
                        { id: '<', name: window.i18n.t('小于') },
                        { id: '>=', name: window.i18n.t('大于等于') },
                        { id: '<=', name: window.i18n.t('小于等于') }
                    ]
                }
                return []
            },
            // 规则字段值为变量时只能选本表字段
            // 字段可选列表只能是可比较值类型的字段，并排除已选中字段
            getRelValVarList () {
                return this.currentTableFields.filter(item => {
                    return COMPARABLE_VALUE_TYPES.includes(item.type)
                })
            },
            // 返回关联字段值类型为常量的字段配置
            getDeterminValField (relation) {
                const field = this.currentTableFields.find(item => item.configure.key === relation.field)
                return field || {}
            },
            // 返回满足规则的联动值类型为常量的字段配置
            getFulfillRuleField (val) {
                return { ...this.field, default: val }
            },
            handleAddGroup () {
                this.localVal.push({
                    relations: [{ // 关联的字段信息
                        field: '',
                        logic: '',
                        type: '', // CONST常量、VAR变量
                        value: ''
                    }],
                    target: { // 满足关联条件的联动值
                        type: this.isCurrentTable ? '' : 'VAR',
                        value: ''
                    }
                })
                this.change()
            },
            handleDelGroup (index) {
                if (this.disabled) {
                    return
                }
                this.localVal.splice(index, 1)
                this.change()
            },
            handleAddRelation (groupIndex, index) {
                if (this.disabled) {
                    return
                }
                this.localVal[groupIndex].relations.splice(index + 1, 0, {
                    field: '',
                    type: '',
                    value: ''
                })
                this.change()
            },
            handleDelRelation (groupIndex, index) {
                if (this.disabled || this.localVal[groupIndex].relations.length <= 1) {
                    return
                }
                this.localVal[groupIndex].relations.splice(index, 1)
                this.change()
            },
            // 关联的规则的本表字段切换
            handleRelValTypeChange (relation, val) {
                relation.type = val
                if (relation.field) {
                    const fields = this.isCurrentTable ? this.currentTableFields : this.otherTableFields
                    const field = fields.find(item => item.configure.key === relation.field)
                    relation.value = (field && val === 'CONST') ? getFieldDefaultVal(field.type) : ''
                } else {
                    relation.value = ''
                }
                this.change()
            },
            handleRelVarValChange (relation, val) {
                relation.value = val
                this.change()
            },
            handleTargetVarValTypeChange (target, val) {
                target.type = val
                target.value = val === 'CONST' ? getFieldDefaultVal(this.field.type) : ''
                this.change()
            },
            handleTargetVarValChange (target, val) {
                target.value = val
                this.change()
            },
            change (e) {
                this.$emit('change', this.localVal)
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .bk-select {
        background: #ffffff;
    }
    .rule-group {
        position: relative;
        margin-bottom: 10px;
        padding: 8px;
        background: #f5f7fa;
        .rule-group-operate {
            position: absolute;
            right: 10px;
            top: 10px;
            display: flex;
            align-items: center;
        }
        .drag-icon {
            color: #63656e;
            font-size: 22px;
            cursor: move;
        }
        .del-group-icon {
            color: #979ba5;
            font-size: 18px;
            cursor: pointer;
            &:hover {
                color: #3a84ff;
            }
        }
    }
    .relation-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 4px 12px;
    }
    .operate-btns {
        i {
            font-size: 14px;
            color: #c4c6cc;
            cursor: pointer;
            &:not(.disabled):hover {
                color: #979ba5;
            }
            &.disabled {
                cursor: not-allowed;
            }
        }
    }
    .target-value {
        display: flex;
        align-items: center;
        margin-top: 4px;
        padding: 0 12px;
    }
</style>
