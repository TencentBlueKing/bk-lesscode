import { Shape } from '@antv/x6'
import { sharedI18n } from 'shared/util'
import { uuid } from '@/common/util'

// 新建流程模板的初始化数据
export const GET_INITIALIZE_FLOW_TPL_STRUCTURE = () => {
    const initialNodes = [
        { type: 'Start', axis: { x: 80, y: 145 }, isDraft: false },
        { type: 'Manual', axis: { x: 235, y: 150 }, isDraft: false },
        { type: 'DataProcessing', axis: { x: 570, y: 150 } },
        { type: 'End', axis: { x: 925, y: 145 } }
    ]
    const nodes = initialNodes.map(item => {
        return GET_NODE_DEFAULT_CONFIG(item.type, { axis: item.axis })
    })
    const edges = []
    nodes.reduce((acc, crt, index) => {
        if (index > 0) {
            edges.push({
                id: `edge${uuid(12)}`,
                source: {
                    cell: acc.id,
                    port: 'port_right'
                },
                target: {
                    cell: crt.id,
                    port: 'port_left'
                }
            })
        }
        return crt
    })

    return { nodes, edges }
}

export const NODE_ICON_MAP = {
    'Manual': 'bk-drag-rengongjiedian',
    'DataProcessing': 'bk-drag-shujuchulijiedian',
    'API': 'bk-drag-apijiedian',
    'Approval': 'bk-drag-shenpijiedian'
}

export const NODES = [
    { type: 'Start', name: sharedI18n().t('开始'), icon: '' },
    { type: 'End', name: sharedI18n().t('结束'), icon: '' },
    { type: 'Manual', name: sharedI18n().t('人工节点'), icon: 'bk-drag-rengongjiedian' },
    { type: 'DataProcessing', name: sharedI18n().t('数据处理节点'), icon: 'bk-drag-shujuchulijiedian' },
    { type: 'API', name: sharedI18n().t('api节点'), icon: 'bk-drag-apijiedian' },
    { type: 'Approval', name: sharedI18n().t('审批节点'), icon: 'bk-drag-shenpijiedian' }
]

export const GET_NODE_ICON = (type) => {
    const node = NODES.find(item => item.type === type)
    return node ? node.icon : ''
}

export const IS_CIRCLE_NODE = (type) => {
    return ['Start', 'End'].includes(type)
}

export const GET_GRAPH_CONFIG = (el) => ({
    container: el,
    grid: {
        size: 10,
        visible: true,
        type: 'mesh',
        args: {
            color: '#f0f1f5',
            thickness: 1
        }
    },
    panning: true, // 画布平移
    mousewheel: { // 画布缩放
        enabled: true,
        modifiers: ['ctrl']
    },
    scaling: { // 最大和最小缩放比例
        min: 0.25,
        max: 1.5
    },
    interacting: {
        nodeMovable: true,
        edgeLabelMovable: true,
        arrowheadMovable: true
    },
    highlighting: {
        // 连接桩可以被连接时在连接桩外围围渲染一个包围框
        magnetAvailable: {
            name: 'stroke',
            args: {
                attrs: {
                    fill: '#fff',
                    stroke: '#31d0c6',
                    'stroke-width': 1
                }
            }
        },
        // 连接桩吸附连线时在连接桩外围围渲染一个包围框
        magnetAdsorbed: {
            name: 'stroke',
            args: {
                attrs: {
                    fill: '#fff',
                    stroke: '#3a84ff',
                    'stroke-width': 2
                }
            }
        }
    },
    connecting: {
        allowBlank: false,
        allowNode: false, // 是否允许边连接到节点
        allowEdge: false, // 是否允许边连接到另一个边
        allowMulti: false, // 是否允许在相同的起始节点和终止之间创建多条边
        highlight: true,
        snap: { // 开启连线过程中的自动吸附
            radius: 15 // 吸附半径
        },
        connectionPoint: 'anchor',
        router: 'manhattan',
        connector: {
            name: 'rounded',
            args: {
                radius: 6
            }
        },
        createEdge () {
            return new Shape.Edge(GET_EDGE_DEFAULT_CONFIG())
        }
    }
})

export const GET_NODE_DEFAULT_CONFIG = (type, customConfig) => {
    const commonConfig = {
        type,
        id: `node${uuid(12)}`,
        axis: { x: 0, y: 0 },
        isDraft: true,
        isAutoAdd: true
    }

    switch (type) {
        case 'Start':
            return {
                config: {
                    name: sharedI18n().t('开始')
                },
                ...commonConfig,
                ...customConfig
            }
        case 'End':
            return {
                config: {
                    name: sharedI18n().t('结束')
                },
                ...commonConfig,
                ...customConfig
            }
        case 'Manual':
            return {
                config: {
                    name: sharedI18n().t('人工节点'),
                    formType: '',
                    formId: null
                },
                ...commonConfig,
                ...customConfig
            }
        case 'DataProcessing':
            return {
                config: {
                    name: sharedI18n().t('数据处理节点'),
                    action: '',
                    tableName: '',
                    conditions: {
                        connector: '',
                        expression: []
                    },
                    mapping: []
                },
                ...commonConfig,
                ...customConfig
            }
        case 'API':
            return {
                config: {
                    name: sharedI18n().t('API节点')
                },
                ...commonConfig,
                ...customConfig
            }
        case 'Approval':
            return {
                config: {
                    name: sharedI18n().t('审批节点')
                },
                ...commonConfig,
                ...customConfig
            }
    }
}

export const GET_EDGE_DEFAULT_CONFIG = () => {
    const id = `edge${uuid(12)}`
    return {
        id,
        shape: 'edge',
        attrs: {
            line: {
                stroke: '#a9adb6',
                strokeWidth: 2,
                targetMarker: {
                    name: 'block',
                    width: 6,
                    height: 8
                }
            }
        },
        data: {},
        zIndex: 0,
        router: {
            name: 'manhattan',
            args: {
                padding: 1
            }
        }
    }
}
