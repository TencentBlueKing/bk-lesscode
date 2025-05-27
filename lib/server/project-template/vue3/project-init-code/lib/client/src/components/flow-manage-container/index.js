import { defineComponent, ref, watch, computed, h, toRefs, resolveComponent } from 'vue'
import processOverview from './components/process-overview'
import buttons from '../data-manage-container/form-data-manage/components/buttons'
import filters from '../data-manage-container/form-data-manage/components/filters'
import table from '../data-manage-container/form-data-manage/components/table'
import { FORM_SYS_FIELD, FIELDS_NOT_DISPLAYED_IN_TABLE } from '../data-manage-container/constants'
import './index.postcss'
import { flowTplListMap } from 'shared/flow-tpl/index'
import { formMap } from 'shared/form'
import cloneDeep from 'lodash.clonedeep'

export default defineComponent({
    name: 'widget-flow-manage-container',
    props: {
        // 组件的唯一标识符，类型为字符串，必填
        id: {
            type: String,
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
    setup (props) {
        const { id, nodeList } = toRefs(props)
        const loading = ref(false)
        const activeTab = ref('')
        const activeNode = ref('')
        const nodeDataList = ref([])
        const processRef = ref(null)

        const currentNodeTab = computed(() => {
            return nodeDataList.value.find(item => item.id === activeNode.value)
        })

        const allFields = computed(() => {
            const list = currentNodeTab.value?.fields.map(item => ({ ...item, system: false })) || []
            FORM_SYS_FIELD.forEach(item => {
                const { id, name, key, type } = item
                list.push({ id, type, system: true, configure: { key, name } })
            })
            return list
        })

        const getNodesList = async () => {
            loading.value = true
            const { nodes } = flowTplListMap[id.value]
            const manualNodes = nodes.filter(node => node.type === 'Manual')
            const currentProps = cloneDeep(nodeList.value)
            const currentPropsMap = new Map(currentProps.map(node => [node.id, node]))
            nodeDataList.value = manualNodes.map(node => {
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

            if (nodeDataList.value.length) {
                if (!activeNode.value) {
                    activeNode.value = nodeDataList.value[0].id
                }
            }
            loading.value = false
        }

        const getFormDetail = async () => {
            loading.value = true
            // 获取当前节点的表单类型
            const formType = currentNodeTab.value?.config.formType
            let formId

            // 根据表单类型设置 formId
            if (formType === 'NEW_FORM' || formType === 'CITE_FORM') {
                // 新建和引用类型使用 formId
                formId = currentNodeTab.value?.config.formId
            } else if (formType === 'USE_FORM') {
                // 复用类型使用 relatedId
                formId = currentNodeTab.value?.config.relatedId
            }

            // 获取表单详情
            const { tableName, content = [] } = formMap[formId]
            // 过滤掉不需要显示的字段
            const list = content.filter(field => !FIELDS_NOT_DISPLAYED_IN_TABLE.includes(field.type))
            // 映射字段信息到当前节点
            currentNodeTab.value.fields = list.map(item => {
                const { id, type, configure } = item
                const { key, name } = configure
                // 返回字段的详细信息
                return { id, key, type, name: name || key, configure }
            })
            // 设置表名
            currentNodeTab.value.tableName = tableName
            loading.value = false
        }

        watch(id, () => {
            getNodesList()
        }, { immediate: true })

        watch(activeNode, (val) => {
            if (val) {
                getFormDetail()
            }
        }, { immediate: true })

        const renderOperateArea = () => {
            if (currentNodeTab.value?.buttons?.length) {
                return h('div', { class: 'header-operate-area' }, [
                    h(buttons, { buttons: currentNodeTab.value.buttons, fields: allFields.value, tableName: currentNodeTab.value.tableName }),
                    h('div', {
                        class: 'toggle-filters-btn',
                        onClick: () => {
                            currentNodeTab.value.hideFilters = !currentNodeTab.value.hideFilters
                        }
                    }, [
                        h('i', { class: 'bk-icon icon-funnel toggle-icon' })
                    ])
                ])
            }
            return ''
        }

        const renderFilters = () => h(filters, {
            fields: allFields.value,
            filters: currentNodeTab.value?.filters,
            queryData: currentNodeTab.value.queryData,
            onQuery: (val) => {
                currentNodeTab.value.queryData = val
            }
        })

        const renderTable = () => h(table, {
            fields: allFields.value,
            queryData: currentNodeTab.value.queryData,
            tableName: currentNodeTab.value.tableName,
            tableRowActions: currentNodeTab.value.tableRowActions,
            tableColsExclude: currentNodeTab.value.tableColsExclude
        })

        const tabPanelList = [
            {
                label: window.i18n.t('流程总览'),
                name: 'process',
                children: [h(processOverview, { id: id.value, ref: 'process' })]
            },
            {
                label: window.i18n.t('节点数据'),
                name: 'node',
                children: [
                    h('div', { class: 'node-tab-wrapper' }, [
                        h(resolveComponent('bk-tab'), {
                            active: activeNode.value,
                            type: 'card-tab',
                            'onUpdate:active': (val) => {
                                if (val) {
                                    activeNode.value = val
                                }
                            }
                        }, nodeDataList.value.map((item, index) =>
                            h(resolveComponent('bk-tab-panel'), {
                                label: `【${item.label}】${window.i18n.t('节点')}`,
                                name: item.id,
                                key: index
                            })
                        )),
                        renderOperateArea(),
                        currentNodeTab.value?.hideFilters ? '' : renderFilters(),
                        currentNodeTab.value?.tableName ? renderTable() : ''
                    ])
                ]
            }
        ]

        const getElements = () => {
            return [
                h('div', {
                        class: 'flow-manage-title',
                    }
                    [`${self.tplName}流程管理`]
                ),
                h(resolveComponent('bk-tab'), {
                    active: activeTab.value,
                    type: 'unborder-card',
                    class: 'render-widget-tab',
                    'onUpdate:active': (val) => {
                        activeTab.value = val
                        val === 'node' && getFormDetail()
                        val === 'process' && processRef.value?.getTableData()
                    }
                }, tabPanelList.map((panel, index) =>
                    h(resolveComponent('bk-tab-panel'), {
                        key: index,
                        name: panel.name,
                        label: panel.label
                    }, panel.children)
                ))
            ]
        }

        return () => h('div', { class: 'flow-manage-wrapper' }, getElements())
    }
})
