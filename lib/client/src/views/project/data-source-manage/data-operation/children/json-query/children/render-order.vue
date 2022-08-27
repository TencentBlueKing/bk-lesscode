<template>
    <select-enable
        title="ORDER BY"
        :enable="renderQueryOrder && renderQueryOrder.length > 0"
        @add="handleInit"
    >
        <select-wrapper
            @delete="handleDelete"
        >
            <section
                v-for="(order, index) in renderQueryOrder"
                :key="index"
                class="order-by"
            >
                <select-table-field
                    class="order-by-item"
                    :field-id="order.fieldId"
                    :table-name="order.tableName"
                    :table-list="tableList"
                    @change="(val) => handleTableChange(index, val)"
                />
                <select-type
                    :list="orderTypeList"
                    :value="order.type"
                    @change="(val) => handleChange(index, val, 'type')"
                /><!--
                --><plus-icon
                    class="plus-icon"
                    @click="handlePlus"
                />
                <minus-icon
                    v-if="index > 0"
                    @click="handleMinus(index)"
                />
            </section>
        </select-wrapper>
    </select-enable>
</template>

<script lang="ts">
    import PlusIcon from '@/components/plus-icon.vue'
    import MinusIcon from '@/components/minus-icon.vue'
    import SelectEnable from './common/select-enable.vue'
    import SelectWrapper from './common/select-wrapper.vue'
    import SelectTableField from './common/select-table-field.vue'
    import SelectType from './common/select-type.vue'
    import {
        ORDER_TYPE,
        getDefaultOrderBy
    } from 'shared/data-source'
    import {
        defineComponent,
        ref,
        PropType,
        watch
    } from '@vue/composition-api'

    interface IOrder {
        tableName: string
        fieldId: string
        type: string
    }

    export default defineComponent({
        components: {
            PlusIcon,
            MinusIcon,
            SelectEnable,
            SelectWrapper,
            SelectTableField,
            SelectType
        },

        props: {
            queryOrder: Array as PropType<IOrder[]>,
            tableList: Array
        },

        setup (props, { emit }) {
            const renderQueryOrder = ref()
            const orderTypeList = Object
                .keys(ORDER_TYPE)
                .map((type) => {
                    return {
                        id: type,
                        name: type
                    }
                })

            const handleInit = () => {
                renderQueryOrder.value = [getDefaultOrderBy()]
                triggleUpdate()
            }

            const handleDelete = () => {
                renderQueryOrder.value = undefined
                triggleUpdate()
            }

            const handleChange = (index, val, key) => {
                renderQueryOrder.value[index][key] = val
                triggleUpdate()
            }

            const handleTableChange = (index, val) => {
                Object.assign(renderQueryOrder.value[index], val)
                triggleUpdate()
            }

            const handlePlus = () => {
                renderQueryOrder.value.push(getDefaultOrderBy())
                triggleUpdate()
            }

            const handleMinus = (index) => {
                renderQueryOrder.value.splice(index, 1)
                triggleUpdate()
            }

            const triggleUpdate = () => {
                emit('change', renderQueryOrder.value)
            }

            watch(
                () => props.queryOrder,
                () => {
                    renderQueryOrder.value = props.queryOrder
                },
                {
                    immediate: true
                }
            )

            return {
                renderQueryOrder,
                orderTypeList,
                handleInit,
                handleDelete,
                handleChange,
                handleTableChange,
                handlePlus,
                handleMinus
            }
        }
    })
</script>

<style lang="postcss" scoped>
    .order-by {
        margin: 8px 0;
        display: flex;
        align-items: center;
    }
    .order-by-item {
        width: calc(100% - 130px);
        max-width: 1656px;
        /deep/ .select-item {
            &.select-table {
                width: calc(50% + 135px);
                max-width: 862px;
            }
        }
    }
    .plus-icon {
        margin: 0 14px;
    }
</style>
