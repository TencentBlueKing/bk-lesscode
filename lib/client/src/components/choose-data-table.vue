<template>
    <section>
        <bk-select
            searchable
            class="choose-data-table"
            ref="selectRef"
            :show-empty="false"
            :value="value"
            :loading="isLoadingList"
            @clear="handleClearTable"
        >
            <span
                v-bk-overflow-tips="{ content: value }"
                class="display-value"
                slot="trigger"
            >
                {{ value }}
                <img src="../images/svg/loading.svg" class="bk-select-loading" v-if="isLoadingList">
                <i class="bk-select-angle bk-icon icon-angle-down" v-else></i>
            </span>
            <bk-option-group :name="tableGroups[0].name">
                <span slot="group-name">
                    {{ tableGroups[0].name }}
                    <i
                        class="bk-drag-icon bk-drag-jump-link tool-icon"
                        @click="handleCreate"
                    ></i>
                    <i
                        class="bk-icon icon-refresh tool-icon"
                        @click="getMysqlTables"
                    ></i>
                </span>
                <section v-bkloading="{ isLoading: tableGroups[0].isLoading }">
                    <bk-option
                        v-for="table in tableGroups[0].children"
                        :key="table.tableName"
                        :id="table.tableName"
                        :name="table.tableName"
                        @click.native="handleSelectTable(table.tableName, tableGroups[0].dataSourceType)"
                    >
                    </bk-option>
                    <bk-exception
                        v-if="tableGroups[0].children.length <= 0"
                        ext-cls="exception-wrap-item exception-part"
                        type="empty"
                        scene="part"
                    >
                        请点击上方刷新按钮获取 Mysql 数据表
                    </bk-exception>
                </section>
            </bk-option-group>
            <bk-option-group
                class="bk-base-options"
                :name="tableGroups[1].name"
            >
                <span slot="group-name">
                    <span v-bk-tooltips="{ content: '目前只支持查询 mysql 或 tspider 的结果表' }">{{ tableGroups[1].name }}</span>
                    <i
                        class="bk-icon icon-refresh tool-icon"
                        @click="getBkBaseBizs"
                    ></i>
                </span>
                <section v-bkloading="{ isLoading: tableGroups[1].isLoading }">
                    <bk-option-group
                        v-for="bkBaseBiz in tableGroups[1].children"
                        :key="bkBaseBiz.bkBizId"
                        :name="bkBaseBiz.bkBizName"
                    >
                        <span slot="group-name">
                            <i
                                v-if="isOpenIds.includes(bkBaseBiz.bkBizId)"
                                class="node-folder-icon mr5 bk-icon icon-down-shape"
                                @click="handleHideOptions(bkBaseBiz.bkBizId)"
                            ></i>
                            <span
                                v-else-if="isLoadingIds.includes(bkBaseBiz.bkBizId)"
                                class="mr5 span-loading"
                            ></span>
                            <i
                                v-else
                                class="node-folder-icon mr5 bk-icon icon-right-shape"
                                @click="handleShowOptions(bkBaseBiz.bkBizId)"
                            ></i>
                            <span>{{ bkBaseBiz.bkBizName }}</span>
                        </span>
                        <template v-if="isOpenIds.includes(bkBaseBiz.bkBizId)">
                            <bk-option
                                v-for="table in bkBaseBiz.tables"
                                :key="table.id"
                                :id="table.tableName"
                                :name="table.tableName"
                                @click.native="handleSelectTable(table.tableName, tableGroups[1].dataSourceType)"
                            >
                            </bk-option>
                            <bk-exception
                                v-if="bkBaseBiz.tables.length <= 0 && bkBaseBiz.loaded"
                                ext-cls="exception-wrap-item exception-part"
                                type="empty"
                                scene="part"
                            >
                                暂无数据
                            </bk-exception>
                        </template>
                    </bk-option-group>
                    <bk-exception
                        v-if="!projectInfo.appCode || !projectInfo.moduleCode"
                        ext-cls="exception-wrap-item exception-part"
                        type="empty"
                        scene="part"
                    >
                        <span
                            class="data-base-tips"
                        >
                            请先
                            <bk-link
                                :href="`/project/${projectInfo.id}/basic`"
                                target="href"
                            >绑定蓝鲸应用模块</bk-link>
                        </span>
                    </bk-exception>
                    <bk-exception
                        v-else-if="tableGroups[1].children.length <= 0"
                        ext-cls="exception-wrap-item exception-part"
                        type="empty"
                        scene="part"
                    >
                        <span
                            class="data-base-tips"
                        >
                            请
                            <bk-link
                                :href="`${v3DeveloperCenterUrl}/apps/${projectInfo.appCode}/cloudapi?apiName=bk-data&api=v3_meta_result_tables_mine_get,v3_queryengine_user_query_sync,v3_meta_bizs`"
                                target="href"
                                v-bk-tooltips="{
                                    boundary: 'window',
                                    width: 350,
                                    content: '应用需要接口【v3_queryengine_user_query_sync & v3_meta_result_tables_mine_get & v3_meta_bizs】的权限，用于应用调用数据平台接口'
                                }"
                            >申请权限</bk-link>
                            。如已申请，可点击上方刷新按钮获取 BkBase 结果表
                        </span>
                    </bk-exception>
                </section>
            </bk-option-group>
        </bk-select>
        <bk-button
            v-if="showDataButton"
            class="mt10"
            theme="primary"
            size="small"
            :disabled="!value"
            :loading="isLoadingData"
            @click="handleGetTableDatas(value, dataSourceType)"
        >获取数据</bk-button>
    </section>
</template>

<script lang="ts">
    import {
        defineComponent,
        ref,
        onBeforeMount
    } from '@vue/composition-api'
    import store from '@/store'
    import router from '@/router'
    import {
        DATA_SOURCE_TYPE,
        findTable
    } from 'shared/data-source'

    export default defineComponent({
        props: {
            value: {
                type: String
            },
            dataSourceType: {
                type: String
            },
            showDataButton: {
                type: Boolean,
                default: true
            }
        },

        setup (props, { emit }) {
            const selectRef = ref()
            const isLoadingData = ref(false)
            const isLoadingList = ref(false)
            const isLoadingIds = ref([])
            const isOpenIds = ref([])
            const projectId = router?.currentRoute?.params?.projectId
            const v3DeveloperCenterUrl = process.env.BK_V3_DEVELOPER_CENTER_URL
            // 项目数据
            const projectInfo = ref({
                id: '',
                appCode: '',
                moduleCode: ''
            })
            const tableGroups = ref([
                {
                    name: 'Mysql 数据表',
                    dataSourceType: DATA_SOURCE_TYPE.PREVIEW,
                    children: [],
                    isLoading: false
                },
                {
                    name: 'BkBase 结果表',
                    dataSourceType: DATA_SOURCE_TYPE.BK_BASE,
                    children: [],
                    isLoading: false
                }
            ])

            // 选择表
            const handleSelectTable = (tableName, dataSourceType) => {
                // 选完以后立即触发选中事件
                const table = findTable(tableName, dataSourceType, tableGroups.value[0].children, tableGroups.value[1].children)
                emit('choose-table', { tableName, table, dataSourceType })
                // 立即更新数据
                handleGetTableDatas(tableName, dataSourceType)
            }

            // 获取表数据
            const handleGetTableDatas = (tableName, bkDataSourceType) => {
                isLoadingData.value = true
                const queryData = {
                    tableName,
                    bkDataSourceType
                }
                store
                    .dispatch('dataSource/getTableDatas', queryData)
                    .then((data) => {
                        emit('fetch-data', data)
                    })
                    .finally(() => {
                        isLoadingData.value = false
                    })
            }

            // 隐藏 bk-base options
            const handleHideOptions = (bkBizId) => {
                const index = isOpenIds.value.findIndex(isOpenId => isOpenId === bkBizId)
                isOpenIds.value.splice(index, 1)
            }

            // 展示 bk-base options
            const handleShowOptions = (bkBizId) => {
                const bkBaseBiz = tableGroups.value[1].children.find(bkBaseBiz => bkBaseBiz.bkBizId === bkBizId)
                if (!bkBaseBiz.loaded) {
                    // 加载数据
                    isLoadingIds.value.push(bkBizId)
                    store
                        .dispatch('dataSource/getBkBaseTables', bkBizId)
                        .then((data) => {
                            // 展开
                            isOpenIds.value.push(bkBizId)
                            // 更新数据
                            bkBaseBiz.loaded = true
                            bkBaseBiz.tables = data?.list || []
                        })
                        .finally(() => {
                            const index = isLoadingIds.value.findIndex(isLoadingId => isLoadingId === bkBizId)
                            isLoadingIds.value.splice(index, 1)
                        })
                } else {
                    // 直接展开
                    isOpenIds.value.push(bkBizId)
                }
            }

            // 获取 mysql 数据表
            const getMysqlTables = () => {
                tableGroups.value[0].isLoading = true
                return store
                    .dispatch('dataSource/list', { projectId, dataSourceType: DATA_SOURCE_TYPE.PREVIEW })
                    .then(({ list }) => {
                        tableGroups.value[0].children = list
                    })
                    .finally(() => {
                        tableGroups.value[0].isLoading = false
                    })
            }

            // 获取 bk-base 结果表
            const getBkBaseBizs = () => {
                tableGroups.value[1].isLoading = true
                return store
                    .dispatch('dataSource/list', { projectId, dataSourceType: DATA_SOURCE_TYPE.BK_BASE })
                    .then(({ list }) => {
                        tableGroups.value[1].children = list.map((item) => ({
                            ...item,
                            tables: [],
                            loaded: false
                        }))
                    })
                    .finally(() => {
                        tableGroups.value[1].isLoading = false
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

            const handleCreate = () => {
                window.open(`/project/${projectId}/data-source-manage/`, '_blank')
            }

            const handleClearTable = () => {
                emit('clear')
            }

            onBeforeMount(() => {
                // 加载表列表loading
                isLoadingList.value = true
                Promise
                    .all([
                        getMysqlTables(),
                        getProjectInfo()
                    ])
                    .then(() => {
                        // 初始化的时候，需要同步获取最新的表数据
                        if (props.value) {
                            handleGetTableDatas(props.value, props.dataSourceType)
                        }
                    })
                    .finally(() => {
                        isLoadingList.value = false
                    })
            })

            return {
                selectRef,
                isLoadingData,
                isLoadingList,
                isLoadingIds,
                isOpenIds,
                v3DeveloperCenterUrl,
                projectInfo,
                tableGroups,
                handleSelectTable,
                getMysqlTables,
                getBkBaseBizs,
                handleCreate,
                handleClearTable,
                handleGetTableDatas,
                handleHideOptions,
                handleShowOptions
            }
        }
    })
</script>

<style lang="postcss" scoped>
    @import "@/css/mixins/ellipsis";

    .choose-data-table {
        height: 32px;
    }
    .display-value {
        @mixin ellipsis 100%, inline-block;
        line-height: 32px;
        padding: 0 36px 0 10px;
    }
    /deep/ .exception-wrap-item {
        .bk-exception-text {
            font-size: 12px;
            margin-top: -20px;
            margin-bottom: 10px;
            color: #979ba5;
        }
    }
    .icon-plus-circle {
        display: inline-block;
        vertical-align: baseline;
        font-size: 12px;
        margin-right: 4px;
    }
    .tool-icon {
        cursor: pointer;
        color: #3A84FF;
        margin-left: 4px;
    }
    .node-folder-icon {
        cursor: pointer;
    }
    .span-loading {
        display: inline-block;
        width: 12px;
        &:before {
            content: "";
            display: inline-block;
            position: absolute;
            width: 16px;
            height: 16px;
            top: 8px;
            background-image: url('../images/svg/loading.svg');
        }
    }
    .bk-base-options {
        /deep/ .bk-group-options {
            padding: 0 5px;
        }
    }
    .data-base-tips {
        line-height: 16px;
        display: inline-block;
        .bk-link {
            vertical-align: baseline;
            color: #3A84FF;
        }
        /deep/ .bk-link-text {
            font-size: 12px;
        }
    }
</style>
