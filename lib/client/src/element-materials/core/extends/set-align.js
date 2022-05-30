/**
 * @desc 设置指定方向的align
 * @param { Node } node
 * @param { String } direction
 * @param { String } align
 * @returns { Boolean }
 */
export default function (node, direction, align) {
    if (![
        'horizontal',
        'vertical'
    ].includes(direction)) {
        throw new Error(`不支持的renderAlign配置 *${direction}*`)
    }
    node.renderAlign[direction] = align
}
