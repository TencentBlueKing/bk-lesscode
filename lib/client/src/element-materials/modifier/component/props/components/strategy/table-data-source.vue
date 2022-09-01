<template>
    <section>
        <span class="g-prop-sub-title g-mb8">数据表</span>
        <choose-data-table
            :value="chooseTableName"
            :data-source-type="dataSourceType"
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
    } from '@vue/composition-api'
    import chooseDataTable from '@/components/choose-data-table.vue'

    interface Iprop {
        name?: string,
        type?: string,
        payload?: any
        defaultValue?: any,
        change: (name: string, val: any, type: string, payload: any) => void,
        batchUpdate: (data: any) => void
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
            batchUpdate: {
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

            const chooseTable = ({ tableName, table, dataSourceType: bkDataSourceType }) => {
                chooseTableName.value = tableName
                dataSourceType.value = bkDataSourceType
                propStatus.change.value(
                    props.name,
                    [],
                    type,
                    {
                        sourceData: {
                            tableName,
                            dataSourceType: bkDataSourceType,
                            // 表示数据表的表头信息
                            columns: table?.columns?.map(column => column.name) || []
                        }
                    }
                )
            }

            const handleFetchData = ({ list }) => {
                propStatus.change.value(
                    props.name,
                    list,
                    type,
                    {}
                )
            }

            const clearTable = () => {
                chooseTableName.value = ''
                dataSourceType.value = ''
                propStatus.change.value(
                    props.name,
                    props.describe.val,
                    type,
                    {
                        sourceData: {
                            tableName: ''
                        }
                    }
                )
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
