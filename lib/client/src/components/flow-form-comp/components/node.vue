<template>
    <div class="node-data-manage">
        <div v-if="!initDataLoading" class="node-tab-wrapper">
            <bk-tab :active="activeNode" :label-height="24" @tab-change="handleTabChange">
                <bk-tab-panel
                    v-for="node in nodes"
                    :key="node.id"
                    :name="node.id"
                    :label="`【${node.name}】${$t('节点')}`">
                </bk-tab-panel>
            </bk-tab>
            <div class="opereate-btns">
                <custom-buttons
                    :table-name="tableName"
                    :node-name="currentNodeName"
                    :fields="fields"
                    :system-fields="systemFields"
                    :table-config="tableConfig"
                    :buttons="buttons">
                </custom-buttons>
                <i
                    v-if="filters.length > 0"
                    class="bk-icon icon-funnel filter-switch-icon"
                    @click="showFilter = !showFilter">
                </i>
            </div>
        </div>
        <div class="node-data-content" v-bkloading="{ isLoading: formDataLoading }">
            <template v-if="!formDataLoading">
                <filters
                    v-if="filters.length > 0 && showFilter"
                    :filters="filters"
                    :fields="fields"
                    :value="filtersData"
                    @change="handleFilterDataChange">
                </filters>
                <table-fields
                    v-if="tableName"
                    style="margin-top: 16px"
                    :table-config="tableConfig"
                    :table-actions="tableActions"
                    :fields="fields"
                    :form-id="formIds[activeNode]"
                    :table-name="tableName"
                    :filters-data="filtersData">
                </table-fields>
            </template>
        </div>
    </div>
</template>
<script>
    import { mapGetters } from 'vuex'
    import { formMap } from 'shared/form'
    import queryStrSearchMixin from '../common/query-str-search-mixin'
    import CustomButtons from './custom-buttons.vue'
    import Filters from '../components/filters.vue'
    import TableFields from '../components/table-fields.vue'

    export default {
        name: 'NodeDataManage',
        components: {
            CustomButtons,
            Filters,
            TableFields
        },
        mixins: [queryStrSearchMixin],
        props: {
            formIds: {
                type: Object,
                default: () => ({})
            },
            config: {
                type: Object,
                default: () => ({})
            },
            systemFields: {
                type: Array,
                default: () => []
            },
            serviceId: Number,
            viewType: String
        },
        data () {
            return {
                initDataLoading: true,
                formDataLoading: false,
                nodes: [],
                activeNode: Number(this.$route.query.activeNode) || '',
                formDataMap: {},
                filters: [],
                tableConfig: [],
                buttons: [],
                tableActions: [],
                showFilter: true,
                filtersData: {}
            }
        },
        computed: {
            ...mapGetters('page', ['pageDetail']),
            fields () {
                return this.formDataMap[this.activeNode]?.content || []
            },
            tableName () {
                return this.formDataMap[this.activeNode]?.tableName || ''
            },
            currentNodeName () {
                if (this.activeNode) {
                    const node = this.nodes.find(item => item.id === this.activeNode)
                    return node ? node.name : ''
                }
                return ''
            }
        },
        async created () {
            await this.getInitData()
            if (this.nodes.length > 0) {
                if (!this.activeNode) { // 如果页面加载时querystring不带当前选中节点tab信息
                    this.activeNode = this.nodes[0].id
                }
                await this.getFormData()
                this.setNodeTabConfig()
                this.setInitFilterData()
            }
        },
        methods: {
            async getInitData () {
                try {
                    this.initDataLoading = true
                    const serviceRes = await this.$http.get(`/nocode/service/${this.serviceId}/`)
                    const nodesRes = await this.$http.get('/nocode/state/', { params: { workflow: serviceRes.data.workflow_id, page_size: 1000 } })
                    const nodes = []
                    nodesRes.data.items.forEach(node => {
                        if (node.type === 'NORMAL' && node.id in this.formIds) {
                            nodes.push(node)
                        }
                    })
                    this.nodes = nodes
                } catch (e) {
                    console.error(e.message || e)
                } finally {
                    this.initDataLoading = false
                }
            },
            async getFormData () {
                try {
                    let formDetail = {}
                    if (this.activeNode in this.formDataMap) {
                        formDetail = this.formDataMap[this.activeNode]
                        return
                    }

                    this.formDataLoading = true
                    if (this.viewType === 'preview') {
                        const res = await this.$http.get('/nocode-form/detail', { params: { formId: this.formIds[this.activeNode] } })
                        const { tableName, content } = res.data
                        formDetail = {
                            tableName,
                            content: JSON.parse(content)
                        }
                    } else {
                        formDetail = formMap[this.formIds[this.activeNode]]
                    }
                    this.$set(this.formDataMap, this.activeNode, {
                        tableName: formDetail.tableName,
                        content: formDetail.content
                    })
                } catch (e) {
                    console.error(e.message || e)
                } finally {
                    this.formDataLoading = false
                }
            },
            setNodeTabConfig () {
                let filters = []
                let tableConfig = []
                let buttons = []
                let tableActions = []
                if (this.activeNode in this.config) {
                    filters = this.config[this.activeNode].filters || []
                    tableConfig = this.config[this.activeNode].tableConfig || []
                    buttons = this.config[this.activeNode].buttons || []
                    tableActions = this.config[this.activeNode].tableActions || []
                }
                this.filters = filters
                this.tableConfig = tableConfig
                this.buttons = buttons
                this.tableActions = tableActions
                this.$set(this.config, this.activeNode, { filters, tableConfig, buttons, tableActions })
            },
            handleTabChange (val) {
                const { path, hash, params, query } = this.$route
                const qs = { activeTab: 'node', activeNode: val }
                if ('pageCode' in query) {
                    qs.pageCode = query.pageCode
                }
                this.$router.replace({ path, hash, params, query: qs })
                this.activeNode = val
                this.filtersData = {}
                this.setNodeTabConfig()
                this.getFormData()
            },
            handleFilterDataChange (val) {
                this.filtersData = val
                this.updateQueryString()
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .node-tab-wrapper {
        /* display: flex;
        align-items: center;
        justify-content: space-between; */
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
    .opereate-btns {
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

    .node-data-content {
        min-height: 260px;
    }
</style>
