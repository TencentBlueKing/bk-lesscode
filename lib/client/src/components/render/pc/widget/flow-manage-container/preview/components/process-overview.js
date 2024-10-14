import { h, framework } from 'bk-lesscode-render'
import { statusMap } from './const'
import http from '@/api/pureAxios'
import dayjs from 'dayjs'
import TaskDetailSlider from './task-detail-sideslider'

import './process-overview.postcss'

export default {
    props: {
        id: {
            type: String,
            required: true
        }
    },
    data () {
        return {
            formData: {
                createUser: '',
                time: [],
                id: ''
            },
            tableData: [],
            taskDetailSliderData: {
                show: false,
                id: 0
            }
        }
    },
    computed: {
        statusList () {
            return Object.keys(statusMap).map(key => ({ name: statusMap[key], key }))
        }
    },
    created () {
        this.getTableData()
    },
    methods: {
        async getTableData () {
            const query = {}
            Object.keys(this.formData).forEach(key => {
                const val = this.formData[key]
                if (key === 'time') {
                    if (val.length > 0 && val.every(v => v.length > 0)) {
                        query.createAtStart = val[0]
                        query.createAtEnd = val[1]
                    }
                } else if (val) {
                    query[key] = val
                }
            })
            const res = await http.get(`/flow/tpl/${this.id}/task/list`, { params: query }).then(response => response.data)
            this.tableData = res.list
        }
    },
    render (render) {
        h.init(render)
        const self = this

        const filterFormItem = [
            {
                label: this.$t('id'),
                component: 'bk-input',
                property: 'id',
                name: 'id',
                props: {
                    placeholder: this.$t('请输入id'),
                    ...(framework === 'vue3' ? { modelValue: this.formData.id } : { value: this.formData.id })
                },
                on: framework === 'vue3' ? {
                    'update:modelValue': (value) => {
                        self.formData.id = value
                    }
                } : {
                    'input': (value) => {
                        self.formData.id = value
                    }
                }
            },
            {
                label: this.$t('创建人'),
                component: 'bk-input',
                property: 'createUser',
                name: 'createUser',
                props: {
                    placeholder: this.$t('请输入创建时间'),
                    ...(framework === 'vue3' ? { modelValue: this.formData.createUser } : { value: this.formData.createUser })
                },
                on: framework === 'vue3' ? {
                    'update:modelValue': (value) => {
                        self.formData.createUser = value
                    }
                } : {
                    'input': (value) => {
                        self.formData.createUser = value
                    }
                }
            },
            {
                label: this.$t('创建时间'),
                component: 'bk-date-picker',
                property: 'time',
                name: 'createTime',
                props: {
                    type: 'datetimerange',
                    format: 'yyyy-MM-dd HH:mm:ss',
                    size: 'small',
                    placeholder: this.$t('请输入创建时间')
                },
                on: {
                    'change': (value) => {
                        self.formData.time = value
                    }
                },
                scopedSlots: {
                    default: ({ row }) => {
                        return h({
                            component: 'div',
                            children: [dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss')]
                        })
                    }
                }
            },
            {
                label: this.$t('状态'),
                component: 'bk-select',
                property: 'status',
                name: 'status',
                props: {
                    placeholder: this.$t('请选择状态'),
                    ...(framework === 'vue3' ? { modelValue: this.formData.status } : { value: this.formData.status })
                },
                on: framework === 'vue3' ? {
                    'update:modelValue': (value) => {
                        self.formData.status = value
                    }
                } : {
                    'input': (value) => {
                        self.formData.status = value
                    }
                },
                scopedSlots: {
                    default: ({ row }) => {
                        return h({
                            component: 'div',
                            class: 'flow-status-item',
                            children: [h({
                                component: 'span',
                                class: `flow-status-icon ${row.status}`
                            }), h({
                                component: 'span',
                                class: 'flow-status-text',
                                children: [statusMap[row.status]]
                            })]
                        })
                    }
                },
                children: self.statusList.map(status => (h({
                    component: 'bk-option',
                    props: {
                        label: status.name,
                        name: status.name,
                        id: status.key,
                        value: status.key
                    }
                })))
            }
        ]

        return h({
            component: 'div',
            class: 'process-render',
            children: [
                h({
                    component: 'div',
                    class: 'filter-render-wrapper',
                    children: [
                        h({
                            component: 'bk-form',
                            props: {
                                'form-type': 'vertical',
                                'model': this.formData
                            },
                            children: filterFormItem.map((item, index) =>
                                item.property === 'status'
                                    ? null
                                    : h({
                                        component: 'bk-form-item',
                                        props: {
                                            label: item.label,
                                            extCls: index === 0 ? '' : 'ml10',
                                            class: index === 0 ? '' : 'ml10',
                                            property: item.property
                                        },
                                        children: [
                                            h({
                                                component: item.component,
                                                props: item.props,
                                                style: {
                                                    width: '100%'
                                                },
                                                children: item.children ? item.children : [],
                                                on: item.on
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
                                    children: [this.$t('查询')],
                                    on: {
                                        click: () => {
                                            self.getTableData()
                                        }
                                    }
                                }),
                                h({
                                    component: 'bk-button',
                                    class: 'ml10',
                                    props: {
                                        theme: 'default'
                                    },
                                    children: [this.$t('重置')],
                                    on: {
                                        click: () => {
                                            self.formData = {
                                                createUser: '',
                                                time: [],
                                                id: ''
                                            }
                                            self.getTableData()
                                        }
                                    }
                                })
                            ]
                        })
                    ]
                }),
                h({
                    component: 'bk-table',
                    class: 'mt20',
                    props: {
                        data: self.tableData
                    },
                    children: [
                        ...filterFormItem.map((item, index) =>
                            h({
                                ...{
                                    component: 'bk-table-column',
                                    props: {
                                        label: item.label,
                                        index: index,
                                        prop: item.name
                                    }
                                },
                                ...(item.scopedSlots ? { scopedSlots: item.scopedSlots } : {})
                            })
                        ),
                        h({
                            component: 'bk-table-column',
                            props: {
                                label: self.$t('操作')
                            },
                            scopedSlots: {
                                default: ({ row }) =>
                                    row.status === 'RUNNING'
                                        ? h({
                                            component: 'div',
                                            class: 'edit-text',
                                            children: [self.$t('处理')],
                                            on: {
                                                click: () => {
                                                    self.taskDetailSliderData.show = true
                                                    self.taskDetailSliderData.id = row.id
                                                }
                                            }
                                        })
                                        : '--'
                            }
                        })
                    ]
                }),
                h({
                    component: TaskDetailSlider,
                    props: {
                        ...self.taskDetailSliderData
                    },
                    on: {
                        refresh: () => {
                            self.getTableData()
                        },
                        close: () => {
                            self.taskDetailSliderData.show = false
                        }
                    }
                })
            ]
        })
    }
}
