import { h, resolveComponent } from 'vue'
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
    render () {
        const self = this

        const renderCellValue = () => {
            if (['rich-text', 'table'].includes(this.field.type)) {
                return h(
                    resolveComponent('bk-button'),
                    {
                        text: true,
                        theme: 'primary',
                        onClick: () => {
                            self.isShowCellDetailDialog = true
                        }
                    },
                    '查看'
                )
            }
            return h(fieldViewValue, { field: this.field, value: this.value })
        }

        const renderCellDetail = () => {
            return h(
                resolveComponent('bk-dialog'),
                {
                    value: self.isShowCellDetailDialog,
                    isShow: self.isShowCellDetailDialog,
                    title: `查看【${self.field.configure.name}】详情`,
                    width: 960,
                    renderDirective: 'if',
                    onCancel: () => {
                        self.isShowCellDetailDialog = false
                    }
                },
                {
                    default () {
                        return h(
                            'div',
                            {
                                class: 'cell-detail-content'
                            },
                            [h(
                                fieldViewValue,
                                {
                                    field: self.field,
                                    value: self.value
                                }
                            )]
                        )
                    },
                    footer () {
                        return h(
                            resolveComponent('bk-button'),
                            {
                                onClick: () => {
                                    self.isShowCellDetailDialog = false
                                }
                            },
                            '关闭'
                        )
                    }
                }
            )
        }

        return h(
            'div',
            {
                class: 'cell-value'
            },
            [
                renderCellValue(),
                renderCellDetail()
            ]
        )
    }
}
