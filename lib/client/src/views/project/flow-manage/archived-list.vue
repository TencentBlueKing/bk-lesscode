<template>
    <div class="flow-archived-list">
        <header class="breadcrumbs">
            <div class="header-content">
                <i class="bk-drag-icon bk-drag-arrow-back" @click="$router.push({ name: 'flowList' })"></i>
                流程归档列表
            </div>
        </header>
        <main class="archived-list-content">
            <div class="search-wrapper">
                <bk-input
                    style="width: 360px;"
                    placeholder="请输入流程名称"
                    right-icon="icon-search">
                </bk-input>
            </div>
            <bk-table
                :data="flowList"
                :pagination="pagination"
                :outer-border="false"
                :header-border="false"
                :header-cell-style="{ background: '#f0f1f5' }"
                @page-change="handlePageChange"
                @page-limit-change="handlePageLimitChange">
                <bk-table-column label="ID" property="id"></bk-table-column>
                <bk-table-column label="流程名称" property="name"></bk-table-column>
                <bk-table-column label="流程描述"></bk-table-column>
                <bk-table-column label="流程表单"></bk-table-column>
                <bk-table-column label="流程数据管理页"></bk-table-column>
                <bk-table-column label="创建人"></bk-table-column>
                <bk-table-column label="创建时间"></bk-table-column>
                <bk-table-column label="操作">
                    <template>
                        <bk-button
                            theme="primary"
                            :text="true"
                            @click="handleRestoreClick">
                            恢复
                        </bk-button>
                    </template>
                </bk-table-column>
            </bk-table>
        </main>
    </div>
</template>
<script>

    export default {
        name: 'ArchivedList',
        data () {
            return {
                flowList: [],
                listLoading: false,
                pagination: {
                    current: 1,
                    count: 0,
                    limit: 15
                }
            }
        },
        methods: {
            handleRestoreClick () {},
            handlePageChange () {},
            handlePageLimitChange () {}
        }
    }
</script>
<style lang="postcss" scoped>
    .flow-archived-list {}
    .header-content {
        display: flex;
        align-items: center;
        font-size: 16px;
        color: #313238;
        i {
            margin-right: 10px;
            font-size: 14px;
            color: #3a84ff;
            cursor: pointer;
        }
    }
    .archived-list-content {
        padding: 20px 24px;
    }
    .search-wrapper {
        margin-bottom: 16px;
    }
</style>
