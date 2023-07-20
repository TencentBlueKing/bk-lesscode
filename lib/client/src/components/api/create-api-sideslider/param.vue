<template>
    <component
        ref="editObjectRef"
        :params="renderParams"
        :is="renderComponent"
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
        computed,
        watch
    } from '@vue/composition-api'
    import {
        METHODS_WITHOUT_DATA,
        getDefaultApiEditScheme,
        API_PARAM_TYPES
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

            const initQueryParam = () => {
                renderParams.value = props.formData.query
                if (renderParams.value.length <= 0) {
                    renderParams.value.push(getDefaultApiEditScheme())
                }
            }

            const initBodyParam = () => {
                renderParams.value = props.formData.body
                if (renderParams.value.name === undefined) {
                    renderParams.value = getDefaultApiEditScheme({
                        name: 'root',
                        type: API_PARAM_TYPES.OBJECT.VAL,
                        value: API_PARAM_TYPES.OBJECT.DEFAULT,
                        disable: true,
                        plusBrotherDisable: true
                    })
                }
            }

            watch(
                () => props.formData[paramKey.value],
                () => {
                    if (paramKey.value === 'query') {
                        initQueryParam()
                    } else {
                        initBodyParam()
                    }
                },
                {
                    immediate: true
                }
            )

            return {
                editObjectRef,
                renderParams,
                paramKey,
                renderComponent,
                update,
                validate,
                handleParamsChange
            }
        }
    })
</script>
