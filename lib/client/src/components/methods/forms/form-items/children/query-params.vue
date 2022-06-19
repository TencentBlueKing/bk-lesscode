<template>
    <use-get-scheme
        :params="renderQuery"
        :disabled="disabled"
        :render-slot="renderSlot"
    >
    </use-get-scheme>
</template>

<script>
    import {
        defineComponent,
        ref,
        watch,
        h
    } from '@vue/composition-api'
    import UseGetScheme from '@/components/api/edit-scheme/get'
    import RenderParamSlot from './render-param-slot'

    export default defineComponent({
        components: {
            UseGetScheme
        },

        props: {
            query: Array,
            disabled: Boolean,
            variableList: Array
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

            watch(
                () => props.query,
                () => {
                    renderQuery.value = props.query
                },
                {
                    immediate: true
                }
            )

            return {
                renderQuery,
                handleUpdate,
                renderSlot
            }
        }
    })
</script>
