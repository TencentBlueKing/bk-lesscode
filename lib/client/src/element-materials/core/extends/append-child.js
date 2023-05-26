import isNode from '../static/is-node'

/**
 * @desc 指定的 slot 追加子节点
 * @param { Node } node
 * @param { Node } childNode
 * @param { String } slotName
 * @returns { Boolean }
 */
export default function (node, childNode, slotName) {
    if (!isNode(childNode)) {
        throw new Error(window.i18n.t('childNode 不是 Node 类型'))
    }
    // 布局类型的组件才支持
    // - 本身是布局组件（Grid、Column、Freelayout、Form）
    // - 组件指定的 slot 是个布局组件
    if (node.layoutType) {
        node.renderSlots[slotName].push(childNode)
    } else if (node.layoutSlotType[slotName]) {
        node.slot[slotName].appendChild(childNode)
    }
    return true
}
