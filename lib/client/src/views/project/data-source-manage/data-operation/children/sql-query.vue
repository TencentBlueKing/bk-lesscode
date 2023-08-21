<template>
    <section class="sql-query">
        <monaco
            language="sql"
            height="530"
            class="sql-editor"
            :value="sql"
            @change="handleSqlChange"
        >
            <span
                slot="title"
                class="sql-title"
            >{{ $t('SQL 编辑器（仅支持 SELECT 查询语句）') }}</span>
        </monaco>
        <section class="db-tree">
            <bk-big-tree
                ref="bigTreeRef"
                class="tree-select"
                :data="apiData"
                :lazy-method="getRemoteApi"
            >
                <div
                    slot-scope="{ data }"
                    :class="{
                        'display-option': true,
                        'disabled': data.disabled
                    }"
                >
                    <i
                        v-if="data.isTable"
                        class="bk-drag-icon bk-drag-data-table"
                    ></i>
                    <span
                        v-bk-overflow-tips
                        class="display-name"
                    >
                        {{data.name}}
                    </span>
                    <i
                        v-if="data.isTable"
                        v-bk-tooltips="{ content: $t('点击生成查询该表SQL') }"
                        class="bk-drag-icon bk-drag-sql"
                        @click.stop="handleAddQuerySql(data)"
                    ></i>
                </div>
            </bk-big-tree>
            <bk-exception
                v-if="apiData.length <= 0"
                class="exception-part"
                type="empty"
                scene="part">
                <span>{{ $t('暂无数据') }}</span>
            </bk-exception>
        </section>
    </section>
</template>

<script>
    import {
        defineComponent,
        ref,
        watch
    } from '@vue/composition-api'
    import Monaco from '@/components/monaco.vue'
    import {
        isEmpty,
        uuid
    } from 'shared/util'
    import {
        getQueryTableSql
    } from 'shared/data-source'
    import { useStore } from '@/store'

    export default defineComponent({
        components: {
            Monaco
        },

        props: {
            sql: {
                type: String,
                default: ''
            },
            tableList: {
                type: Array,
                default: () => ([])
            },
            bkBaseBizList: {
                type: Array,
                default: () => ([])
            },
            dataSourceType: {
                type: String
            }
        },

        setup (props, { emit }) {
            const store = useStore()
            const apiData = ref([])

            // 构造节点数据
            const getNodeValue = (data, isLeaf) => {
                const node = {
                    data
                }
                if (isEmpty(data)) {
                    node.data = [{
                        name: window.i18n.t('暂无数据'),
                        disabled: true
                    }]
                }
                node.data.forEach((item) => {
                    item.id = uuid()
                })
                if (isLeaf || isEmpty(data)) {
                    node.leaf = node.data.map(x => x.id)
                }
                return node
            }
            // sql 变更
            const handleSqlChange = (val) => {
                emit('change', val)
            }
            // 校验
            const validate = () => {
                if (isEmpty(props.sql)) {
                    return Promise.reject(new Error(window.i18n.t('Sql 语句不能为空')))
                } else if (!/;$/.test(props.sql?.trim())) {
                    return Promise.reject(new Error(window.i18n.t('Sql 语句不完整，需要是【;】号结尾')))
                } else {
                    return Promise.resolve()
                }
            }
            // 获取 bkBase 表
            const getBkBaseTables = (data) => {
                return store
                    .dispatch('dataSource/getBkBaseTables', data.id)
                    .then((data) => {
                        const bkBaseTables = data?.list?.map((bkBaseTable) => {
                            return {
                                ...bkBaseTable,
                                name: bkBaseTable.tableName,
                                type: 'base-table-name',
                                isTable: true
                            }
                        })
                        return getNodeValue(bkBaseTables)
                    })
            }
            // 远程加载数据
            const getRemoteApi = ({ data }) => {
                switch (data.type) {
                    case 'base-table-name':
                    case 'preview-table-name':
                        return getNodeValue(data.columns, true)
                    case 'base-biz-name':
                        return getBkBaseTables(data)
                }
            }

            // 点击添加查询 sql
            const handleAddQuerySql = (table) => {
                let sql = getQueryTableSql(table)
                if (props.sql.trim()) {
                    sql = `${props.sql}\r\n${sql}`
                }
                handleSqlChange(sql)
            }

            watch(
                [
                    () => props.dataSourceType,
                    () => props.tableList,
                    () => props.bkBaseBizList
                ],
                () => {
                    if (props.dataSourceType === 'preview') {
                        apiData.value = props.tableList.map((table) => {
                            return {
                                ...table,
                                name: table.tableName,
                                type: 'preview-table-name',
                                isTable: true
                            }
                        })
                    } else {
                        apiData.value = props.bkBaseBizList.map((bkBaseBiz) => {
                            return {
                                id: bkBaseBiz.bkBizId,
                                name: bkBaseBiz.bkBizName,
                                type: 'base-biz-name'
                            }
                        })
                    }
                }
            )

            return {
                apiData,
                handleSqlChange,
                validate,
                getRemoteApi,
                handleAddQuerySql
            }
        }
    })
</script>

<style lang="postcss" scoped>
    @import "@/css/mixins/scroller";
    @import "@/css/mixins/ellipsis";

    .sql-query {
        display: flex;
        flex-direction: row;
        .sql-editor {
            width: calc(100% - 330px);
            margin-right: 30px;
        }
        .db-tree {
            @mixin scroller;
            width: 300px;
            height: 530px;
            overflow: auto;
            background: #fff;
            box-shadow: 0 2px 4px 0 rgb(25 25 41 / 5%);
            padding: 10px;
        }
    }
    .sql-title {
        margin-left: 25px;
        color: #C4C6CC;
        font-size: 14px;
    }

    .display-option {
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        &.disabled {
            cursor: not-allowed;
            color: #c4c6cc;
        }
        .display-name {
            @mixin ellipsis calc(100% - 30px), inline-block;
            flex: 1;
            margin: 0 3px;
        }
        .bk-drag-sql {
            color: #3a84ff;
            margin-right: 5px;
        }
    }
</style>
