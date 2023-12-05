import { h } from 'bk-lesscode-render'
import cloneDeep from 'lodash.clonedeep'
import LC from '@/element-materials/core'
import formDataButtons from './components/form-data-buttons'
import tableFilters from './components/table-filters'
import formDataTable from './components/table'
import http from '@/api/pureAxios'
import { FORM_SYS_FIELD, FIELDS_NOT_DISPLAYED_IN_TABLE } from '../constants'
import './index.postcss'

export default {
    name: 'widget-data-manage-container-edit',
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
            fields: [],
            tableName: '',
            hideFilters: false,
            propsData: this.getPropsData(this.componentData)
        }
    },
    computed: {
        allFields () {
            const list = this.fields.map(item => Object.assign({}, item, { system: false }))
            FORM_SYS_FIELD.forEach(item => {
                list.push(Object.assign({}, item, { system: true }))
            })
            return list
        },
        noDataSourceConfigured () {
            return !this.propsData.formId
        }
    },
    watch: {
        'propsData.formId' () {
            this.getFields()
        }
    },
    mounted () {
        this.getFields()
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

            const { formId, buttons, filters, tableRowActions, tableColsExclude } = node.renderProps
            return {
                formId: formId.code,
                buttons: buttons.code,
                filters: filters.code,
                tableRowActions: tableRowActions.code,
                tableColsExclude: tableColsExclude.code
            }
        },
        async getFields () {
            if (this.noDataSourceConfigured) {
                return
            }
            this.loading = true
            const res = await http.get('nocode-form/detail', { params: { formId: this.propsData.formId } })
            const list = JSON.parse(res.data.content).filter(field => !FIELDS_NOT_DISPLAYED_IN_TABLE.includes(field.type))
            this.fields = list.map(item => {
                const { id, type, configure } = item
                const { key, name } = configure
                return { id, key, type, name: name || key }
            })
            this.tableName = res.data.tableName
            this.loading = false
        },
        updateCallBack ({ type, target }) {
            if (type === 'setProp' && target.type === 'widget-data-manage-container') {
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
            return h({
                component: 'div',
                class: 'header-operate-area',
                children: [
                    h({
                        component: formDataButtons,
                        props: { buttons: self.propsData.buttons },
                        on: {
                            update: self.handlePropsUpdate,
                            active: self.activeElement,
                            del: self.delElement
                        }
                    }),
                    h({
                        component: 'div',
                        class: 'toggle-filters-btn',
                        on: {
                            click: () => {
                                self.hideFilters = !self.hideFilters
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
        }

        const renderFilters = () => {
            return h({
                component: tableFilters,
                props: {
                    fields: self.allFields,
                    filters: self.propsData.filters,
                    hideFilters: self.hideFilters
                },
                on: {
                    update: self.handlePropsUpdate
                }
            })
        }

        const renderTable = () => {
            return h({
                component: formDataTable,
                props: {
                    fields: self.allFields,
                    actions: self.propsData.tableRowActions,
                    tableColsExclude: self.propsData.tableColsExclude
                },
                on: {
                    update: self.handlePropsUpdate,
                    active: self.activeElement,
                    del: self.delElement
                }
            })
        }

        const getElements = () => {
            const elements = [
                renderOperateArea()
            ]
            if (!self.hideFilters) {
                elements.push(renderFilters())
            }

            if (!self.loading) {
                elements.push(renderTable())
            }

            return elements
        }

        return h({
            component: 'div',
            class: ['form-data-manage', { 'empty': this.noDataSourceConfigured }],
            attrs: {
                'data-empty-content': this.noDataSourceConfigured ? self.$t('请在右侧配置数据源') : ''
            },
            children: this.noDataSourceConfigured ? null : getElements()
        })
    }
}
