import { h, framework } from 'bk-lesscode-render'
import { statusMap } from './const'
import http from '@/api/pureAxios'
import dayjs from 'dayjs'
import TaskDetailSlider from './task-detail-sideslider'

import './process-overview.postcss'

export default {
    props: {
        // 是否为流程工作台容器，流程工作台容器展示项目下所有任务
        isWorkbench: {
            type: Boolean,
            default: false
        },
        // 指定流程模板，流程管理容器需要
        id: {
            type: String,
            required: false
        }
    },
    data () {
        return {
            formData: {
                tplName: '',
                createUser: '',
                time: [],
                id: ''
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
            this.loading = true

            const url = this.isWorkbench ? '/flow/task/list' : `/flow/tpl/${this.id}/task/list`
            const res = await http.get(url, { params: {
                page: this.pagination.current,
                pageSize: this.pagination.limit,
                ...query
            } }).then(response => response.data)
            this.tableData = res.list
            this.pagination.count = res.count
            this.loading = false
        }
    },
    render (render) {
        h.init(render)
        const self = this

        const filterFormItem = [
            {
                label: this.$t('任务ID'),
                component: 'bk-input',
                property: 'id',
                name: 'id',
                props: {
                    placeholder: this.$t('请输入任务ID'),
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
                    placeholder: this.$t('请输入创建人'),
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
                label: this.$t('执行人'),
                component: 'bk-input',
                property: 'executor',
                name: 'createUser',
                props: {},
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
                label: this.$t('执行时间'),
                component: 'bk-date-picker',
                property: 'startTime',
                name: 'time',
                props: {},
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
                        return row.status ? h({
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
                        }) : '--'
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

        if (this.isWorkbench) {
            filterFormItem.splice(1, 0, {
                label: this.$t('流程'),
                component: 'bk-input',
                property: 'tplName',
                name: 'tpl.name',
                props: {
                    placeholder: this.$t('请输入流程名称'),
                    ...(framework === 'vue3' ? { modelValue: this.formData.tplName } : { value: this.formData.tplName })
                },
                on: framework === 'vue3' ? {
                    'update:modelValue': (value) => {
                        self.formData.tplName = value
                    }
                } : {
                    'input': (value) => {
                        self.formData.tplName = value
                    }
                }
            })
        }

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
                            children: filterFormItem.filter((item) => !['executor', 'startTime', 'status'].includes(item.property)).map((item, index) => h({
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
                            }))
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
                                            self.pagination.current = 1
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
                                                tplName: '',
                                                createUser: '',
                                                time: [],
                                                id: ''
                                            }
                                            self.pagination.current = 1
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
                        border: framework === 'vue2' ? false : ['outer'],
                        data: self.tableData,
                        pagination: self.pagination,
                        remotePagination: true
                    },
                    on: framework === 'vue3' ? {
                        'page-value-change': (page) => {
                            self.pagination.current = page
                            self.getTableData()
                        },
                        'page-limit-change': (limit) => {
                            self.pagination.current = 1
                            self.pagination.limit = limit
                            self.getTableData()
                        }
                    } : {
                        'page-change': (page) => {
                            self.pagination.current = page
                            self.getTableData()
                        },
                        'page-limit-change': (limit) => {
                            self.pagination.current = 1
                            self.pagination.limit = limit
                            self.getTableData()
                        }
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
                    ],
                    directives: [
                        {
                            name: framework === 'vue3' ? 'lesscodeloading' : 'bkloading',
                            value: framework === 'vue3' ? {
                                loading: self.loading
                            } : {
                                isLoading: self.loading
                            }
                        }
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
