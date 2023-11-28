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
    render (h) {
        const self = this

        const renderCellValue = () => {
            if (['rich-text', 'table'].includes(this.field.type)) {
                return h(
                    'bk-button',
                    {
                        props: { text: true, theme: 'primary' },
                        on: {
                            click: () => {
                                self.isShowCellDetailDialog = true
                            }
                        }
                    },
                    '查看'
                )
            }
            return h(fieldViewValue, { props: { field: this.field, value: this.value } })
        }

        const renderCellDetail = () => {
            return h(
                'bk-dialog',
                {
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
                    }
                },
                [
                    h(
                        'div',
                        {
                            class: 'cell-detail-content',
                            slot: 'default'
                        },
                        [h(
                            fieldViewValue,
                            {
                                props: {
                                    field: this.field,
                                    value: this.value
                                }
                            }
                        )]
                    ),
                    h(
                        'bk-button',
                        {
                            slot: 'footer',
                            on: {
                                click: () => {
                                    self.isShowCellDetailDialog = false
                                }
                            }
                        },
                        '关闭'
                    )
                ]
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
