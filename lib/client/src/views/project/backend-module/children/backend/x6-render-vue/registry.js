import { Graph } from '@antv/x6'
import './view'
import './node'

export const shapeMaps = {}

export function register (config) {
    const { shape, component, inherit, ...others } = config
    if (!shape) {
        throw new Error('should specify shape in config')
    }
    shapeMaps[shape] = {
        component
    }

    Graph.registerNode(
        shape,
        {
            inherit: inherit || 'vue-shape',
            ...others
        },
        true
    )
}
