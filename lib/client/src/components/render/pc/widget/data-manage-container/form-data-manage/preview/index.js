import { h } from 'bk-lesscode-render'
import table from './components/table'
import buttons from './components/buttons'
import filters from './components/filters'
import { FORM_SYS_FIELD, FIELDS_NOT_DISPLAYED_IN_TABLE } from '../constants'
import './index.postcss'

export default {
    name: 'widget-data-manage-container-preview',
    props: {
        buttons: {
            type: Array,
            default: () => []
        },
        filters: {
            type: Array,
            default: () => []
        },
        tableRowActions: {
            type: Array,
            default: () => []
        },
        tableColsExclude: {
            type: Array,
            default: () => []
        },
        formId: Number
    },
    data () {
        return {
            loading: true,
            fields: [],
            tableName: '',
            queryData: {},
            hideFilters: false
        }
    },
    computed: {
        allFields () {
            const list = this.fields.map(item => Object.assign({}, item, { system: false }))
            FORM_SYS_FIELD.forEach(item => {
                const { id, name, key, type } = item
                list.push({ id, type, system: true, configure: { key, name } })
            })
            return list
        }
    },
    created () {
        if (this.formId) {
            this.getFormDetail()
        }
    },
    methods: {
        async getFormDetail () {
            this.loading = true
            const res = await this.$http.get('/nocode-form/detail', { params: { formId: this.formId } })
            const { tableName, content = [] } = res.data
            this.fields = JSON.parse(content).filter(field => !FIELDS_NOT_DISPLAYED_IN_TABLE.includes(field.type))
            this.tableName = tableName
            this.loading = false
        }
    },
    render (render) {
        h.init(render)

        const self = this

        return h({
            component: 'div',
            class: 'widget-data-manage-container',
            children: this.loading ? null : [
                h({
                    component: 'div',
                    class: 'data-manage-operate-area',
                    children: [
                        this.buttons.length > 0 ? h({
                            component: buttons,
                            props: {
                                tableName: this.tableName,
                                fields: this.allFields,
                                buttons: this.buttons
                            }
                        }) : null,
                        this.filters.length > 0 ? h({
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
                        }) : null
                    ]
                }),
                (this.hideFilters || this.filters.length === 0) ? null : h({
                    component: filters,
                    props: {
                        fields: this.allFields,
                        filters: this.filters,
                        queryData: this.queryData
                    },
                    on: {
                        query: (val) => {
                            self.queryData = val
                        }
                    }
                }),
                h({
                    component: table,
                    props: {
                        fields: this.allFields,
                        queryData: this.queryData,
                        tableName: this.tableName,
                        tableRowActions: this.tableRowActions,
                        tableColsExclude: this.tableColsExclude
                    }
                })
            ]
        })
    }
}
