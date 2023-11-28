<template>
    <setter-form-item title="placeholder">
        <bk-input :disabled="disabled" :value="value" @change="$emit('change', $event)" />
    </setter-form-item>
</template>
<script>
    import setterFormItem from '../../common/setter-form-item.vue'

    export default {
        name: 'setter-placeholder',
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
