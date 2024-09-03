import { h } from 'bk-lesscode-render'
import processOverview from './components/process-overview'
import buttons from '../../data-manage-container/form-data-manage/preview/components/buttons'
import filters from '../../data-manage-container/form-data-manage/preview/components/filters'
import table from '../../data-manage-container/form-data-manage/preview/components/table'
import { FORM_SYS_FIELD, FIELDS_NOT_DISPLAYED_IN_TABLE } from '../../data-manage-container/form-data-manage/constants'
import './index.postcss'

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
        },
        tableColsExclude: {
            type: Array,
            default: () => []
        }
    },
    data () {
        return {
            loading: false,
            activeTab: 'process',
            activeNode: '',
            hideFilters: false
        }
    },
    computed: {
        currentNodeTab () {
            return this.nodeList.find(item => item.id === this.activeNode)
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
        'nodeList': {
            handler () {
                this.initData()
            },
            immediate: true
        }
    },
    methods: {
        initData () {
            if (this.nodeList) {
                if (!this.activeNode) {
                    this.activeNode = this.nodeList[0].id
                }
                this.nodeList.forEach(item => {
                    if (!Object.prototype.hasOwnProperty.call(item, 'queryData')) {
                        item.queryData = {}
                    }
                })
            }
        },
        async getFormDetail (formId) {
            this.loading = true
            const res = await this.$http.get('/nocode-form/detail', { params: { formId: formId } })
            const { tableName, content = [] } = res.data
            this.fields = JSON.parse(content).filter(field => !FIELDS_NOT_DISPLAYED_IN_TABLE.includes(field.type))
            this.tableName = tableName
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
                        id: self.id
                    }
                })]
            },
            {
                label: this.$t('节点数据'),
                name: 'node',
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
                                children: self.nodeList
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
                            renderTable()
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
