import { register } from '@/views/project/backend-module/children/backend/x6-render-vue/registry.js'
import CustomNode from './node.vue';

const ports = {
    items: [
        {
            id: 'port_top',
            group: 'top'
        },
        {
            id: 'port_right',
            group: 'right'
        },
        {
            id: 'port_bottom',
            group: 'bottom'
        },
        {
            id: 'port_left',
            group: 'left'
        }
    ]
  }

export const registryNode = (eventMap = {}) => {
    register({
        shape: 'custom-node',
        ports: { ...ports },
        component: {
            render: h => h(CustomNode, {
            on: () => {
                return eventMap
            },
            })
        }
    })
}

export const registryEvents = (graph, editable = true) => {
    console.log(graph, editable)
}
