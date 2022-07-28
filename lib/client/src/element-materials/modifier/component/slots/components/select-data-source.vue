<template>
    <section>
        <div
            class="g-prop-sub-title g-mt8 g-mb6"
        >数据表</div>
        <choose-data-table
            class="g-mb8"
            :value="sourceData.tableName"
            :is-loading.sync="isLoading"
            @choose="chooseTable"
            @clear="clearTable"
        />
        <select-key
            :params="sourceData.keys"
            :options="optionList"
            :is-loading="isLoading"
            @change="changeParams"
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
    import SelectKey from './common/select-key.vue'

    interface Iprop {
        slotVal?: any,
        slotConfig?: any,
        change: (slot: any, type: string) => void
    }

    export default defineComponent({
        components: {
            chooseDataTable,
            SelectKey
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
            const {
                slotVal,
                slotConfig,
                change
            } = toRefs<Iprop>(props)
            const isLoading = ref(false)
            // 参数原始值
            const originSourceData = slotVal?.value?.payload?.sourceData
            // 构造此处需要使用的数据
            const sourceData = ref({
                val: [],
                tableName: originSourceData?.tableName,
                keys: {
                    idKey: originSourceData?.keys?.idKey,
                    nameKey: originSourceData?.keys?.nameKey
                }
            })
            const optionList = ref([])

            const chooseTable = ({ tableName, data, table }) => {
                optionList.value = table?.columns.map(column => column.name)
                sourceData.value.keys.idKey = sourceData.value.keys.idKey || optionList.value[0]
                sourceData.value.keys.nameKey = sourceData.value.keys.nameKey || optionList.value[0]
                sourceData.value.val = data.list
                sourceData.value.tableName = tableName
                triggleUpdate()
            }

            const changeParams = ({ key, value }) => {
                sourceData.value.keys[key] = value
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
                            keys: {
                                ...sourceData.value.keys
                            }
                        }
                    }
                }
                change.value(slot, type)
            }

            return {
                sourceData,
                optionList,
                isLoading,
                chooseTable,
                changeParams,
                clearTable
            }
        }
    })
</script>
