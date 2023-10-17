<template>
    <setter-form-item title="默认值">
        <default-value :key="field.id" :field="field" :value="value" @change="$emit('change', $event)" />
    </setter-form-item>
</template>
<script>
    import setterFormItem from '../../common/setter-form-item.vue'
    import defaultValue from '../../common/default-value.vue'

    export default {
        name: 'setter-value',
        components: {
            setterFormItem,
            defaultValue
        },
        props: {
            field: {
                type: Object,
                default: () => ({})
            },
            value: [String, Array, Number, Object]
        }
    }
</script>
