import _ from 'lodash'

/**
 * @desc 设置节点 renderProps 上指定 prop 的值
 * @param { Node } node
 * @param { Object | String } params1
 * @param { String } params2
 * @returns { Boolean }
 *
 */
export default function (node, params1, params2) {
    if (node.layoutType) {
        throw new Error(window.i18n.t('布局类型的组件不支持 setSlot 调用，可以使用子节点操作相关 api'))
    }
    let slotData = {}
    if (Object.prototype.toString.call(params1) === '[object String]') {
        slotData[params1] = params2
    } else {
        slotData = params1
    }
    // 检测 slot 值时候合法
    Object.keys(slotData).forEach(slotName => {
        if (node.layoutSlotType[slotName]) {
            throw new Error(window.i18n.t('{0} 的 slot {1} 为布局类型的组件 setSlot 调用，可以使用子节点操作相关 api', [node.type, slotName]))
        }
    })
    Object.keys(slotData).forEach(slotName => {
        node.renderSlots[slotName] = _.cloneDeep(slotData[slotName])
    })
    return true
}
