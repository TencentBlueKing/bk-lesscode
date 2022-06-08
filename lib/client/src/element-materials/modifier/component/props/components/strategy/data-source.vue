<template>
    <section>
        <span class="g-prop-sub-title g-mb8">数据表</span>
        <choose-data-table
            :value="chooseTableName"
            @choose="chooseTable"
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
            const propStatus = toRefs<Iprop>(props)
            const chooseTableName = ref(propStatus.payload?.value?.sourceData?.tableName)

            const chooseTable = ({ tableName, data }) => {
                triggleUpdate(tableName, data.list)
            }

            const clearTable = () => {
                triggleUpdate('', props.describe.val)
            }

            const triggleUpdate = (tableName, val) => {
                chooseTableName.value = tableName
                propStatus.change.value(
                    props.name,
                    val,
                    props.type,
                    {
                        sourceData: {
                            tableName: tableName
                        }
                    }
                )
            }

            return {
                chooseTableName,
                chooseTable,
                clearTable
            }
        }
    })
</script>
