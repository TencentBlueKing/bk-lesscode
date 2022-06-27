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
                localValue: {}
            }
        },
        watch: {
            fields () {
                this.initFormValue()
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
            handleChange (key, value) {
                this.localValue[key] = value
                this.$emit('change', this.localValue)
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
