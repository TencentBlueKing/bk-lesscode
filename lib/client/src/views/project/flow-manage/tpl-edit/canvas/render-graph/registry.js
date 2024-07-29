import { register } from '@/views/project/backend-module/children/backend/x6-render-vue/registry.js'
import CustomNode from './node.vue'

const ports = {
    groups: {
        top: {
            position: 'top',
            attrs: {
                circle: {
                    r: 6,
                    magnet: true,
                    stroke: '#5F95FF',
                    strokeWidth: 1,
                    fill: '#fff',
                    style: {
                        visibility: 'hidden'
                    }
                }
            }
        },
        right: {
            position: 'right',
            attrs: {
                circle: {
                    r: 6,
                    magnet: true,
                    stroke: '#5F95FF',
                    strokeWidth: 1,
                    fill: '#fff',
                    style: {
                        visibility: 'hidden'
                    }
                }
            }
        },
        bottom: {
            position: 'bottom',
            attrs: {
                circle: {
                    r: 6,
                    magnet: true,
                    stroke: '#5F95FF',
                    strokeWidth: 1,
                    fill: '#fff',
                    style: {
                        visibility: 'hidden'
                    }
                }
            }
        },
        left: {
            position: 'left',
            attrs: {
                circle: {
                    r: 6,
                    magnet: true,
                    stroke: '#5F95FF',
                    strokeWidth: 1,
                    fill: '#fff',
                    style: {
                        visibility: 'hidden'
                    }
                }
            }
        }
    },
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
        shape: 'custom-circle',
        width: 56,
        height: 56,
        ports: { ...ports },
        component: CustomNode
    })
    register({
        shape: 'custom-rect',
        width: 236,
        height: 46,
        ports: { ...ports },
        component: {
            render: h => h(CustomNode, {
                on: eventMap
            })
        }
    })
}
