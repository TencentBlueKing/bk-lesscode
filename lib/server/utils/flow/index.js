import httpConf from '../../conf/http'
import flowConf from '../../conf/flow'

// lesscode流程节点类型和BkFlow节点类型映射
export const NODE_TYPE_MAP = {
    Start: 'startpoint',
    End: 'endpoint',
    Manual: 'tasknode',
    DataProcessing: 'tasknode',
    API: 'tasknode',
    Approval: 'tasknode'
}

// lesscode流程节点类型和在BkFlow中使用对应的插件映射
export const NODE_PLUGIN_MAP = {
    Manual: 'pause_node',
    DataProcessing: 'bk_http_request'
}

// 将流程模板数据转换为BkFlow需要的pipeline_tree结构
export const transFlowTplToBkFlowPipelineTree = (projectId, nodes, edges) => {
    const pipelineTree = {
        activities: {},
        canvas_mode: "horizontal",
        constants: {},
        end_event: {},
        flows: {},
        gateways: {},
        line: [],
        location: [],
        outputs: [],
        start_event: {}
    }

    nodes.forEach(node => {
        const { type, id, axis, config } = node
        const nodeType = NODE_TYPE_MAP[type]
        if (nodeType === 'tasknode') {
            // activities
            pipelineTree.activities[id] = {
                id: id,
                name: config.name,
                incoming: getNodeIncomingOrOutgoing(id, edges, 'incoming', true),
                outgoing: getNodeIncomingOrOutgoing(id, edges, 'outgoing'),
                component: getNodeComponentConfig(projectId, node),
                error_ignorable: false,
                loop: null,
                optional: true,
                stage_name: '',
                type: 'ServiceActivity',
                retryable: true,
                skippable: true,
                auto_retry: { enable: false, interval: 0, times: 1 },
                timeout_config: { enable: false, seconds: 10, action: 'forced_fail' },
                labels: []
            }
            // 人工节点需要将callback_data勾选为全选变量，在流程上下文中使用
            if (NODE_PLUGIN_MAP[node.type] === 'pause_node') {
                pipelineTree.constants[`\${callback_data_${node.id}}`] = {
                    name: "API回调数据",
                    key: `\${callback_data_${node.id}}`,
                    desc: "",
                    custom_type: "",
                    source_info: {
                        [node.id]: ['callback_data']
                    },
                    source_tag: '',
                    value: '',
                    show_type: 'hide',
                    source_type: 'component_outputs',
                    validation: '',
                    index: 0,
                    plugin_code: ''
                }
            }
        } else if (nodeType === 'startpoint') {
            // start_event
            pipelineTree.start_event = {
                id,
                incoming: '',
                name: '',
                outgoing: getNodeIncomingOrOutgoing(id, edges, 'outgoing'),
                type: 'EmptyStartEvent',
                labels: []
            }
        } else if (nodeType === 'endpoint') {
            // end_event
            pipelineTree.end_event = {
                id,
                incoming: getNodeIncomingOrOutgoing(id, edges, 'incoming'),
                name: '',
                outgoing: '',
                type: 'EmptyEndEvent',
                labels: []
            }
        }

        // location
        pipelineTree.location.push({ id, type: nodeType, name: config.name, x: axis.x, y: axis.y })
    })

    edges.forEach(edge => {
        const { id, source, target } = edge
        // line
        pipelineTree.line.push({ id, source: { id: source.cell, arrow: extractPortDirectionName(source.port) }, target: { id: target.cell, arrow: extractPortDirectionName(target.port) } })
        // flow
        pipelineTree.flows[id] = { id, source: source.cell, target: target.cell, is_default: false }
    })

    return pipelineTree
}

// 获取任务节点component属性配置
export const getNodeComponentConfig = (projectId, node) => {
    const pluginName = NODE_PLUGIN_MAP[node.type]
    const componentConfig = {
        code: pluginName,
        data: {},
        version: 'legacy',
    }
    if (pluginName === 'pause_node') {
        componentConfig.data = {
            description: { hook: false, need_render: true, value: 'lesscode人工节点' }
        }
    } else if (pluginName === 'bk_http_request') {
        const apiURL = `${httpConf.apiGateWayUrlTmpl.replace('{api_name}', 'bk-lesscode')}/${httpConf.stageName}/dataManage`
        componentConfig.data = {
            bk_http_request_method: { hook: false, need_render: true, value: 'POST' },
            bk_http_request_url: { hook: false, need_render: true, value: apiURL },
            bk_http_request_header: {
                hook: false,
                need_render: true,
                value: [
                    {
                        name: 'x-project-id',
                        value: projectId
                    },
                    {
                        name: 'X-Bkapi-Authorization',
                        value: JSON.stringify({
                            app_code: flowConf.APP_CODE,
                            app_secret: flowConf.APP_SECRET
                        })
                    }
                ]
            },
            bk_http_request_body: { hook: false, need_render: true, value: JSON.stringify(node.config) },
            bk_http_timeout: { hook: false, need_render: true, value: 5 },
            bk_http_success_exp: { hook: false, need_render: true, value: '' }
        }
        componentConfig.version = 'v1.0'
    }

    return componentConfig
}

// 替换数据处理节点引用的流程变量
export const replaceDataProcessingNodeVar = () => {}

// 提取连接桩方向的名称
export const extractPortDirectionName = (port) => {
    const parts = port.split('_');
    const targetPart = parts[parts.length - 1];

    // 将首字母转换为大写，其他部分保持不变
    return targetPart.charAt(0).toUpperCase() + targetPart.slice(1);
}

// 获取节点的入度或出度
export const getNodeIncomingOrOutgoing = (nodeId, edges, direction, isMultiple = false) => {
    const results = []
    edges.forEach(edge => {
        const cellId = direction === 'incoming' ? edge.target.cell : edge.source.cell
        if (cellId === nodeId) {
            results.push(edge.id)
        }
    })

    if (results.length > 0) {
        return isMultiple ? results : results[0]
    }

    return isMultiple ? [] : ''
}