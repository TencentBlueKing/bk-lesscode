<template>
    <edit-dynamic-object
        ref="editObjectRef"
        :disable-edit-root="true"
        :param="{ a: [{ c: 2 }] }"
    />
</template>

<script>
    import {
        defineComponent,
        computed
    } from '@vue/composition-api'
    import EditDynamicObject from './edit-dynamic-object/index.vue'
    import useForm from './use-form'
    import {
        METHODS_WITHOUT_DATA
    } from 'shared/api'

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

            const paramKey = computed(() => {
                if (METHODS_WITHOUT_DATA.includes(props.formData.method)) {
                    return 'query'
                } else {
                    return 'body'
                }
            })

            const validate = () => {
                return editObjectRef.value.validate().then((jsonScheme) => {
                    return {
                        [paramKey.value]: jsonScheme
                    }
                })
            }

            return {
                editObjectRef,
                paramKey,
                update,
                validate
            }
        }
    })
</script>

<style lang="postcss" scoped>
    
</style>
