<template>
    <section>
        <bk-select
            searchable
            ref="selectRef"
            :value="value"
            :loading="isLoadingList"
            @clear="handleClearTable"
        >
            <span
                class="display-value"
                slot="trigger"
            >
                {{ value }}
                <i class="bk-select-angle bk-icon icon-angle-down"></i>
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
            <bk-option-group :name="tableGroups[0].name">
                <span slot="group-name">
                    {{ tableGroups[1].name }}
                    <i
                        class="bk-icon icon-refresh tool-icon"
                        @click="getBkBaseTables"
                    ></i>
                </span>
                <section v-bkloading="{ isLoading: tableGroups[1].isLoading }">
                    <bk-option
                        v-for="table in tableGroups[1].children"
                        :key="table.tableName"
                        :id="table.tableName"
                        :name="table.tableName"
                        @click.native="handleSelectTable(table.tableName, tableGroups[1].dataSourceType)"
                    >
                    </bk-option>
                    <bk-exception
                        v-if="tableGroups[1].children.length <= 0"
                        ext-cls="exception-wrap-item exception-part"
                        type="empty"
                        scene="part"
                    >
                        请点击上方刷新按钮获取 BkBase 结果表
                    </bk-exception>
                </section>
            </bk-option-group>
        </bk-select>
        <bk-button
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
        DATA_SOURCE_TYPE
    } from 'shared/data-source'

    export default defineComponent({
        props: {
            value: {
                type: String
            },
            dataSourceType: {
                type: String
            }
        },

        setup (props, { emit }) {
            const selectRef = ref()
            const isLoadingData = ref(false)
            const isLoadingList = ref(false)
            const projectId = router?.currentRoute?.params?.projectId
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
                const tableGroup = tableGroups.value.find((group) => group.dataSourceType === dataSourceType)
                const table = tableGroup.children.find((table) => table.tableName === tableName)
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

            const getBkBaseTables = () => {
                tableGroups.value[1].isLoading = true
                return store
                    .dispatch('dataSource/list', { projectId, dataSourceType: DATA_SOURCE_TYPE.BK_BASE })
                    .then(({ list }) => {
                        tableGroups.value[1].children = list
                    })
                    .finally(() => {
                        tableGroups.value[1].isLoading = false
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
                        getMysqlTables()
                        // getBkBaseTables()
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
                tableGroups,
                handleSelectTable,
                getMysqlTables,
                getBkBaseTables,
                handleCreate,
                handleClearTable,
                handleGetTableDatas
            }
        }
    })
</script>

<style lang="postcss" scoped>
    .display-value {
        display: inline-block;
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
</style>
