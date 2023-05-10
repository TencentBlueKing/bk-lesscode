<template>
    <section class="json-query-home">
        <h3 class="query-title">
            <span class="title-name">
                <i
                    :class="{
                        'bk-icon icon-angle-up-fill': true,
                        close: !isShowCondition
                    }"
                    @click="toggleShowCondition"
                ></i>
                {{ $t('查询条件') }} </span>
            <bk-button
                title="primary"
                size="small"
                :text="true"
                @click="handleClear"
            >
                {{ $t('清空') }} </bk-button>
        </h3>

        <template
            v-if="isShowCondition"
        >
            <bk-divider />
            <render-table
                :query-table="renderCondition.table"
                :query-group="renderCondition.groupBy"
                :table-list="tableList"
                :bk-base-biz-list="bkBaseBizList"
                :data-source-type="dataSourceType"
                @change="(value) => handleChange('table', value)"
                @updataBizs="(value) => $emit('updataBizs', value)"
            />
            <bk-divider />
            <render-where
                class="mb16"
                :query-where="renderCondition.where"
                :table-list="usedTableList"
                @change="(value) => handleChange('where', value)"
            />
            <render-group
                class="mb16"
                :query-group="renderCondition.groupBy"
                :table-list="usedTableList"
                @change="(value) => handleChange('groupBy', value)"
            />
            <render-order
                class="mb16"
                :query-order="renderCondition.orderBy"
                :table-list="usedTableList"
                @change="(value) => handleChange('orderBy', value)"
            />
            <render-limit
                class="mb16"
                :query-limit="renderCondition.limit"
                @change="(value) => handleChange('limit', value)"
            />
        </template>
    </section>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {
        defineComponent,
        ref,
        computed,
        PropType
    } from '@vue/composition-api'
    import RenderTable, { ITable, IBkBaseBiz } from './children/render-table.vue'
    import RenderWhere from './children/render-where.vue'
    import RenderGroup from './children/render-group.vue'
    import RenderOrder from './children/render-order.vue'
    import RenderLimit from './children/render-limit.vue'
    import {
        getDefaultCondition,
        findTable
    } from 'shared/data-source'
    import validateContainer from './children/composables/validate'

    export default defineComponent({
        components: {
            RenderTable,
            RenderWhere,
            RenderGroup,
            RenderOrder,
            RenderLimit
        },

        props: {
            condition: Object,
            tableList: Array as PropType<ITable[]>,
            dataSourceType: String,
            bkBaseBizList: Array as PropType<IBkBaseBiz[]>
        },

        setup (props, { emit }) {
            const isShowCondition = ref(true)
            const renderCondition = ref(Object.assign({}, getDefaultCondition(), props.condition))

            const usedTableList = computed(() => {
                return renderCondition
                    .value
                    .table
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
            })

            const toggleShowCondition = () => {
                isShowCondition.value = !isShowCondition.value
            }

            const handleClear = () => {
                renderCondition.value = Object.assign({}, getDefaultCondition())
                triggleChange()
            }

            const handleChange = (key, value) => {
                Vue.set(renderCondition.value, key, value)
                triggleChange()
            }

            const setRenderCondition = (condition) => {
                renderCondition.value = Object.assign({}, condition)
                triggleChange()
            }

            const triggleChange = () => {
                emit('change', renderCondition.value)
            }

            const validate = () => {
                return validateContainer.validate()
            }

            return {
                isShowCondition,
                renderCondition,
                usedTableList,
                toggleShowCondition,
                handleClear,
                handleChange,
                setRenderCondition,
                validate
            }
        }
    })
</script>

<style lang="postcss" scoped>
    .json-query-home {
        background: #FFFFFF;
        box-shadow: 0 2px 4px 0 rgba(25,25,41,0.05);
        border-radius: 2px;
        padding: 16px;
    }
    .query-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: 0;
        line-height: 38px;
        font-weight: normal;
        .title-name {
            font-size: 14px;
            color: #313238;
            font-weight: Bold;
        }
    }
    .icon-angle-up-fill {
        display: inline-block;
        cursor: pointer;
        font-size: 14px;
        margin-right: 11px;
        transition: transform 200ms;
        &.close {
            transform: rotate(-90deg);
        }
    }
    .mb16 {
        margin-bottom: 16px;
    }
</style>
