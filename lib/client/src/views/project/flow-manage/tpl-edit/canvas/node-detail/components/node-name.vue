<template>
    <bk-form-item :label="$t('form_节点名称')" property="name" :required="true">
        <bk-input v-model="name" @change="change" />
    </bk-form-item>
</template>
<script>
    import { defineComponent, ref } from '@vue/composition-api'

    export default defineComponent({
        name: 'NodeName',
        props: {
            value: {
                type: String,
                default: ''
            }
        },
        setup (props, { emit }) {
            const name = ref(props.value)

            const change = () => {
                emit('change', name.value)
            }

            return {
                name,
                change
            }
        }
    })
</script>