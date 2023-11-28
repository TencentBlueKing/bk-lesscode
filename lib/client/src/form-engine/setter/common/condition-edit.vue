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
        @cancel="close">
        <div class="condition-edit-dialog">
            <div class="logic-rule">
                <label>{{$t('字段间关系')}}</label>
                <bk-radio-group v-model="localVal.logic">
                    <bk-radio value="and" :disabled="disabled">{{$t('且')}}</bk-radio>
                    <bk-radio value="or" :disabled="disabled">{{ $t('或')}}</bk-radio>
                </bk-radio-group>
            </div>
            <div class="condition-list">
                <div v-for="(condition, index) in localVal.conditions" class="condition-item" :key="index">
                    <div class="condition-content">
                        <!-- 选择字段 -->
                        <bk-select
                            v-model="condition.key"
                            style="width: 30%; margin-right: 8px"
                            :clearable="false"
                            :disabled="disabled"
                            @change="handleFieldChange(condition)">
                            <bk-option v-for="field in fieldList" :key="field.key" :id="field.key" :name="field.name"></bk-option>
                        </bk-select>
                        <!-- 选择逻辑关系 -->
                        <bk-select
                            v-model="condition.logic"
                            style="width: 30%; margin-right: 8px"
                            :clearable="false"
                            :disabled="disabled">
                            <bk-option
                                v-for="field in getConditionOptions(condition.key)"
                                :key="field.id"
                                :id="field.id"
                                :name="field.name">
                            </bk-option>
                        </bk-select>
                        <!-- 条件值 -->
                        <field-value
                            style="width: 40%"
                            :field="getField(condition.key)"
                            :value="condition.value"
                            @change="condition.value = $event" />
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
    import fieldValue from './default-value.vue'

    export default {
        name: 'condition-edit',
        components: {
            fieldValue
        },
        props: {
            show: Boolean,
            title: String,
            disabled: Boolean,
            list: {
                type: Array,
                default: () => []
            },
            field: Object,
            config: {
                type: Object,
                default: () => ({
                    logic: 'and',
                    conditions: []
                })
            }
        },
        data () {
            return {
                localVal: {
                    logic: 'and',
                    conditions: []
                },
                fieldList: []
            }
        },
        watch: {
            show (val) {
                if (val) {
                    this.localVal = this.config.conditions.length > 0 ? cloneDeep(this.config) : { logic: 'and', conditions: [{ key: '', logic: '', value: '' }] }
                    this.fieldList = this.list.filter(item => item.id !== this.field.id).map(item => {
                        const { key, name } = item.configure
                        return { key, name: name || key, type: item.type }
                    })
                }
            }
        },
        methods: {
            getConditionOptions (key) {
                if (key) {
                    const field = this.fieldList.find(i => i.key === key)
                    return field ? this.getFieldConditions(field.type) : []
                }
                return []
            },
            getFieldConditions (type) {
                if (['input', 'textarea', 'date', 'datetime', 'select', 'multiple-select', 'member', 'members', 'rich-text', 'description', 'link'].includes(type)) {
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
            },
            getField (key) {
                if (key) {
                    const field = this.list.find(item => item.configure.key === key)
                    if (field) {
                        return field
                    }
                }
                return {}
            },
            handleFieldChange (condition) {
                condition.logic = ''
                condition.value = ''
            },
            handleAdd (index) {
                this.localVal.conditions.splice(index + 1, 0, { key: '', logic: '', value: '' })
            },
            handleDel (index) {
                if (this.localVal.conditions.length > 1) {
                    this.localVal.conditions.splice(index, 1)
                }
            },
            handleConfirm () {
                this.$emit('change', this.localVal)
                this.close()
            },
            close () {
                this.$emit('update:show', false)
            }
        }
    }
</script>
<style lang="postcss" scoped>
    @import "@/css/mixins/scroller";

    .condition-edit-dialog {
        position: relative;
        padding: 16px 0;
        background: #fafbfd;
        border: 1px solid #dcdee5;
    }
    .logic-rule {
        display: flex;
        align-items: center;
        padding: 0 16px;
        height: 20px;
        & > label {
            position: relative;
            margin-right: 30px;
            color: #63656e;
            font-size: 12px;
            white-space: nowrap;
        }
        /deep/ {
            .bk-radio-text {
                font-size: 12px;
            }
        }
    }
    .condition-list {
        margin-top: 12px;
        padding: 0 16px;
        max-height: 330px;
        overflow: auto;
        @mixin scroller;
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
    /deep/ {
        .bk-form-radio {
            margin-right: 24px;
        }
        .bk-select {
            background: #ffffff;
        }
    }
</style>
