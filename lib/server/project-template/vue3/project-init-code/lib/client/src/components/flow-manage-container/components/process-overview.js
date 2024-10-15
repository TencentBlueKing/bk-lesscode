import { h, defineComponent, ref, computed, onMounted, resolveComponent, withDirectives, resolveDirective } from 'vue'
import { statusMap } from './const'
import http from '@/api/pureAxios'
import dayjs from 'dayjs'

import './process-overview.postcss'

export default defineComponent({
    props: {
        id: {
            type: String,
            required: true
        }
    },
    setup (props) {
        const formData = ref({
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

        const statusList = computed(() => {
            console.log(statusMap, 'fuck StatusMap')
            return Object.keys(statusMap).map(key => ({ name: statusMap[key], key }))
        })

        const getTableData = async () => {
            loading.value = true
            const res = await http.get(`/flow/tpl/${props.id}/task/list`, { params: {
                page: pagination.value.current,
                pageSize: pagination.value.limit,
                ...formData.value
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
            getTableData,
            pagination,
            loading
        }
    },
    render () {
        const self = this

        const filterFormItem = [
            {
                label: window.i18n.t('创建人'),
                component: 'bk-input',
                property: 'creator',
                name: 'createUser',
                props: {
                    placeholder: window.i18n.t('请输入创建时间'),
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

        return h('div', {
            class: 'process-render'
        }, [
            h('div', {
                class: 'filter-render-wrapper'
            }, [
                h(resolveComponent('bk-form'), {
                    'form-type': 'vertical',
                    'model': self.formData
                }, filterFormItem.map((item, index) => h(resolveComponent('bk-form-item'), {
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
                ])))

            ]),
            withDirectives(
                h(resolveComponent('bk-table'), {
                    data: self.tableData,
                    pagination: self.pagination,
                    style: {
                        marginTop: '20px'
                    },
                    on: {
                        'page-value-change': (page) => {
                            self.pagination.current = page
                            self.getTableData()
                        },
                        'page-limit-change': (limit) => {
                            self.pagination.limit = limit
                            self.getTableData()
                        }
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
                        default: ({ row }) => h('div', {
                            class: 'edit-text',
                            onClick: () => {
                                window.open(`${process.env.BK_ITSM_URL}/#/ticket/detail?id=${row.id}&project_id=lesscode`, '_blank')
                            }
                        }, [window.i18n.t('详情')])
                    })
                ]), [
                    resolveDirective('bkloading', {
                        loading: self.loading
                    })
                ])
        ])
    }
})
