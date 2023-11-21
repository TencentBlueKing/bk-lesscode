import { h } from 'bk-lesscode-render'
import fieldViewValue from '../field-view-value'
import './index.postcss'

export default {
    name: 'cell-value',
    props: {
        field: {
            type: Object,
            default: () => ({})
        },
        value: [String, Number, Boolean, Array, Object]
    },
    data () {
        return {
            isShowCellDetailDialog: false
        }
    },
    render (render) {
        h.init(render)

        const self = this

        const renderCellValue = () => {
            if (['rich-text', 'table'].includes(this.field.type)) {
                return h({
                    component: 'bk-button',
                    props: { text: true, theme: 'primary' },
                    on: {
                        click: () => {
                            self.isShowCellDetailDialog = true
                        }
                    },
                    children: '查看'
                })
            }
            return h({ component: fieldViewValue, props: { field: this.field, value: this.value } })
        }

        const renderCellDetail = () => {
            return h({
                component: 'bk-dialog',
                props: {
                    value: self.isShowCellDetailDialog,
                    isShow: self.isShowCellDetailDialog,
                    title: `查看【${this.field.configure.name}】详情`,
                    width: 960,
                    renderDirective: 'if',
                    on: {
                        cancel: () => {
                            self.isShowCellDetailDialog = false
                        }
                    }
                },
                slots: {
                    default: () => {
                        return h({
                            component: 'div',
                            class: 'cell-detail-content',
                            slot: 'default',
                            children: [h({
                                component: fieldViewValue,
                                props: {
                                    field: this.field,
                                    value: this.value
                                }
                            })]
                        })
                    },
                    footer: () => {
                        return h({
                            component: 'bk-button',
                            slot: 'footer',
                            on: {
                                click: () => {
                                    self.isShowCellDetailDialog = false
                                }
                            },
                            children: '关闭'
                        })
                    }
                }
            })
        }

        return h({
            component: 'div',
            class: 'cell-value',
            children: [
                renderCellValue(),
                renderCellDetail()
            ]
        })
    }
}
