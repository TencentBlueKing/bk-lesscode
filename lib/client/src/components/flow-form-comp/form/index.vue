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
    import debounce from 'lodash.debounce'
    import { deepClone } from './util/index.js'
    import conditionMixins from './condition-mixins'
    import FieldFormItem from './fieldItem.vue'

    export default {
        name: 'FormFields',
        components: {
            FieldFormItem
        },
        mixins: [conditionMixins],
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
                localValue: this.getFieldsValue(this.fields)
            }
        },
        watch: {
            fields () {
                this.localValue = this.getFieldsValue()
            },
            value: {
                handler () {
                    this.localValue = this.getFieldsValue()
                },
                deep: true
            }
        },
        created () {
            this.handleParseCondition = debounce(this.parseFieldConditions, 300)
            this.handleParseCondition()
        },
        methods: {
            // 获取变量value，优先去props传入的value值，若没有则取默认值
            getFieldsValue () {
                const fieldsValue = {}
                this.fields.map((item) => {
                    if (item.key in this.value) {
                        fieldsValue[item.key] = deepClone(this.value[item.key])
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
                return fieldsValue
            },
            handleChange (key, value) {
                this.localValue[key] = value
                this.$emit('change', key, deepClone(this.localValue))
                this.handleParseCondition()
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
