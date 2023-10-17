<template>
    <setter-form-item title="填写说明">
        <bk-input type="textarea" :value="value" @change="$emit('change', $event)" />
    </setter-form-item>
</template>
<script>
    import setterFormItem from '../../common/setter-form-item.vue'

    export default {
        name: 'setter-label-tips',
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
