export default function (data, node) {
    if (data.renderStyles) {
        node.renderStyles = data.renderStyles
    }
    if (data.renderProps) {
        // prop 通过 merge 的方式加载
        // 兼容组件 prop 扩展的场景
        Object.keys(data.renderProps).forEach(key => {
            node.renderProps[key] = data.renderProps[key]
        })
    }
    if (data.renderDirectives) {
        node.renderDirectives = data.renderDirectives
    }
    if (data.renderEvents) {
        node.renderEvents = data.renderEvents
    }
    if (data.renderAlign) {
        Object.keys(data.renderAlign).forEach(key => {
            node.renderAlign[key] = data.renderAlign[key]
        })
    }
    if (data.renderPerms) {
        node.renderPerms = data.renderPerms
    }
}
