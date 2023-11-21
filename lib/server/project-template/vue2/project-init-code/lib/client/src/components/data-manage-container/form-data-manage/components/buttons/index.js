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
    render (h) {
        const self = this

        const renderButtons = () => {
            return this.buttons.slice(0, 4).map(btn => {
                return h(
                    'bk-button',
                    {
                        props: self.getProperties(btn),
                        on: {
                            click: () => {
                                self.handleClick(btn)
                            }
                        }
                    },
                    btn.name
                )
            })
        }

        const renderDropDown = () => {
            return h(
                'bk-dropdown-menu',
                {
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
                    }
                },
                [
                    h(
                        'div',
                        {
                            class: 'more-buttons-trigger',
                            slot: 'dropdown-trigger'
                        },
                        [
                            '更多',
                            h(
                                'i',
                                {
                                    class: ['bk-icon icon-angle-down angle-icon', { 'active': self.isDropdownShow }]
                                }
                            )
                        ]
                    ),
                    h(
                        'ul',
                        {
                            class: 'more-btns-list',
                            slot: 'dropdown-content',
                            props: {}
                        },
                        self.buttons.slice(4).map(btn => {
                            return h(
                                'li',
                                {
                                    class: 'button-item',
                                    on: {
                                        click: () => {
                                            self.handleClick(btn)
                                        }
                                    }
                                },
                                btn.name
                            )
                        })
                    )
                ]
            )
        }

        return h(
            'div',
            {
                class: 'data-manage-buttons'
            },
            [
                renderButtons(),
                this.buttons.length > 4 ? renderDropDown() : null
            ]
        )
    }
}
