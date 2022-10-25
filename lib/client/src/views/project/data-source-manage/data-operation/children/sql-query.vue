<template>
    <section class="sql-query">
        <monaco
            language="sql"
            height="500"
            class="sql-editor"
            :value="sql"
            @change="handleSqlChange"
        >
            <span
                slot="title"
                class="sql-title"
            >SQL 编辑器（仅支持 SELECT 查询语句）</span>
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
                    <i v-if="data.icon" :class="data.icon"></i>
                    {{data.name}}
                </div>
            </bk-big-tree>
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
                        name: '暂无数据',
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
                    return Promise.reject(new Error('Sql 语句不能为空'))
                } else if (!/;$/.test(props.sql?.trim())) {
                    return Promise.reject(new Error('Sql 语句不完整，需要是【;】号结尾'))
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
                                id: bkBaseTable.id,
                                name: bkBaseTable.tableName,
                                columns: bkBaseTable.columns,
                                type: 'base-table-name',
                                icon: 'bk-drag-icon bk-drag-data-table'
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
                                id: table.id,
                                name: table.tableName,
                                columns: table.columns,
                                type: 'preview-table-name',
                                icon: 'bk-drag-icon bk-drag-data-table'
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
                getRemoteApi
            }
        }
    })
</script>

<style lang="postcss" scoped>
    @import "@/css/mixins/scroller";

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
            padding: 20px;
        }
    }
    .sql-title {
        margin-left: 25px;
        color: #C4C6CC;
        font-size: 14px;
    }

    .display-option {
        font-size: 12px;
        &.disabled {
            cursor: not-allowed;
            color: #c4c6cc;
        }
    }
</style>
