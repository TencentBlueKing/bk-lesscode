import processOverview from '../../flow-manage-container/preview/components/process-overview'
import './index.postcss'

export default {
    name: 'widget-flow-workbench-container-preview',
    inheritAttrs: false,
    render (h) {
        return h('div',
            { class: 'widget-flow-workbench-container',},
            [
                h('div', { class: 'container-title' }, ['我的流程任务']),
                h(processOverview, { isWorkbench: true })
            ]
        )
    }
}
