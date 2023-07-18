<template>
    <use-get-scheme
        ref="paramRef"
        :params="renderQuery"
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
    </use-get-scheme>
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
        getDefaultApiUseScheme
    } from 'shared/api'
    import UseGetScheme from '@/components/api/use-scheme/get'
    import RenderParamSlot from './render-param-slot'

    export default defineComponent({
        components: {
            UseGetScheme
        },

        props: {
            query: Array,
            disabled: Boolean,
            nameOptions: Array,
            variableList: Array,
            functionList: Array,
            apiList: Array
        },

        setup (props, { emit }) {
            const renderQuery = ref([])
            const paramRef = ref()

            const handleUpdate = (row, val) => {
                Object.assign(row, val)
                triggleChange()
            }

            const triggleChange = () => {
                emit('change', renderQuery.value)
            }

            const renderSlot = (row) => {
                return RenderParamSlot.render(h, row, handleUpdate, props.variableList)
            }

            const getParamVal = LCGetParamsVal(props.variableList)

            const validate = () => {
                return paramRef.value.validate()
            }

            watch(
                () => props.query,
                () => {
                    renderQuery.value = props.query
                    if (renderQuery.value.length <= 0) {
                        renderQuery.value.push(getDefaultApiUseScheme())
                    }
                },
                {
                    immediate: true
                }
            )

            return {
                renderQuery,
                paramRef,
                handleUpdate,
                renderSlot,
                getParamVal,
                validate
            }
        }
    })
</script>
