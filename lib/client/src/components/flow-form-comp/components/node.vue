<template>
    <div class="node-data-manage">
        <div v-if="!initDataLoading" class="node-tab-wrapper">
            <bk-tab :active.sync="activeNode" :label-height="32" @tab-change="handleTabChange">
                <bk-tab-panel
                    v-for="node in nodes"
                    :key="node.id"
                    :name="node.id"
                    :label="node.name">
                </bk-tab-panel>
            </bk-tab>
            <div class="opereate-btns">
                <!-- <bk-button>导出</bk-button>
                <bk-button>下载流程附件</bk-button> -->
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
                    :system-fields="systemFields"
                    :value.sync="filtersData">
                </filters>
                <table-fields
                    style="margin-top: 16px"
                    :table-config="tableConfig"
                    :fields="fields"
                    :form-id="formIds[activeNode]"
                    :table-name="tableName"
                    :system-fields="systemFields"
                    :filters-data="filtersData">
                </table-fields>
            </template>
        </div>
    </div>
</template>
<script>
    import { mapGetters } from 'vuex'
    import { formMap } from 'shared/form'
    import { FLOW_SYS_FIELD } from '../common/field.js'
    import Filters from '../components/filters.vue'
    import TableFields from '../components/table-fields.vue'

    export default {
        name: 'NodeDataManage',
        components: {
            Filters,
            TableFields
        },
        props: {
            formIds: {
                type: Object,
                default: () => ({})
            },
            config: {
                type: Object,
                default: () => ({})
            },
            serviceId: Number,
            viewType: String
        },
        data () {
            return {
                initDataLoading: true,
                formDataLoading: true,
                nodes: [],
                activeNode: '',
                formDataMap: {},
                filters: [],
                systemFields: FLOW_SYS_FIELD,
                tableConfig: [],
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
            }
        },
        // watch: {
        //     filtersData (val) {
        //         const isShowField = Object.values(val).every(item => {
        //             if (Array.isArray(item)) {
        //                 return !item.every(i => i)
        //             } else {
        //                 return !item
        //             }
        //         })
        //         this.showFilter = isShowField
        //     }
        // },
        async created () {
            await this.getInitData()
            if (this.nodes.length > 0) {
                this.activeNode = this.nodes[0].id
                this.getFormData()
                this.setNodeTabConfig()
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
                if (this.activeNode in this.config) {
                    this.filters = this.config[this.activeNode].filters || []
                    this.tableConfig = this.config[this.activeNode].tableConfig || []
                } else {
                    this.filters = []
                    this.tableConfig = []
                    this.$set(this.config, this.activeNode, { filters: [], tableConfig: [] })
                }
            },
            handleTabChange (val) {
                this.activeNode = val
                this.setNodeTabConfig()
                this.getFormData()
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
        max-width: calc(100% - 250px);
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

    .node-data-content {
        min-height: 260px;
    }
</style>
