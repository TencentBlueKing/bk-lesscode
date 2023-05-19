<template>
    <lc-form :label-width="$store.state.Language === 'en' ? 195 : 180" :model="form" ref="funcForm" :form-type="formType" class="func-form-item">
        <lc-form-item
            :label="$t('form_函数简介')"
            property="funcSummary"
            error-display-type="normal"
            :rules="[summaryRule]"
        >
            <bk-input
                type="textarea"
                :placeholder="$t('请输入函数简介')"
                :rows="3"
                :maxlength="100"
                :disabled="disabled"
                :value="form.funcSummary"
                @input="(funcSummary) => updateValue({ funcSummary })">
            </bk-input>
        </lc-form-item>
    </lc-form>
</template>

<script>
    import mixins from './form-item-mixins'

    export default {
        mixins: [mixins],

        props: {
            requireSummary: {
                type: Boolean,
                default: false
            }
        },

        data () {
            return {
                summaryRule: {
                    validator: (val) => (!this.requireSummary || !['', undefined, null].includes(val)),
                    message: this.$t('函数简介必填'),
                    trigger: 'blur'
                }
            }
        }
    }
</script>
