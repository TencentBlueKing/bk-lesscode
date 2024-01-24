const graphlib = require('graphlib')

export const sortNodes = function (nodes, edges) {
    const graph = new graphlib.Graph({ directed: true })
    nodes.map(node => {
        graph.setNode(node.id)
    })
    edges.map(edge => {
        graph.setEdge(edge.from_node, edge.to_node)
    })
    const sorted = graphlib.alg.topsort(graph)
    const afterNodes = []
    sorted.forEach(id => {
        const node = nodes.find(node => node.node_id === id)
        if (node?.node_id) {
            afterNodes.push(node)
        }
    })
    return afterNodes
}

export const getLineColor = function (status) {
    const colorMap = {
        success: '#1CAB88',
        fail: '#EA3636'
    }
    return colorMap[status] || '#979BA5'
}

export const getStatusMap = function (status) {
    let res = ''
    if (['failed', 'unknown'].includes(status)) {
        res = 'fail'
    } else if (['finished'].includes(status)) {
        res = 'success'
    } else if (['running'].includes(status)) {
        res = 'running'
    } else if (['applied', 'delayed', 'inited'].includes(status)) {
        res = 'pending'
    }
    return res
}

export const getGraphDefaultConfig = function () {
    return {
        container: document.querySelector('.nodes-container'),
        color: '#F5F7FA',
        autoResize: true,
        interacting: false,
        panning: {
            enabled: true,
            eventTypes: ['leftMouseDown', 'mouseWheel']
        },
        mousewheel: {
            enabled: true,
            modifiers: 'ctrl',
            factor: 1.1,
            maxScale: 3,
            minScale: 0.5
        },
        highlighting: {
            magnetAdsorbed: {
                name: 'stroke',
                args: {
                    attrs: {
                        fill: '#fff',
                        stroke: '#31d0c6',
                        strokeWidth: 4
                    }
                }
            }
        },
        connecting: {
            snap: true,
            allowBlank: false,
            allowLoop: false,
            highlight: true,
            connectionPoint: 'anchor',
            anchor: 'center',
            validateMagnet () {
                return false
            },
            validateEdge () {
                return false
            }
        }
    }
}

export const finalNodeTypes = ['MigrateProcessor', 'LaunchProcessor', 'PreviewProcessor']
