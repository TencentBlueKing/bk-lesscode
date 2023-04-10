/**
 * 修改节点数据
 * @param {*} node 节点
 * @param {*} data 数据
 * @returns 节点
 */
export default function (node, data) {
    if (data.renderStyles) {
        node.setRenderStyles({
            ...node.renderStyles,
            ...data.renderStyles
        })
    }
    if (data.renderProps) {
        node.setRenderProps({
            ...node.renderProps,
            ...data.renderProps
        })
    }
    if (data.renderDirectives) {
        node.setRenderDirectives([
            ...node.renderDirectives,
            ...data.renderDirectives
        ])
    }
    if (data.renderEvents) {
        node.setRenderEvents({
            ...node.renderEvents,
            ...data.renderEvents
        })
    }
    if (data.renderAlign) {
        node.setRenderAlign({
            ...node.renderAlign,
            ...data.renderAlign
        })
    }
    if (data.renderPerms) {
        node.setRenderPerms([
            ...node.renderPerms,
            ...data.renderPerms
        ])
    }

    return node
}
