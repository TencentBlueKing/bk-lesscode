<template>
    <section class="computed-config">
        <setter-form-item title="计算公式">
            <bk-select></bk-select>
        </setter-form-item>
        <setter-form-item title="计算字段">
            <bk-select></bk-select>
        </setter-form-item>
    </section>
</template>
<script>
    import setterFormItem from '../../common/setter-form-item.vue'

    export default {
        name: 'computed-config',
        inheritAttrs: false,
        components: {
            setterFormItem
        },
        props: {
            field: {
                type: Object,
                default: () => ({})
            },
            disabled: Boolean,
            value: {
                type: Object
            }
        },
    }
</script>
