import {
    h,
    ref
} from 'bk-lesscode-render'
import http from '@/api'

export default {
    props: {
        isShow: Boolean,
        id: Number,
        tableName: String,
        thirdPartDBName: String
    },

    emits: ['close', 'delete'],

    setup (props, { emit }) {
        const isLoading = ref(false)

        const handleConfirmDelete = () => {
            isLoading.value = true
            return http
                .delete(`/data-source/user/tableName/${props.tableName}${props.thirdPartDBName ? `/${props.thirdPartDBName}` : ''}?id=${props.id}`)
                .then(() => {
                    emit('delete')
                    handleCloseDialog()
                })
                .finally(() => {
                    isLoading.value = false
                })
        }

        const handleCloseDialog = () => {
            emit('close')
        }

        return {
            isLoading,
            handleConfirmDelete,
            handleCloseDialog
        }
    },

    render (render) {
        h.init(render)

        const self = this

        return h({
            component: 'bk-dialog',
            props: {
                title: '确定删除',
                maskClose: false,
                loading: self.isLoading,
                isShow: self.isShow,
                value: self.isShow
            },
            on: {
                cancel: self.handleCloseDialog,
                closed: self.handleCloseDialog
            },
            slots: {
                default () {
                    return `确定删除【id：${self.id}】？`
                },
                footer () {
                    return h({
                        component: 'div',
                        slot: 'footer',
                        class: 'dialog-footer',
                        children: [
                            h({
                                component: 'bk-button',
                                class: 'mr5',
                                props: {
                                    theme: 'danger',
                                    loading: self.isLoading
                                },
                                on: {
                                    click: self.handleConfirmDelete
                                },
                                children: [
                                    '确定'
                                ]
                            }),
                            h({
                                component: 'bk-button',
                                props: {
                                    disabled: self.isLoading
                                },
                                on: {
                                    click: self.handleCloseDialog
                                },
                                children: [
                                    '取消'
                                ]
                            })
                        ]
                    })
                }
            }
        })
    }
}
