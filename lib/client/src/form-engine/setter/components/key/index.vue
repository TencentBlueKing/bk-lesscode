<template>
    <setter-form-item title="唯一标识">
        <bk-input :value="value" @change="$emit('change', $event)" />
    </setter-form-item>
</template>
<script>
    import setterFormItem from '../../common/setter-form-item.vue'

    export default {
        name: 'setter-key',
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
