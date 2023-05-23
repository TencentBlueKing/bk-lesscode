<template>
    <section>
        <template v-for="key in keys">
            <div
                class="g-prop-sub-title g-mb6 g-mt8 subline"
                :key="key.id + 'label'"
                v-bk-tooltips="{
                    content: key.tips,
                    placements: ['left-start'],
                    boundary: 'window'
                }"
            >{{ key.label }}</div>
            <bk-select
                class="g-mb8 h32"
                :key="key.id"
                :value="value[key.id]"
                :loading="isLoading"
                @change="val => changeParams(key.id, val)"
            >
                <span
                    v-bk-overflow-tips="{ content: value[key.id] }"
                    class="display-value"
                    slot="trigger"
                >
                    {{ value[key.id] }}
                    <i class="bk-select-angle bk-icon icon-angle-down"></i>
                </span>
                <bk-option
                    v-for="option in options"
                    :key="option"
                    :id="option"
                    :name="option"
                />
            </bk-select>
        </template>
    </section>
</template>

<script lang="ts">
    import {
        defineComponent,
        PropType,
        watch,
        nextTick
    } from '@vue/composition-api'

    interface IKey {
        id: string;
        label: string;
        tips: string;
    }

    export default defineComponent({
        props: {
            keys: {
                type: Array as PropType<IKey[]>,
                default: () => ([])
            },
            options: {
                type: Array,
                default: () => ([])
            },
            isLoading: {
                type: Boolean,
                default: false
            },
            value: {
                type: Object,
                default: () => ({})
            },
            valueType: {
                type: String
            }
        },

        setup (props, { emit }) {
            const changeParams = (key, value) => {
                triggerUpdata({
                    ...props.value,
                    [key]: value
                })
            }

            const triggerUpdata = (val) => {
                emit('change', val)
            }

            watch(
                () => props.options,
                (options) => {
                    nextTick(() => {
                        let valueChanged = false
                        const value = Object.keys(props.value).reduce((acc, cur) => {
                            const val = props.value[cur]
                            if (options.includes(val)) {
                                acc[cur] = val
                            } else {
                                // 因数据变化导致值置空的情况，需要update
                                if (val) {
                                    valueChanged = true
                                }
                            }
                            return acc
                        }, {})
                        if (valueChanged) {
                            triggerUpdata(value)
                        }
                    })
                }
            )

            return {
                changeParams
            }
        }
    })
</script>

<style lang="postcss" scoped>
    @import "@/css/mixins/ellipsis";

    .subline {
        cursor: pointer;
        border-bottom: 1px dashed #63656E;
    }
    .h32 {
        height: 32px;
    }
    .display-value {
        @mixin ellipsis 100%, inline-block;
        line-height: 32px;
        padding: 0 36px 0 10px;
    }
</style>
