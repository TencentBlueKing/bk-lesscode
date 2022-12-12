import generateLayout from '../../layout'

/**
 * @desc 生成表单容器组件源码
 * @param { CodeModel } code
 * @param { Object } item 当前组件配置
 * @param { Object } payload { vueDirective, propDirective, itemProps, itemClass, css, alignStr }
 * @returns { String }
 */
export default function generateWidgetForm (code, item, { vueDirective, propDirective, itemProps, itemClass, css, alignStr }) {
    return `
        <div${alignStr}${itemClass} style="${css}">
            <bk-form ${vueDirective} ${propDirective} ${itemProps}>
                ${generateLayout(code, item.renderSlots.default)}
            </bk-form>
        </div>
        `
}
