<template>
    <lc-form :label-width="180" :model="form" ref="funcForm" :form-type="formType" class="func-form-item">
        <lc-form-item
            :label="$t('form_函数标识')"
            :required="true"
            :rules="[requireRule($t('form_函数标识')), codeRepeatRule, codeRule, keyWordRule]"
            property="funcCode"
            error-display-type="normal">
            <bk-input
                :placeholder="$t('由大小写英文字母、下划线、数字组成')"
                :value="form.funcCode"
                :disabled="disabled"
                @input="(funcCode) => updateValue({ funcCode })">
            </bk-input>
        </lc-form-item>
    </lc-form>
</template>

<script>
    import mixins from './form-item-mixins'
    import { isJsKeyWord } from '@/common/util'

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
                codeRepeatRule: {
                    validator: (val) => {
                        return !this.functionList.find((func) => (func.funcCode === val && func.id !== this.form.id))
                    },
                    message: this.$t('函数标识在当前应用下重复，请修改后重试'),
                    trigger: 'blur'
                },
                codeRule: {
                    validator: (val) => /^[A-Za-z_0-9]*$/.test(val),
                    message: this.$t('由大小写英文字母、下划线、数字组成'),
                    trigger: 'blur'
                },
                keyWordRule: {
                    validator: (val) => !isJsKeyWord(val),
                    message: this.$t('函数标识不能是 JavaScript 保留字'),
                    trigger: 'blur'
                }
            }
        }
    }
</script>
