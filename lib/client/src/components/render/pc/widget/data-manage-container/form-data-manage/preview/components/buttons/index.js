import { h } from 'bk-lesscode-render'
import * as XLSX from 'xlsx'
import './index.postcss'

export default {
    name: 'data-manage-buttons',
    props: {
        tableName: String,
        fields: {
            type: Array,
            default: () => []
        },
        buttons: {
            type: Array,
            default: () => []
        }
    },
    data () {
        return {
            isDropdownShow: false
        }
    },
    computed: {
        tableFields () {
            return this.fields.map(field => {
                return {
                    key: field.configure.key,
                    name: field.configure.name
                }
            })
        }
    },
    methods: {
        getProperties (btn) {
            const props = {}
            Object.keys(btn.props).forEach(key => {
                props[key] = btn.props[key].val
            })
            return props
        },
        async exportData (btn) {
            try {
                const params = {
                    fields: this.tableFields.map(item => item.key)
                }
                btn.loading = true
                const res = await this.$http.post(`/nocode/filterTableData/keys/tableName/${this.tableName}`, params)
                const list = res.data.list
                const header = this.tableFields.map(field => {
                    return field.name || ''
                })
                const body = []
                list.forEach(item => {
                    const row = []
                    this.tableFields.forEach(field => {
                        for (const [rowKey, value] of Object.entries(item)) {
                            if (field.key === rowKey) {
                                row.push(value)
                            }
                        }
                    })
                    body.push(row)
                })

                const wb = XLSX.utils.book_new()
                const ws = XLSX.utils.aoa_to_sheet([header, ...body])
                XLSX.utils.book_append_sheet(wb, ws)
                XLSX.writeFile(wb, `${this.tableName}.xlsx`)
            } catch (e) {
                console.log(e.message || e)
            } finally {
                btn.loading = false
            }
        },
        handleClick (btn) {
            if (btn.events.click?.enable && btn.events.click?.name === 'export') {
                this.exportData(btn)
            }
        }
    },
    render (render) {
        h.init(render)
        const self = this

        const renderButtons = () => {
            return this.buttons.slice(0, 4).map(btn => {
                return h({
                    component: 'bk-button',
                    props: self.getProperties(btn),
                    on: {
                        click: () => {
                            self.handleClick(btn)
                        }
                    },
                    children: btn.name
                })
            })
        }

        const renderDropDown = () => {
            return h({
                component: 'bk-dropdown-menu',
                props: {
                    trigger: 'click',
                    ref: 'dropdown'
                },
                on: {
                    show: () => {
                        self.isDropdownShow = true
                    },
                    hide: () => {
                        self.isDropdownShow = false
                    }
                },
                slots: {
                    'dropdown-trigger' () {
                        return h({
                            component: 'div',
                            class: 'more-buttons-trigger',
                            slot: 'dropdown-trigger',
                            children: [
                                '更多',
                                h({
                                    component: 'i',
                                    class: ['bk-icon icon-angle-down angle-icon', { 'active': self.isDropdownShow }]
                                })
                            ]
                        })
                    },
                    'dropdown-content' () {
                        return h({
                            component: 'ul',
                            class: 'more-btns-list',
                            slot: 'dropdown-content',
                            props: {},
                            children: self.buttons.slice(4).map(btn => {
                                return h({
                                    component: 'li',
                                    class: 'button-item',
                                    on: {
                                        click: () => {
                                            self.handleClick(btn)
                                        }
                                    },
                                    children: btn.name
                                })
                            })
                        })
                    }
                }
            })
        }

        return h({
            component: 'div',
            class: 'data-manage-buttons',
            children: [
                renderButtons(),
                this.buttons.length > 4 ? renderDropDown() : null
            ]
        })
    }
}
