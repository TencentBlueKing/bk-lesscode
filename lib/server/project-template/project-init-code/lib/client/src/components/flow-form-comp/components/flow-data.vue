<template>
    <div class="flow-data">
        <bk-tab type="unborder-card" :active.sync="active">
            <bk-tab-panel label="流程总览" name="flow">
                <!--                <div class="operate-btns">-->
                <!--                    <bk-button theme="primary" style="width: 88px; cursor: text;">新建</bk-button>-->
                <!--                </div>-->
                <ticket-list :service-id="serviceId"></ticket-list>
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
    import TicketList from './ticket-list.vue'
    import NodeDataManage from './node.vue'

    export default {
        name: 'FlowData',
        components: {
            TicketList,
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
    .bk-tab {
        >>> .bk-tab-section {
            padding: 16px 0;
        }
    }
    .bk-button-text.operate-btn {
        padding: 0;
    }
</style>
