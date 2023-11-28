<template>
    <setter-form-item :title="$t('form_字段名称')">
        <bk-input v-model="locVal" :disabled="disabled" @change="$emit('change', $event)" @blur="handleBlur" />
    </setter-form-item>
</template>
<script>
    import setterFormItem from '../../common/setter-form-item.vue'

    export default {
        name: 'setter-name',
        inheritAttrs: false,
        components: {
            setterFormItem
        },
        props: {
            disabled: Boolean,
            value: {
                type: String,
                default: ''
            }
        },
        data () {
            return {
                locVal: this.value
            }
        },
        watch: {
            value (val) {
                this.locVal = val
            }
        },
        methods: {
            handleBlur () {
                if (!this.locVal) {
                    this.locVal = '字段名称'
                    this.$emit(change, this.locVal)
                }
            }
        }
    }
</script>
