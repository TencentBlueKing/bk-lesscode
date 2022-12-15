
/**
 * @desc 基于当前选中node的位置和类型， 粘贴copyNode
 * @param { Node } parentNode
 * @param { Node } copyNode
 * @returns { Boolean }
 */

export default function (node, copyNode) {
    if (!node.type || !copyNode.type || inExcludeParentType(node)) return
    // render-column 只能被复制到 render-grid里
    if (copyNode.type === 'render-column' && node.parentNode?.type !== 'render-grid') return
    copyNode = copyNode.cloneNode(true)
    if (isContainer(node) === isContainer(copyNode)) {
        node.parentNode.insertAfter(copyNode, node)
    } else if (isContainer(node) && !isContainer(copyNode)) {
        if (node.type === 'free-layout') {
            node.appendChild(copyNode)
        } else if (node.type === 'render-grid') {
            const columnNode = node.renderSlots.default[0]
            columnNode.appendChild(copyNode)
        }
    } else {
        if (node.parentNode && node.parentNode.type === 'render-column') {
            node.parentNode.insertAfter(copyNode, node)
        }
    }
}

function isContainer (node) {
    return ['render-grid', 'free-layout', 'h5-container', 'h5-page'].indexOf(node.type) > -1
}

// 当parentNode的type类型为以下时，不允许粘贴
function inExcludeParentType (node) {
    const parentType = node.parentNode?.type
    return ['widget-form-item', 'widget-form'].indexOf(parentType) > -1
}
