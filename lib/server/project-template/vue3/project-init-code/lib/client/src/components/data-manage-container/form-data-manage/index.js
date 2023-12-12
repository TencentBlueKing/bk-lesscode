import { h } from 'vue'
import table from './components/table'
import buttons from './components/buttons'
import filters from './components/filters'
import { FORM_SYS_FIELD, FIELDS_NOT_DISPLAYED_IN_TABLE } from '../constants'
import { formMap } from 'shared/form'
import './index.postcss'

export default {
    name: 'widget-data-manage-container',
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
            const { tableName, content = [] } = formMap[this.formId]
            this.fields = content.filter(field => !FIELDS_NOT_DISPLAYED_IN_TABLE.includes(field.type))
            this.tableName = tableName
            this.loading = false
        }
    },
    render () {
        const self = this

        return h(
            'div',
            {
                class: 'widget-data-manage-container'
            },
            this.loading ? null : [
                h(
                    'div',
                    {
                        class: 'data-manage-operate-area'
                    },
                    [
                        this.buttons.length > 0 ? h(
                            buttons,
                            {
                                tableName: this.tableName,
                                fields: this.allFields,
                                buttons: this.buttons
                            }
                        ) : null,
                        this.filters.length > 0 ? h(
                            'div',
                            {
                                class: 'toggle-filters-btn',
                                onClick: () => {
                                    self.hideFilters = !self.hideFilters
                                }
                            },
                            [
                                h(
                                    'i',
                                    {
                                        class: 'bk-icon icon-funnel toggle-icon'
                                    }
                                )
                            ]
                        ) : null
                    ]
                ),
                (this.hideFilters || this.filters.length === 0) ? null : h(
                    filters,
                    {
                        fields: this.allFields,
                        filters: this.filters,
                        queryData: this.queryData,
                        onQuery: (val) => {
                            self.queryData = val
                        }
                    }
                ),
                h(
                    table,
                    {
                        fields: this.allFields,
                        queryData: this.queryData,
                        tableName: this.tableName,
                        tableRowActions: this.tableRowActions,
                        tableColsExclude: this.tableColsExclude
                    }
                )
            ]
        )
    }
}
