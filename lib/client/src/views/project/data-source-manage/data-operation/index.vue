<template>
    <article>
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
                            <span class="operation-source-value">
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

        <main class="data-operation-home"
            v-bkloading="{ isLoading }"
        >
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
                    v-else-if="!projectInfo.token"
                    type="warning"
                    class="mb10"
                >
                    <span
                        slot="title"
                        class="data-base-tips"
                    >
                        需
                        <bk-link
                            :href="`/project/${projectInfo.id}/credential`"
                            target="href"
                        >生成凭证</bk-link>
                        ，用于预览环境使用绑定的蓝鲸应用身份调用接口
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
                            :href="`${v3DeveloperCenterUrl}/apps/${projectInfo.appCode}/cloudapi?apiName=bk-data&api=v3_meta_result_tables_mine_get,v3_queryengine_user_query_sync`"
                            target="href"
                        >申请权限</bk-link>
                        【接口：v3_queryengine_user_query_sync & v3_meta_result_tables_mine_get】，用于应用调用数据平台接口，如已申请可忽略
                    </span>
                </bk-alert>
            </template>

            <json-query
                v-show="queryType === 'json-query'"
                ref="jsonQueryRef"
                :condition="conditionQuery"
                :table-list="tableList"
                @change="handleConditionChange"
            />
            <sql-query
                v-show="queryType === 'sql-query'"
                ref="sqlQueryRef"
                :sql="sqlQuery"
                @change="handleSqlChange"
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
                    v-if="queryType === 'json-query'"
                    class="mr6"
                    @click="handleShowSql"
                >
                    查看 SQL
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
                    :table-list="tableList"
                    :data-source-type="dataSourceType"
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

<script lang="ts">
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
        onBeforeMount
    } from '@vue/composition-api'
    import {
        API_METHOD,
        parseValue2Scheme,
        parseValue2UseScheme
    } from 'shared/api'
    import {
        FUNCTION_TYPE
    } from 'shared/function'
    import {
        generateSqlByCondition
    } from 'shared/data-source'

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
            const v3DeveloperCenterUrl = V3_DEVELOPER_CENTER_URL
            // ref
            const dataSourceTypeRef = ref()
            const jsonQueryRef = ref()
            const sqlQueryRef = ref()
            const queryResultRef = ref()
            // tab 展示
            const dataSourceType = ref('preview')
            const queryType = ref<string>('json-query')
            const queryTab = ref<string>('query-result')
            // 项目数据
            const projectInfo = ref({
                id: '',
                appCode: '',
                moduleCode: '',
                token: ''
            })
            // 查询相关状态
            const conditionQuery = ref()
            const sqlQuery = ref('')
            const isQueryLoading = ref(false)
            const tableList = ref([])
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

            const toggleQueryType = (val: string): void => {
                queryType.value = val
            }

            // 选择数据源
            const chooseDataSource = (type) => {
                dataSourceTypeRef.value.hideHandler()
                if (type !== dataSourceType.value) {
                    dataSourceType.value = type
                    jsonQueryRef.value.handleClear()
                    sqlQuery.value = ''
                    // 重新获取数据
                    getTableList()
                        .catch(() => {
                            tableList.value = []
                        })
                }
            }

            // 查询条件发生变化
            const handleConditionChange = (val) => {
                conditionQuery.value = val
            }

            // 查询 sql 发生变化
            const handleSqlChange = (val) => {
                sqlQuery.value = val
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

            // 展示 SQL
            const handleShowSql = () => {
                validate()
                    .then(() => {
                        sqlData.value.isShow = true
                        sqlData.value.sql = generateSqlByCondition(conditionQuery.value, tableList.value)
                    })
                    .catch((err) => {
                        messageError(err.message)
                    })
            }

            const getFinalySql = () => {
                const sql = queryType.value === 'json-query'
                    ? generateSqlByCondition(conditionQuery.value, tableList.value)
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
                            body: parseValue2Scheme({ sql: getFinalySql() })
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
                        funcData.value.form = {
                            projectId,
                            funcType: FUNCTION_TYPE.REMOTE,
                            versionId,
                            funcMethod: API_METHOD.POST,
                            funcBody: 'return res\r\n',
                            funcApiUrl: '/api/data-source/user/queryBySql',
                            apiBody: parseValue2UseScheme({ sql: getFinalySql() })
                        }
                    })
                    .catch((err) => {
                        messageError(err.message)
                    })
            }

            const handleLoadHistory = (history) => {
                const loadHistory = () => {
                    dataSourceType.value = history.dataSourceType
                    queryType.value = history.type
                    if (history.type === 'json-query') {
                        jsonQueryRef.value.setRenderCondition(history.condition)
                    } else {
                        sqlQuery.value = history.sql
                    }
                }
                if (dataSourceType.value !== history.dataSourceType) {
                    getTableList(history.dataSourceType).then(loadHistory)
                } else {
                    loadHistory()
                }
            }

            const getTableList = (type = dataSourceType.value) => {
                isLoading.value = true
                return new Promise((resolve, reject) => {
                    store
                        .dispatch('dataSource/list', {
                            projectId,
                            dataSourceType: type
                        })
                        .then((res) => {
                            tableList.value = res.list
                            resolve(res)
                        })
                        .catch((err) => {
                            messageError(err.message || err)
                            reject(err)
                        })
                        .finally(() => {
                            isLoading.value = false
                        })
                })
            }

            // 获取项目相关信息
            const getProjectInfo = () => {
                Promise
                    .all([
                        store.dispatch('project/detail', { projectId }),
                        store.dispatch('functions/getTokenList', projectId)
                    ])
                    .then(([project, token]) => {
                        projectInfo.value.id = project.id
                        projectInfo.value.appCode = project.appCode
                        projectInfo.value.moduleCode = project.moduleCode
                        projectInfo.value.token = token?.data?.[0]
                    })
            }

            onBeforeMount(() => {
                getTableList()
                getProjectInfo()
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
                conditionQuery,
                sqlQuery,
                isQueryLoading,
                tableList,
                isLoading,
                apiData,
                funcData,
                sqlData,
                toggleQueryType,
                chooseDataSource,
                handleConditionChange,
                handleSqlChange,
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
