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
            @change="(val) => handleChange(val)"
        ></select-field>
    </section>
</template>

<script lang="ts">
    import {
        defineComponent,
        PropType,
        computed
    } from '@vue/composition-api'
    import SelectTable, { ITable } from './select-table.vue'
    import SelectField, { IField } from './select-field.vue'
    export { IField }

    export default defineComponent({
        components: {
            SelectTable,
            SelectField
        },

        props: {
            tableList: Array as PropType<ITable[]>,
            tableName: String,
            fieldId: [String, Number]
        },

        setup (props, { emit }) {
            const tableColumns = computed(() => {
                const table = props.tableList?.find(table => table.tableName === props.tableName) || { columns: [] }
                return table.columns
            })

            const handleChange = (val) => {
                emit('change', val)
            }

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
