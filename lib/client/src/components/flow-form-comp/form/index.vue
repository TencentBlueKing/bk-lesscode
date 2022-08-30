<template>
    <div class="form-fields">
        <template v-for="field in fields">
            <field-form-item
                v-if="!field.isHide"
                :key="field.key"
                :field="field"
                :use-fixed-data-source="useFixedDataSource"
                :value="localValue[field.key]"
                @change="handleChange(field.key, $event)">
            </field-form-item>
        </template>
    </div>
</template>
<script>
    import { debounce, isEqual, cloneDeep } from 'lodash'
    import dayjs from 'dayjs'
    import conditionMixins from './condition-mixins'
    import FieldFormItem from './fieldItem.vue'

    export default {
        name: 'FormFields',
        components: {
            FieldFormItem
        },
        mixins: [conditionMixins],
        model: {
            prop: 'value',
            event: 'change'
        },
        props: {
            fields: {
                type: Array,
                default: () => []
            },
            useFixedDataSource: {
                type: Boolean,
                default: false
            },
            value: {
                type: Object,
                default: () => ({})
            }
        },
        data () {
            return {
                fieldsCopy: cloneDeep(this.fields),
                localValue: {}
            }
        },
        watch: {
            fields (val) {
                this.initFormValue()
                this.fieldsCopy = cloneDeep(val)
            },
            value (val, oldVal) {
                if (!isEqual(val, oldVal)) {
                    this.initFormValue()
                }
            }
        },
        created () {
            this.initFormValue()
            this.parseFieldConditions()
            this.parseAssociationValRules()
            // 解析字段显隐、必填、只读条件
            this.handleParseCondition = debounce(this.parseFieldConditions, 300)
            // 解析值联动规则
            this.handleParseAssociation = debounce(this.parseAssociationValRules, 300)
        },
        methods: {
            // 获取变量value，优先取props传入的value值，若没有则取默认值
            initFormValue () {
                const fieldsValue = {}
                const fieldsWithRules = []
                this.fields.forEach((item) => {
                    let value
                    if (item.key in this.value) {
                        value = cloneDeep(this.value[item.key])
                    } else if ('default' in item) {
                        if (['MULTISELECT', 'CHECKBOX', 'MEMBER', 'MEMBERS', 'TABLE', 'IMAGE', 'FILE'].includes(item.type)) {
                            value = item.default ? item.default.split(',') : []
                        } else {
                            value = item.default
                        }
                    }
                    if (item.meta.default_val_config) {
                        fieldsWithRules.push(item)
                    }
                    fieldsValue[item.key] = value
                })
                this.localValue = fieldsValue
                fieldsWithRules.forEach(async field => {
                    const { type, rules, end_value: endValue, can_modify: canModify } = field.meta.default_val_config
                    if (type === 'currentTable') {
                        const rule = this.getFulfillAssociationRule(rules)
                        if (rule) {
                            const value = rule.target.type === 'CONST' ? rule.target.value : this.localValue[rule.target.value]
                            this.localValue[field.key] = value
                        } else {
                            this.localValue[field.key] = endValue
                        }
                    } else if (type === 'otherTable') {
                        const res = await this.getAssociationFilterData(field.key)
                        if (res.data.list.length === 1) {
                            this.localValue[field.key] = res.data.list[0][rules[0].target.value]
                        } else {
                            this.localValue[field.key] = endValue
                        }
                    } else if (type === 'createTicketTime') {
                        this.localValue[field.key] = field.type === 'DATE' ? dayjs().format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD HH:mm:ss')
                    }
                    if (!canModify) {
                        field.is_readonly = true
                    }
                })
                this.$emit('change', this.localValue)
            },
            // 解析是否有表单依赖变化的表单项，如果有则更新数据源配置，触发重新拉取数据逻辑
            parseDataSourceRelation (key, val) {
                this.fieldsCopy.forEach(field => {
                    if (field.meta?.data_config) {
                        let hasRelated = false
                        const { conditions } = cloneDeep(field.meta.data_config)
                        conditions.expressions.forEach(exp => {
                            if (exp.type === 'field' && exp.value === key) {
                                exp.value = val
                                exp.type = 'const'
                                hasRelated = true
                            }
                        })
                        if (hasRelated) {
                            const dataConfig = { ...field.meta.data_config, conditions }
                            const relatedField = this.fields.find(item => item.key === field.key)
                            this.$set(relatedField.meta, 'data_config', dataConfig)
                        }
                    }
                })
            },
            // 解析表单字段间的默认值联动
            parseAssociationValRules (key) {
                const associatedFields = this.getValAssociatedFields(key)
                associatedFields.forEach(async field => {
                    const { type, rules } = field.meta.default_val_config
                    if (type === 'currentTable') {
                        const rule = this.getFulfillAssociationRule(rules)
                        console.log(rule)
                        if (rule) {
                            const value = rule.target.type === 'CONST' ? rule.target.value : this.localValue[rule.target.value]
                            this.localValue[field.key] = value
                        }
                    } else {
                        const res = await this.getAssociationFilterData(field.key)
                        if (res.data.list.length === 1) {
                            this.localValue[field.key] = res.data.list[0][rules[0].target.value]
                        }
                    }
                })
            },
            // 获取关联规则中包含当前字段key的字段列表
            getValAssociatedFields (key) {
                return this.fields.filter(field => {
                    if (field.meta.default_val_config) {
                        const { type, rules } = field.meta.default_val_config
                        return rules.some(group => {
                            return group.relations.find(item => {
                                if (type === 'currentTable') {
                                    return item.field === key
                                } else {
                                    return item.type === 'VAR' && item.value === key
                                }
                            })
                        })
                    }
                })
            },
            // 获取当前表单满足联动规则设置的生效规则项
            getFulfillAssociationRule (rules) {
                let fulfillRule = null
                rules.forEach(group => {
                    const isfullFill = group.relations.every(relation => {
                        const { field: relFieldKey, type, value } = relation
                        if (!(relFieldKey in this.localValue)) {
                            return
                        }
                        if (type === 'CONST') {
                            return isEqual(this.localValue[relFieldKey], value)
                        } else {
                            return value in this.localValue && isEqual(this.localValue[relFieldKey], this.localValue[value])
                        }
                    })
                    if (isfullFill) {
                        fulfillRule = group
                    }
                })
                return fulfillRule
            },
            // 获取关联他表字段的筛选数据
            getAssociationFilterData (key) {
                const field = this.fieldsCopy.find(item => item.key === key)
                const { tableName, rules } = field.meta.default_val_config
                const query = {}
                rules[0].relations.forEach(item => {
                    const val = item.type === 'CONST' ? item.value : this.localValue[item.value]
                    query[item.field] = val
                })
                const params = {
                    fields: [rules[0].target.value, 'id'],
                    query
                }
                return this.$http.post(`/nocode/filterTableData/keys/tableName/${tableName}`, params)
            },
            handleChange (key, value) {
                this.localValue[key] = value
                this.$emit('change', this.localValue)
                this.handleParseCondition()
                this.parseDataSourceRelation(key, value)
                this.handleParseAssociation(key)
            }
        }
    }
</script>
<style lang="postcss" scoped>
.form-fields{
  display: flex;
  flex-wrap: wrap;
}
</style>
