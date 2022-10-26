<template>
    <section class="select-join-wrapper">
        <section
            v-for="(join, index) in renderJoinList"
            :key="'jon' + index"
            :class="{
                'select-join': true,
                'sub-line': index > 0
            }"
        >
            <select-type
                v-if="index === 0"
                class="join-title"
                :value="title"
                :disable="true"
            />
            <select-type
                v-if="index > 0"
                class="join-type ml1"
                :list="joinTypeList"
                :value="join.type"
                @change="(val) => handleJoinChange(index, val, 'type')"
            ></select-type>
            <select-table-field
                class="select-left ml1"
                :field-id="join.left.fieldId"
                :table-name="join.left.tableName"
                :table-list="joinTableList"
                @change="(val) => handleJoinChange(index, val, 'left')"
            />
            <select-type
                class="connect-type"
                value="="
                :disable="true"
            />
            <select-table-field
                class="select-right"
                :field-id="join.right.fieldId"
                :table-name="join.right.tableName"
                :table-list="joinTableList"
                @change="(val) => handleJoinChange(index, val, 'right')"
            />
            <plus-icon
                class="plus-icon"
                @click="handlePlusJoin"
            />
            <minus-icon
                v-if="index > 0"
                @click="handleMinusJoin(index)"
            />
        </section>
    </section>
</template>

<script lang="ts">
    import {
        defineComponent,
        PropType,
        ref,
        watch
    } from '@vue/composition-api'
    import SelectType from './select-type.vue'
    import SelectTableField, { IField } from './select-table-field.vue'
    import PlusIcon from '@/components/plus-icon.vue'
    import MinusIcon from '@/components/minus-icon.vue'
    import {
        CONDITION_TYPE,
        getDefaultTableOn
    } from 'shared/data-source'

    export interface IJoinOn {
        left: IField,
        right: IField,
        type: ''
    }

    export default defineComponent({
        components: {
            SelectTableField,
            SelectType,
            PlusIcon,
            MinusIcon
        },

        props: {
            joinList: Array as PropType<IJoinOn[]>,
            title: String,
            joinTableList: Array
        },

        setup (props, { emit }) {
            const renderJoinList = ref()
            const joinTypeList = Object
                .keys(CONDITION_TYPE)
                .map((key) => ({
                    id: CONDITION_TYPE[key],
                    name: CONDITION_TYPE[key]
                }))

            const handlePlusJoin = () => {
                renderJoinList.value.push(getDefaultTableOn())
                triggleUpdate()
            }

            const handleMinusJoin = (index) => {
                renderJoinList.value.splice(index, 1)
                triggleUpdate()
            }

            const handleJoinChange = (index, val, key) => {
                if (typeof val === 'string') {
                    renderJoinList.value[index][key] = val
                } else {
                    Object.assign(renderJoinList.value[index][key], val)
                }
                triggleUpdate()
            }

            const triggleUpdate = () => {
                emit('change', renderJoinList.value)
            }

            watch(
                () => props.joinList,
                () => {
                    renderJoinList.value = props.joinList
                },
                {
                    immediate: true
                }
            )

            return {
                renderJoinList,
                joinTypeList,
                handlePlusJoin,
                handleMinusJoin,
                handleJoinChange
            }
        }
    })
</script>

<style lang="postcss" scoped>
    .select-join-wrapper {
        &:before, &::after {
            content: '';
            display: table;
            clear: both;
        }
    }
    .select-join {
        width: 100%;
        display: flex;
        align-items: center;
        margin: 8px 8px 8px 0;
        padding-left: 65px;
        position: relative;
        float: left;
        &.sub-line {
            .select-left {
                width: calc(50% - 99px);
                max-width: 736px;
            }
        }
        .select-left {
            width: calc(50% - 35px);
            max-width: 800px;
        }
        .select-right {
            width: calc(50% - 86px);
            max-width: 800px;
        }
        .ml1 {
            margin-left: -1px;
        }
        .connect-type {
            margin: 0 -1px 0 -4px;
        }
        .plus-icon {
            margin: 0 14px;
        }
        .join-title {
            position: absolute;
            left: 0;
        }
    }
</style>
