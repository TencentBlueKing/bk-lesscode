/**
 * @desc 验证节点配置是否正确
 * @param { Node } node
 * @returns { Array | null }
 */

const typeMap = {
    array: '[object Array]',
    string: '[object String]',
    boolean: '[object Boolean]',
    number: '[object Number]',
    float: '[object Number]'
}

export default function (node) {
    const stack = []
    const {
        renderProps,
        renderSlots
    } = node

    // 验证 prop
    Object.keys(renderProps).forEach(propName => {
        const {
            type,
            val,
            payload = {}
        } = renderProps[propName]
        if (typeMap[type]) {
            if (Object.prototype.toString.call(val) !== typeMap[type]) {
                stack.push(window.i18n.t('属性【{0}】的类型为 {1} 值为 {2}', [propName, type, val]))
            }
        } else if (type === 'remote' && propName !== 'remoteOptions') {
            if (!payload.methodCode) {
                stack.push(window.i18n.t('属性【{0}】的类型为 remote 但未选择远程函数', [propName]))
            }
        }
    })

    // 验证 slot
    Object.keys(renderSlots).forEach(slotName => {
        const {
            type,
            payload = {}
        } = renderSlots[slotName]
        if (type === 'remote') {
            if (!(payload.methodData && payload.methodData.methodCode)) {
                stack.push(window.i18n.t('插槽【{0}】的类型为 remote 但为选择远程函数', [slotName]))
            }
        }
    })
    return stack.length > 0 ? stack : null
}
