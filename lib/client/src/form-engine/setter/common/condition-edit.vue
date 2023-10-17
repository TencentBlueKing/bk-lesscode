<template>
    <bk-dialog
        header-position="left"
        width="560"
        :value="show"
        :title="title"
        :mask-close="false"
        :auto-close="false"
        :close-icon="false"
        @confirm="handleConfirm"
        @cancel="handleClose">
        <div class="condition-edit-dialog">
            <div class="logic-rule">
                <label>{{$t('字段间关系')}}</label>
                <bk-radio-group v-model="localVal.logic">
                    <bk-radio value="AND" :disabled="disabled">{{$t('且')}}</bk-radio>
                    <bk-radio value="OR" :disabled="disabled">{{ $t('或')}}</bk-radio>
                </bk-radio-group>
            </div>
            <div class="condition-list">
                <div v-for="(conditionItem, index) in localVal.conditions" class="condition-item" :key="index">
                    <div class="condition-content">
                        <!-- 选择字段 -->
                        <bk-select
                            :value="conditionItem.key"
                            style="width: 30%; margin-right: 8px"
                            :clearable="false"
                            :loading="fieldsLoading"
                            :disabled="disabled"
                            @selected="handleSelectField(conditionItem, $event)">
                            <bk-option v-for="field in fields" :key="field.key" :id="field.key" :name="field.name"></bk-option>
                        </bk-select>
                        <!-- 选择逻辑关系 -->
                        <bk-select
                            :value="conditionItem.condition"
                            style="width: 30%; margin-right: 8px"
                            :clearable="false"
                            :disabled="disabled"
                            @selected="handleSelectCondition">
                            <bk-option
                                v-for="field in getConditionOptions(conditionItem.key)"
                                :key="field.id"
                                :id="field.id"
                                :name="field.name">
                            </bk-option>
                        </bk-select>
                        <!-- 条件值 -->
                        <default-value
                            style="width: 40%"
                            :field="field"
s                           :value="conditionItem.value"
                            @change="handleValChange(conditionItem, $event)">
                        </default-value>
                    </div>
                    <div class="operate-btns">
                        <i class="icon bk-drag-icon bk-drag-add-fill" @click="handleAdd(index)"></i>
                        <i
                            :class="['icon', 'bk-drag-icon', 'bk-drag-reduce-fill', { disabled: localVal.conditions.length < 2 }]"
                            @click="handleDel(index)">
                        </i>
                    </div>
                </div>
            </div>
        </div>
    </bk-dialog>
</template>
<script>
    import cloneDeep from 'lodash.clonedeep'
    import defaultValue from './default-value.vue'

    export default {
        name: 'condition-edit',
        components: {
            defaultValue
        },
        props: {
            show: Boolean,
            title: String,
            disabled: Boolean,
            field: Object,
            config: {
                type: Object,
                default: () => ({
                    logic: 'AND',
                    conditions: []
                })
            }
        },
        data () {
            return {
                localVal: {
                    logic: 'AND',
                    conditions: []
                },
                fieldsLoading: false,
                fields: []
            }
        },
        watch: {
            show (val) {
                if (val) {
                    this.localVal = this.config.conditions.length > 0 ? cloneDeep(this.config) : { logic: 'AND', conditions: [{ key: '', condition: '', value: '' }] }
                }
            }
        },
        methods: {
            getConditionOptions (key) {
                if (key) {
                    const field = this.fields.find(i => i.key === key)
                    return field ? this.getFieldConditions(field.type) : []
                }
                return []
            },
            getFieldConditions (type) {
                if (['input', 'textarea', 'date', 'datetime', 'select', 'multiple-select', 'member', 'members', 'rich-text', 'description', 'link'].includes(type)) {
                    return [
                        { id: '==', name: window.i18n.t('等于') },
                        { id: 'in', name: '包含' }
                    ]
                }
                return [
                    { id: '==', name: window.i18n.t('等于') },
                    { id: '>', name: window.i18n.t('大于') },
                    { id: '<', name: window.i18n.t('小于') },
                    { id: '>=', name: window.i18n.t('大于等于') },
                    { id: '<=', name: window.i18n.t('小于等于') }
                ]
            },
            handleSelectField () {},
            handleSelectCondition () {},
            handleValChange () {},
            handleAdd (index) {
                console.log(index)
                this.localVal.conditions.splice(index, 0, { key: '', condition: '', value: '' })
            },
            handleDel (index) {
                if (this.localVal.conditions.length > 1) {
                    this.localVal.conditions.splice(index, 1)
                }
            },
            validate () {},
            handleConfirm () {},
            handleClose () {
                this.$emit('update:show', false)
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .logic-rule {
        display: flex;
        align-items: center;
        height: 20px;
        & > label {
            position: relative;
            margin-right: 30px;
            color: #63656e;
            font-size: 14px;
            white-space: nowrap;
        }
    }
    .condition-list {
        margin-top: 20px;
    }
    .condition-item {
        position: relative;
        margin-top: 10px;
        padding-right: 50px;
    }
    .condition-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .operate-btns {
        position: absolute;
        top: 50%;
        right: 0;
        transform: translateY(-50%);
        width: 40px;
        i {
            margin-right: 4px;
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
    /deep/ .bk-form-radio {
        margin-right: 24px;
    }
</style>
