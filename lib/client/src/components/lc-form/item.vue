<template>
    <bk-form-item
        ref="bkFormItem"
        class="lc-form-item"
        v-bind="$attrs"
        v-on="$listeners">
        <slot />
    </bk-form-item>
</template>
<script>
    export default {
        name: 'LcFormItem',
        inheritAttrs: false,
        methods: {
            clearValidator () {
                this.$refs.bkFormItem.clearValidator()
            },
            validate () {
                return this.$refs.bkFormItem.validate()
            }
        }
    }
</script>
