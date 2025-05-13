import processOverview from '../../flow-manage-container/preview/components/process-overview'

export default {
    name: 'widget-flow-workbench-container-preview',
    inheritAttrs: false,
    render (h) {
        return h('div', {
            class: 'widget-flow-workbench-container',
          },
          [h(processOverview, { isWorkbench: true })]
        )
    }
}
