import { h, resolveComponent } from 'vue'
import dayjs from 'dayjs'
import { isValEmpty } from '@/common/util'
import richTextViewer from '../../rich-text-viewer'

export default {
    name: 'field-view-value',
    props: {
        field: {
            type: Object,
            default: () => ({})
        },
        value: [String, Number, Boolean, Array, Object]
    },
    render () {
        const renderViewValue = () => {
            if (this.field.type === 'table') {
                return h(
                    resolveComponent('bk-table'),
                    {
                        data: this.value || []
                    },
                    this.field.configure.tableConfig.map((col, index) => h(
                        resolveComponent('bk-table-column'),
                        {
                            index,
                            key: col.key,
                            prop: col.key,
                            label: col.label
                        },
                        {
                            default (props) {
                                return h(
                                    'span',
                                    {},
                                    [isValEmpty(props.row[col.key]) ? '--' : props.row[col.key]]
                                )
                            }
                        }
                    ))
                )
            } else if (this.field.type === 'rich-text') {
                return h(richTextViewer, { value: this.value })
            } else if (isValEmpty(this.value)) {
                return h('span', {}, '--')
            } else if (['datetime', 'datetime'].includes(this.field.type)) {
                const formatter = this.field.type === 'datetime' ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD'
                return h('span', {}, dayjs(this.value).format(formatter))
            } else if (this.field.type === 'link') {
                return h(
                    'a',
                    {
                        style: { color: '#3a84ff' },
                        target: '_blank',
                        href: this.value
                    },
                    this.field.key
                )
            }

            return h('span', {}, this.value)
        }

        return h(
            'div',
            {
                class: 'field-view-value'
            },
            [renderViewValue()]
        )
    }
}
