<template>
    <section>
        <span class="g-prop-sub-title g-mb8">{{ $t('数据表') }}</span>
        <choose-data-table
            :value="chooseTableName"
            :data-source-type="dataSourceType"
            :third-part-d-b-name="thirdPartDBName"
            @choose-table="chooseTable"
            @fetch-data="handleFetchData"
            @clear="clearTable"
        ></choose-data-table>
    </section>
</template>

<script lang="ts">
    import {
        defineComponent,
        ref,
        toRefs
    } from 'vue'
    import chooseDataTable from '@/components/choose-data-table.vue'

    interface Iprop {
        name?: string,
        type?: string,
        payload?: any
        defaultValue?: any,
        change: (name: string, val: any, type: string, payload: any) => void
    }

    export default defineComponent({
        components: {
            chooseDataTable
        },

        props: {
            name: String,
            type: String,
            payload: {
                type: Object,
                default: () => ({})
            },
            defaultValue: {
                type: [Object, Array, Number, String]
            },
            change: {
                type: Function,
                default: () => {}
            },
            describe: {
                type: Object
            }
        },

        setup (props) {
            // copy type 防止响应式更新
            const type = props.type
            const propStatus = toRefs<Iprop>(props)
            const chooseTableName = ref(propStatus.payload?.value?.sourceData?.tableName)
            const dataSourceType = ref(propStatus.payload?.value?.sourceData?.dataSourceType)
            const thirdPartDBName = ref(propStatus.payload?.value?.sourceData?.thirdPartDBName)

            const chooseTable = ({ tableName, dataSourceType, thirdPartDBName }) => {
                triggleUpdate(tableName, [], dataSourceType, thirdPartDBName)
            }

            const handleFetchData = ({ list }) => {
                triggleUpdate(chooseTableName.value, list, dataSourceType.value, thirdPartDBName.value)
            }

            const clearTable = () => {
                triggleUpdate('', props.describe.val, '', '')
            }

            const triggleUpdate = (tableName, val, bkDataSourceType, bkThirdPartDBName) => {
                chooseTableName.value = tableName
                dataSourceType.value = bkDataSourceType
                thirdPartDBName.value = bkThirdPartDBName
                propStatus.change.value(
                    props.name,
                    val,
                    type,
                    {
                        sourceData: {
                            tableName,
                            dataSourceType: bkDataSourceType,
                            thirdPartDBName: bkThirdPartDBName
                        }
                    }
                )
            }

            return {
                chooseTableName,
                dataSourceType,
                thirdPartDBName,
                handleFetchData,
                chooseTable,
                clearTable
            }
        }
    })
</script>
