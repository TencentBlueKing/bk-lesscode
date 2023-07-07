<template>
    <div class="form-fields">
        <template v-for="field in fields">
            <field-form-item
                v-if="!field.isHide"
                :key="field.key"
                :disabled="disabled"
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
    import { computDateDiff, computeNumberResult } from './util/index.js'
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
            },
            disabled: Boolean
        },
        data () {
            return {
                fieldsCopy: cloneDeep(this.fields),
                localValue: {},
                computeConfigFields: []
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
                this.computeConfigFields = []

                this.fields.forEach((item) => {
                    let value
                    if (item.key in this.value) {
                        // 复制一份表单字段的值
                        value = cloneDeep(this.value[item.key])
                    } else if ('default' in item) {
                        // 默认值
                        if (['MULTISELECT', 'CHECKBOX', 'MEMBER', 'MEMBERS', 'TABLE', 'IMAGE', 'FILE'].includes(item.type)) {
                            value = item.default ? item.default.split(',') : []
                        } else {
                            value = item.default
                        }
                    }
                    // 记录配置有关联规则的字段
                    if (item.meta.default_val_config) {
                        fieldsWithRules.push(item)
                    }
                    if (item.meta.compute_config_info) {
                        this.computeConfigFields.push(item)
                    }
                    // 隐藏自动编号字段
                    if (item.type === 'SERIAL') {
                        item.isHide = true
                    }
                    // 储存各个字段对应的初始值
                    fieldsValue[item.key] = value
                })
                this.localValue = fieldsValue
                // 遍历配置有关联规则的字段
                fieldsWithRules.forEach(async field => {
                    const { type, rules } = field.meta.default_val_config
                    if (type === 'currentTable') {
                        const rule = this.getFulfillAssociationRule(rules, field.type)
                        // 找到满足条件的规则,那规则赋值初始值
                        if (rule) {
                            const value = rule.target.type === 'CONST' ? rule.target.value : this.localValue[rule.target.value]
                            this.localValue[field.key] = value
                        }
                    } else if (type === 'otherTable') {
                        const res = await this.getAssociationFilterData(field.key)
                        if (res.data.list.length === 1) {
                            this.localValue[field.key] = res.data.list[0][rules[0].target.value]
                        }
                    } else if (type === 'createTicketTime') {
                        this.localValue[field.key] = field.type === 'DATE' ? dayjs().format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD HH:mm:ss')
                    }
                })
                this.$emit('change', this.localValue)
            },
            // 初始化计算组件数据
            initComputeData (computeConfigFields) {
                computeConfigFields.forEach((computeField) => {
                    this.localValue[computeField.key] = this.changeComputeDefalutValue(computeField)
                })
            },
            // 修改计算控件的值
            changeComputeDefalutValue (computeField) {
                const { type, dateTime, numberComput } = computeField.meta.compute_config_info
                if (type === 'dateTime') {
                    // 计算时间间隔
                    if (this.changeDateTime(dateTime)) {
                        return computDateDiff(computeField.meta.compute_config_info)
                    }
                    return computeField.default
                } else {
                    this.setBindFieldValue(numberComput)
                    return computeNumberResult(numberComput)
                }
            },
            // 修改日期计算组件的开始或结束日期的值
            changeDateTime (dateTime) {
                let isChange = false
                // 日期计算
                const dateKeys = ['creation_date', 'update_date', 'specify_date']
                const dateTimeKeys = ['startDate', 'endDate']
                dateTimeKeys.forEach((strItem) => {
                    const key = dateTime[strItem].key
                    if (!dateKeys.includes(key)) {
                        // 找到对应的日期字段的值
                        dateTime[strItem].value = this.localValue[key]
                        isChange = true
                    }
                })
                return isChange
            },
            // 设置绑定的字段值
            setBindFieldValue (numberComput) {
                let fieldsKey = 'computeFields'
                if (numberComput.formula === 'customize') {
                    fieldsKey = 'customizeFormula'
                }
                numberComput[fieldsKey] = numberComput[fieldsKey].map((item) => {
                    const key = item.key || item
                    return {
                        key,
                        value: this.localValue[key]
                    }
                })
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
                        // 获取每个字段的有效规则
                        const rule = this.getFulfillAssociationRule(rules, field.type)
                        if (rule) {
                            let value = null
                            if (field.type === 'RATE') {
                                // 遍历所有区间，看所绑定的字段值命中那个区间，评分组件的值就是该区间的值
                                rule.intervals.forEach((item) => {
                                    const triggerValue = this.localValue[key] * 1
                                    if ((item.min <= triggerValue) && triggerValue < item.max) {
                                        value = item.value
                                    }
                                })
                            } else {
                                value = rule.target.type === 'CONST' ? rule.target.value : this.localValue[rule.target.value]
                            }
                            this.localValue[field.key] = value
                        }
                    } else {
                        const res = await this.getAssociationFilterData(field.key)
                        if (res.data.list.length === 1) {
                            this.localValue[field.key] = res.data.list[0][rules[0].target.value]
                        }
                    }
                })
                this.initComputeData(this.computeConfigFields)
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
            getFulfillAssociationRule (rules, fieldType) {
                // 某个字段所配置的所有规则
                let fulfillRule = null
                rules.forEach(group => {
                    // 找出最后一条满足所有关联字段所设置条件的规则
                    const isfullFill = group.relations.every(relation => {
                        const { field: relFieldKey, type, value } = relation
                        // 如果是评分组件
                        if (fieldType === 'RATE') {
                            return this.getRateSatisfyIntervalRule(group, relation)
                        } else {
                            if (!(relFieldKey in this.localValue)) {
                                return
                            }
                            if (type === 'CONST') {
                                return isEqual(this.localValue[relFieldKey], value)
                            }
                            return value in this.localValue && isEqual(this.localValue[relFieldKey], this.localValue[value])
                        }
                    })
                    if (isfullFill) {
                        fulfillRule = group
                    }
                })
                return fulfillRule
            },
            // 获取当前满足评分组件的所设区间的规则
            getRateSatisfyIntervalRule (group, relation) {
                // 评分组件所绑定的字段默认为变量类型
                const relationValue = relation.type === 'CONST' ? (relation.value * 1) : this.localValue[relation.value] * 1
                const isContain = group.intervals.some((item) => {
                    return (item.min <= relationValue) && (relationValue < item.max)
                })
                return isContain
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
