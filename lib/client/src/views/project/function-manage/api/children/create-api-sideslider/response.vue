<template>
    <edit-dynamic-object
        ref="editObjectRef"
        :disable-edit-root="true"
        :param="{ a: [{ c: 2 }] }"
    />
</template>

<script>
    import {
        defineComponent
    } from '@vue/composition-api'
    import EditDynamicObject from './edit-dynamic-object/index.vue'
    import useForm from './use-form'

    export default defineComponent({
        components: {
            EditDynamicObject
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
