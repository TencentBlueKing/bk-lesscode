import processOverview from './components/process-overview'
import buttons from '../data-manage-container/form-data-manage/components/buttons'
import filters from '../data-manage-container/form-data-manage/components/filters'
import table from '../data-manage-container/form-data-manage/components/table'
import { FORM_SYS_FIELD, FIELDS_NOT_DISPLAYED_IN_TABLE } from '../data-manage-container/constants'
import './index.postcss'
import { flowTplListMap } from 'shared/flow-tpl/index'
import { formMap } from 'shared/form'
import cloneDeep from 'lodash.clonedeep'

export default {
    name: 'widget-flow-manage-container',
    props: {
        // 组件的唯一标识符，类型为字符串，必填
        id: {
            type: [String, Number],
            required: true
        },

        // 节点列表，类型为数组，默认为空数组
        nodeList: {
            type: Array,
            default: () => []
        },

        // 表格列排除项，类型为数组，默认为空数组
        tableColsExclude: {
            type: Array,
            default: () => []
        }
    },
    data () {
        return {
            // 加载状态
            loading: false,

            // 当前激活的标签页
            activeTab: 'process',

            // 当前激活的节点
            activeNode: '',

            // 隐藏筛选器
            hideFilters: false,

            // 节点数据列表
            nodeDataList: []
        }
    },
    computed: {
        // 当前节点的标签页
        currentNodeTab () {
            return this.nodeDataList.find(item => item.id === this.activeNode)
        },

        // 所有字段
        allFields () {
            // 获取当前节点的字段列表
            const list = this.currentNodeTab?.fields.map(item => Object.assign({}, item, { system: false }))

            // 添加系统字段
            FORM_SYS_FIELD.forEach(item => {
                const { id, name, key, type } = item
                list.push({ id, type, system: true, configure: { key, name } })
            })

            // 返回字段列表
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

    // 组件的方法
    methods: {
        // 获取当前流程模板的所有人工节点数据
        async getNodesList () {
            this.loading = true
            const { nodes } = flowTplListMap[this.id]
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
            if (this.nodeDataList.length) {
                if (!this.activeNode) {
                    this.activeNode = this.nodeDataList[0].id
                }
            }
            this.loading = false
        },

        // 获取表单详情
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

            // 获取表单详情
            const { tableName, content = [] } = formMap[formId]
            // 过滤掉不需要显示的字段
            const list = content.filter(field => !FIELDS_NOT_DISPLAYED_IN_TABLE.includes(field.type))
            // 映射字段信息到当前节点
            this.currentNodeTab.fields = list.map(item => {
                const { id, type, configure } = item
                const { key, name } = configure
                // 返回字段的详细信息
                return { id, key, type, name: name || key, configure }
            })
            // 设置表名
            this.currentNodeTab.tableName = tableName
            this.loading = false
        }
    },

    // 渲染函数
    render (h) {
        const self = this

        // 渲染操作区域
        const renderOperateArea = () => {
            return self.currentNodeTab?.buttons?.length
                ? h('div', {
                    class: 'header-operate-area'
                }, [
                    h(buttons, {
                        props: {
                            buttons: self.currentNodeTab.buttons,
                            fields: self.allFields,
                            tableName: self.currentNodeTab.tableName
                        }
                    }),
                    h('div', {
                        class: 'toggle-filters-btn',
                        on: {
                            click: () => {
                                self.currentNodeTab.hideFilters = !self.currentNodeTab.hideFilters
                            }
                        }
                    }, [
                        h('i', {
                            class: 'bk-icon icon-funnel toggle-icon'
                        })
                    ])
                ])
                : ''
        }

        // 渲染筛选器
        const renderFilters = () => h(filters, {
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

        // 渲染表格
        const renderTable = () => h(table, {
            props: {
                fields: this.allFields,
                queryData: self.currentNodeTab.queryData,
                tableName: self.currentNodeTab.tableName,
                tableRowActions: self.currentNodeTab.tableRowActions,
                tableColsExclude: self.currentNodeTab.tableColsExclude
            }
        })

        // 标签页列表
        const tabPanelList = [
            {
                label: window.i18n.t('流程总览'),
                name: 'process',
                children: [h(processOverview, {
                    props: {
                        id: self.id,
                        ref: 'process'
                    }
                })]
            },
            {
                label: window.i18n.t('节点数据'),
                name: 'node',
                ref: 'node',
                children: [
                    h('div', {
                        class: 'node-tab-wrapper'
                    }, [
                        h('bk-tab', {
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
                            }
                        }, self.nodeDataList.map((item, index) =>
                            h('bk-tab-panel', {
                                props: {
                                    label: `【${item.label}】${window.i18n.t('节点')}`,
                                    name: item.id,
                                    key: index
                                }
                            })
                        )),
                        renderOperateArea(),
                        this.currentNodeTab?.hideFilters ? '' : renderFilters(),
                        this.currentNodeTab?.tableName ? renderTable() : ''
                    ])
                ]
            }
        ]

        // 获取元素
        const getElements = () => {
            return [
                h('div', {
                        class: 'flow-manage-title',
                    }
                    [`${self.tplName}流程管理`]
                ),
                h('bk-tab', {
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
                    }
                }, tabPanelList.map((panel, index) =>
                    h('bk-tab-panel', {
                        key: index,
                        props: {
                            name: panel.name,
                            label: panel.label
                        }
                    }, panel.children)
                ))
            ]
        }

        // 返回渲染的元素
        return h('div', {
            class: ['flow-manage-wrapper']
        }, getElements())
    }
}
