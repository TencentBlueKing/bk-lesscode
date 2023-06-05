<template>
    <lc-form :label-width="180" :model="form" ref="funcForm" :form-type="formType" class="func-form-item" v-if="form.funcType === 1">
        <lc-form-item
            label="API Data"
            property="funcApiData"
            error-display-type="normal"
            :rules="[objRule]"
            :desc="{ width: 350, content: $t('HTTP 请求（例如 POST）的请求体数据包。如果是GET请求，请在 Api Url 中填写请求头参数') }">
            <bk-input
                type="textarea"
                :value="form.funcApiData"
                :rows="3"
                :maxlength="500"
                :disabled="disabled"
                :placeholder="$t('请输入请求体数据包，例如：{ name: {0}, age: 17 }', ['name'])"
                @input="(funcApiData) => updateValue({ funcApiData })">
            </bk-input>
        </lc-form-item>
    </lc-form>
</template>

<script>
    import mixins from './form-item-mixins'

    export default {
        mixins: [mixins],

        data () {
            return {
                objRule: {
                    validator: (val = '') => {
                        try {
                            const Fn = Function
                            const replaceVal = val.replace(/\{\{([^\}]+)\}\}/g, (all, code) => `this.${code}`)
                            const relVal = new Fn(`return ${replaceVal}`)()
                            const type = Object.prototype.toString.call(relVal)
                            return type === '[object Object]' || val === '' || this.form.funcType === 0
                        } catch (error) {
                            return false
                        }
                    },
                    message: this.$t('apiData需要是json格式的数据'),
                    trigger: 'blur'
                }
            }
        }
    }
</script>
