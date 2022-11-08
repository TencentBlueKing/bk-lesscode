<template>
    <section class="select-table-field">
        <select-table
            class="select-item"
            :table-list="tableList"
            :table-name="tableName"
            @change="(tableName) => handleChange({ tableName })"
        ></select-table>
        <select-field
            class="select-item"
            :field-id="fieldId"
            :columns="tableColumns"
            :disable-distinct="true"
            :disable-delete="true"
            :custom-validate="customValidate"
            @change="(val) => handleChange(val)"
        ></select-field>
    </section>
</template>

<script lang="ts">
    import {
        defineComponent,
        PropType,
        computed,
        onMounted
    } from '@vue/composition-api'
    import {
        isEmpty
    } from 'shared/util'

    import SelectTable, { ITable } from './select-table.vue'
    import SelectField, { IField } from './select-field.vue'
    export { IField }

    export default defineComponent({
        components: {
            SelectTable,
            SelectField
        },

        props: {
            tableList: {
                type: Array as PropType<ITable[]>
            },
            tableName: {
                type: String
            },
            fieldId: {
                type: [String, Number]
            },
            customValidate: {
                type: Function,
                default: () => {}
            }
        },

        setup (props, { emit }) {
            const tableColumns = computed(() => {
                const table = props.tableList?.find(table => table.tableName === props.tableName) || { columns: [] }
                return table.columns
            })

            const handleChange = (val) => {
                emit('change', val)
            }

            onMounted(() => {
                // 打开的时候默认选择第一个表
                if (isEmpty(props.tableName) && !isEmpty(props.tableList)) {
                    handleChange({
                        tableName: props.tableList[0]?.tableName || ''
                    })
                }
            })

            return {
                tableColumns,
                handleChange
            }
        }
    })
</script>

<style lang="postcss" scoped>
    .select-table-field {
        display: flex;
        align-items: center;
        .select-item {
            margin-right: -2px;
            width: 50%;
        }
    }
</style>
