<template>
    <setter-form-item title="placeholder">
        <bk-input :value="value" @change="$emit('change', $event)" />
    </setter-form-item>
</template>
<script>
    import setterFormItem from '../../common/setter-form-item.vue'

    export default {
        name: 'setter-placeholder',
        components: {
            setterFormItem
        },
        props: {
            value: {
                type: String,
                default: ''
            }
        }
    }
</script>
