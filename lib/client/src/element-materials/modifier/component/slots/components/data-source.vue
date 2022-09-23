<template>
    <choose-data-table
        :value="chooseTableName"
        :data-source-type="dataSourceType"
        @choose-table="chooseTable"
        @fetch-data="handleFetchData"
        @clear="clearTable"
    ></choose-data-table>
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

        setup (props) {
            // copy type 防止响应式更新
            const type = props.type
            const propStatus = toRefs<Iprop>(props)
            const chooseTableName = ref(propStatus.slotVal?.value?.payload?.sourceData?.tableName)
            const dataSourceType = ref(propStatus.slotVal?.value?.payload?.sourceData?.dataSourceType)

            const chooseTable = ({ tableName, dataSourceType }) => {
                triggleUpdate(tableName, [], dataSourceType)
            }

            const handleFetchData = ({ list }) => {
                triggleUpdate(chooseTableName.value, list, dataSourceType.value)
            }

            const clearTable = () => {
                triggleUpdate('', propStatus.slotConfig.value.val, '')
            }

            const triggleUpdate = (tableName, val, bkDataSourceType) => {
                chooseTableName.value = tableName
                dataSourceType.value = bkDataSourceType
                const slot = {
                    ...propStatus.slotVal.value,
                    val,
                    payload: {
                        sourceData: {
                            tableName,
                            dataSourceType: bkDataSourceType
                        }
                    }
                }
                propStatus.change.value(slot, type)
            }

            return {
                chooseTableName,
                dataSourceType,
                chooseTable,
                handleFetchData,
                clearTable
            }
        }
    })
</script>
