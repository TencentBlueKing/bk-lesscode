<template>
    <select-enable
        title="LIMIT"
        :enable="!!renderLimit"
        @add="handleInit"
    >
        <select-wrapper
            @delete="handleDelete"
        >
            <section class="limit-wrapper">
                <span class="limit-title">开始</span>
                <bk-input
                    class="limit-number"
                    type="number"
                    :value="renderLimit && renderLimit.index"
                    @change="(val) => handleChange(val, 'index')"
                ></bk-input>
            </section>
            <section class="limit-wrapper">
                <span class="limit-title">长度</span>
                <bk-input
                    class="limit-number"
                    type="number"
                    :value="renderLimit && renderLimit.length"
                    @change="(val) => handleChange(val, 'length')"
                ></bk-input>
            </section>
        </select-wrapper>
    </select-enable>
</template>

<script lang="ts">
    import SelectEnable from './common/select-enable.vue'
    import SelectWrapper from './common/select-wrapper.vue'
    import {
        defineComponent,
        ref,
        PropType,
        watch
    } from '@vue/composition-api'
    import {
        getDefaultLimit
    } from 'shared/data-source'

    interface ILimit {
        index: number,
        length: number
    }

    export default defineComponent({
        components: {
            SelectEnable,
            SelectWrapper
        },

        props: {
            queryLimit: Object as PropType<ILimit>
        },

        setup (props, { emit }) {
            const renderLimit = ref()

            const handleInit = () => {
                renderLimit.value = getDefaultLimit()
                triggleUpdate()
            }

            const handleDelete = () => {
                renderLimit.value = undefined
                triggleUpdate()
            }

            const handleChange = (val, key) => {
                renderLimit.value[key] = val
                triggleUpdate()
            }

            const triggleUpdate = () => {
                emit('change', renderLimit.value)
            }

            watch(
                () => props.queryLimit,
                () => {
                    renderLimit.value = props.queryLimit
                },
                {
                    immediate: true
                }
            )

            return {
                renderLimit,
                handleInit,
                handleDelete,
                handleChange
            }
        }
    })
</script>

<style lang="postcss" scoped>
    .limit-wrapper {
        margin: 8px 8px 8px 0;
        display: flex;
        align-items: center;
        width: calc(100% - 64px);
        max-width: 1722px;
        &:hover {
            .limit-title {
                background: #EAEBF0;
            }
        }
    }
    .limit-title {
        margin-left: -1px;
        display: inline-block;
        min-width: 65px;
        background: #F5F7FA;
        border: 1px solid #C4C6CC;
        border-radius: 2px 0 0 2px;
        line-height: 30px;
        font-size: 12px;
        padding: 0 12px;
        text-align: center;
    }
    .limit-number {
        left: -1px;
    }
</style>
