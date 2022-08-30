<template>
    <div class="relation-rules-wrapper">
        <vue-draggable handle=".drag-icon" :list="localVal" @change="change">
            <div class="rule-group" v-for="(rule, groupIndex) in localVal" :key="groupIndex">
                <i v-if="isCurrentTable" class="bk-drag-icon bk-drag-grag-fill drag-icon"></i>
                <i
                    v-if="localVal.length > 1"
                    class="bk-drag-icon bk-drag-close-small del-group-icon"
                    @click="handleDelGroup(groupIndex)">
                </i>
                <p v-if="isCurrentTable" style="padding: 0 8px; font-size: 14px;">{{ `规则${groupIndex + 1}` }}</p>
                <div class="relations-content">
                    <div class="relation-item" v-for="(relation, index) in rule.relations" :key="index">
                        当
                        <bk-select
                            v-model="relation.field"
                            style="width: 130px;"
                            size="small"
                            placeholder="表单字段"
                            :loading="!isCurrentTable && formListLoading"
                            @change="change">
                            <bk-option
                                v-for="item in getRelFieldList()"
                                :key="item.key"
                                :id="item.key"
                                :name="item.name">
                            </bk-option>
                        </bk-select>
                        等于
                        <bk-select
                            style="width: 80px;"
                            size="small"
                            :clearable="false"
                            :value="relation.type"
                            @change="handleRelValTypeChange(relation, $event)">
                            <bk-option id="CONST" name="常量"></bk-option>
                            <bk-option id="VAR" name="变量"></bk-option>
                        </bk-select>
                        <div class="field-value" style="width: 160px; line-height: initial">
                            <bk-select
                                v-if="relation.type === 'VAR'"
                                v-model="relation.value"
                                size="small"
                                @change="change">
                                <bk-option
                                    v-for="item in getRelValVarList(relation.field)"
                                    :key="item.key"
                                    :id="item.key"
                                    :name="item.name">
                                </bk-option>
                            </bk-select>
                            <default-value
                                v-else
                                class="determine-value"
                                :field="getDeterminValField(relation)"
                                :disabled="disabled"
                                @change="handleRelVarValChange(relation, $event)">
                            </default-value>
                                
                        </div>
                        <div class="operate-btns">
                            <i class="bk-drag-icon bk-drag-add-fill" @click="handleAddRelation(groupIndex, index)"></i>
                            <i :class="['bk-drag-icon bk-drag-reduce-fill', { disabled: rule.relations.length <= 1 }]" @click="handleDelRelation(groupIndex, index)"></i>
                        </div>
                    </div>
                </div>
                <div class="target-value">
                    <span style="white-space: nowrap;">值为</span>
                    <bk-select
                        v-if="isCurrentTable"
                        :value="rule.target.type"
                        style="margin-left: 8px; width: 80px;"
                        size="small"
                        :clearable="false"
                        @change="handleTargetVarValTypeChange(rule.target, $event)">
                        <bk-option id="CONST" name="常量"></bk-option>
                        <bk-option id="VAR" name="变量"></bk-option>
                    </bk-select>
                    <div style="margin-left: 8px; width: 160px;">
                        <bk-select
                            v-if="rule.target.type === 'VAR'"
                            v-model="rule.target.value"
                            size="small"
                            :placeholder="isCurrentTable ? '请选择本表字段' : '请选择他表字段'"
                            :loading="!isCurrentTable && formListLoading"
                            @change="change">
                            <bk-option
                                v-for="item in targetValVarList"
                                :key="item.id"
                                :id="item.key"
                                :name="item.name">
                            </bk-option>
                        </bk-select>
                        <default-value
                            v-else
                            :field="getFulfillRuleField(rule.target.value)"
                            :disabled="disabled"
                            @change="handleTargetVarValChange(rule.target, $event)">
                        </default-value>
                    </div>
                </div>
            </div>
        </vue-draggable>
        <bk-button v-if="isCurrentTable" size="small" :text="true" @click="handleAddGroup()">继续添加规则</bk-button>
    </div>
</template>
<script>
    import { mapGetters } from 'vuex'
    import cloneDeep from 'lodash.clonedeep'
    import DefaultValue from '../default-value.vue'
    import { getTypeDefaultVal, COMPARABLE_VALUE_TYPES, MULTIPLE_VALUE_TYPES } from 'shared/no-code'

    export default {
        name: 'RelationRules',
        components: {
            DefaultValue
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
            otherTableFields: { // 他表字段
                type: Array,
                default: () => []
            }
        },
        data () {
            return {
                localVal: cloneDeep(this.rules)
            }
        },
        computed: {
            ...mapGetters('nocode/formSetting', ['fieldsList']),
            // 满足规则的联动值类型为变量时，可选变量列表，变量分别根据当前选中的联动内容从本表字段或他表字段中取
            // 本字段为多值文本类型时，类型不限（不包括附件、图片、富文本等不可比较值的类型），为单值类型时不能选择多值类型
            // 本字段为数字时，只能选择数字、计算控件
            // 本字段为日期、时间、单选人员、多选人员时，只能选择对应的类型
            targetValVarList () {
                const fields = this.isCurrentTable ? this.fieldsList.filter(item => item.key !== this.field.key) : this.otherTableFields
                const type = this.field.type
                if (['INT', 'DATE', 'DATETIME', 'MEMBER', 'MEMBERS'].includes(type)) {
                    return fields.filter(item => item.type === type)
                } else if (!MULTIPLE_VALUE_TYPES.includes(type)) {
                    return fields.filter(item => COMPARABLE_VALUE_TYPES.includes(item.type) && !MULTIPLE_VALUE_TYPES.includes(item.type))
                }
                return fields.filter(item => COMPARABLE_VALUE_TYPES.includes(item.type))
            }
        },
        watch: {
            rules (val) {
                this.localVal = cloneDeep(val)
            }
        },
        methods: {
            // 规则字段可选列表
            getRelFieldList () {
                return this.isCurrentTable ? this.fieldsList.filter(item => item.key !== this.field.key) : this.otherTableFields
            },
            // 规则字段值为变量时只能选本表字段
            // 字段可选列表只能是可比较值类型的字段，并排除已选中字段
            getRelValVarList () {
                return this.fieldsList.filter(item => {
                    return item.key !== this.field.key && COMPARABLE_VALUE_TYPES.includes(item.type)
                })
            },
            // 返回关联字段值类型为常量的字段配置
            getDeterminValField (relation) {
                const field = this.fieldsList.find(item => item.key === relation.field)
                if (field) {
                    return { ...field, default: relation.value }
                }
                return {}
            },
            // 返回满足规则的联动值类型为常量的字段配置
            getFulfillRuleField (val) {
                return { ...this.field, default: val }
            },
            handleAddGroup () {
                this.localVal.push({
                    relations: [{ // 关联的字段信息
                        field: '',
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
                this.localVal.splice(index, 1)
                this.change()
            },
            handleAddRelation (groupIndex, index) {
                this.localVal[groupIndex].relations.splice(index + 1, 0, {
                    field: '',
                    type: '',
                    value: ''
                })
                this.change()
            },
            handleDelRelation (groupIndex, index) {
                if (this.localVal[groupIndex].relations.length <= 1) {
                    return
                }
                this.localVal[groupIndex].relations.splice(index, 1)
                this.change()
            },
            // 关联的规则的本表字段切换
            handleRelValTypeChange (relation, val) {
                relation.type = val
                if (relation.field) {
                    const fields = this.isCurrentTable ? this.fieldsList : this.otherTableFields
                    const field = fields.find(item => item.key === relation.field)
                    relation.value = (field && val === 'CONST') ? getTypeDefaultVal(field.type) : ''
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
                target.value = val === 'CONST' ? getTypeDefaultVal(this.field.type) : ''
                this.change()
            },
            handleTargetVarValChange (target, val) {
                target.value = val
                this.change()
            },
            change () {
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
        &:hover {
            .drag-icon,
            .del-group-icon {
                display: block;
            }
        }
        .drag-icon {
            display: none;
            position: absolute;
            top: 50%;
            left: 2px;
            color: #63656e;
            font-size: 14px;
            transform: translateY(-50%);
            cursor: move;
        }
        .del-group-icon {
            display: none;
            position: absolute;
            top: 4px;
            right: 4px;
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
