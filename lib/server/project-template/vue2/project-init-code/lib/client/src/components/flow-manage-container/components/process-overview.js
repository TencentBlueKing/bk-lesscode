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
                creator: '',
                time: [],
                status: ''
            },
            tableData: [],
            taskDetailSliderData: {
                show: false,
                id: 0
            },
            pagination: {
                current: 1,
                limit: 10,
                count: 0
            },
            loading: false
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
            this.loading = true
            const res = await http.get(`/flow/tpl/${this.id}/task/list`, { params: {
                page: this.pagination.current,
                pageSize: this.pagination.limit,
                ...this.formData
            } }).then(response => response.data)
            this.tableData = res?.list || []
            this.pagination.count = res?.count || 0
            this.loading = false
        }
    },
    render (h) {
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
                property: 'creator',
                name: 'createUser',
                props: {
                    placeholder: this.$t('请输入创建时间'),
                    value: this.formData.creator
                },
                on: {
                    'input': (value) => {
                        self.formData.creator = value
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
                        return h('div', [h('span', dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss'))])
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
                    value: this.formData.status
                },
                on: {
                    'input': (value) => {
                        self.formData.status = value
                    }
                },
                scopedSlots: {
                    default: ({ row }) => {
                        return h('div', {
                            class: 'flow-status-item'
                        }, [h('span', {
                            class: `flow-status-icon ${row.status}`
                        }), h('span', {
                            class: 'flow-status-text'
                        }, [statusMap[row.status]])])
                    }
                },
                children: self.statusList.map(status => (h('bk-option', {
                    props: {
                        label: status.name,
                        name: status.name,
                        id: status.key,
                        value: status.key
                    }
                })))
            }
        ]

        return h('div', {
            class: 'process-render'
        }, [
            h('div', {
                class: 'filter-render-wrapper'
            }, [
                h('bk-form', {
                    props: {
                        'form-type': 'vertical',
                        'model': this.formData
                    }
                }, filterFormItem.map((item, index) =>
                    item.property === 'status'
                        ? null
                        : h('bk-form-item', {
                                props: {
                                    label: item.label,
                                    extCls: index === 0 ? '' : 'ml10',
                                    class: index === 0 ? '' : 'ml10',
                                    property: item.property
                                }
                            }, [
                                h(item.component, {
                                    props: item.props,
                                    style: {
                                        width: '100%'
                                    },
                                    on: item.on
                                }, item.children ? item.children : [])
                            ])
                )),
                h('div', {
                    class: 'filter-btn-area mt20'
                }, [
                    h('bk-button', {
                        props: {
                            theme: 'primary'
                        },
                        on: {
                            click: () => {
                                self.getTableData()
                            }
                        }
                    }, [this.$t('查询')]),
                    h('bk-button', {
                        class: 'ml10',
                        props: {
                            theme: 'default'
                        },
                        on: {
                            click: () => {
                                self.formData = {
                                    creator: '',
                                    time: [],
                                    status: ''
                                }
                                self.getTableData()
                            }
                        }
                    }, [this.$t('重置')])
                ])
            ]),
            h('bk-table', {
                class: 'mt20',
                props: {
                    data: self.tableData,
                    pagination: self.pagination
                },
                on: {
                    'page-change': (page) => {
                        self.pagination.current = page
                        self.getTableData()
                    },
                    'page-limit-change': (limit) => {
                        self.pagination.limit = limit
                        self.getTableData()
                    }
                },
                directives: [
                    {
                        name: 'bkloading',
                        value: {
                            isLoading: self.loading
                        }
                    }
                ]
            }, [
                ...filterFormItem.map((item, index) =>
                    h('bk-table-column', {
                        props: {
                            label: item.label,
                            index: index,
                            prop: item.name
                        },
                        ...(item.scopedSlots ? { scopedSlots: item.scopedSlots } : {})
                    })
                ),
                h('bk-table-column', {
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
            ]),
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
        ])
    }
}
