import { safeObjectMerge, safeForEachProperty } from '../../../../../shared/security/property-injection-guard'

export default function (data, node) {
    if (data.renderStyles) {
        // 安全地合并样式对象，防止属性注入攻击
        node.renderStyles = safeObjectMerge(node.renderStyles || {}, data.renderStyles, { deep: true })
    }
    if (data.renderProps) {
        // prop 通过 merge 的方式加载
        // 兼容组件 prop 扩展的场景
        // 使用安全的方式遍历和设置属性，防止原型链污染
        safeForEachProperty(data.renderProps, (key, value) => {
            node.renderProps[key] = value
        })
    }
    if (data.renderDirectives) {
        node.renderDirectives = data.renderDirectives
    }
    if (data.renderEvents) {
        // 安全地合并事件对象
        node.renderEvents = safeObjectMerge(node.renderEvents || {}, data.renderEvents, { deep: true })
    }
    if (data.renderAlign) {
        // 安全地合并对齐属性
        safeForEachProperty(data.renderAlign, (key, value) => {
            node.renderAlign[key] = value
        })
    }
    if (data.renderPerms) {
        node.renderPerms = data.renderPerms
    }
}
