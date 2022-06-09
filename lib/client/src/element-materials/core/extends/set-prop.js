import _ from 'lodash'
/**
 * @desc 设置节点 renderProps 上指定 prop 的值
 * @param { Node } node
 * @param { Object | String } params1
 * @param { Object } params2
 * @returns { Boolean }
 *
 * - params1 是 Object 时 params2 无效
 * - params1 是 String 时表示属性名，params2 为对应的属性值
 */
export default function (node, params1, params2) {
    let propData = {}
    if (Object.prototype.toString.call(params1) === '[object String]') {
        propData[params1] = params2
    } else {
        propData = params1
    }
    const materialProps = node.material.props

    Object.keys(propData).forEach(propName => {
        if (materialProps.hasOwnProperty(propName)) {
            const propConfigType = materialProps[propName].type

            node.renderProps[propName] = _.cloneDeep(propData[propName])

            // 没传 valueType，
            if (!propData[propName].valueType) {
                // 从组件配置中自动推导出默认 valueType （如果是数组默认取第一个）
                const valueType = Array.isArray(propConfigType)
                    ? propConfigType[0]
                    : propConfigType
                node.renderProps[propName].valueType = valueType
            }
            if (!propData[propName].payload) {
                node.renderProps[propName].payload = {}
            }
        }
    })
    
    return true
}
