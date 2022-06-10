<template>
    <choose-data-table
        :value="chooseTableName"
        @choose="chooseTable"
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
            const propStatus = toRefs<Iprop>(props)
            const chooseTableName = ref(propStatus.slotVal?.value?.payload?.sourceData?.tableName)

            const chooseTable = ({ tableName, data }) => {
                triggleUpdate(tableName, data.list)
            }

            const clearTable = () => {
                triggleUpdate('', propStatus.slotConfig.value.val)
            }

            const triggleUpdate = (tableName, val) => {
                chooseTableName.value = tableName
                const slot = {
                    ...propStatus.slotVal.value,
                    val,
                    payload: {
                        sourceData: {
                            tableName
                        }
                    }
                }
                propStatus.change.value(slot)
            }

            return {
                chooseTableName,
                chooseTable,
                clearTable
            }
        }
    })
</script>
