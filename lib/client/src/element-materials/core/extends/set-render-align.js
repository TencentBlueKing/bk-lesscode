/**
 * @desc 设置组件布局。水平居左、居中、居右；垂直吸顶、居中、吸底
 * @param { Node } node
 * @param { String } align
 * @returns { Boolean }
 */
export default function (node, align) {
    node.renderAlign = Object.freeze(Object.assign({}, align))
    return true
}
