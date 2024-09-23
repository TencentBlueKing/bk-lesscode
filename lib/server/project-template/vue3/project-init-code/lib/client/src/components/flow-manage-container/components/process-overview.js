import { h, defineComponent, ref, computed, onMounted, resolveComponent } from 'vue'
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

        const statusList = computed(() => {
            console.log(statusMap, 'fuck StatusMap')
            return Object.keys(statusMap).map(key => ({ name: statusMap[key], key }))
        })

        const getTableData = async () => {
            const res = await http.get(`/flow/tpl/${props.id}/task/list`, { params: formData.value }).then(response => response.data)
            tableData.value = res?.list || []
        }

        onMounted(() => {
            getTableData()
        })

        return {
            formData,
            tableData,
            statusList,
            getTableData
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
            h(resolveComponent('bk-table'), {
                data: self.tableData,
                style: {
                    marginTop: '20px'
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
            ])
        ])
    }
})
