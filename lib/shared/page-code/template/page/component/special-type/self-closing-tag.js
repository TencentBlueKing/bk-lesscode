/**
 * @desc 生成单闭合标签类型组件源码
 * @param { CodeModel } code
 * @param { Object } item 当前组件配置
 * @param { Object } payload { vueDirective, propDirective, itemProps, itemClass, itemEvents, css, alignStr }
 * @returns { String }
 */
export default function generateSelfClosingTag (code, item, { vueDirective, propDirective, itemProps, itemClass, itemEvents, css, alignStr = '' }) {
    let componentCode = ''
    if (css) {
        componentCode += `
            <div${alignStr}style="${css}" ${vueDirective}>
                <${item.type} ${itemProps} ${itemClass} ${itemEvents} ${propDirective} />
            </div>`
    } else {
        componentCode += `
            <${item.type}${alignStr}${itemClass} ${itemProps} ${itemEvents} ${vueDirective} ${propDirective} />`
    }
    return componentCode
}
