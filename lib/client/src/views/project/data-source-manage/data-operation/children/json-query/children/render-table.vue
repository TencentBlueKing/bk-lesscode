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
                    v-if="['preview', 'third-part'].includes(dataSourceType)"
                    class="fl mr8 mt8 mb8 wh380"
                    :table-name="table.tableName"
                    :table-list="tableList"
                    @change="(value) => handleTableChange(tableIndex, value)"
                />
                <select-bk-base-table
                    v-else
                    class="fl mr8 mt8 mb8 wh380"
                    :table-name="table.tableName"
                    :bk-base-biz-list="bkBaseBizList"
                    @change="({ tableName, bkBizId }) => handleTableChange(tableIndex, tableName, bkBizId)"
                    @updataBizs="(value) => $emit('updataBizs', value)"
                />
                <select-field
                    v-for="(field, fieldIndex) in table.fields"
                    class="fl mr8 mt8 mb8 wh380"
                    :key="`${tableIndex}_${field.functionName}_${field.fieldId}_${field.distinct}`"
                    :show-alias="true"
                    :field-id="field.fieldId"
                    :distinct="field.distinct"
                    :function-name="field.functionName"
                    :alias="field.alias"
                    :disable-delete="table.fields.length <= 1"
                    :columns="handleGetColumns(table.tableName)"
                    :custom-validate="validate"
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
                        <i class="bk-drag-icon bk-drag-crosshair"></i>
                    </span>
                </select-type>
            </select-wrapper>
        </section>
        <bk-link
            class="g-small-link"
            theme="primary"
            icon="bk-drag-icon bk-drag-plus-circle"
            @click="addLinkTable"
        >{{ $t('添加关联表') }}</bk-link>
    </section>
</template>

<script lang="ts">
    import {
        defineComponent,
        toRef,
        PropType
    } from '@vue/composition-api'
    import {
        JOIN_TYPE,
        SQL_FUNCTION_TYPE,
        getDefaultTable,
        getDefaultTableOn,
        getDefaultTableField,
        findTable
    } from 'shared/data-source'
    import {
        isEmpty
    } from 'shared/util'

    import SelectWrapper from './common/select-wrapper.vue'
    import SelectType from './common/select-type.vue'
    import SelectJoin, { IJoinOn } from './common/select-join.vue'
    import SelectTable, { ITable } from './common/select-table.vue'
    import SelectBkBaseTable, { IBkBaseBiz } from './common/select-bk-base-table.vue'
    import SelectField, { IField } from './common/select-field.vue'
    import { IQueryGroup } from './render-group.vue'

    export { ITable, IBkBaseBiz }

    interface IQueryTable {
        tableName: string
        joinType: string
        bkBizId: string
        fields: IField[]
        on: IJoinOn[]
    }

    export default defineComponent({
        components: {
            SelectWrapper,
            SelectType,
            SelectJoin,
            SelectTable,
            SelectBkBaseTable,
            SelectField
        },

        props: {
            queryTable: Array as PropType<IQueryTable[]>,
            queryGroup: Object as PropType<IQueryGroup>,
            tableList: Array as PropType<ITable[]>,
            bkBaseBizList: Array as PropType<IBkBaseBiz[]>,
            dataSourceType: String
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
                .keys(SQL_FUNCTION_TYPE())
                .map((type) => ({
                    id: SQL_FUNCTION_TYPE()[type].VAL,
                    name: SQL_FUNCTION_TYPE()[type].NAME
                }))

            // 校验
            const validate = ({ functionName, fieldId }) => {
                let message = ''
                if (isEmpty(functionName)
                    && !isEmpty(props.queryGroup?.fields)
                    && !props.queryGroup?.fields?.some(field => field.fieldId === fieldId)
                ) {
                    message = window.i18n.t('设置了 GROUP 的情况下，查询字段只能为【AVG，COUNT，MAX，MIN，SUM】或者 GROUP 字段')
                }
                return message
            }

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
                        const isUsed = acc.find(table => table.tableName === cur.tableName)
                        const table = findTable(cur.tableName, props.dataSourceType, props.tableList, props.bkBaseBizList)
                        if (cur.tableName && !isUsed && table) {
                            acc.push({
                                id: table.id,
                                tableName: table.tableName,
                                columns: table.columns
                            })
                        }
                        return acc
                    }, [])
            }

            const handleGetColumns = (tableName) => {
                const table = findTable(tableName, props.dataSourceType, props.tableList, props.bkBaseBizList)
                return table?.columns || []
            }

            const handleChange = (tableIndex, key, value) => {
                renderTables.value[tableIndex][key] = value
                triggleUpdate()
            }

            const handleTableChange = (tableIndex, tableName, bkBizId) => {
                renderTables.value[tableIndex].tableName = tableName
                renderTables.value[tableIndex].bkBizId = bkBizId
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
                validate,
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
