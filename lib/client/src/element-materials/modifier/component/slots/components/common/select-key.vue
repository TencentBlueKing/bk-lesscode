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
                    boundary: 'window',
                    maxWidth: 400
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
                    boundary: 'window',
                    maxWidth: 400
                }"
            >{{ $t(key.label) }}</div>
            <bk-tag-input
                class="g-mb8 h32"
                trigger="focus"
                :max-data="1"
                :allow-create="true"
                :key="key.id"
                :value="[valueKeys[key.id]].filter(v => v)"
                :loading="isLoading"
                :list="options.map(x => ({ id: x, name: x }))"
                @change="([val]) => changeParams(key.id, val)">
            </bk-tag-input>
        </template>
    </section>
</template>

<script lang="ts">
    import {
        defineComponent,
        PropType,
        ref,
        watch
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
