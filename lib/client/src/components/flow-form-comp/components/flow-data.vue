<template>
    <div class="flow-data">
        <bk-tab type="unborder-card" :active.sync="active">
            <bk-tab-panel label="流程总览" name="flow">
                <!--                <div class="operate-btns">-->
                <!--                    <bk-button theme="primary" style="width: 88px; cursor: text;">新建</bk-button>-->
                <!--                </div>-->
                <div class="filter-area">
                    <bk-form form-type="vertical" class="filter-form">
                        <bk-form-item label="创建人">
                            <bk-input v-model="filterData.creator"></bk-input>
                        </bk-form-item>
                        <bk-form-item label="创建时间">
                            <bk-date-picker v-model="filterData.create_at" size="small"></bk-date-picker>
                        </bk-form-item>
                        <bk-form-item label="当前节点">
                            <bk-select v-model="filterData.node"></bk-select>
                        </bk-form-item>
                        <bk-form-item label="状态">
                            <bk-select v-model="filterData.status"></bk-select>
                        </bk-form-item>
                    </bk-form>
                    <div class="search-btns-wrapper">
                        <bk-button style="margin-right: 4px;" theme="primary">查询</bk-button>
                        <bk-button @click="handleReset">重置</bk-button>
                    </div>
                </div>
                <bk-table :data="emptyData" :outer-border="!emptyData.length > 0">
                    <bk-table-column label="创建人"></bk-table-column>
                    <bk-table-column label="创建时间"></bk-table-column>
                    <bk-table-column label="当前节点"></bk-table-column>
                    <bk-table-column label="状态"></bk-table-column>
                    <bk-table-column label="操作">
                        <bk-button ext-cls="operate-btn" theme="primary" :text="true" size="small">详情</bk-button>
                    </bk-table-column>
                </bk-table>
            </bk-tab-panel>
            <bk-tab-panel label="节点数据" name="node" render-directive="if">
                <node-data-manage
                    :form-ids="formIds"
                    :service-id="serviceId"
                    :config="config"
                    :view-type="viewType">
                </node-data-manage>
            </bk-tab-panel>
        </bk-tab>
    </div>
</template>
<script>
    import NodeDataManage from './node.vue'

    export default {
        name: 'FlowData',
        components: {
            NodeDataManage
        },
        props: {
            formIds: [Number, Object], // 普通表单数据管理为单个id值，流程数据管理为{ nodeId: id }
            serviceId: Number, // itsm流程的id
            config: {
                type: Object,
                default: () => ({})
            },
            viewType: String
        },
        data () {
            return {
                active: 'flow',
                emptyData: [],
                filterData: {
                    creator: '',
                    create_at: '',
                    node: '',
                    status: ''
                }
            }
        },
        methods: {
            handleReset () {
                this.filterData = {
                    creator: '',
                    create_at: '',
                    node: '',
                    state: ''
                }
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .filter-area {
        margin: 12px 0 32px;
        padding: 16px 8px;
        background: #fafbfd;
        border-radius: 2px;
        .filter-form {
            display: flex;
            align-items: center;
            justify-content: space-between;
            .bk-form-item {
                flex: 1;
                margin: 0 8px;
            }
            >>> .bk-form-control {
                width: 100%;
            }
            .bk-date-picker {
                width: 100%;
            }
            .bk-select {
                background: #ffffff;
            }
        }
        .search-btns-wrapper {
            margin-top: 16px;
            padding: 0 8px;
        }
    }
    .bk-tab {
        >>> .bk-tab-section {
            padding: 16px 0;
        }
    }
    .bk-button-text.operate-btn {
        padding: 0;
    }
</style>
