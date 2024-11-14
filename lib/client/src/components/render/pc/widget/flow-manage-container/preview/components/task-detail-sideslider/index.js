import { h } from 'bk-lesscode-render'
import http from '@/api/pureAxios'
import ManualNodeForm from './manual-node-form'
import './index.postcss'

export default {
    name: 'TaskHandingComp',
    props: {
        show: Boolean,
        id: Number // 任务id
    },
    data () {
        return {
            detailLoading: true,
            formLoading: true,
            taskDetail: {},
            nodeName: '',
            nodeId: '',
            fields: []
        }
    },
    watch: {
        show (val) {
            if (val) {
                this.getTaskDetail()
            }
        }
    },
    methods: {
        async getTaskDetail () {
            this.detailLoading = true
            const res = await http.get(`/flow/task/${this.id}/detail`)
            const nodes = JSON.parse(res.data.nodes || '[]')
            this.taskDetail = res.data
            // 有正在执行的人工节点，展示第一个节点的表单
            if (res.data.runningNodeIds.length > 0) {
                const runningNode = nodes.find(v => v.id === res.data.runningNodeIds[0])
                if (runningNode?.type === 'Manual') {
                    const { name, formType, formId, relatedId } = runningNode.config
                    const id = formType === 'USE_FORM' ? relatedId : formId
                    this.nodeName = name
                    this.nodeId = runningNode.id
                    this.getFormDetail(id)
                }
            }
            this.detailLoading = false
        },
        async getFormDetail (id) {
            this.formLoading = true
            const res = await http.get('/nocode-form/detail', { params: { formId: id } })
            this.fields = JSON.parse(res.data.content || '[]')
            this.formLoading = false
        }
    },
    render (render) {
        h.init(render)

        const self = this

        return h({
            component: 'bk-sideslider',
            props: {
                isShow: self.show,
                width: 600,
                quickClose: false,
                beforeClose: () => {
                    self.$emit('close')
                }
            },
            slots: {
                header: () => {
                    return h({
                        component: 'div',
                        slot: 'header', // vue2 sideslider 组件的头部区域slot名称
                        class: 'task-detail-header-title',
                        children: [
                            h({
                                component: 'span',
                                class: 'title-name',
                                children: [
                                    '流程节点执行详情'
                                ]
                            }),
                            h({
                                component: 'span',
                                class: 'node-name',
                                children: [this.nodeName]
                            })
                        ]
                    })
                },
                default: () => { // vue3 sideslider组件内容区域slot
                    return self.formLoading
                        ? null
                        : h({
                            component: 'div',
                            slot: 'content', // vue2 sideslider 组件的内容区域slot名称
                            class: 'task-detail-content',
                            children: [
                                h({
                                    component: ManualNodeForm,
                                    props: {
                                        id: self.id,
                                        nodeId: self.nodeId,
                                        fields: self.fields
                                    },
                                    on: {
                                        close: () => {
                                            self.fields = []
                                            self.$emit('close')
                                        },
                                        submitted: () => {
                                            self.$emit('close')
                                            self.$emit('refresh')
                                        }
                                    }
                                })
                            ]
                        })
                }
            }
        })
    }
}
