<template>
    <article>
        <header>
            <render-header>数据操作</render-header>
            <div class="g-page-tab">
                <div
                    class="tab-item"
                    :class="{ active: queryType === 'json-query' }"
                    @click="toggleQueryType('json-query')"
                >数据查询</div>
                <div
                    class="tab-item"
                    :class="{ active: queryType === 'sql-query' }"
                    @click="toggleQueryType('sql-query')"
                >SQL 执行</div>
            </div>
        </header>

        <main class="data-operation-home">
            <json-query
                v-show="queryType === 'json-query'"
                ref="jsonQueryRef"
                :condition="conditionQuery"
                @change="handleQueryChange"
            />
            <sql-query
                v-show="queryType === 'sql-query'"
                ref="sqlQueryRef"
                :sql="sqlQuery"
                @change="handleQueryChange"
            />

            <section class="operation-button">
                <bk-button
                    theme="primary"
                    class="mr6"
                    :loading="isQueryLoading"
                    @click="handleQuery"
                >
                    查询
                </bk-button>
                <bk-button
                    class="mr6"
                    @click="handleGenApi"
                >
                    生成 API
                </bk-button>
                <bk-button
                    @click="handleGenFunction"
                >
                    生成函数
                </bk-button>
            </section>

            <section class="operation-result">
                <bk-tab
                    type="unborder-card"
                    :label-height="54"
                    :active.sync="queryTab"
                >
                    <bk-tab-panel
                        label="查询结果"
                        name="query-result"
                    />
                    <bk-tab-panel
                        label="查询历史"
                        name="query-history"
                    />
                </bk-tab>
                <query-result
                    v-show="queryTab === 'query-result'"
                    :query-type="queryType"
                    :condition="conditionQuery"
                    :sql="sqlQuery"
                    ref="queryResultRef"
                />
                <query-history
                    v-if="queryTab === 'query-history'"
                    @load="handleLoadHistory"
                />
            </section>
        </main>
        <edit-func-sideslider
            title="新增函数"
            :is-show.sync="funcData.isShow"
            :func-data="funcData.form"
        />
        <create-api-sideslider
            title="新增 API"
            :form="apiData.form"
            :is-show.sync="apiData.isShow"
        />
    </article>
</template>

<script lang="ts">
    import router from '@/router'
    import store from '@/store'
    import renderHeader from '../data-table/common/header'
    import JsonQuery from './children/json-query/index.vue'
    import SqlQuery from './children/sql-query.vue'
    import QueryResult from './children/query-result.vue'
    import QueryHistory from './children/query-history.vue'
    import EditFuncSideslider from '@/components/methods/forms/edit-func-sideslider.vue'
    import CreateApiSideslider from '@/components/api/create-api-sideslider/index.vue'

    import { messageError } from '@/common/bkmagic'
    import {
        API_METHOD,
        parseValue2Scheme,
        parseValue2UseScheme
    } from 'shared/api'
    import {
        FUNCTION_TYPE
    } from 'shared/function'
    import {
        defineComponent,
        ref
    } from '@vue/composition-api'

    export default defineComponent({
        components: {
            renderHeader,
            JsonQuery,
            SqlQuery,
            QueryResult,
            QueryHistory,
            EditFuncSideslider,
            CreateApiSideslider
        },

        setup () {
            const projectId = router?.currentRoute?.params?.projectId
            const versionId = store.getters['projectVersion/currentVersionId']
            // ref
            const jsonQueryRef = ref()
            const sqlQueryRef = ref()
            const queryResultRef = ref()
            // tab 展示
            const queryType = ref<string>('json-query')
            const queryTab = ref<string>('query-result')
            // 查询相关状态
            const conditionQuery = ref()
            const sqlQuery = ref('')
            const isQueryLoading = ref(false)
            // 新增相关状态
            const apiData = ref({
                isShow: false,
                form: {}
            })
            const funcData = ref({
                isShow: false,
                form: {}
            })

            const toggleQueryType = (val: string): void => {
                queryType.value = val
            }

            // 查询条件发生变化
            const handleQueryChange = (val) => {
                if (queryType.value === 'json-query') {
                    conditionQuery.value = val
                } else {
                    sqlQuery.value = val
                }
            }

            // 校验
            const validate = () => {
                const validateMap = {
                    'json-query' () {
                        return jsonQueryRef.value.validate()
                    },
                    'sql-query' () {
                        return sqlQueryRef.value.validate()
                    }
                }
                return validateMap[queryType.value]()
            }

            // 执行查询
            const handleQuery = () => {
                validate()
                    .then(() => {
                        // 切换到查询结果tab
                        queryTab.value = 'query-result'
                        // 接口查询
                        isQueryLoading.value = true
                        queryResultRef
                            .value
                            .handleQuery()
                            .finally(() => {
                                isQueryLoading.value = false
                            })
                    })
                    .catch((err) => {
                        messageError(err.message)
                    })
            }

            // 生成 api
            const handleGenApi = () => {
                validate()
                    .then(() => {
                        apiData.value.isShow = true
                        if (queryType.value === 'json-query') {
                            apiData.value.form = {
                                method: API_METHOD.POST,
                                projectId,
                                url: '/api/data-source/user/queryByJson',
                                body: parseValue2Scheme(conditionQuery.value)
                            }
                        } else {
                            apiData.value.form = {
                                method: API_METHOD.POST,
                                projectId,
                                url: '/api/data-source/user/queryBySql',
                                body: parseValue2Scheme({ sql: sqlQuery.value })
                            }
                        }
                    })
                    .catch((err) => {
                        messageError(err.message)
                    })
            }

            // 生成函数
            const handleGenFunction = () => {
                validate()
                    .then(() => {
                        funcData.value.isShow = true
                        const commonForm = {
                            projectId,
                            funcType: FUNCTION_TYPE.REMOTE,
                            versionId,
                            funcMethod: API_METHOD.POST,
                            funcBody: 'return res\r\n'
                        }
                        if (queryType.value === 'json-query') {
                            funcData.value.form = {
                                ...commonForm,
                                funcApiUrl: '/api/data-source/user/queryByJson',
                                apiBody: parseValue2UseScheme(conditionQuery.value)
                            }
                        } else {
                            funcData.value.form = {
                                ...commonForm,
                                funcApiUrl: '/api/data-source/user/queryBySql',
                                apiBody: parseValue2UseScheme({ sql: sqlQuery.value })
                            }
                        }
                    })
                    .catch((err) => {
                        messageError(err.message)
                    })
            }

            const handleLoadHistory = ({ type, condition, sql }) => {
                queryType.value = type
                if (type === 'json-query') {
                    jsonQueryRef.value.setRenderCondition(condition)
                } else {
                    sqlQuery.value = sql
                }
            }

            return {
                jsonQueryRef,
                sqlQueryRef,
                queryResultRef,
                queryType,
                queryTab,
                conditionQuery,
                sqlQuery,
                isQueryLoading,
                apiData,
                funcData,
                toggleQueryType,
                handleQueryChange,
                handleQuery,
                handleGenApi,
                handleGenFunction,
                handleLoadHistory
            }
        }
    })
</script>

<style lang="postcss" scoped>
    @import "@/css/mixins/scroller";
    .data-operation-home {
        padding: 20px 24px;
        height: calc(100% - 96px);
        overflow: auto;
        @mixin scroller;
    }
    .operation-button {
        margin: 16px 0 24px;
        .mr6 {
            margin-right: 6px;
        }
    }
    .operation-result {
        background: #FFFFFF;
        box-shadow: 0 2px 4px 0 rgba(25,25,41,0.05);
        padding: 0 20px 20px;
        /deep/ .bk-tab-section {
            padding: 0;
        }
    }
</style>
