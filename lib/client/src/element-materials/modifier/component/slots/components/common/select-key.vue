<template>
    <section>
        <template v-for="key in keys">
            <div
                class="g-prop-sub-title g-mb6 g-mt8 subline"
                :key="key.id + 'label'"
                v-bk-tooltips="{
                    content: $t(key.tips),
                    placements: ['left-start'],
                    boundary: 'window'
                }"
            >{{ $t(key.label) }}</div>
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
        getCurrentInstance
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
            const instance = getCurrentInstance()

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
                () => {
                    let value = props.keys.reduce((acc, cur) => {
                        acc[cur.id] = props.options.includes(props.value[cur.id]) && props.value[cur.id]
                            ? props.value[cur.id]
                            : props.options?.[0]
                        return acc
                    }, {})
                    // 未展示状态下，不需要设置key
                    if ((instance.proxy?.$el as HTMLElement)?.style?.display === 'none') {
                        value = {}
                    }
                    triggerUpdata(value)
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
