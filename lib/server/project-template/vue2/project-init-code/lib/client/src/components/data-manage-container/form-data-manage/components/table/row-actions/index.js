import { bkInfoBox } from 'bk-magic-vue'
import fieldViewValue from '../field-view-value'
import './index.postcss'

export default {
    name: 'data-manage-table-row-action',
    props: {
        tableName: String,
        actions: {
            type: Array,
            default: () => []
        },
        fields: {
            type: Array,
            default: () => []
        },
        value: {
            type: Object,
            default: () => ({})
        }
    },
    data () {
        return {
            isShowRowDetail: false
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
        handleViewDetail () {
            this.isShowRowDetail = true
        },
        handleDelItem () {
            bkInfoBox({
                title: '确认删除该条数据',
                confirmLoading: true,
                confirmFn: async () => {
                    try {
                        await this.$http.delete(`/data-source/user/tableName/${this.tableName}?id=${this.value.id}`)
                        this.$bkMessage({
                            message: '删除成功',
                            theme: 'success'
                        })
                        this.$emit('delete')
                        return true
                    } catch (e) {
                        console.warn(e)
                        return false
                    }
                }
            })
        }
    },
    render (h) {
        const self = this

        const renderActions = () => this.actions.map(action => h(
            'bk-button',
            {
                class: 'action-btn',
                props: {
                    key: action.id,
                    text: true,
                    ...self.getProperties(action)
                },
                on: {
                    click: () => {
                        const { enable, name } = action.events.click
                        if (!enable) {
                            return
                        }
                        if (name === 'rowDetail') {
                            self.handleViewDetail()
                        } else if (name === 'rowDelete') {
                            self.handleDelItem()
                        }
                    }
                }
            },
            action.name
        ))

        const renderDataDetail = () => {
            return h(
                'bk-sideslider',
                {
                    props: {
                        width: 800,
                        title: '查看详情',
                        isShow: self.isShowRowDetail,
                        'quick-close': true,
                        'before-close': () => {
                            self.isShowRowDetail = false
                        }
                    }
                },
                [
                    h(
                        'div',
                        {
                            class: 'table-row-detail',
                            slot: 'content',
                            props: {}
                        },
                        [
                            h(
                                'bk-form',
                                {},
                                this.fields.map(field => {
                                    return h(
                                        'bk-form-item',
                                        {
                                            props: {
                                                label: field.configure.name
                                            }
                                        },
                                        [
                                            h(
                                                fieldViewValue,
                                                {
                                                    props: {
                                                        field,
                                                        value: this.value[field.configure.key]
                                                    }
                                                }
                                            )
                                        ]
                                    )
                                })
                            )
                        ]
                    )
                ]
            )
        }

        return h(
            'div',
            {
                class: 'table-row-actions'
            },
            [
                renderActions(),
                renderDataDetail()
            ]
        )
    }
}
