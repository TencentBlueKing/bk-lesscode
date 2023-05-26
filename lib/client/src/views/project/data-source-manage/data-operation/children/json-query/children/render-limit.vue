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
                <span class="limit-title">{{ $t('开始') }}</span>
                <select-value
                    class="limit-number"
                    :value="renderLimit && renderLimit.index"
                    :param="renderLimit && renderLimit.indexParam"
                    @change="(val) => handleChange(val, 'index')"
                />
            </section>
            <section class="limit-wrapper">
                <span class="limit-title">{{ $t('长度') }}</span>
                <select-value
                    class="limit-number"
                    :value="renderLimit && renderLimit.length"
                    :param="renderLimit && renderLimit.lengthParam"
                    @change="(val) => handleChange(val, 'length')"
                />
            </section>
        </select-wrapper>
    </select-enable>
</template>

<script lang="ts">
    import SelectEnable from './common/select-enable.vue'
    import SelectWrapper from './common/select-wrapper.vue'
    import SelectValue from './common/select-value.vue'
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
            SelectWrapper,
            SelectValue
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
                if (key === 'index') {
                    renderLimit.value.index = val.value
                    renderLimit.value.indexParam = val.param
                } else {
                    renderLimit.value.length = val.value
                    renderLimit.value.lengthParam = val.param
                }
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
        margin-left: -2px;
        flex: 1;
    }
</style>
