import { h } from 'bk-lesscode-render'
import './index.postcss'
import processOverview from '../../flow-manage-container/preview/components/process-overview'

export default {
    name: 'widget-flow-workbench-container-preview',
    props: {
        componentData: {
            type: Object,
            required: true
        }
    },
    data () {
        return {}
    },
    render (render) {
        h(render)

        return h({
            component: 'div',
            class: ['widget-flow-workbench-container'],
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
