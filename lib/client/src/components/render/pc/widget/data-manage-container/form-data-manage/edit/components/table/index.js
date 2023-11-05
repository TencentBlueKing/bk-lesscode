import { h, toolTips } from 'bk-lesscode-render'
import elementBox from '../element-box'
import tableColSetting from '../table-col-setting'
import { uuid } from 'shared/util'
import './index.postcss'

export default {
    name: 'form-data-table',
    inheritAttrs: false,
    props: {
        fields: {
            type: Array,
            default: () => [],
            required: true
        },
        actions: {
            type: Array,
            default: () => []
        },
        tableColsExclude: {
            type: Array,
            default: () => []
        }
    },
    computed: {
        tableData () {
            return [{ actions: this.actions }]
        },
        fieldsToBeDisplayed () {
            return this.fields.filter(item => !this.tableColsExclude.includes(item.key))
        }
    },
    methods: {
        getProperties (action) {
            const props = {}
            Object.keys(action.props).forEach(key => {
                props[key] = action.props[key].val
            })
            return props
        },
        handleAddAction (e) {
            e.stopPropagation()
            const actions = this.actions.slice()
            const comp = {
                id: `action-${uuid(8)}`,
                type: 'tableRowAction',
                name: this.$t('操作'),
                props: {},
                events: { click: { enable: false, name: '' } },
                perms: []
            }
            actions.push(comp)
            this.update(actions)
            this.$emit('active', comp)
        },
        handleCopyAction (comp) {
            const actions = this.actions.slice()
            const copyComp = Object.assign({}, comp, { id: `action-${uuid(8)}` })
            const index = actions.findIndex(item => item.id === comp.id)
            if (index > -1) {
                actions.splice(index + 1, 0, copyComp)
                this.update(actions)
                this.$emit('active', copyComp)
            }
        },
        handleDelAction (comp) {
            const actions = this.actions.filter(item => item.id !== comp.id)
            this.update(actions)
            this.$emit('del', comp)
        },
        handleColSettingUpdate (exclude) {
            this.$emit('update', 'tableColsExclude', exclude)
        },
        update (actions) {
            this.$emit('update', 'tableRowActions', actions)
        }
    },
    render (render) {
        h.init(render)

        const self = this

        const renderRowActions = () => {
            const actions = this.actions.map(btn => h({
                component: elementBox,
                class: 'row-action-item',
                props: {
                    elementData: btn,
                    selected: false
                },
                on: {
                    click: () => {
                        self.$emit('active', btn)
                    },
                    copy: () => {
                        self.handleCopyAction(btn)
                    },
                    del: () => {
                        self.handleDelAction(btn)
                    }
                },
                slots: {
                    default () {
                        return h({
                            component: 'div',
                            class: 'action-btn',
                            key: btn.id,
                            children: [
                                h({
                                    component: 'bk-button',
                                    props: {
                                        text: true,
                                        ...self.getProperties(btn)
                                    },
                                    children: btn.name
                                })
                            ]
                        })
                    }
                }
            }))

            actions.push(h({
                component: 'i',
                class: 'bk-icon icon-plus add-btn',
                directives: [{
                    name: toolTips,
                    value: {
                        content: self.$t('添加操作'),
                        placement: 'top'
                    }
                }],
                on: {
                    click: self.handleAddAction
                }
            }))

            return h({
                component: 'bk-table-column',
                props: {
                    minWidth: 150,
                    index: 9999,
                    label: this.$t('操作')
                },
                scopedSlots: {
                    default () {
                        return h({
                            component: 'div',
                            class: 'table-row-actions',
                            key: actions.length,
                            children: actions
                        })
                    }
                }
            })
        }

        const renderTableColSetting = () => {
            return h({
                component: tableColSetting,
                props: {
                    fields: this.fields,
                    exclude: this.tableColsExclude
                },
                on: {
                    update: self.handleColSettingUpdate
                }
            })
        }

        const renderTableCols = () => {
            const cols = this.fieldsToBeDisplayed.map(field => h({
                component: 'bk-table-column',
                props: {
                    prop: field.key,
                    label: field.name
                }
            }))

            cols.push(renderRowActions(), renderTableColSetting())

            return cols
        }

        return h({
            component: 'div',
            class: 'form-data-table',
            children: [h({
                component: 'bk-table',
                props: {
                    data: this.tableData,
                    headerCellStyle: { background: '#f0f1f5' },
                    outerBorder: false
                },
                children: renderTableCols()
            })]
        })
    }
}
