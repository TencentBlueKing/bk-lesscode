import { h, defineComponent, ref, computed, onMounted, resolveComponent, withDirectives, resolveDirective } from 'vue'
import { statusMap } from './const'
import http from '@/api/pureAxios'
import dayjs from 'dayjs'
import TaskDetailSlider from './task-detail-sideslider'

import './process-overview.postcss'

export default defineComponent({
    props: {
        isWorkbench: {
            type: Boolean,
            default: false
        },
        id: {
            type: String,
            required: false
        }
    },
    setup (props) {
        const formData = ref({
            tplName: '',
            id: '',
            creator: '',
            time: [],
            status: ''
        })
        const tableData = ref([])
        const pagination = ref({
            current: 1,
            limit: 10,
            count: 0
        })
        const loading = ref(false)
        const taskDetailSliderData = ref({
            show: false,
            id: 0
        })

        const statusList = computed(() => {
            console.log(statusMap, 'fuck StatusMap')
            return Object.keys(statusMap).map(key => ({ name: statusMap[key], key }))
        })

        const getTableData = async () => {
            loading.value = true
            const query = {}
            Object.keys(formData.value).forEach(key => {
                const val = formData.value[key]
                if (key === 'time') {
                    if (val.length > 0 && val.every(v => v.length > 0)) {
                        query.createAtStart = val[0]
                        query.createAtEnd = val[1]
                    }
                } else if (val) {
                    query[key] = val
                }
            })
            const url = this.isWorkbench ? '/flow/task/list' : `/flow/tpl/${this.id}/task/list`
            const res = await http.get(url, { params: {
                page: pagination.value.current,
                pageSize: pagination.value.limit,
                ...query
            } }).then(response => response.data)
            tableData.value = res?.list || []
            pagination.value.count = res?.count || 0
            loading.value = false
        }

        onMounted(() => {
            getTableData()
        })

        return {
            formData,
            tableData,
            statusList,
            taskDetailSliderData,
            getTableData,
            pagination,
            loading
        }
    },
    render () {
        const self = this

        const filterFormItem = [
            {
                label: window.i18n.t('任务ID'),
                component: 'bk-input',
                property: 'id',
                name: 'id',
                props: {
                    placeholder: window.i18n.t('请输入任务ID'),
                    modelValue: this.formData.id,
                    'onUpdate:modelValue': (value) => {
                        self.formData.id = value
                    }
                }
            },
            {
                label: window.i18n.t('创建人'),
                component: 'bk-input',
                property: 'creator',
                name: 'createUser',
                props: {
                    placeholder: window.i18n.t('请输入创建人'),
                    modelValue: self.formData.creator,
                    'onUpdate:modelValue': (value) => {
                        self.formData.creator = value
                    }
                }
            },
            {
                label: window.i18n.t('创建时间'),
                component: 'bk-date-picker',
                property: 'time',
                name: 'createTime',
                props: {
                    type: 'datetimerange',
                    format: 'yyyy-MM-dd HH:mm:ss',
                    size: 'small',
                    placeholder: window.i18n.t('请输入创建时间'),
                    modelValue: self.formData.time,
                    'onChange': (value) => {
                        self.formData.time = value
                    }
                },
                scopedSlots: {
                    default: ({ row }) => {
                        return h('div', null, [dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss')])
                    }
                }
            },
            {
                label: window.i18n.t('状态'),
                component: 'bk-select',
                property: 'status',
                name: 'status',
                props: {
                    placeholder: window.i18n.t('请选择状态'),
                    modelValue: self.formData.status,
                    'onUpdate:modelValue': (value) => {
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
                children: self.statusList.map(status => (h(resolveComponent('bk-option', {
                    label: status.name,
                    name: status.name,
                    id: status.key,
                    value: status.key
                }))))
            }
        ]

        if (this.isWorkbench) {
            filterFormItem.splice(1, 0, {
                label: window.i18n.t('流程'),
                component: 'bk-input',
                property: 'tplName',
                name: 'tplName',
                props: {
                    placeholder: window.i18n.t('请输入流程名称'),
                    modelValue: this.formData.tplName
                },
                on: {
                    'update:modelValue': (value) => {
                        self.formData.tplName = value
                    }
                }
            })
        }

        return h('div', {
            class: 'process-render'
        }, [
            h('div', {
                class: 'filter-render-wrapper'
            }, [
                h(resolveComponent('bk-form'), {
                    'form-type': 'vertical',
                    'model': self.formData
                }, filterFormItem.map((item, index) =>
                    item.property === 'status'
                        ? null
                        : h(resolveComponent('bk-form-item'), {
                            'label': item.label,
                            style: {
                                marginLeft: index === 0 ? '0' : '10px'
                            },
                            'property': item.property
                        }, [
                            h(resolveComponent(item.component), {
                                ...item.props,
                                style: {
                                    width: '100%'
                                }
                            }, item.children ? item.children : [])
                        ])
                )),
                h('div', {
                    class: 'filter-btn-area mt20'
                }, [
                    h(resolveComponent('bk-button'), {
                        theme: 'primary',
                        onClick: () => {
                            self.pagination.current = 1
                            self.getTableData()
                        }
                    }, [this.$t('查询')]),
                    h(resolveComponent('bk-button'), {
                        class: 'ml10',
                        theme: 'default',
                        onClick: () => {
                            self.formData = {
                                creator: '',
                                time: [],
                                status: ''
                            }
                            self.pagination.current = 1
                            self.getTableData()
                        }
                    }, [this.$t('重置')])
                ])
            ]),
            withDirectives(
                h(resolveComponent('bk-table'), {
                    data: self.tableData,
                    pagination: self.pagination,
                    style: {
                        marginTop: '20px'
                    },
                    onPageValueChange: (page) => {
                        self.pagination.current = page
                        self.getTableData()
                    },
                    onPageLimitChange: (limit) => {
                        self.pagination.current = 1
                        self.pagination.limit = limit
                        self.getTableData()
                    }
                }, [
                    ...filterFormItem.map((item, index) => h(resolveComponent('bk-table-column'), {
                        'label': item.label,
                        index: index,
                        prop: item.name
                    }, item.scopedSlots ?? {})),
                    h(resolveComponent('bk-table-column'), {
                        'label': window.i18n.t('操作')
                    }, {
                        default: ({ row }) =>
                            row.status === 'RUNNING'
                                ? h('div', {
                                    class: 'edit-text',
                                    onClick: () => {
                                        self.taskDetailSliderData.show = true
                                        self.taskDetailSliderData.id = row.id
                                    }
                                }, [self.$t('处理')])
                                : '--'
                    })
                ]),
                [
                    [resolveDirective('bkloading'), { loading: self.loading }]
                ]
            ),
            h(TaskDetailSlider, {
                ...self.taskDetailSliderData,
                onRefresh: () => {
                    self.getTableData()
                },
                onClose: () => {
                    self.taskDetailSliderData.show = false
                }
            })
        ])
    }
})
