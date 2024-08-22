import { h } from 'bk-lesscode-render'
import cloneDeep from 'lodash.clonedeep'
import formDataTable from '../../data-manage-container/form-data-manage/edit/components/table'
import tableFilters from '../../data-manage-container/form-data-manage/edit/components/table-filters'
import LC from '@/element-materials/core'
import formDataButtons from '../../data-manage-container/form-data-manage/edit/components/form-data-buttons'
import http from '@/api/pureAxios'
import { FORM_SYS_FIELD, FIELDS_NOT_DISPLAYED_IN_TABLE } from '../../data-manage-container/form-data-manage/constants'
import './flow-manage-container.postcss'

export default {
    name: 'widget-flow-manage-container-edit',
    inheritAttrs: false,
    props: {
        componentData: {
            type: Object,
            required: true
        }
    },
    data () {
        return {
            loading: false,
            activeTab: 'process',
            nodeDataList: [], // 节点数据节点列表
            activeNode: '',
            tableName: '',
            propsData: this.getPropsData(this.componentData)
        }
    },
    computed: {
        allFields () {
            const list = this.currentNodeTab.fields.map(item => Object.assign({}, item, { system: false }))
            FORM_SYS_FIELD.forEach(item => {
                list.push(Object.assign({}, item, { system: true }))
            })
            return list
        },
        noDataSourceConfigured () {
            return !this.propsData?.id
        },
        currentNodeTab () {
            return this.propsData.nodeList.find(item => item.id === this.activeNode)
        }
    },
    watch: {
        'propsData.id': {
            immediate: true,
            handler (val) {
                val && this.getNodesList()
            }
        },
        'currentNodeTab' (val) {
            val && this.getFields()
        }
    },
    mounted () {
        LC.addEventListener('update', this.updateCallBack)
    },
    beforeDestroy () {
        LC.removeEventListener('update', this.updateCallBack)
    },
    methods: {
        getPropsData (node) {
            if (!node) {
                return {}
            }

            const { id, tableColsExclude, nodeList } = node.renderProps

            return {
                id: id.code,
                nodeList: nodeList.code,
                tableColsExclude: tableColsExclude.code
            }
        },
        /**
         * 获取当前流程模板的所有人工节点数据
         */
        async getNodesList () {
            this.loading = true
            const { data } = await http.get(`flow/tpl/${this.propsData.id}`)
            const nodes = JSON.parse(data.nodes || '[]')
            const manualNodes = nodes.filter(node => node.type === 'Manual')
            const currentProps = cloneDeep(this.componentData.renderProps.nodeList).code

            // 将 currentProps 转换为一个 Map，以便快速查找
            const currentPropsMap = new Map(currentProps.map(node => [node.id, node]))

            // 将后端返回的节点数据与当前组件的 props 数据进行合并，以便能够正确的展示人工节点的配置信息
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
                    ...currentNodeProps
                }
            })
            
            // 如果当前组件的 props 数据中没有人工节点数据，则将第一个节点的 id 设置为 activeNode
            this.activeNode = this.nodeDataList[0]?.id || ''
            this.loading = false
            // 将合并后的节点数据更新到当前组件的 props 数据中
            this.handlePropsUpdate('nodeList', this.nodeDataList)
        },
        async getFields () {
            const res = await http.get('nocode-form/detail', { params: { formId: this.currentNodeTab?.config.formId } })
            const list = JSON.parse(res.data.content).filter(field => !FIELDS_NOT_DISPLAYED_IN_TABLE.includes(field.type))
            this.currentNodeTab.fields = list.map(item => {
                const { id, type, configure } = item
                const { key, name } = configure
                return { id, key, type, name: name || key, configure }
            })
            this.currentNodeTab.tableName = res.data.tableName
        },
        updateCallBack ({ type, target }) {
            if (type === 'setProp' && target.type === 'widget-flow-manage-container') {
                if (target.componentId === this.componentData.componentId) {
                    this.propsData = this.getPropsData(target)
                }
            }
        },
        handlePropsUpdate (prop, val) {
            const propConfig = cloneDeep(this.componentData.renderProps[prop])
            this.componentData.setProp(prop, {
                ...propConfig,
                code: val,
                renderValue: val
            })
        },
        updateConfig (prop, val) {
            if (this.currentNodeTab) {
                this.currentNodeTab[prop] = val
            }
        },
        activeElement (element) {
            const activeNode = LC.getActiveNode()
            if (activeNode) {
                activeNode.activeClear()
            }
            LC.triggerEventListener('componentMouserleave', {
                type: 'componentMouserleave'
            })
            LC.setActiveElement(this.componentData, element)
        },
        delElement (element) {
            const activeElement = LC.getActiveElement()
            if (activeElement && activeElement.elementData.id === element.id) {
                LC.resetActiveElement()
            }
        }
    },
    render (render) {
        h.init(render)

        const self = this

        const renderOperateArea = () => {
            return self.currentNodeTab
                ? h({
                    component: 'div',
                    class: 'header-operate-area',
                    children: [
                        h({
                            component: formDataButtons,
                            props: { buttons: self.currentNodeTab.buttons },
                            on: {
                                update: self.updateConfig,
                                active: self.activeElement,
                                del: self.delElement
                            }
                        }),
                        h({
                            component: 'div',
                            class: 'toggle-filters-btn',
                            on: {
                                click: () => {
                                    self.currentNodeTab.hideFilters = !self.currentNodeTab.hideFilters
                                    console.log(self.currentNodeTab, self.currentNodeTab.hideFilters, 'toggle-filters-btn')
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

        const renderFilters = () => {
            if (this.currentNodeTab) {
                return h({
                    component: tableFilters,
                    props: {
                        fields: self.allFields,
                        filters: self.currentNodeTab.filters,
                        hideFilters: self.currentNodeTab.hideFilters
                    },
                    on: {
                        update: self.updateConfig
                    }
                })
            }
        }

        const renderTable = () => {
            return h({
                component: formDataTable,
                props: {
                    fields: self.allFields,
                    actions: self.currentNodeTab.tableRowActions,
                    tableColsExclude: this.propsData.tableColsExclude
                },
                on: {
                    update: self.updateConfig,
                    active: self.activeElement,
                    del: self.delElement
                }
            })
        }

        const filterFormItem = [
            { label: this.$t('创建人'), component: 'bk-input', placeholder: this.$t('请输入创建人') },
            { label: this.$t('创建时间'), component: 'bk-input', placeholder: this.$t('请输入创建时间') },
            { label: this.$t('状态'), component: 'bk-select', placeholder: this.$t('请选择状态') }
        ]

        const processRender = () =>
            h({
                component: 'div',
                class: 'process-render',
                children: [
                    h({
                        component: 'div',
                        class: 'filter-render-wrapper',
                        children: [
                            h({
                                component: 'bk-form',
                                props: {
                                    'form-type': 'vertical'
                                },
                                children: filterFormItem.map((item, index) =>
                                    h({
                                        component: 'bk-form-item',
                                        props: {
                                            label: item.label,
                                            extCls: index === 0 ? '' : 'ml10'
                                        },
                                        children: [
                                            h({
                                                component: item.component,
                                                props: {
                                                    placeholder: item.placeholder
                                                }
                                            })
                                        ]
                                    })
                                )
                            }),
                            h({
                                component: 'div',
                                class: 'filter-btn-area mt20',
                                children: [
                                    h({
                                        component: 'bk-button',
                                        props: {
                                            theme: 'primary'
                                        },
                                        children: [this.$t('查询')]
                                    }),
                                    h({
                                        component: 'bk-button',
                                        class: 'ml10',
                                        props: {
                                            theme: 'default'
                                        },
                                        children: [this.$t('重置')]
                                    })
                                ]
                            })
                        ]
                    }),
                    h({
                        component: 'bk-table',
                        class: 'mt20',
                        props: {
                            data: []
                        },
                        children: [
                            ...filterFormItem.map((item, index) =>
                                h({
                                    component: 'bk-table-column',
                                    props: {
                                        label: item.label,
                                        index: index
                                    }
                                })
                            ),
                            h({
                                component: 'bk-table-column',
                                props: {
                                    label: self.$t('操作')
                                }
                            })
                        ]
                    })
                ]
            })

        const nodeDataRender = () =>
            (!self.loading && self.currentNodeTab) ? h({
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
                    renderTable()
                ]
            }) : ''

        const tabPanelList = [
            { label: this.$t('流程总览'), name: 'process', children: [processRender()] },
            { label: this.$t('节点数据'), name: 'node', children: [nodeDataRender()] }
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
            class: ['flow-manage-wrapper', { empty: this.noDataSourceConfigured }],
            attrs: {
                'data-empty-content': this.noDataSourceConfigured ? self.$t('请在右侧配置数据源') : ''
            },
            children: this.noDataSourceConfigured ? null : getElements()
        })
    }
}
