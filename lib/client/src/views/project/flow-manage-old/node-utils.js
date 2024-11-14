// 将itsm webhook节点type类型转换为独立type
export function transWebhookToNodeType (node) {
    if (node.type === 'WEBHOOK') {
        if (node.extras.node_type === 'DATA_PROC') {
            return Object.assign({}, node, { type: 'DATA_PROC' })
        } else if (node.extras.node_type === 'TASK') {
            return Object.assign({}, node, { type: 'TASK' })
        }
    }
    return node
}
// 将节点独立type转换为itsm webhook节点
export function transNodeTypeToWebhook (node) {
    if (['DATA_PROC', 'TASK'].includes(node.type)) {
        return Object.assign({}, node, { type: 'WEBHOOK' })
    }
    return node
}
