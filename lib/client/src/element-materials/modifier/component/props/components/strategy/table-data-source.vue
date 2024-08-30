<template>
    <section>
        <span class="g-prop-sub-title g-mb8">{{ $t('数据表') }}</span>
        <choose-data-table
            :value="renderChooseTableName"
            :data-source-type="renderDataSourceType"
            :third-part-d-b-name="renderThirdPartDBName"
            @choose-table="chooseTable"
            @fetch-data="handleFetchData"
            @clear="clearTable"
        ></choose-data-table>
        <template v-if="renderDataSourceType === 'preview'">
            <span class="g-prop-sub-title g-mb8 g-mt12">{{ $t('是否展示操作列') }}</span>
            <bk-switcher
                class="display-block"
                size="small"
                theme="primary"
                :value="renderShowOperationColumn"
                @change="handleToggleShowOperationColumn"
            ></bk-switcher>
        </template>
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
            const renderChooseTableName = ref(propStatus.payload?.value?.sourceData?.tableName)
            const renderDataSourceType = ref(propStatus.payload?.value?.sourceData?.dataSourceType)
            const renderShowOperationColumn = ref(propStatus.payload?.value?.sourceData?.showOperationColumn)
            const renderThirdPartDBName = ref(propStatus.payload?.value?.sourceData?.thirdPartDBName)

            const chooseTable = ({ tableName, dataSourceType, thirdPartDBName }) => {
                renderChooseTableName.value = tableName
                renderThirdPartDBName.value = thirdPartDBName
                // 类型改变的时候，需要重置部分状态
                if (renderDataSourceType.value !== dataSourceType) {
                    renderDataSourceType.value = dataSourceType
                    renderShowOperationColumn.value = ['third-part', 'preview'].includes(dataSourceType)
                }
                // 触发更新
                propStatus.change.value(
                    props.name,
                    props.defaultValue,
                    type,
                    {
                        sourceData: {
                            tableName,
                            dataSourceType,
                            thirdPartDBName,
                            showOperationColumn: renderShowOperationColumn.value
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
                renderChooseTableName.value = ''
                renderDataSourceType.value = ''
                renderThirdPartDBName.value = ''
                renderShowOperationColumn.value = false
                propStatus.change.value(
                    props.name,
                    props.describe.val,
                    type,
                    {
                        sourceData: {
                            tableName: '',
                            thirdPartDBName: '',
                            showOperationColumn: false
                        }
                    }
                )
            }

            const handleToggleShowOperationColumn = (showOperationColumn) => {
                renderShowOperationColumn.value = showOperationColumn
                propStatus.change.value(
                    props.name,
                    props.defaultValue,
                    type,
                    {
                        sourceData: {
                            ...propStatus.payload?.value?.sourceData,
                            showOperationColumn
                        }
                    }
                )
            }

            return {
                renderChooseTableName,
                renderDataSourceType,
                renderShowOperationColumn,
                renderThirdPartDBName,
                chooseTable,
                handleFetchData,
                clearTable,
                handleToggleShowOperationColumn
            }
        }
    })
</script>

<style lang="postcss" scoped>
    .display-block {
        display: block;
    }
</style>
