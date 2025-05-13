import { h } from 'bk-lesscode-render'
import processOverview from '../../flow-manage-container/preview/components/process-overview'

export default {
    name: 'widget-flow-workbench-container-preview',
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
    render (render) {
        h(render)

        return h({
            component: 'div',
            class: 'widget-flow-workbench-container',
            children: [h({
                component: processOverview,
                props: {
                    ref: 'process',
                    isWorkbench: true
                }
            })]
        })
    }
}
