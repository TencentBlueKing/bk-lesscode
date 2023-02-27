<template>
    <article
        v-bkloading="{
            isLoading,
            title: dataSourceType === 'preview' ? '正在加载 Mysql 数据表' : '正在加载 BkBase 结果表'
        }"
    >
        <header>
            <render-header>
                <span class="operation-title">
                    数据操作
                    <bk-divider
                        direction="vertical"
                        color="#C4C6CC"
                    ></bk-divider>
                    <span class="operation-source">
                        数据源 :
                        <bk-popover
                            ref="dataSourceTypeRef"
                            placement="bottom"
                            trigger="click"
                            theme="light"
                            ext-cls="g-popover-empty-padding"
                            :tippy-options="{ arrow: false }"
                        >
                            <span
                                class="operation-source-value"
                                v-bk-tooltips="{
                                    content: '目前只支持查询 mysql 或 tspider 的结果表',
                                    disabled: dataSourceType === 'preview'
                                }"
                            >
                                {{ dataSourceType === 'preview' ? 'Mysql 数据表' : 'BkBase 结果表' }}
                                <i class="bk-icon icon-angle-down"></i>
                            </span>
                            <ul
                                slot="content"
                                class="operation-source-list"
                            >
                                <li
                                    :class="{
                                        active: dataSourceType === 'preview',
                                        'operation-source-item': true
                                    }"
                                    @click="chooseDataSource('preview')"
                                >
                                    Mysql 数据表
                                </li>
                                <li
                                    :class="{
                                        active: dataSourceType === 'bk-base',
                                        'operation-source-item': true
                                    }"
                                    @click="chooseDataSource('bk-base')"
                                >
                                    BkBase 结果表
                                </li>
                            </ul>
                        </bk-popover>
                    </span>
                </span>
            </render-header>
            <div class="g-page-tab">
                <div
                    class="tab-item"
                    :class="{ active: queryType === 'json-query' }"
                    @click="toggleQueryType('json-query')"
                >查询描述</div>
                <div
                    class="tab-item"
                    :class="{ active: queryType === 'sql-query' }"
                    @click="toggleQueryType('sql-query')"
                >SQL</div>
            </div>
        </header>
        <main class="data-operation-home">
            <template v-if="dataSourceType === 'bk-base'">
                <bk-alert
                    v-if="!projectInfo.appCode || !projectInfo.moduleCode"
                    type="warning"
                    class="mb10"
                >
                    <span
                        slot="title"
                        class="data-base-tips"
                    >
                        请先
                        <bk-link
                            :href="`/project/${projectInfo.id}/basic`"
                            target="href"
                        >绑定蓝鲸应用模块</bk-link>
                    </span>
                </bk-alert>
                <bk-alert
                    v-else
                    type="warning"
                    class="mb10"
                    closable
                >
                    <span
                        slot="title"
                        class="data-base-tips"
                    >
                        应用需
                        <bk-link
                            :href="`${v3DeveloperCenterUrl}/apps/${projectInfo.appCode}/cloudapi?apiName=bk-data&api=v3_meta_result_tables_mine_get,v3_queryengine_user_query_sync,v3_meta_bizs`"
                            target="href"
                        >申请权限</bk-link>
                        【接口：v3_queryengine_user_query_sync & v3_meta_result_tables_mine_get & v3_meta_bizs】，用于应用调用数据平台接口，如已申请可忽略
                    </span>
                </bk-alert>
            </template>

            <json-query
                v-show="queryType === 'json-query'"
                ref="jsonQueryRef"
                :condition="conditionQuery"
                :table-list="tableList"
                :bk-base-biz-list="bkBaseBizList"
                :data-source-type="dataSourceType"
                @change="handleConditionChange"
                @updataBizs="handleUpdateBiz"
            />
            <sql-query
                v-show="queryType === 'sql-query'"
                ref="sqlQueryRef"
                :sql="sqlQuery"
                :table-list="tableList"
                :bk-base-biz-list="bkBaseBizList"
                :data-source-type="dataSourceType"
                @change="handleSqlChange"
            />

            <section class="operation-button">
                <span
                    v-bk-tooltips="{
                        disabled: !isEmptySql,
                        content: '填写 SQL 后，可执行查询'
                    }"
                >
                    <bk-button
                        theme="primary"
                        class="mr6"
                        :disabled="isEmptySql"
                        :loading="isQueryLoading"
                        @click="handleQuery"
                    >
                        查询
                    </bk-button>
                </span>
                <span
                    v-if="queryType === 'json-query'"
                    v-bk-tooltips="{
                        disabled: isSuccessfulQuery,
                        content: '成功查询后，可查看 SQL'
                    }"
                >
                    <bk-button
                        class="mr6"
                        :disabled="!isSuccessfulQuery"
                        @click="handleShowSql"
                    >
                        查看 SQL
                    </bk-button>
                </span>
                <span
                    v-bk-tooltips="{
                        disabled: isSuccessfulQuery,
                        content: '成功查询后，可生成 API'
                    }"
                >
                    <bk-button
                        class="mr6"
                        :disabled="!isSuccessfulQuery"
                        @click="handleGenApi"
                    >
                        生成 API
                    </bk-button>
                </span>
                <span
                    v-bk-tooltips="{
                        disabled: isSuccessfulQuery,
                        content: '成功查询后，可生成函数'
                    }"
                >
                    <bk-button
                        :disabled="!isSuccessfulQuery"
                        @click="handleGenFunction"
                    >
                        生成函数
                    </bk-button>
                </span>
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
                    ref="queryResultRef"
                    :query-type="queryType"
                    :condition="conditionQuery"
                    :sql="sqlQuery"
                    :table-list="tableList"
                    :bk-base-biz-list="bkBaseBizList"
                    :data-source-type="dataSourceType"
                    :is-successful-query="isSuccessfulQuery"
                    @changeQueryStatus="changeQueryStatus"
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
            :is-edit="false"
        />
        <create-api-sideslider
            title="新增 API"
            :form="apiData.form"
            :is-show.sync="apiData.isShow"
            :is-edit="false"
        />
        <bk-dialog
            theme="primary"
            width="1100"
            title="SQL"
            v-model="sqlData.isShow"
        >
            <monaco
                read-only
                language="sql"
                :height="500"
                :value="sqlData.sql"
            ></monaco>
        </bk-dialog>
    </article>
</template>

<script>
    import router from '@/router'
    import store from '@/store'
    import RenderHeader from '../data-table/common/header'
    import JsonQuery from './children/json-query/index.vue'
    import SqlQuery from './children/sql-query.vue'
    import QueryResult from './children/query-result.vue'
    import QueryHistory from './children/query-history.vue'
    import EditFuncSideslider from '@/components/methods/forms/edit-func-sideslider.vue'
    import CreateApiSideslider from '@/components/api/create-api-sideslider/index.vue'
    import Monaco from '@/components/monaco.vue'

    import { messageError } from '@/common/bkmagic'
    import {
        defineComponent,
        ref,
        computed,
        onBeforeMount
    } from '@vue/composition-api'
    import {
        API_METHOD,
        parseValue2Scheme,
        parseValue2UseScheme,
        getParamFromApi
    } from 'shared/api'
    import {
        FUNCTION_TYPE
    } from 'shared/function'
    import {
        generateSqlByCondition
    } from 'shared/data-source'
    import {
        isEmpty
    } from 'shared/util'

    export default defineComponent({
        components: {
            RenderHeader,
            JsonQuery,
            SqlQuery,
            QueryResult,
            QueryHistory,
            EditFuncSideslider,
            CreateApiSideslider,
            Monaco
        },

        setup () {
            const projectId = router?.currentRoute?.params?.projectId
            const versionId = store.getters['projectVersion/currentVersionId']
            const v3DeveloperCenterUrl = process.env.BK_V3_DEVELOPER_CENTER_URL
            // ref
            const dataSourceTypeRef = ref()
            const jsonQueryRef = ref()
            const sqlQueryRef = ref()
            const queryResultRef = ref()
            // tab 展示
            const dataSourceType = ref('preview')
            const queryType = ref('json-query')
            const queryTab = ref('query-result')
            // 项目数据
            const projectInfo = ref({
                id: '',
                appCode: '',
                moduleCode: '',
            })
            // 是否成功查询
            const isSuccessfulQuery = ref(false)
            // 查询相关状态
            const conditionQuery = ref()
            const sqlQuery = ref('')
            const isQueryLoading = ref(false)
            // prevew 表列表
            const tableList = ref([])
            // bk-base 业务列表，包含了结果表
            const bkBaseBizList = ref([])
            const isLoading = ref(false)
            // 弹框 & 侧滑相关状态
            const apiData = ref({
                isShow: false,
                form: {}
            })
            const funcData = ref({
                isShow: false,
                form: {}
            })
            const sqlData = ref({
                isShow: false,
                sql: ''
            })

            // 计算变量
            const isEmptySql = computed(() => {
                return queryType.value === 'sql-query' && isEmpty(sqlQuery.value)
            })

            // 方法
            const toggleQueryType = (val) => {
                queryType.value = val
            }

            const changeQueryStatus = (val) => {
                isSuccessfulQuery.value = val
            }

            // 选择数据源
            const chooseDataSource = (type) => {
                dataSourceTypeRef.value.hideHandler()
                if (type !== dataSourceType.value) {
                    dataSourceType.value = type
                    jsonQueryRef.value.handleClear()
                    sqlQuery.value = ''
                    // 重新获取数据
                    isLoading.value = true
                    getTableList()
                        .catch(() => {
                            tableList.value = []
                            bkBaseBizList.value = []
                        })
                        .finally(() => {
                            isLoading.value = false
                        })
                }
            }

            // 查询条件发生变化
            const handleConditionChange = (val) => {
                conditionQuery.value = val
                // 查询条件发生变化以后，需要重置成功查询状态
                changeQueryStatus(false)
            }

            // 查询 sql 发生变化
            const handleSqlChange = (val) => {
                sqlQuery.value = val
                // 查询条件发生变化以后，需要重置成功查询状态
                changeQueryStatus(false)
            }

            // bk-base 数据发生变化
            const handleUpdateBiz = (val) => {
                bkBaseBizList.value = val
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

            const getAllTables = () => {
                let tables = []
                if (dataSourceType.value === 'preview') {
                    tables = tableList.value
                } else {
                    bkBaseBizList.value.forEach((bkBaseBiz) => {
                        tables.push(...bkBaseBiz.tables)
                    })
                }
                return tables
            }

            // 展示 SQL
            const handleShowSql = () => {
                validate()
                    .then(() => {
                        sqlData.value.isShow = true
                        sqlData.value.sql = generateSqlByCondition(conditionQuery.value, getAllTables())
                    })
                    .catch((err) => {
                        messageError(err.message)
                    })
            }

            const getFinalySql = () => {
                const sql = queryType.value === 'json-query'
                    ? generateSqlByCondition(conditionQuery.value, getAllTables())
                    : sqlQuery.value
                // 回车转空格
                return sql.replace(/\r\n/g, ' ')
            }

            // 生成 api
            const handleGenApi = () => {
                validate()
                    .then(() => {
                        apiData.value.isShow = true
                        apiData.value.form = {
                            method: API_METHOD.POST,
                            projectId,
                            url: '/api/data-source/user/queryBySql',
                            body: parseValue2Scheme({
                                sql: getFinalySql(),
                                dataSourceType: dataSourceType.value
                            })
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
                        const apiBody = parseValue2UseScheme({
                            sql: getFinalySql(),
                            dataSourceType: dataSourceType.value
                        })
                        const funcParams = getParamFromApi(null, apiBody, 'post')
                        funcData.value.isShow = true
                        funcData.value.form = {
                            projectId,
                            funcType: FUNCTION_TYPE.REMOTE,
                            versionId,
                            funcMethod: API_METHOD.POST,
                            funcBody: 'return res\r\n',
                            funcApiUrl: '/api/data-source/user/queryBySql',
                            funcParams,
                            apiBody
                        }
                    })
                    .catch((err) => {
                        messageError(err.message)
                    })
            }

            const handleLoadHistory = (history) => {
                dataSourceType.value = history.dataSourceType
                isLoading.value = true
                getTableList(history.dataSourceType)
                    .then(() => {
                        if (history.dataSourceType === 'bk-base') {
                            return getInitBkBaseTables(history.condition)
                        }
                    })
                    .then(() => {
                        queryType.value = history.type
                        if (history.type === 'json-query') {
                            jsonQueryRef.value.setRenderCondition(history.condition)
                            sqlQuery.value = ''
                        } else {
                            jsonQueryRef.value.handleClear()
                            sqlQuery.value = history.sql
                        }
                    })
                    .finally(() => {
                        isLoading.value = false
                    })
            }

            // 已选择的表，刷新页面后需要自动展开获取该数据，否则select不展示
            const getInitBkBaseTables = (condition) => {
                const bkBizIds = condition?.table?.map(table => table.bkBizId)
                if (!Array.isArray(bkBizIds) || bkBizIds.length <= 0) {
                    return Promise.resolve()
                }
                return store
                    .dispatch('dataSource/getBkBaseTables', bkBizIds)
                    .then(({ list }) => {
                        const hasLoadedBizs = bkBaseBizList.value.filter(bkBaseBiz => bkBizIds.includes(+bkBaseBiz.bkBizId))
                        hasLoadedBizs.forEach((bkBaseBiz) => {
                            bkBaseBiz.loaded = true
                            bkBaseBiz.tables = list.filter(table => table.bkBizId === +bkBaseBiz.bkBizId)
                        })
                    })
            }

            const getTableList = (type = dataSourceType.value) => {
                return new Promise((resolve, reject) => {
                    store
                        .dispatch('dataSource/list', {
                            projectId,
                            dataSourceType: type
                        })
                        .then((res) => {
                            if (type === 'preview') {
                                tableList.value = res.list
                            } else {
                                bkBaseBizList.value = res.list.map((item) => ({
                                    ...item,
                                    tables: [],
                                    loaded: false
                                }))
                            }
                            resolve(res)
                        })
                        .catch((err) => {
                            messageError(err.message || err)
                            reject(err)
                        })
                })
            }

            // 获取项目相关信息
            const getProjectInfo = () => {
                return store
                    .dispatch('project/detail', { projectId })
                    .then((project) => {
                        projectInfo.value.id = project.id
                        projectInfo.value.appCode = project.appCode
                        projectInfo.value.moduleCode = project.moduleCode
                    })
            }

            onBeforeMount(() => {
                isLoading.value = true
                Promise
                    .all([
                        getTableList(),
                        getProjectInfo()
                    ])
                    .finally(() => {
                        isLoading.value = false
                    })
            })

            return {
                v3DeveloperCenterUrl,
                dataSourceTypeRef,
                jsonQueryRef,
                sqlQueryRef,
                queryResultRef,
                dataSourceType,
                queryType,
                queryTab,
                projectInfo,
                isSuccessfulQuery,
                conditionQuery,
                sqlQuery,
                isQueryLoading,
                tableList,
                bkBaseBizList,
                isLoading,
                apiData,
                funcData,
                sqlData,
                isEmptySql,
                toggleQueryType,
                changeQueryStatus,
                chooseDataSource,
                handleConditionChange,
                handleSqlChange,
                handleUpdateBiz,
                handleQuery,
                handleShowSql,
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
    .operation-title {
        display: flex;
        align-items: center;
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
    .operation-source {
        font-size: 12px;
        color: #63656E;
        .tippy-active {
            .icon-angle-down {
                transform: rotate(-180deg);
            }
        }
    }
    .operation-source-value {
        font-size: 12px;
        color: #3A84FF;
        cursor: pointer;
        margin-left: 2px;
        .icon-angle-down {
            font-size: 18px;
            transition: transform 200ms;
            display: inline-block;
        }
    }
    .operation-source-list {
        padding: 4px 0;
        .operation-source-item {
            cursor: pointer;
            line-height: 32px;
            padding: 0 12px;
            &:hover {
                background: #F5F7FA;
            }
            &.active {
                background: #E1ECFF;
                color: #3A84FF;
            }
        }
    }
    .data-base-tips {
        .bk-link {
            vertical-align: baseline;
            color: #3A84FF;
        }
        /deep/ .bk-link-text {
            font-size: 12px;
        }
    }
</style>
