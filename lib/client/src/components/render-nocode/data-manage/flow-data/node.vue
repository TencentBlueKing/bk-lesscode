<template>
    <div class="node-data-manage" v-bkloading="{ isLoading: nodeListLoading }">
        <div v-if="!nodeListLoading" class="node-tabs-wrapper">
            <bk-tab :active="activeNode" :label-height="24" @tab-change="handleTabChange">
                <bk-tab-panel
                    v-for="node in nodes"
                    :key="node.id"
                    :name="node.id"
                    :label="`【${node.name}】${$t('节点')}`">
                </bk-tab-panel>
            </bk-tab>
            <div class="operate-btns-area">
                <custom-btns-edit></custom-btns-edit>
                <i class="bk-icon icon-funnel filter-switch-icon" @click="showFilters = !showFilters"></i>
            </div>
        </div>
        <div class="node-data-content">
            <filters
                v-if="showFilters"
                :filters="filters"
                :fields="formContents[activeNode]"
                :table-config="tableConfig"
                @update="handleUpdate('filters', $event)">
            </filters>
            <table-fields
                style="margin-top: 16px"
                :table-config="tableConfig"
                :fields="formContents[activeNode]"
                @update="handleUpdate('tableConfig', $event)">
            </table-fields>
        </div>
    </div>
</template>
<script>
    import { mapState, mapGetters } from 'vuex'
    import cloneDeep from 'lodash.clonedeep'
    import { messageError } from '@/common/bkmagic'
    import CustomBtnsEdit from '../components/custom-btns-edit.vue'
    import Filters from '../components/filters.vue'
    import TableFields from '../components/table-fields.vue'

    export default {
        name: 'NodeDataManage',
        components: {
            CustomBtnsEdit,
            Filters,
            TableFields
        },
        props: {
            flowConfig: {
                type: Object,
                default: () => {}
            }
        },
        data () {
            return {
                nodeListLoading: true,
                nodes: [],
                formContents: {},
                nodesConfig: {},
                filters: [],
                tableConfig: [],
                showFilters: true
            }
        },
        computed: {
            ...mapState('nocode/dataManage', ['activeNode', 'pageConfig']),
            ...mapGetters('page', ['pageDetail']),
            formIds () {
                return this.flowConfig.formIds ? JSON.parse(this.flowConfig.formIds) : {}
            }
        },
        async created () {
            this.nodesConfig = this.getNodesConfig()
            this.$store.commit('nocode/dataManage/setPageConfig', this.nodesConfig)
            await this.getNodeList()
            if (this.nodes.length > 0) {
                this.setActiveNode(this.nodes[0].id)
                this.getFormData()
            }
        },
        methods: {
            getNodesConfig () {
                if (Array.isArray(this.pageDetail.content)) {
                    return { filters: [], tableConfig: [], tableActions: [], buttons: [] }
                } else {
                    return Object.assign({ tableActions: [], buttons: [] }, cloneDeep(this.pageDetail.content))
                }
            },
            // 获取流程中人工节点类型节点列表
            async getNodeList () {
                try {
                    this.nodeListLoading = true
                    const serviceData = await this.$store.dispatch('nocode/flow/getServiceData', this.flowConfig.itsmId)
                    const res = await this.$store.dispatch('nocode/flow/getFlowNodes', { workflow: serviceData.workflow_id, page_size: 1000 })
                    const nodes = []
                    res.items.forEach(node => {
                        if (node.type === 'NORMAL' && node.id in this.formIds) {
                            nodes.push(node)
                        }
                    })
                    this.nodes = nodes
                } catch (e) {
                    messageError(e.message || e)
                } finally {
                    this.nodeListLoading = false
                }
            },
            // 获取节点表单字段
            async getFormData () {
                try {
                    this.formDataLoading = true
                    const res = await this.$store.dispatch('nocode/form/formDetail', { formId: this.formIds[this.activeNode] })
                    this.$set(this.formContents, this.activeNode, JSON.parse(res.content))
                } catch (e) {
                    messageError(e.message || e)
                } finally {
                    this.formDataLoading = false
                }
            },
            // 切换节点tab
            handleTabChange (val) {
                this.setActiveNode(val)
                if (val in this.nodesConfig) {
                    this.filters = this.nodesConfig[val].filters || []
                    this.tableConfig = this.nodesConfig[val].tableConfig || []
                } else {
                    this.filters = []
                    this.tableConfig = []
                    this.$set(this.nodesConfig, val, { filters: [], tableConfig: [] })
                }
                if (!(val in this.formContents)) {
                    this.getFormData()
                }
            },
            // 更新筛选字段和表格配置字段
            handleUpdate (type, val) {
                const pageConfig = cloneDeep(this.pageConfig)
                if (!pageConfig[this.activeNode]) {
                    pageConfig[this.activeNode] = {}
                }
                if (type === 'filters') {
                    this.nodesConfig[this.activeNode].filters = val
                    this.filters = val
                    pageConfig[this.activeNode].filters = val
                } else {
                    this.nodesConfig[this.activeNode].tableConfig = val
                    this.tableConfig = val
                    pageConfig[this.activeNode].tableConfig = val
                }
                this.$store.commit('nocode/dataManage/setPageConfig', pageConfig)
            },
            setActiveNode (id) {
                this.$store.commit('nocode/dataManage/setActiveNode', id)
            },
            clearSelectedComp (e) {
                this.$store.commit('nocode/dataManage/setSelectedComp')
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .bk-tab {
        padding: 4px;
        background: #f0f1f5;
        border-radius: 2px;
        >>> .bk-tab-section {
            display: none;
        }
        >>> .bk-tab-header {
            background: #f0f1f5;
            background-image: none !important;
            border: none;
            .bk-tab-label {
                font-size: 12px;
            }
            .bk-tab-label-item {
                border: none !important;
            }
        }
        >>>.bk-tab-label-wrapper {
            .bk-tab-scroll-controller {
                height: 33px !important;
                background: #f5f7fa;
                color: #979ba5;
                &:hover {
                    background: #eaebf0;
                    color: #63656e;
                }
            }
        }
    }
    .operate-btns-area {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: 16px 0;
        .bk-button {
            cursor: inherit;
        }
        .filter-switch-icon {
            height: 32px;
            line-height: 32px;
            width: 32px;
            text-align: center;
            color: #979ba5;
            border: 1px solid #c4c6cc;
            border-radius: 2px;
            background: #ffffff;
            cursor: pointer;
            &:hover {
                color: #3a84ff;
            }
        }
    }
</style>
