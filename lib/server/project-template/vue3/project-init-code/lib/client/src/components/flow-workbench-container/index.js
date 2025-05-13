import { defineComponent, h } from 'vue'
import processOverview from '../flow-manage-container/components/process-overview'

export default defineComponent({
    name: 'widget-flow-workbench-container-preview',
    inheritAttrs: false,
    setup () {
        return () => h('div', {
              class: 'widget-flow-workbench-container',
            },
            [h(processOverview, { isWorkbench: true })]
        )
    }
})
