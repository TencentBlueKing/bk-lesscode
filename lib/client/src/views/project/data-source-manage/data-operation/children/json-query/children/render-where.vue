<template>
    <select-enable
        title="WHERE"
        :enable="!!renderQueryWhere"
        @add="handleAdd"
    >
        <select-wrapper
            @delete="handleChange(undefined)"
        >
            <select-condition
                :condition-list="renderQueryWhere"
                :table-list="tableList"
                @change="handleChange"
            ></select-condition>
        </select-wrapper>
    </select-enable>
</template>

<script lang="ts">
    import {
        defineComponent,
        ref,
        watch
    } from '@vue/composition-api'
    import SelectEnable from './common/select-enable.vue'
    import SelectCondition from './common/select-condition.vue'
    import SelectWrapper from './common/select-wrapper.vue'
    import {
        getDefaultConnect
    } from 'shared/data-source'

    export default defineComponent({
        components: {
            SelectEnable,
            SelectCondition,
            SelectWrapper
        },

        props: {
            queryWhere: Array,
            tableList: Array
        },

        setup (props, { emit }) {
            const renderQueryWhere = ref()

            const handleAdd = () => {
                renderQueryWhere.value = [getDefaultConnect()]
                triggleUpdate()
            }

            const handleChange = (val) => {
                renderQueryWhere.value = val
                triggleUpdate()
            }

            const triggleUpdate = () => {
                emit('change', renderQueryWhere.value)
            }

            watch(
                () => props.queryWhere,
                () => {
                    renderQueryWhere.value = props.queryWhere
                },
                {
                    immediate: true
                }
            )

            return {
                renderQueryWhere,
                handleAdd,
                handleChange
            }
        }
    })
</script>
