/**
 * @desc 设置指定方向的align
 * @param { Node } node
 * @param { Object | String } params1
 * @param { String } params2
 * @returns { Boolean }
 */
export default function (node, params1, params2 = '') {
    let alignData = {}
    if (Object.prototype.toString.call(params1) === '[object String]') {
        alignData[params1] = params2
    } else {
        alignData = params1
    }
    
    Object.keys(alignData).forEach(direction => {
        if ([
            'horizontal',
            'vertical'
        ].includes(direction)) {
            node.renderAlign[direction] = alignData[direction]
        }
    })
    return true
}
