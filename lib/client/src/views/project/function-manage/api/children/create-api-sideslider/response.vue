<template>
    <edit-dynamic-data
        ref="editObjectRef"
        :disable-edit-root="true"
        :param="formData.response"
    />
</template>

<script>
    import {
        defineComponent
    } from '@vue/composition-api'
    import EditDynamicData from './edit-dynamic-data/index.vue'
    import useForm from './use-form'

    export default defineComponent({
        components: {
            EditDynamicData
        },

        props: {
            formData: Object
        },

        setup (props, { emit }) {
            const {
                editObjectRef,
                update
            } = useForm(emit)

            const validate = () => {
                return editObjectRef.value.validate().then((jsonScheme) => {
                    return {
                        response: jsonScheme
                    }
                })
            }

            return {
                editObjectRef,
                update,
                validate
            }
        }
    })
</script>

<style lang="postcss" scoped>
    
</style>
