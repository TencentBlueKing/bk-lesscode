<template>
    <select-enable
        title="GROUP"
        :enable="!!queryGroup"
        @add="handleAdd"
    >
        <select-wrapper
            @delete="handleChange(undefined)"
        >
            <section
                v-for="(field, index) in renderQueryGroup && renderQueryGroup.fields"
                :key="index"
                class="group-fields"
            >
                <select-table-field
                    class="group-field-item"
                    :field-id="field.fieldId"
                    :table-name="field.tableName"
                    :table-list="tableList"
                    @change="(val) => handleTableChange(index, val)"
                />
                <plus-icon
                    class="plus-icon"
                    @click="handlePlusField"
                />
                <minus-icon
                    v-if="index > 0"
                    @click="handleMinusField"
                />
            </section>
            <bk-link
                v-if="!renderQueryGroup || !renderQueryGroup.having || renderQueryGroup.having.length <= 0"
                class="g-small-link mb5"
                theme="primary"
                icon="bk-drag-icon bk-drag-plus-circle"
                @click="handleInitHaving"
            >{{ $t('添加 HAVING') }}</bk-link>
            <select-condition
                v-else
                title="HAVING"
                :condition-list="renderQueryGroup && renderQueryGroup.having"
                :table-list="tableList"
                :allow-clear="true"
                :custom-validate="validate"
                @change="handleHavingChange"
            ></select-condition>
        </select-wrapper>
    </select-enable>
</template>

<script lang="ts">
    import PlusIcon from '@/components/plus-icon.vue'
    import MinusIcon from '@/components/minus-icon.vue'
    import SelectEnable from './common/select-enable.vue'
    import SelectWrapper from './common/select-wrapper.vue'
    import SelectCondition, { ICondition } from './common/select-condition.vue'
    import SelectTableField, { IField } from './common/select-table-field.vue'
    import {
        defineComponent,
        ref,
        PropType,
        watch
    } from '@vue/composition-api'
    import {
        getDefaultGroupBy,
        getDefaultTableField,
        getDefaultConnect
    } from 'shared/data-source'

    export interface IQueryGroup {
        having: ICondition[],
        fields: IField[]
    }

    export default defineComponent({
        components: {
            PlusIcon,
            MinusIcon,
            SelectEnable,
            SelectWrapper,
            SelectCondition,
            SelectTableField
        },

        props: {
            queryGroup: Object as PropType<IQueryGroup>,
            tableList: Array
        },

        setup (props, { emit }) {
            const renderQueryGroup = ref()

            const validate = ({ fieldId }) => {
                let message = ''
                if (!props.queryGroup?.fields?.find(field => field.fieldId === fieldId)) {
                    message = window.i18n.t('HAVING 字段必须是查询的字段或者 GROUP 的条件字段')
                }
                return message
            }

            const handleAdd = () => {
                renderQueryGroup.value = getDefaultGroupBy()
                triggleUpdate()
            }

            const handleChange = (val) => {
                renderQueryGroup.value = val
                triggleUpdate()
            }

            const handleTableChange = (index, val) => {
                Object.assign(renderQueryGroup.value.fields[index], val)
                triggleUpdate()
            }

            const handlePlusField = () => {
                renderQueryGroup.value.fields.push(getDefaultTableField())
                triggleUpdate()
            }

            const handleMinusField = (index) => {
                renderQueryGroup.value.fields.splice(index, 1)
                triggleUpdate()
            }

            const handleInitHaving = () => {
                renderQueryGroup.value.having = [getDefaultConnect()]
                triggleUpdate()
            }

            const handleHavingChange = (val) => {
                renderQueryGroup.value.having = val
                triggleUpdate()
            }

            const triggleUpdate = () => {
                emit('change', renderQueryGroup.value)
            }

            watch(
                () => props.queryGroup,
                () => {
                    renderQueryGroup.value = props.queryGroup || { having: [], fields: [] }
                },
                {
                    immediate: true
                }
            )

            return {
                renderQueryGroup,
                validate,
                handleAdd,
                handleChange,
                handleTableChange,
                handlePlusField,
                handleMinusField,
                handleInitHaving,
                handleHavingChange
            }
        }
    })
</script>

<style lang="postcss" scoped>
    .group-fields {
        display: flex;
        align-items: center;
        margin: 8px 0;
        .group-field-item {
            width: calc(100% - 65px);
            max-width: 1723px;
            /deep/ .select-item {
                width: 50%;
                &.select-table {
                    width: calc(50% + 51px);
                    max-width: 862px;
                }
            }
        }
    }
    .plus-icon {
        margin: 0 14px 0 14px;
    }
</style>
