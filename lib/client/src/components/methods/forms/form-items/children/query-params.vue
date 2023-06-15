<template>
    <use-get-scheme
        :params="renderQuery"
        :disabled="disabled"
        :name-options="nameOptions"
        :render-slot="renderSlot"
        :get-param-val="getParamVal"
    />
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
            variableList: Array,
            nameOptions: Array
        },

        setup (props, { emit }) {
            const renderQuery = ref([])

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
                handleUpdate,
                renderSlot,
                getParamVal
            }
        }
    })
</script>
