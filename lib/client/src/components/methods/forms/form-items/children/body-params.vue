<template>
    <use-post-scheme
        :params="renderBody"
        :disabled="disabled"
        :render-slot="renderSlot"
    >
    </use-post-scheme>
</template>

<script>
    import {
        defineComponent,
        ref,
        watch,
        h
    } from '@vue/composition-api'
    import UsePostScheme from '@/components/api/edit-scheme/post'
    import RenderParamSlot from './render-param-slot'

    export default defineComponent({
        components: {
            UsePostScheme
        },

        props: {
            body: Object,
            disabled: Boolean,
            variableList: Array
        },

        setup (props, { emit }) {
            const renderBody = ref({})

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

            watch(
                () => props.body,
                () => {
                    renderBody.value = props.body
                },
                {
                    immediate: true
                }
            )

            return {
                renderBody,
                renderSlot,
                handleUpdate
            }
        }
    })
</script>
