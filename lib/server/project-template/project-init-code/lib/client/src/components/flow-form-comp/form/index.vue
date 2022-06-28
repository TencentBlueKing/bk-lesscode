<template>
    <div class="form-fields">
        <template v-for="field in fields">
            <field-form-item
                v-if="field.show_type === 0"
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
            this.handleParseCondition = debounce(this.parseFieldConditions, 300)
            this.handleParseCondition()
        },
        methods: {
            // 获取变量value，优先去props传入的value值，若没有则取默认值
            initFormValue () {
                const fieldsValue = {}
                this.fields.map((item) => {
                    if (item.key in this.value) {
                        fieldsValue[item.key] = cloneDeep(this.value[item.key])
                    } else if ('default' in item) {
                        if (['MULTISELECT', 'CHECKBOX', 'MEMBER', 'MEMBERS', 'TABLE', 'IMAGE', 'FILE'].includes(item.type)) {
                            fieldsValue[item.key] = item.default ? item.default.split(',') : []
                        } else if (item.type === 'DATETIME' && item.default === 'curTime') {
                            fieldsValue[item.key] = JSON.stringify(this.$dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'))
                        } else {
                            fieldsValue[item.key] = item.default
                        }
                    }
                })
                this.localValue = fieldsValue
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
            handleChange (key, value) {
                this.localValue[key] = value
                this.$emit('change', this.localValue)
                this.handleParseCondition()
                this.parseDataSourceRelation(key, value)
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
