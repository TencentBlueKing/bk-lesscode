<template>
    <section class="query-main">
        <section
            v-for="(table, tableIndex) in renderTables"
            :key="tableIndex"
        >
            <section
                v-if="+tableIndex > 0"
                class="query-join mb8"
            >
                <select-type
                    class="join-type"
                    :value="table.joinType"
                    :list="joinTypeList"
                    @change="(value) => handleChange(tableIndex, 'joinType', value)"
                >
                    <span
                        class="join-type-trigger"
                        slot="dropdown-trigger"
                    >
                        {{ table.joinType }}
                    </span>
                </select-type>
                <select-wrapper :show-delete="false">
                    <select-join
                        title="ON"
                        :join-list="table.on"
                        :join-table-list="handleGetJoinTableList(tableIndex)"
                        @change="(value) => handleChange(tableIndex, 'on', value)"
                    />
                </select-wrapper>
            </section>
            <select-wrapper
                class="mb8 select-table-field-wrapper"
                :show-delete="renderTables.length > 1"
                @delete="handleTableDelete(tableIndex)"
            >
                <select-table
                    class="fl mr8 mt8 mb8 wh380"
                    :table-name="table.tableName"
                    :table-list="tableList"
                    @change="(value) => handleTableChange(tableIndex, value)"
                />
                <select-field
                    v-for="(field, fieldIndex) in table.fields"
                    class="fl mr8 mt8 mb8 wh380"
                    :key="`${tableIndex}_${fieldIndex}`"
                    :show-alias="true"
                    :field-id="field.fieldId"
                    :distinct="field.distinct"
                    :function-name="field.functionName"
                    :alias="field.alias"
                    :disable-delete="table.fields.length <= 1"
                    :columns="handleGetColumns(table.tableName, field.functionName)"
                    @change="(val) => handleFieldChange(tableIndex, fieldIndex, val)"
                    @delete="() => handleFieldDelete(tableIndex, fieldIndex)"
                />
                <select-type
                    class="join-type fl mt8 mb8"
                    :list="fieldTypeList"
                    @change="(name) => handlePlusField(tableIndex, name)"
                >
                    <span
                        class="field-plus"
                        slot="dropdown-trigger"
                    >
                        <i class="bk-icon icon-plus"></i>
                    </span>
                </select-type>
            </select-wrapper>
        </section>
        <bk-link
            class="g-small-link"
            theme="primary"
            icon="bk-drag-icon bk-drag-plus-circle"
            @click="addLinkTable"
        >添加关联表</bk-link>
    </section>
</template>

<script lang="ts">
    import {
        defineComponent,
        toRef,
        PropType
    } from '@vue/composition-api'
    import SelectWrapper from './common/select-wrapper.vue'
    import SelectType from './common/select-type.vue'
    import SelectJoin, { IJoinOn } from './common/select-join.vue'
    import SelectTable, { ITable } from './common/select-table.vue'
    import SelectField, { IField } from './common/select-field.vue'
    import {
        JOIN_TYPE,
        SQL_FUNCTION_TYPE,
        getDefaultTable,
        getDefaultTableOn,
        getDefaultTableField
    } from 'shared/data-source'
    export { ITable }

    interface IQueryTable {
        tableName: string
        joinType: string
        fields: IField[]
        on: IJoinOn[]
    }

    export default defineComponent({
        components: {
            SelectWrapper,
            SelectType,
            SelectJoin,
            SelectTable,
            SelectField
        },

        props: {
            queryTable: Array as PropType<IQueryTable[]>,
            tableList: Array as PropType<ITable[]>
        },

        setup (props, { emit }) {
            const renderTables = toRef(props, 'queryTable')
            const joinTypeList = Object
                .keys(JOIN_TYPE)
                .map(type => ({
                    id: JOIN_TYPE[type],
                    name: JOIN_TYPE[type]
                }))
            const fieldTypeList = Object
                .keys(SQL_FUNCTION_TYPE)
                .map((type) => ({
                    id: SQL_FUNCTION_TYPE[type].VAL,
                    name: SQL_FUNCTION_TYPE[type].NAME
                }))

            const addLinkTable = () => {
                renderTables
                    .value
                    .push(
                        getDefaultTable({
                            joinType: JOIN_TYPE.LEFT_JOIN,
                            on: [getDefaultTableOn()]
                        })
                    )
                triggleUpdate()
            }

            const handlePlusField = (tableIndex, functionName) => {
                renderTables
                    .value[tableIndex]
                    .fields
                    .push(getDefaultTableField({
                        functionName,
                        tableName: renderTables.value[tableIndex].tableName
                    }))
            }

            const handleGetJoinTableList = (tableIndex) => {
                return renderTables
                    .value
                    .slice(0, tableIndex + 1)
                    .reduce((acc, cur) => {
                        if (cur.tableName && !acc.find(table => table.tableName === cur.tableName)) {
                            // 表格配置
                            const table = props.tableList.find(table => table.tableName === cur.tableName)
                            if (table) {
                                acc.push({
                                    id: cur.tableName,
                                    tableName: cur.tableName,
                                    columns: table.columns
                                })
                            }
                        }
                        return acc
                    }, [])
            }

            const handleGetColumns = (tableName, functionName) => {
                const table = props.tableList.find(table => table.tableName === tableName) || { columns: [] }
                const columns = [...table.columns]
                // 默认字段添加 *
                // if (!functionName && tableName) {
                //     columns.unshift({ name: '*', columnId: '*' })
                // }
                return columns
            }

            const handleChange = (tableIndex, key, value) => {
                renderTables.value[tableIndex][key] = value
                triggleUpdate()
            }

            const handleTableChange = (tableIndex, tableName) => {
                renderTables.value[tableIndex].tableName = tableName
                renderTables.value[tableIndex].fields.forEach((field) => {
                    field.tableName = tableName
                })
                triggleUpdate()
            }

            const handleFieldChange = (tableIndex, fieldIndex, val) => {
                Object.assign(renderTables.value[tableIndex].fields[fieldIndex], val)
                triggleUpdate()
            }

            const handleFieldDelete = (tableIndex, fieldIndex) => {
                renderTables.value[tableIndex].fields.splice(fieldIndex, 1)
                triggleUpdate()
            }

            const handleTableDelete = (tableIndex) => {
                renderTables.value.splice(tableIndex, 1)
                triggleUpdate()
            }

            const triggleUpdate = () => {
                emit('change', renderTables.value)
            }

            return {
                renderTables,
                joinTypeList,
                fieldTypeList,
                addLinkTable,
                handlePlusField,
                handleGetJoinTableList,
                handleGetColumns,
                handleChange,
                handleTableChange,
                handleFieldChange,
                handleFieldDelete,
                handleTableDelete
            }
        }
    })
</script>

<style lang="postcss" scoped>
    .query-main {
        padding: 0 50px 0 150px;
    }
    .query-join {
        position: relative;
        .join-type {
            position: absolute;
            top: 8px;
            left: -110px;
        }
        .join-type-trigger {
            display: inline-block;
            cursor: pointer;
            background: #FFFFFF;
            border: 1px solid #C4C6CC;
            border-radius: 2px;
            color: #3A84FF;
            line-height: 30px;
            padding: 0 12px;
            font-weight: 600;
            width: 100px;
            text-align: center;
        }
    }
    .mr8 {
        margin-right: 8px;
    }
    .mb8 {
        margin-bottom: 8px;
    }
    .mt8 {
        margin-top: 8px;
    }
    .wh380 {
        width: 380px;
    }
    .select-table-field-wrapper {
        width: 100%;
        content: '';
        display: table;
        clear: both;
        padding-top: -15px;
        .field-plus {
            cursor: pointer;
            display: inline-block;
            background-color: #fff;
            width: 32px;
            height: 32px;
            border: 1px solid #C4C6CC;
            border-radius: 2px;
            font-size: 20px;
            padding: 5px;
            line-height: 18px;
        }
    }
    .fl {
        float: left;
    }
</style>
