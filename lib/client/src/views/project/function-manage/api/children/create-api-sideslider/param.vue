<template>
    <component
        ref="editObjectRef"
        :params="formData[paramKey]"
        :is="renderComponent"
        @change="handleParamsChange"
    />
</template>

<script>
    import {
        defineComponent,
        computed
    } from '@vue/composition-api'
    import {
        METHODS_WITHOUT_DATA
    } from 'shared/api'
    import useForm from './use-form'
    import EditGetScheme from '@/components/api/edit-scheme/get'
    import EditPostScheme from '@/components/api/edit-scheme/post'

    export default defineComponent({
        components: {
            EditGetScheme,
            EditPostScheme
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

            const renderComponent = computed(() => {
                if (METHODS_WITHOUT_DATA.includes(props.formData.method)) {
                    return 'EditGetScheme'
                } else {
                    return 'EditPostScheme'
                }
            })

            const validate = () => {
                return editObjectRef.value.validate().then((jsonScheme) => {
                    return {
                        [paramKey.value]: jsonScheme
                    }
                })
            }

            const handleParamsChange = (val) => {
                emit('update', {
                    [paramKey.value]: val
                })
            }

            return {
                editObjectRef,
                paramKey,
                renderComponent,
                update,
                validate,
                handleParamsChange
            }
        }
    })
</script>
