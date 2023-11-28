<template>
    <setter-form-item :title="$t('form_填写说明')">
        <bk-input type="textarea" :disabled="disabled" :value="value" @change="$emit('change', $event)" />
    </setter-form-item>
</template>
<script>
    import setterFormItem from '../../common/setter-form-item.vue'

    export default {
        name: 'setter-label-tips',
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
        }
    }
</script>
