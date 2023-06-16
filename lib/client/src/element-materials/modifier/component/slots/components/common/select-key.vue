<template>
    <section>
        <div
            class="g-prop-sub-title g-mb4 select-key"
        >
            <span
                class="subline"
                v-bk-tooltips="{
                    content: $t('可以设置字段的映射关系，来做数据转换。注意：值改变下拉选项会自动改变'),
                    placements: ['left-start'],
                    boundary: 'window'
                }"
            >
                {{ $t('字段映射') }}
            </span>
        </div>
        <template v-for="key in keys">
            <div
                class="g-prop-sub-title g-mb4 g-mt8 subline"
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
                :value="valueKeys[key.id]"
                :loading="isLoading"
                @change="val => changeParams(key.id, val)"
            >
                <span
                    v-bk-overflow-tips="{ content: valueKeys[key.id] }"
                    class="display-value"
                    slot="trigger"
                >
                    {{ valueKeys[key.id] }}
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
        ref,
        watch,
        nextTick
    } from '@vue/composition-api'
    import store from '@/store'

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
            value: {
                type: Array,
                default: () => ([])
            },
            isLoading: {
                type: Boolean,
                default: false
            },
            valueKeys: {
                type: Object,
                default: () => ({})
            },
            valueType: {
                type: String
            },
            payload: {
                type: Object
            }
        },

        setup (props, { emit }) {
            const options = ref([])

            const changeParams = (key, value) => {
                triggerUpdata({
                    ...props.valueKeys,
                    [key]: value
                })
            }

            const triggerUpdata = (val) => {
                emit('change', val)
            }

            watch(
                [
                    () => props.value,
                    () => props.valueType,
                    () => props.payload
                ],
                () => {
                    options.value = Object.keys(props.value?.[0] || {})
                    // 数据源
                    if (props.valueType.includes('data-source') && props.payload?.sourceData?.dataSourceType === 'preview') {
                        const tables = store.state?.dataSource?.tableList || []
                        const table = tables.find(table => table.tableName === props.payload.sourceData.tableName)
                        options.value = table.columns.map(column => column.name)
                    }
                    // 选项变了以后，要清空列表没有的数据
                    nextTick(() => {
                        let valueChanged = false
                        const value = Object.keys(props.valueKeys).reduce((acc, cur) => {
                            const val = props.valueKeys[cur]
                            if (options.value.includes(val)) {
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
                },
                {
                    immediate: true,
                    deep: true
                }
            )

            return {
                options,
                changeParams
            }
        }
    })
</script>

<style lang="postcss" scoped>
    @import "@/css/mixins/ellipsis";
    .select-key {
        display: block;
        margin-top: 14px;
    }
    .inline-block {
        display: inline-block;
    }
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
