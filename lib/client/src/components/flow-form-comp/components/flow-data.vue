<template>
    <div class="flow-data">
        <bk-tab type="unborder-card" :active="active" @tab-change="handleTabChange">
            <bk-tab-panel :label="$t('流程总览')" name="flow">
                <ticket-list :service-id="serviceId" :view-type="viewType"></ticket-list>
            </bk-tab-panel>
            <bk-tab-panel :label="$t('节点数据')" name="node" render-directive="if">
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
                active: this.$route.query.activeTab === 'node' ? 'node' : 'flow'
            }
        },
        methods: {
            handleTabChange (val) {
                this.active = val
                const { path, hash, params, query } = this.$route
                const qs = { activeTab: this.active }
                if ('pageCode' in query) {
                    qs.pageCode = query.pageCode
                }
                this.$router.replace({ path, hash, params, query: qs })
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
