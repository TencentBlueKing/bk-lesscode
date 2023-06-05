<template>
    <section class="select-condition-wrapper">
        <section
            v-for="(condition, index) in renderConditionList"
            :key="index"
            :class="{
                'select-condition': true,
                'with-title': title,
                'sub-line': index > 0
            }"
        >
            <select-type
                v-if="index === 0 && title"
                class="condition-title"
                :value="title"
                :disable="true"
            />
            <select-type
                v-if="index > 0"
                class="condition-type"
                :list="conditionTypeList"
                :value="condition.type"
                @change="(val) => handleChange(index, val, 'type')"
            ></select-type>
            <select-table-field
                class="select-main"
                :field-id="condition.fieldId"
                :table-name="condition.tableName"
                :table-list="tableList"
                :custom-validate="customValidate"
                @change="(val) => handleValueChange(index, val)"
            />
            <select-type
                class="connect-type"
                :value="condition.expression"
                :list="connectTypeList"
                @change="(val) => handleChange(index, val, 'expression')"
            />
            <select-value
                class="select-value"
                :placeholder="$t('可用逗号分隔的字符串表示数组')"
                :value="condition.value"
                :param="condition.param"
                @change="(val) => handleValueChange(index, val)"
            />
            <plus-icon
                class="plus-icon"
                @click="handlePlusCondition"
            />
            <minus-icon
                v-if="allowClear || index > 0"
                @click="handleMinusCondition(index)"
            />
        </section>
    </section>
</template>

<script lang="ts">
    import {
        defineComponent,
        PropType,
        toRef
    } from '@vue/composition-api'
    import { ITable } from './select-table.vue'
    import SelectType from './select-type.vue'
    import SelectTableField from './select-table-field.vue'
    import SelectValue from './select-value.vue'
    import PlusIcon from '@/components/plus-icon.vue'
    import MinusIcon from '@/components/minus-icon.vue'
    import {
        CONDITION_TYPE,
        CONNECT_TYPE_LIST,
        getDefaultConnect
    } from 'shared/data-source'

    export interface ICondition {
        tableName: string;
        fieldId: string;
        expression: string;
        value: string;
        param: string;
        type: string;
    }

    export default defineComponent({
        components: {
            SelectType,
            SelectTableField,
            SelectValue,
            PlusIcon,
            MinusIcon
        },

        props: {
            conditionList: {
                type: Array as PropType<ICondition[]>
            },
            title: {
                type: String,
                default: ''
            },
            tableList: {
                type: Array as PropType<ITable[]>
            },
            allowClear: {
                type: Boolean,
                default: false
            },
            customValidate: {
                type: Function,
                default: () => {}
            }
        },

        setup (props, { emit }) {
            const renderConditionList = toRef(props, 'conditionList')
            const conditionTypeList = Object
                .keys(CONDITION_TYPE)
                .map((key) => ({
                    id: CONDITION_TYPE[key],
                    name: CONDITION_TYPE[key]
                }))
            const connectTypeList = CONNECT_TYPE_LIST.map(type => ({
                id: type,
                name: type
            }))

            const handlePlusCondition = () => {
                renderConditionList.value.push(getDefaultConnect())
                triggleUpdate()
            }

            const handleMinusCondition = (index) => {
                renderConditionList.value.splice(index, 1)
                triggleUpdate()
            }

            const handleValueChange = (index, val) => {
                Object.assign(renderConditionList.value[index], val)
                triggleUpdate()
            }

            const handleChange = (index, val, key) => {
                renderConditionList.value[index][key] = val
                triggleUpdate()
            }

            const triggleUpdate = () => {
                emit('change', renderConditionList.value)
            }

            return {
                renderConditionList,
                conditionTypeList,
                connectTypeList,
                handlePlusCondition,
                handleMinusCondition,
                handleValueChange,
                handleChange
            }
        }
    })
</script>

<style lang="postcss" scoped>
    .select-condition-wrapper {
        &:before, &::after {
            content: '';
            display: table;
            clear: both;
        }
    }
    .select-condition {
        width: 100%;
        display: flex;
        align-items: center;
        margin: 8px 8px 8px 0;
        position: relative;
        float: left;
        &.with-title {
            padding-left: 65px;
            .select-main {
                width: calc(50% - 35px);
                max-width: 800px;
            }
            &.sub-line {
                .select-main {
                    width: calc(50% - 99px);
                    max-width: 736px;
                }
            }
            .select-value {
                width: calc(50% - 87px);
            }
        }
        &.sub-line {
            .select-main {
                width: calc(50% - 67px);
                max-width: 801px;
            }
        }
        .select-main {
            margin-left: -1px;
            width: calc(50% - 2px);
            max-width: 865px;
        }
        .select-value {
            margin-left: -1px;
            width: calc(50% - 120px);
            max-width: 800px;
        }
        .connect-type {
            margin: 0 -1px 0 -4px;
        }
        .plus-icon {
            margin: 0 14px;
        }
        .condition-title {
            position: absolute;
            left: 0;
        }
        .condition-type {
            margin-left: -1px;
        }
    }
</style>
