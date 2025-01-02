import { h } from 'bk-lesscode-render'
import processOverview from './components/process-overview'
import buttons from '../../data-manage-container/form-data-manage/preview/components/buttons'
import filters from '../../data-manage-container/form-data-manage/preview/components/filters'
import table from '../../data-manage-container/form-data-manage/preview/components/table'
import { FORM_SYS_FIELD, FIELDS_NOT_DISPLAYED_IN_TABLE } from '../../data-manage-container/form-data-manage/constants'
import './index.postcss'
import cloneDeep from 'lodash.clonedeep'

export default {
    name: 'widget-flow-manage-container',
    props: {
        id: {
            type: String,
            required: true
        },
        nodeList: {
            type: Array,
            default: () => []
        }
    },
    data () {
        return {
            loading: false,
            activeTab: 'process',
            activeNode: '',
            nodeDataList: []
        }
    },
    computed: {
        currentNodeTab () {
            return this.nodeDataList.find(item => item.id === this.activeNode)
        },
        allFields () {
            const list = this.currentNodeTab?.fields.map(item => Object.assign({}, item, { system: false }))
            FORM_SYS_FIELD.forEach(item => {
                const { id, name, key, type } = item
                list.push({ id, type, system: true, configure: { key, name } })
            })
            return list || []
        }
    },
    watch: {
        'id': {
            handler () {
                this.getNodesList()
            },
            immediate: true
        },
        activeNode: {
            immediate: true,
            handler (val) {
                val && this.getFormDetail()
            }
        }
    },
    methods: {
        /**
         * 获取当前流程模板的所有人工节点数据
         */
        async getNodesList () {
            this.loading = true
            const { data } = await this.$http.get(`flow/tpl/${this.id}`)
            const nodes = JSON.parse(data.nodes || '[]')
            const manualNodes = nodes.filter(node => node.type === 'Manual')
            const currentProps = cloneDeep(this.nodeList)
        
            // 将 currentProps 转换为一个 Map，以便快速查找
            const currentPropsMap = new Map(currentProps.map(node => [node.id, node]))
        
            // 将后端返回的节点数据与当前组件的 props 数据进行合并，以便能够正确的展示最新的人工节点的配置信息
            this.nodeDataList = manualNodes.map(node => {
                const currentNodeProps = currentPropsMap.get(node.id) || {}
                return {
                    ...node,
                    label: node.config.name,
                    hideFilters: false,
                    buttons: [],
                    filters: [],
                    fields: [],
                    tableColsExclude: [],
                    tableRowActions: [],
                    queryData: {},
                    ...currentNodeProps
                }
            })
                    
            // 如果当前组件的 props 数据中没有人工节点数据，则将第一个节点的 id 设置为 activeNode
            if (this.nodeDataList) {
                if (!this.activeNode) {
                    this.activeNode = this.nodeDataList[0].id
                }
            }
            this.loading = false
        },
        async getFormDetail () {
            this.loading = true
            // 获取当前节点的表单类型
            const formType = this.currentNodeTab?.config.formType
            let formId

            // 根据表单类型设置 formId
            if (formType === 'NEW_FORM' || formType === 'CITE_FORM') {
                // 新建和引用类型使用 formId
                formId = this.currentNodeTab?.config.formId
            } else if (formType === 'USE_FORM') {
                // 复用类型使用 relatedId
                formId = this.currentNodeTab?.config.relatedId
            }

            // 发起请求获取表单详情
            const res = await this.$http.get('/nocode-form/detail', { params: { formId } })
            // 解析返回的数据并过滤掉不需要显示的字段
            const list = JSON.parse(res.data.content).filter(field => !FIELDS_NOT_DISPLAYED_IN_TABLE.includes(field.type))
            // 映射字段信息到当前节点
            this.currentNodeTab.fields = list.map(item => {
                const { id, type, configure } = item
                const { key, name } = configure
                // 返回字段的详细信息
                return { id, key, type, name: name || key, configure }
            })
            // 设置表名
            this.currentNodeTab.tableName = res.data.tableName
            this.loading = false
        }
    },
    render (render) {
        h.init(render)

        const self = this

        const renderOperateArea = () => {
            return self.currentNodeTab?.buttons?.length
                ? h({
                    component: 'div',
                    class: 'header-operate-area',
                    children: [
                        h({
                            component: buttons,
                            props: {
                                buttons: self.currentNodeTab.buttons,
                                fields: self.allFields,
                                tableName: self.currentNodeTab.tableName }
                        }),
                        h({
                            component: 'div',
                            class: 'toggle-filters-btn',
                            on: {
                                click: () => {
                                    self.currentNodeTab.hideFilters = !self.currentNodeTab.hideFilters
                                }
                            },
                            children: [
                                h({
                                    component: 'i',
                                    class: 'bk-icon icon-funnel toggle-icon'
                                })
                            ]
                        })
                    ]
                })
                : ''
        }

        const renderFilters = () => h({
            component: filters,
            props: {
                fields: this.allFields,
                filters: this.currentNodeTab?.filters,
                queryData: self.currentNodeTab.queryData
            },
            on: {
                query: (val) => {
                    self.currentNodeTab.queryData = val
                }
            }
        })

        const renderTable = () => h({
            component: table,
            props: {
                fields: this.allFields,
                queryData: self.currentNodeTab.queryData,
                tableName: self.currentNodeTab.tableName,
                tableRowActions: self.currentNodeTab.tableRowActions,
                tableColsExclude: self.currentNodeTab.tableColsExclude
            }
        })

        const tabPanelList = [
            {
                label: this.$t('流程总览'),
                name: 'process',
                children: [h({
                    component: processOverview,
                    props: {
                        id: self.id,
                        ref: 'process'
                    }
                })]
            },
            {
                label: this.$t('节点数据'),
                name: 'node',
                ref: 'node',
                children: [
                    h({
                        component: 'div',
                        class: 'node-tab-wrapper',
                        children: [
                            h({
                                component: 'bk-tab',
                                props: {
                                    active: self.activeNode,
                                    type: 'card-tab'
                                },
                                on: {
                                    'update:active': (val) => {
                                        if (val) {
                                            self.activeNode = val
                                        }
                                    }
                                },
                                children: self.nodeDataList
                                    .map((item, index) =>
                                        h({
                                            component: 'bk-tab-panel',
                                            props: {
                                                label: `【${item.label}】${this.$t('节点')}`,
                                                name: item.id,
                                                key: index
                                            }
                                        })
                                    )
                            }),
                            renderOperateArea(),
                            this.currentNodeTab?.hideFilters ? '' : renderFilters(),
                            this.currentNodeTab?.tableName ? renderTable() : ''
                        ]
                    })
                ] }
        ]

        const getElements = () => {
            return [
                h({
                    component: 'bk-tab',
                    props: {
                        active: self.activeTab,
                        type: 'unborder-card',
                        extCls: 'render-widget-tab'
                    },
                    on: {
                        'update:active': (val) => {
                            self.activeTab = val
                            val === 'process' && self.$refs[val]?.getTableData()
                            val === 'node' && self.getFormDetail()
                        }
                    },
                    children: tabPanelList.map((panel, index) =>
                        h({
                            component: 'bk-tab-panel',
                            props: {
                                key: index,
                                name: panel.name,
                                label: panel.label
                            },
                            children: panel.children
                        })
                    )
                })
            ]
        }

        return h({
            component: 'div',
            class: ['flow-manage-wrapper'],
            children: getElements()
        })
    }
}
