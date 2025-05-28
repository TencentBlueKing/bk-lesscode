import { h } from 'bk-lesscode-render'
import LC from '@/element-materials/core'
import processOverview from '../../flow-manage-container/preview/components/process-overview'
import './index.postcss'

export default {
    name: 'widget-flow-workbench-container-edit',
    inheritAttrs: false,
    props: {
        componentData: {
            type: Object,
            required: true
        }
    },
    data () {
        return {}
    },
    mounted () {
        LC.addEventListener('update', this.updateCallBack)
    },
    beforeDestroy () {
        LC.removeEventListener('update', this.updateCallBack)
    },
    methods: {
        updateCallBack (event) {
            if (event.target.componentId === this.componentData.componentId) {
                this.$forceUpdate()
            }
        }
    },
    render (render) {
        h.init(render)

        return h({
            component: 'div',
            class: ['flow-process-table'],
            children: [
                h({
                    component: 'div',
                    class: 'container-title',
                    children: ['我的流程任务']
                }),
                h({
                    component: processOverview,
                    props: {
                        ref: 'process',
                        isWorkbench: true
                    }
                })
            ]
        })
    }
}
