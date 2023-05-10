<template>
    <section class="query-main">
        <select-type
            class="join-type"
            :disable="true"
        >
            <span
                class="join-type-trigger"
                slot="dropdown-trigger"
            >
                {{ title }}
            </span>
        </select-type>
        <slot v-if="enable"></slot>
        <bk-link
            v-else
            class="g-small-link enable-setting"
            theme="primary"
            icon="bk-drag-icon bk-drag-plus-circle"
            @click="changeEnable"
        >{{ $t('添加') }}</bk-link>
    </section>
</template>

<script>
    import {
        defineComponent
    } from '@vue/composition-api'
    import SelectType from './select-type.vue'

    export default defineComponent({
        components: {
            SelectType
        },

        props: {
            enable: Boolean,
            title: String
        },

        emits: ['add'],

        setup (_, { emit }) {
            const changeEnable = () => {
                emit('add')
            }

            return {
                changeEnable
            }
        }
    })
</script>

<style lang="postcss" scoped>
    .query-main {
        padding: 0 50px 0 150px;
        position: relative;
        min-height: 48px;
    }
    .join-type {
        position: absolute;
        top: 8px;
        left: 40px;
    }
    .join-type-trigger {
        display: inline-block;
        cursor: pointer;
        background: #FFFFFF !important;
        border: 1px solid #C4C6CC;
        border-radius: 2px;
        color: #3A84FF;
        line-height: 30px;
        padding: 0 12px;
        font-weight: 600;
        width: 100px;
        text-align: center;
    }
    .enable-setting {
        min-height: 48px;
    }
</style>
