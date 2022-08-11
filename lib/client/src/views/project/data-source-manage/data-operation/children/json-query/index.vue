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
                查询条件
            </span>
            <bk-button
                title="primary"
                size="small"
                :text="true"
                @click="handleClear"
            >
                清空
            </bk-button>
        </h3>

        <template
            v-if="isShowCondition"
            v-bkloading="{ isLoading }"
        >
            <bk-divider />
            <render-table
                :query-table="renderCondition.table"
                :table-list="tableList"
                @change="(value) => handleChange('table', value)"
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
    import {
        defineComponent,
        ref,
        computed,
        onBeforeMount
    } from '@vue/composition-api'
    import store from '@/store'
    import router from '@/router'
    import RenderTable from './children/render-table.vue'
    import RenderWhere from './children/render-where.vue'
    import RenderGroup from './children/render-group.vue'
    import RenderOrder from './children/render-order.vue'
    import RenderLimit from './children/render-limit.vue'
    import {
        getDefaultCondition
    } from 'shared/data-source'
    import { messageError } from '@/common/bkmagic'
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
            condition: Object
        },

        setup (props, { emit }) {
            const projectId = router?.currentRoute?.params?.projectId
            const tableList = ref([])
            const isLoading = ref(false)
            const isShowCondition = ref(true)
            const renderCondition = ref(Object.assign({}, getDefaultCondition(), props.condition))

            const usedTableList = computed(() => {
                return renderCondition
                    .value
                    .table
                    .reduce((acc, cur) => {
                        const isUsed = acc.find(table => table.tableName === cur.tableName)
                        if (cur.tableName && !isUsed) {
                            const table = tableList.value.find(table => table.tableName === cur.tableName)
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
                renderCondition.value[key] = value
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

            const getTableList = () => {
                isLoading.value = true
                return store
                    .dispatch('dataSource/list', {
                        projectId
                    })
                    .then((res) => {
                        tableList.value = res.list
                    })
                    .catch((err) => {
                        messageError(err.message || err)
                    })
                    .finally(() => {
                        isLoading.value = false
                    })
            }

            onBeforeMount(getTableList)

            return {
                tableList,
                isLoading,
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
