<template>
    <use-post-scheme
        ref="paramRef"
        :params="renderBody"
        :disabled="disabled"
        :name-options="nameOptions"
        :variable-list="variableList"
        :function-list="functionList"
        :api-list="apiList"
        :render-slot="renderSlot"
        :get-param-val="getParamVal"
    >
        <template slot="tool">
            <slot></slot>
        </template>
    </use-post-scheme>
</template>

<script>
    import {
        defineComponent,
        ref,
        watch,
        h
    } from '@vue/composition-api'
    import {
        LCGetParamsVal,
        getDefaultApiUseScheme,
        API_PARAM_TYPES
    } from 'shared/api'
    import UsePostScheme from '@/components/api/use-scheme/post'
    import RenderParamSlot from './render-param-slot'

    export default defineComponent({
        components: {
            UsePostScheme
        },

        props: {
            body: Object,
            disabled: Boolean,
            nameOptions: Array,
            variableList: Array,
            functionList: Array,
            apiList: Array
        },

        setup (props, { emit }) {
            const renderBody = ref({})
            const paramRef = ref()

            const handleUpdate = (row, val) => {
                Object.assign(row, val)
                triggleChange()
            }

            const triggleChange = () => {
                emit('change', renderBody.value)
            }

            const renderSlot = (row) => {
                return RenderParamSlot.render(h, row, handleUpdate, props.variableList)
            }

            const getParamVal = LCGetParamsVal(props.variableList)

            const validate = () => {
                return paramRef.value.validate()
            }

            watch(
                () => props.body,
                () => {
                    renderBody.value = props.body
                    if (renderBody.value.name === undefined) {
                        renderBody.value = getDefaultApiUseScheme({
                            name: 'root',
                            type: API_PARAM_TYPES.OBJECT.VAL,
                            value: API_PARAM_TYPES.OBJECT.DEFAULT,
                            plusBrotherDisable: true
                        })
                    }
                },
                {
                    immediate: true
                }
            )

            return {
                renderBody,
                paramRef,
                renderSlot,
                handleUpdate,
                getParamVal,
                validate
            }
        }
    })
</script>
