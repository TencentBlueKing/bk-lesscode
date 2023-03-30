<template>
    <section>
        <div
            class="g-prop-sub-title g-mt8 g-mb6"
        >{{ $t('数据表') }}</div>
        <choose-data-table
            class="g-mb8"
            :value="sourceData.tableName"
            :data-source-type="sourceData.dataSourceType"
            @choose-table="chooseTable"
            @fetch-data="handleFetchData"
            @clear="clearTable"
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
        change: (slot: any, type: string) => void
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
            type: {
                type: String
            },
            change: {
                type: Function,
                default: () => {}
            }
        },

        setup (props, { emit }) {
            // copy type 防止响应式更新
            const type = props.type
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
                dataSourceType: originSourceData?.dataSourceType
            })

            const chooseTable = ({ tableName, table, dataSourceType }) => {
                // 更新 options
                const columns = table?.columns.map(column => column.name)
                updateOptions(columns)
                // 更新值
                sourceData.value.val = []
                sourceData.value.tableName = tableName
                sourceData.value.dataSourceType = dataSourceType
                triggleUpdate()
            }

            const handleFetchData = ({ list }) => {
                sourceData.value.val = list
                triggleUpdate()
            }

            const clearTable = () => {
                sourceData.value.val = slotConfig?.value?.val
                sourceData.value.tableName = ''
                sourceData.value.dataSourceType = ''
                triggleUpdate()
            }

            const triggleUpdate = () => {
                const slot = {
                    ...slotVal.value,
                    val: sourceData.value.val,
                    payload: {
                        sourceData: {
                            tableName: sourceData.value.tableName,
                            dataSourceType: sourceData.value.dataSourceType
                        }
                    }
                }
                change.value(slot, type)
            }

            const updateOptions = (columns) => {
                emit('option-change', columns)
            }

            return {
                sourceData,
                chooseTable,
                handleFetchData,
                clearTable
            }
        }
    })
</script>
