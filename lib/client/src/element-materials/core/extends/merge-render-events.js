import { safeObjectMerge } from '../../../../../shared/security/property-injection-guard'

/**
 * @desc 设置节点的 renderEvents（增量添加）
 * @param { Node } node
 * @param { Object } events
 * @returns { Boolean }
 */
export default function (node, events) {
    const isObject = (val) => {
        return Object.prototype.toString.call(val) === '[object Object]'
    }
    if (!isObject(events)) {
        throw new Error(window.i18n.t('设置 mergeRenderEvents 值只支持 Object'))
    }
    
    // 使用安全的对象合并方式，防止属性注入攻击
    node.renderEvents = safeObjectMerge(node.renderEvents || {}, events, { deep: true })
    return true
}
