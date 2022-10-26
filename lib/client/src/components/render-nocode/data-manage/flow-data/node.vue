<template>
    <div class="node-data-manage" v-bkloading="{ isLoading: initDataLoading }">
        <div v-if="!initDataLoading" class="node-tab-wrapper">
            <bk-tab :active.sync="activeNode" :label-height="24" @tab-change="handleTabChange">
                <bk-tab-panel
                    v-for="node in nodes"
                    :key="node.id"
                    :name="node.id"
                    :label="`【${node.name}】节点`">
                </bk-tab-panel>
            </bk-tab>
            <div class="opereate-btn">
                <!-- <bk-button>导出</bk-button>
                <bk-button>下载流程附件</bk-button> -->
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
    import { mapGetters } from 'vuex'
    import cloneDeep from 'lodash.clonedeep'
    import { messageError } from '@/common/bkmagic'
    import Filters from '../components/filters.vue'
    import TableFields from '../components/table-fields.vue'
    export default {
        name: 'NodeDataManage',
        components: {
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
                initDataLoading: true,
                nodes: [],
                activeNode: '',
                formContents: {},
                nodesConfig: {},
                filters: [],
                tableConfig: [],
                showFilters: true
            }
        },
        computed: {
            ...mapGetters('page', ['pageDetail']),
            formIds () {
                return this.flowConfig.formIds ? JSON.parse(this.flowConfig.formIds) : {}
            }
        },
        async created () {
            this.nodesConfig = Array.isArray(this.pageDetail.content) ? { filters: [], tableConfig: [] } : cloneDeep(this.pageDetail.content)
            this.$store.commit('nocode/formSetting/setTableFields', this.nodesConfig)
            await this.getInitData()
            if (this.nodes.length > 0) {
                this.activeNode = this.nodes[0].id
                this.getFormData()
            }
        },
        beforeDestroy () {
            this.$store.commit('nocode/formSetting/setTableFields', {})
        },
        methods: {
            async getInitData () {
                try {
                    this.initDataLoading = true
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
                    this.initDataLoading = false
                }
            },
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
            handleTabChange (val) {
                this.activeNode = val
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
            handleUpdate (type, val) {
                if (type === 'filters') {
                    this.nodesConfig[this.activeNode].filters = val
                    this.filters = val
                } else {
                    this.nodesConfig[this.activeNode].tableConfig = val
                    this.tableConfig = val
                }
                this.$store.commit('nocode/formSetting/setTableFields', cloneDeep(this.nodesConfig))
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .node-tab-wrapper {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
    }
    .bk-tab {
        padding: 4px;
        max-width: calc(100% - 250px);
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
    .opereate-btn {
        display: flex;
        align-items: center;
        justify-content: space-between;
        max-width: 230px;
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
