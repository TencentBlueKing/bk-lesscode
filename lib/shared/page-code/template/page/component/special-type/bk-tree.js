/**
 * @desc 生成tree树组件源码
 * @param { CodeModel } code
 * @param { Object } item 当前组件配置
 * @param { Object } payload { vueDirective, propDirective, itemProps, itemClass, itemEvents, slotStr, css, alignStr }
 * @returns { String }
 */
export default function generateTree (code, item, { vueDirective, propDirective, itemProps, itemClass, itemEvents, slotStr = '', css, alignStr = ' ' }) {
    let componentCode = ''
    // css有值，则表示在自由布局中，需要外层包一层div
    if (css) {
        componentCode += `
            <div${alignStr}style="${css}" ${vueDirective}>
                <${item.type} ${itemProps} ${itemClass} ${itemEvents} ${propDirective}>${slotStr}</${item.type}>
            </div>`
    // 非自由布局
    } else {
        componentCode += `
           <div>
                <${item.type}${alignStr}${itemClass} ${itemProps}${itemEvents} ${vueDirective} ${propDirective}
                    >${slotStr}
                </${item.type}>
           </div>`
    }
    return componentCode
}
