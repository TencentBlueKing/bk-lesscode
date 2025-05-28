import { defineComponent, h } from 'vue'
import processOverview from '../flow-manage-container/components/process-overview'
import './index.postcss'

export default defineComponent({
    name: 'widget-flow-workbench-container-preview',
    inheritAttrs: false,
    setup () {
        return () => h('div',
            { class: 'widget-flow-workbench-container'},
            [
                h('div', { class: 'container-title' }, ['我的流程任务']),
                h(processOverview, { isWorkbench: true })
            ]
        )
    }
})
