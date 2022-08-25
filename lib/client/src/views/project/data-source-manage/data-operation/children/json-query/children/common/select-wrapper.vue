<template>
    <section class="wrapper-main">
        <slot></slot>
        <i
            v-if="showDelete"
            class="bk-drag-icon bk-drag-delet"
            @click="handleDelete"
        ></i>
    </section>
</template>

<script lang="ts">
    import {
        defineComponent
    } from '@vue/composition-api'

    export default defineComponent({
        props: {
            showDelete: {
                type: Boolean,
                default: true
            }
        },

        setup (_, { emit }) {
            const handleDelete = () => {
                emit('delete')
            }

            return {
                handleDelete
            }
        }
    })
</script>

<style lang="postcss" scoped>
    .wrapper-main {
        position: relative;
        background: #F5F7FA;
        border-radius: 2px;
        padding: 0 8px;
        &:hover {
            background: #EAEBF0;
            .bk-drag-delet {
                display: block;
            }
        }
        &:before, &:after {
            content: '';
            display: table;
            clear: both;
        }
    }
    .bk-drag-delet {
        display: none;
        position: absolute;
        right: 9px;
        top: 9px;
        cursor: pointer;
        &:hover {
            color: #EA3636;
        }
    }
</style>
