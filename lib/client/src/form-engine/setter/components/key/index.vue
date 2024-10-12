<template>
    <setter-form-item :title="$t('form_唯一标识')">
        <bk-input
            :value="value"
            :disabled="disabled || !field.unsaved"
            @change="$emit('change', $event)" />
    </setter-form-item>
</template>
<script>
    import setterFormItem from '../../common/setter-form-item.vue'

    export default {
        name: 'setter-key',
        inheritAttrs: false,
        components: {
            setterFormItem
        },
        props: {
            disabled: Boolean,
            field: {
                type: Object,
                default: () => ({})
            },
            value: {
                type: String,
                default: ''
            }
        }
    }
</script>
