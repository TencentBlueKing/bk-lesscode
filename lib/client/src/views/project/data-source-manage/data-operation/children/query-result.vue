<template>
    <section v-if="queryResult.length && queryResult[0].length">
        <bk-table
            v-for="(data, index) in displayResult"
            :key="index"
            :outer-border="false"
            :header-border="false"
            :header-cell-style="{ background: '#f0f1f5' }"
            :data="data"
            :pagination="paginationList[index]"
            @page-change="(val) => handlePageChange(val, index)"
            @page-limit-change="(val) => handlePageLimitChange(val, index)"
            class="mt20 g-hairless-table"
        >
            <bk-table-column
                v-for="column in Object.keys(data[0])"
                :key="column"
                :label="column"
                :prop="column"
                :formatter="formatter"
                show-overflow-tooltip
            />
        </bk-table>
    </section>
    <bk-exception
        v-else-if="queryErrorMessage"
        class="exception-part"
        type="500"
        scene="part">
        <span>{{ queryErrorMessage }}</span>
    </bk-exception>
    <bk-exception
        v-else
        class="exception-part"
        type="empty"
        scene="part">
        <span>暂无数据</span>
    </bk-exception>
</template>

<script>
    import {
        defineComponent,
        ref,
        watch
    } from '@vue/composition-api'
    import store from '@/store'
    import router from '@/router'
    import dayjs from 'dayjs'
    import {
        isEmpty
    } from 'shared/util'
    import {
        generateSqlByCondition
    } from 'shared/data-source'

    export default defineComponent({
        props: {
            queryType: String,
            condition: Object,
            sql: String,
            tableList: Array,
            dataSourceType: String
        },

        setup (props) {
            const queryResult = ref([])
            const displayResult = ref([])
            const queryErrorMessage = ref('')
            const paginationList = ref([])

            const formatter = (row, column, cellValue, index) => {
                const value = row[column.property]
                if (isEmpty(value)) {
                    return '--'
                } else if (typeof value === 'object') {
                    return JSON.stringify(value)
                } else if (/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/.test(value)) {
                    return dayjs(value).format('YYYY-MM-DD HH:mm:ss')
                } else {
                    return value
                }
            }

            // 清空数据
            const clearStatus = () => {
                queryErrorMessage.value = ''
                queryResult.value = []
                paginationList.value = []
                displayResult.value = []
            }

            // 执行查询
            const handleQuery = () => {
                clearStatus()
                // 查询记录
                const queryRecord = {
                    type: props.queryType,
                    projectId: router?.currentRoute?.params?.projectId,
                    dataSourceType: props.dataSourceType
                }
                if (props.queryType === 'json-query') {
                    queryRecord.condition = props.condition
                    queryRecord.sql = generateSqlByCondition(props.condition, props.tableList)
                } else {
                    queryRecord.sql = props.sql
                }
                // 执行查询
                return store
                    .dispatch('dataSource/queryBySql', {
                        sql: queryRecord.sql,
                        dataSourceType: props.dataSourceType
                    })
                    .then(({ data, spendTime }) => {
                        // 存储总数
                        queryResult.value = data
                        // 分页数据
                        data.forEach((item) => {
                            paginationList.value.push({
                                limit: 10,
                                current: 1,
                                count: item.length
                            })
                            displayResult.value.push([])
                        })
                        // 计算需要展示的数据
                        calcDisplayResult()
                        // 查询记录
                        queryRecord.status = 0
                        queryRecord.spendTime = spendTime
                    })
                    .catch((err) => {
                        queryErrorMessage.value = err.message
                        queryRecord.status = 1
                        queryRecord.message = err.message
                    })
                    .finally(() => {
                        // 记录本次查询
                        store.dispatch('dataSource/addQueryHistory', queryRecord)
                    })
            }

            // 本地翻页
            const handlePageChange = (current, index) => {
                paginationList.value[index].current = current
                calcDisplayResult()
            }

            // 页数改变
            const handlePageLimitChange = (limit, index) => {
                paginationList.value[index].limit = limit
                calcDisplayResult()
            }

            // 计算展示的搜索结果
            const calcDisplayResult = () => {
                queryResult.value.forEach((item, index) => {
                    const pagination = paginationList.value[index]
                    displayResult
                        .value[index]
                        .splice(
                            0,
                            displayResult.value[index].length,
                            ...item.slice(
                                (pagination.current - 1) * pagination.limit,
                                pagination.current * pagination.limit
                            )
                        )
                })
            }

            watch(
                () => props.queryType,
                () => {
                    clearStatus()
                }
            )

            return {
                queryResult,
                displayResult,
                queryErrorMessage,
                paginationList,
                formatter,
                handleQuery,
                handlePageChange,
                handlePageLimitChange
            }
        }
    })
</script>

<style lang="postcss" scoped>
    .mt20 {
        margin-top: 20px;
    }
    .exception-part {
        height: 320px;
        padding-top: 90px;
    }
</style>
