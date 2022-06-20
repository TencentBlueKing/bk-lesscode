<template>
    <edit-response-scheme
        ref="editObjectRef"
        :params="formData.response"
        @change="handleResponseChange"
    />
</template>

<script>
    import {
        defineComponent
    } from '@vue/composition-api'
    import EditResponseScheme from '@/components/api/edit-scheme/response'
    import useForm from './use-form'

    export default defineComponent({
        components: {
            EditResponseScheme
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

            const handleResponseChange = (val) => {
                emit('update', {
                    response: val
                })
            }

            return {
                editObjectRef,
                update,
                validate,
                handleResponseChange
            }
        }
    })
</script>

<style lang="postcss" scoped>
    
</style>
