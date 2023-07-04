import cssModule from './edit.postcss?module'
import {
    h,
    ref,
    watch,
    framework
} from 'bk-lesscode-render'
import editObject from '../../components/edit-object/edit-object'
import {
    messageError
} from '@/common/bkmagic'
import http from '@/api'
import dayjs from 'dayjs'
import DayJSUtcPlugin from 'dayjs/plugin/utc'
dayjs.extend(DayJSUtcPlugin)

export default {
    props: {
        isLoading: Boolean,
        isShow: Boolean,
        form: Object,
        columns: Array,
        tableName: String
    },

    emits: ['close', 'edit'],

    setup (props, { emit }) {
        const isSaving = ref(false)
        const formRef = ref(null)
        const renderForm = ref({})

        watch(
            () => props.isShow,
            () => {
                renderForm.value = JSON.parse(JSON.stringify(props.form))
            }
        )

        const getColumnRule = (column) => {
            if (!column.isNullable) {
                return [{
                    required: true,
                    message: `${column.propertyName} 是必填项`,
                    trigger: 'blur'
                }]
            }
        }

        const changeDateTime = (propName, date) => {
            renderForm.value[propName] = timeFormatter(date)
        }

        const changeDate = (propName, date) => {
            renderForm.value[propName] = dateFormatter(date)
        }

        const timeFormatter = (val) => {
            return val ? dayjs(val).format('YYYY-MM-DD HH:mm:ss') : ''
        }

        const dateFormatter = (val) => {
            return val ? dayjs(val).format('YYYY-MM-DD') : ''
        }

        const handleSubmitData = () => {
            formRef
                .value
                .validate()
                .then(() => {
                    // 入库前根据浏览器时间转换时区
                    const dateTimeColumns = props.columns?.filter((column) => (column.type === 'datetime'))
                    dateTimeColumns.forEach((dateTimeColumn) => {
                        renderForm.value[dateTimeColumn.propertyName] = dayjs(renderForm.value[dateTimeColumn.propertyName])
                            .utcOffset(0)
                            .format('YYYY-MM-DD HH:mm:ss')
                    })
                    isSaving.value = true
                    return http
                        .put(`/data-source/user/tableName/${props.tableName}`, renderForm.value)
                        .then(() => {
                            emit('edit')
                            handleCloseForm()
                        })
                        .finally(() => {
                            isSaving.value = false
                        })
                })
                .catch((validator) => {
                    messageError(validator.content || validator)
                })
        }

        const handleCloseForm = () => {
            emit('close')
        }

        return {
            isSaving,
            formRef,
            renderForm,
            getColumnRule,
            changeDateTime,
            changeDate,
            timeFormatter,
            dateFormatter,
            handleSubmitData,
            handleCloseForm
        }
    },

    render (render) {
        h.init(render)

        const self = this

        const renderEditItem = (column) => {
            const handleChange = (propertyName, val) => {
                self.renderForm[propertyName] = val
            }
            switch (column.type) {
                case 'datetime':
                    return h({
                        component: 'bk-date-picker',
                        style: 'width:100%',
                        props: {
                            type: 'datetime',
                            clearable: false,
                            value: self.renderForm[column.propertyName],
                            modelValue: self.renderForm[column.propertyName]
                        },
                        on: {
                            change () {
                                self.changeDateTime(column.propertyName, ...arguments)
                            }
                        }
                    })
                case 'decimal':
                    return h({
                        component: 'bk-input',
                        props: {
                            value: self.renderForm[column.propertyName],
                            modelValue: self.renderForm[column.propertyName],
                            precision: +column.scale,
                            type: 'number',
                            placeholder: '请输入数字'
                        },
                        on: {
                            change (val) {
                                handleChange(column.propertyName, val)
                            }
                        }
                    })
                case 'int':
                    return h({
                        component: 'bk-input',
                        props: {
                            value: self.renderForm[column.propertyName],
                            modelValue: self.renderForm[column.propertyName],
                            type: 'number',
                            placeholder: '请输入数字'
                        },
                        on: {
                            change (val) {
                                handleChange(column.propertyName, val)
                            }
                        }
                    })
                case 'date':
                    return h({
                        component: 'bk-date-picker',
                        style: 'width:100%',
                        props: {
                            value: self.renderForm[column.propertyName],
                            modelValue: self.renderForm[column.propertyName],
                            clearable: false
                        },
                        on: {
                            change () {
                                self.changeDate(column.propertyName, ...arguments)
                            }
                        }
                    })
                case 'json':
                    return h({
                        component: editObject,
                        props: {
                            value: self.renderForm[column.propertyName]
                        },
                        on: {
                            change (val) {
                                handleChange(column.propertyName, val)
                            }
                        }
                    })
                default:
                    return h({
                        component: 'bk-input',
                        props: {
                            value: self.renderForm[column.propertyName],
                            modelValue: self.renderForm[column.propertyName],
                            placeholder: '请输入字符串'
                        },
                        on: {
                            change (val) {
                                handleChange(column.propertyName, val)
                            }
                        }
                    })
            }
        }
        
        const renderEditFormItems = () => {
            return self.columns.filter(column => column.propertyName !== 'id').map((column) => {
                return h({
                    component: 'bk-form-item',
                    key: column.propertyName,
                    props: {
                        label: column.propertyName,
                        required: !column.isNullable,
                        property: column.propertyName,
                        rules: self.getColumnRule(column),
                        errorDisplayType: 'normal'
                    },
                    children: [
                        renderEditItem(column)
                    ]
                })
            })
        }

        const renderOperationFormItem = () => {
            return h({
                component: 'bk-form-item',
                children: [
                    h({
                        component: 'bk-button',
                        class: 'mr5',
                        props: {
                            theme: 'primary',
                            loading: self.isSaving
                        },
                        on: {
                            click: self.handleSubmitData
                        },
                        children: [
                            '提交'
                        ]
                    }),
                    h({
                        component: 'bk-button',
                        props: {
                            disabled: self.isSaving
                        },
                        on: {
                            click: self.handleCloseForm
                        },
                        children: [
                            '取消'
                        ]
                    })
                ]
            })
        }

        const renderSidesilder = () => {
            const slotName = framework === 'vue2' ? 'content' : 'default'
            return h({
                component: 'bk-sideslider',
                props: {
                    title: '编辑数据',
                    width: 740,
                    transfer: framework === 'vue2',
                    isShow: self.isShow
                },
                on: {
                    'update:isShow': self.handleCloseForm
                },
                slots: {
                    [slotName] () {
                        return h({
                            slot: slotName,
                            component: 'bk-loading',
                            key: self.isLoading,
                            props: {
                                loading: self.isLoading,
                                isLoading: self.isLoading
                            },
                            children: [
                                h({
                                    component: 'bk-form',
                                    ref: 'formRef',
                                    class: cssModule['edit-data-form'],
                                    props: {
                                        formType: 'vertical',
                                        labelWidth: 120,
                                        model: self.renderForm
                                    },
                                    children: [
                                        ...renderEditFormItems(),
                                        renderOperationFormItem()
                                    ]
                                })
                            ]
                        })
                    }
                }
            })
        }

        return renderSidesilder()
    }
}
