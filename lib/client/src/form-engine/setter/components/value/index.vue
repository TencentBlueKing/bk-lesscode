<template>
    <variable-select
        :options="formOptions"
        :value="formData"
        @change="handleVariableFormatChange">
        <template v-slot:title>
            <section class="bkform-engine-default-value-title">{{ $t('默认值') }}</section>
        </template>
        <default-value :key="field.id" :field="field" :disabled="disabled" :value="value" @change="handleValueChange" />
    </variable-select>
</template>
<script>
    import defaultValue from '../../common/default-value.vue'
    import VariableSelect from '@/components/variable/variable-select/index.vue'
    import { getFieldValType, getFieldDefaultVal } from '../../../utils/index'
    import { isLesscodeVarStr, getLesscodeVarCode } from '../../../../../../shared/util'

    export default {
        name: 'setter-value',
        inheritAttrs: false,
        components: {
            defaultValue,
            VariableSelect
        },
        props: {
            field: {
                type: Object,
                default: () => ({})
            },
            disabled: Boolean,
            value: [String, Array, Number, Object]
        },
        data () {
            return {
                formData: this.getFormData()
            }
        },
        computed: {
            formOptions () {
                return {
                    formatInclude: ['value', 'variable'],
                    valueTypeInclude: [getFieldValType(this.field.type)]
                }
            }
        },
        methods: {
            // 设置variable-select组件value初始值
            getFormData () {
                const isVarType = isLesscodeVarStr(this.value)
                const format = isVarType ? 'variable' : 'value'
                let code = ''
                if (isVarType) {
                    code = getLesscodeVarCode(this.value)
                }
                return {
                    format,
                    code,
                    renderValue: this.value,
                    valueType: getFieldValType(this.field.type)
                }
            },
            handleVariableFormatChange (variableSelectData) {
                let val
                if (variableSelectData.format === 'variable' && variableSelectData.code) {
                    val = `{{ bk_lesscode_${variableSelectData.code} }}`
                } else {
                    val = getFieldDefaultVal(this.field.type)
                }
                this.$emit('change', val)
            },
            handleValueChange (value) {
                this.$emit('change', value)
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .bkform-engine-default-value-title {
        margin: 6px 0;
        line-height: 20px;
        font-size: 12px;
        color: #63656e;
    }
</style>
