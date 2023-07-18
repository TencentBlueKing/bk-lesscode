<template>
    <edit-header-scheme
        ref="editObjectRef"
        :params="renderParams"
        :variable-list="variableList"
        :function-list="functionList"
        :api-list="apiList"
        @change="handleParamsChange"
    />
</template>

<script>
    import {
        defineComponent,
        ref,
        watch
    } from '@vue/composition-api'
    import {
        getDefaultApiEditScheme
    } from 'shared/api'
    import useForm from './use-form'
    import EditHeaderScheme from '@/components/api/edit-scheme/header.vue'

    export default defineComponent({
        components: {
            EditHeaderScheme
        },

        props: {
            formData: Object,
            variableList: Array,
            functionList: Array,
            apiList: Array
        },

        setup (props, { emit }) {
            const {
                editObjectRef,
                update
            } = useForm(emit)
            const renderParams = ref()

            const validate = () => {
                return editObjectRef.value.validate().then((jsonScheme) => {
                    return {
                        header: jsonScheme
                    }
                })
            }

            const handleParamsChange = (val) => {
                emit('update', {
                    header: val
                })
            }

            const initParam = () => {
                renderParams.value = props.formData.header
                if (renderParams.value.length <= 0) {
                    renderParams.value.push(getDefaultApiEditScheme())
                }
            }

            watch(
                () => props.formData.header,
                () => {
                    initParam()
                },
                {
                    immediate: true
                }
            )

            return {
                editObjectRef,
                renderParams,
                update,
                validate,
                handleParamsChange
            }
        }
    })
</script>
