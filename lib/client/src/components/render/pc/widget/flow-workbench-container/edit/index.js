import { h } from 'bk-lesscode-render'
import LC from '@/element-materials/core'

import './index.postcss'

export default {
    name: 'widget-flow-workbench-container-edit',
    inheritAttrs: false,
    props: {
        componentData: {
            type: Object,
            required: true
        }
    },
    data () {
        return {}
    },
    mounted () {
        LC.addEventListener('update', this.updateCallBack)
    },
    beforeDestroy () {
        LC.removeEventListener('update', this.updateCallBack)
    },
    methods: {
        updateCallBack (event) {
            if (event.target.componentId === this.componentData.componentId) {
                this.$forceUpdate()
            }
        }
    },
    render (render) {
        h.init(render)

        const self = this

        const filterFormItem = [
            { label: this.$t('任务ID'), component: 'bk-input', placeholder: this.$t('请输入任务ID') },
            { label: this.$t('流程'), component: 'bk-input', placeholder: this.$t('请输入流程名称') },
            { label: this.$t('创建人'), component: 'bk-input', placeholder: this.$t('请输入创建人') },
            { label: this.$t('创建时间'), component: 'bk-input', placeholder: this.$t('请输入创建时间') }
        ]

        const tableRender = () =>
            h({
                component: 'div',
                class: 'flow-process-table',
                children: [
                    h({
                        component: 'div',
                        class: 'filter-render-wrapper',
                        children: [
                            h({
                                component: 'bk-form',
                                props: {
                                    'form-type': 'vertical'
                                },
                                children: filterFormItem.map((item, index) =>
                                    h({
                                        component: 'bk-form-item',
                                        props: {
                                            label: item.label,
                                            extCls: index === 0 ? '' : 'ml10',
                                            class: index === 0 ? '' : 'ml10'
                                        },
                                        children: [
                                            h({
                                                component: item.component,
                                                props: {
                                                    placeholder: item.placeholder
                                                }
                                            })
                                        ]
                                    })
                                )
                            }),
                            h({
                                component: 'div',
                                class: 'filter-btn-area mt20',
                                children: [
                                    h({
                                        component: 'bk-button',
                                        props: {
                                            theme: 'primary'
                                        },
                                        children: [this.$t('查询')]
                                    }),
                                    h({
                                        component: 'bk-button',
                                        class: 'ml10',
                                        props: {
                                            theme: 'default'
                                        },
                                        children: [this.$t('重置')]
                                    })
                                ]
                            })
                        ]
                    }),
                    h({
                        component: 'bk-table',
                        class: 'mt20',
                        props: {
                            data: []
                        },
                        children: [
                            ...filterFormItem.map((item, index) =>
                                h({
                                    component: 'bk-table-column',
                                    props: {
                                        label: item.label,
                                        index: index
                                    }
                                })
                            ),
                            h({
                                component: 'bk-table-column',
                                props: {
                                    label: self.$t('状态')
                                }
                            }),
                            h({
                                component: 'bk-table-column',
                                props: {
                                    label: self.$t('操作')
                                }
                            })
                        ]
                    })
                ]
            })

        return h({
            component: 'div',
            class: 'widget-flow-workbench-container',
            children: [tableRender()]
        })
    }
}
