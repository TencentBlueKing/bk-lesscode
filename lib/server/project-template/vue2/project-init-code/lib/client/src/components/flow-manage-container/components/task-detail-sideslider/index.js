import http from '@/api/pureAxios'
import ManualNodeForm from './manual-node-form'
import './index.postcss'
import { formMap } from 'shared/form'

export default {
    name: 'TaskHandingComp',
    props: {
        show: Boolean,
        id: Number // 任务id
    },
    data () {
        return {
            detailLoading: true,
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
                    this.fields = formMap[id].content
                }
            }
            this.detailLoading = false
        }
    },
    render (h) {
        const self = this

        return h('bk-sideslider', {
            props: {
                isShow: self.show,
                width: 600,
                quickClose: false,
                beforeClose: () => {
                    self.$emit('close')
                }
            }
        }, [
            h('div', {
                class: 'task-detail-header-title',
                slot: 'header'
            }, [
                h('span', {
                    class: 'title-name'
                }, ['流程节点执行详情']),
                h('span', {
                    class: 'node-name'
                }, [this.nodeName])
            ]),
            h('div', {
                slot: 'content',
                class: 'task-detail-content'
            }, [
                self.detailLoading
                    ? null
                    : h(ManualNodeForm, {
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
            ])
        ])
    }
}
