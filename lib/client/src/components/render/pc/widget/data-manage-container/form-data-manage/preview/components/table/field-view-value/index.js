import { h, framework } from 'bk-lesscode-render'
import dayjs from 'dayjs'
import { isValEmpty } from '@/common/util'
import richTextViewer from '../../rich-text-viewer'

export default {
    name: 'cell-value',
    props: {
        field: {
            type: Object,
            default: () => ({})
        },
        value: [String, Number, Boolean, Array, Object]
    },
    render (render) {
        h.init(render)

        // const self = this

        const renderViewValue = () => {
            if (this.field.type === 'table') {
                return h({
                    component: 'bk-table',
                    props: { data: this.value || [] },
                    children: this.field.configure.tableConfig.map((col, index) => h({
                        component: 'bk-table-column',
                        props: {
                            key: col.key,
                            prop: col.key,
                            label: col.label,
                            index
                        },
                        scopedSlots: {
                            default (props) {
                                // vue3 table组件bk-table-column默认插槽初次渲染时，props内值为空
                                if (framework === 'vue3' && !('index' in props)) {
                                    return null
                                }
                                // vue3 table组件表示行的字段名称为index
                                // const index = framework === 'vue3' ? props.index : props.$index
                                return h({
                                    component: 'span',
                                    children: [isValEmpty(props.row[col.key]) ? '--' : props.row[col.key]]
                                })
                            }
                        }
                    }))
                })
            } else if (this.field.type === 'rich-text') {
                return h({ component: richTextViewer, props: { value: this.value } })
            } else if (isValEmpty(this.value)) {
                return h({ component: 'span', children: '--' })
            } else if (['datetime', 'datetime'].includes(this.field.type)) {
                const formatter = this.field.type === 'datetime' ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD'
                return h({ component: 'span', children: dayjs(this.value).format(formatter) })
            } else if (this.field.type === 'link') {
                return h({
                    component: 'a',
                    style: { color: '#3a84ff' },
                    target: '_blank',
                    href: this.value,
                    children: this.field.key
                })
            }

            return h({ component: 'span', children: this.value })
        }

        return h({
            component: 'div',
            class: 'field-view-value',
            children: [renderViewValue()]
        })
    }
}
