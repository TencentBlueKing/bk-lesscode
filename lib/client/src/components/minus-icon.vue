<template>
    <i
        class="bk-drag-icon bk-drag-reduce-fill"
        v-bk-tooltips="{
            content: tips,
            disabled: !tips,
            maxWidth: 400
        }"
        @click="handleClick"
    ></i>
</template>

<script lang="ts">
    import {
        defineComponent
    } from '@vue/composition-api'

    export default defineComponent({
        emits: ['click'],

        props: {
            tips: {
                type: String,
                default: ''
            }
        },

        setup (_, { emit }) {
            const handleClick = () => {
                emit('click')
            }

            return {
                handleClick
            }
        }
    })
</script>

<style lang="postcss" scoped>
    .bk-drag-icon {
        cursor: pointer;
        color: #C4C6CC;
        font-size: 14px;
        &:hover {
            color: #979BA5;
        }
    }
</style>
