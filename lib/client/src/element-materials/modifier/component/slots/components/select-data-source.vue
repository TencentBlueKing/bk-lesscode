<template>
    <section>
        <div
            class="g-prop-sub-title g-mt8 g-mb6"
        >数据表</div>
        <choose-data-table
            class="g-mb8"
            :value="sourceData.tableName"
            @choose="chooseTable"
            @clear="clearTable"
        />
        <div
            class="g-prop-sub-title g-mb6 g-mt8 subline"
            v-bk-tooltips="{
                content: '用于赋值的字段名，默认为 id',
                placements: ['left-start'],
                boundary: 'window'
            }"
        >id 配置</div>
        <bk-input
            class="g-mb8"
            :value="sourceData.params.idKey"
            @change="val => changeParams('idKey', val)"
        />
        <div
            class="g-prop-sub-title g-mb6 g-mt8 subline"
            v-bk-tooltips="{
                content: '用于展示的字段名，默认为 name',
                placements: ['left-start'],
                boundary: 'window'
            }"
        >name 配置</div>
        <bk-input
            :value="sourceData.params.nameKey"
            @change="val => changeParams('nameKey', val)"
        />
    </section>
</template>

<script lang="ts">
    import {
        defineComponent,
        ref,
        toRefs
    } from '@vue/composition-api'
    import chooseDataTable from '@/components/choose-data-table.vue'

    interface Iprop {
        slotVal?: any,
        slotConfig?: any,
        change: (slot: any) => void
    }

    export default defineComponent({
        components: {
            chooseDataTable
        },

        props: {
            slotVal: {
                type: Object,
                required: true
            },
            slotConfig: {
                type: Object,
                default: () => ({})
            },
            change: {
                type: Function,
                default: () => {}
            }
        },

        setup (props) {
            const {
                slotVal,
                slotConfig,
                change
            } = toRefs<Iprop>(props)
            // 参数原始值
            const originSourceData = slotVal?.value?.payload?.sourceData
            // 构造此处需要使用的数据
            const sourceData = ref({
                val: [],
                tableName: originSourceData?.tableName,
                params: {
                    idKey: originSourceData?.params?.idKey || 'id',
                    nameKey: originSourceData?.params?.nameKey || 'name'
                }
            })

            const chooseTable = ({ tableName, data }) => {
                sourceData.value.val = data.list
                sourceData.value.tableName = tableName
                triggleUpdate()
            }

            const changeParams = (key, value) => {
                sourceData.value.params[key] = value
                triggleUpdate()
            }

            const clearTable = () => {
                sourceData.value.val = slotConfig?.value?.val
                sourceData.value.tableName = ''
                triggleUpdate()
            }

            const triggleUpdate = () => {
                const slot = {
                    ...slotVal.value,
                    val: sourceData.value.val,
                    payload: {
                        sourceData: {
                            tableName: sourceData.value.tableName,
                            params: {
                                ...sourceData.value.params
                            }
                        }
                    }
                }
                change.value(slot)
            }

            return {
                sourceData,
                chooseTable,
                changeParams,
                clearTable
            }
        }
    })
</script>

<style lang="postcss" scoped>
    .subline {
        cursor: pointer;
        border-bottom: 1px dashed #63656E;
    }
</style>
