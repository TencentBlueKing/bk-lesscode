<template>
    <lc-form :label-width="180" :model="form" ref="funcForm" :form-type="formType">
        <lc-form-item
            :label="$t('form_函数名称')"
            property="funcName"
            error-display-type="normal"
            :required="true"
            :rules="[requireRule($t('form_函数名称')), nameRepeatRule, groupNameRule]">
            <bk-input
                :placeholder="$t('由大小写英文字母、数字组成，开头和结尾还可以是下划线，且必须符合驼峰命名规范')"
                :disabled="disabled"
                :value="form.funcName"
                @input="(funcName) => updateValue({ funcName })"
            >
            </bk-input>
        </lc-form-item>
    </lc-form>
</template>

<script>
    import mixins from './form-item-mixins'

    export default {
        mixins: [mixins],

        props: {
            functionList: {
                type: Array,
                default: () => ([])
            }
        },

        data () {
            return {
                nameRepeatRule: {
                    validator: (val) => {
                        return !this.functionList.find((func) => (func.funcName === val && func.id !== this.form.id))
                    },
                    message: this.$t('函数名称在当前应用下重复，请修改后重试'),
                    trigger: 'blur'
                },
                groupNameRule: {
                    validator: val => /^[A-Za-z_][A-Za-z0-9]*[A-Za-z_]?$/.test(val),
                    message: this.$t('由大小写英文字母、数字组成，开头和结尾还可以是下划线，且必须符合驼峰命名规范'),
                    trigger: 'blur'
                }
            }
        }
    }
</script>
