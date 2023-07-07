import { getAlignStr } from '../../../common/utils'
import getDirectives from '../directive'
import getItemStyles from '../style'
import generateComponent from '../component'

import { generateH5Container } from './mobile-layout'

/**
 * @desc 递归遍历targetData、生成布局、组件源码
 * @param { CodeModel } code
 * @param { Array } items 当前遍历的层级内容
 * @param { Boolean } inFreeLayout 是否位于自由布局中
 * @returns { String }
 */
export default function generateLayout (code, items = [], inFreeLayout = false) {
    // return 'page-content'

    // 有时json里面会有null的脏数据，直接过滤剔除
    items = items.filter(item => item?.componentId)

    const len = items.length
    let templateCode = ''
    for (let i = 0; i < len; i++) {
        const item = items[i]
        // 获取布局上设置的指令
        const { vueDirectives, propDirectives, templateDirectives } = getDirectives(code, item.renderDirectives, item.componentId)
        const vueDirective = vueDirectives.join(' ')
        const templateDirective = templateDirectives.join(' ')
        const propDirective = propDirectives.join(' ')
        if (templateDirective) templateCode += `\n<template ${templateDirective}>`
        // 或者对布局设置的居中、居左、居右样式
        const alignStr = getAlignStr(item.renderAlign || {}, inFreeLayout)

        // 多列布局
        if (item.type === 'render-grid') {
            /* eslint-disable no-unused-vars, indent */
            getItemStyles(code, item.componentId, item.renderStyles, item.renderProps, { inFreeLayout })
            templateCode += `
                <div${alignStr}class="bk-layout-row-${code.uniqueKey} ${item.componentId}" ${vueDirective} ${propDirective}>
                    ${item.renderSlots && item.renderSlots.default && item.renderSlots.default.map(col => {
                        getItemStyles(code, col.componentId, col.renderStyles, col.renderProps, {})
                        const colAlignStr = getAlignStr(col.renderAlign || {}, inFreeLayout)
                        const {
                            vueDirectives: rowVueDirs,
                            propDirectives: rowPropDirs,
                            templateDirectives: rowTempDirs
                        } = getDirectives(code, col.renderDirectives, col.componentId)
                        let rowCode = ''
                        if (rowTempDirs.join(' ')) rowCode += `\n<template ${rowTempDirs.join(' ')}>`
                        rowCode += `<div class="bk-layout-col-${code.uniqueKey} ${col.componentId}"${colAlignStr} ${rowVueDirs.join(' ')} ${rowPropDirs.join(' ')}>
                            ${col.renderSlots.default.length ? `${generateLayout(code, col.renderSlots.default)}` : ''}
                        </div>`
                        if (rowTempDirs.join(' ')) rowCode += '\n</template>'
                        return rowCode
                    }).join('\n')}
                        </div>
                    `
        // 自由布局
        } else if (['free-layout', 'h5-page'].includes(item.type)) {
            getItemStyles(code, item.componentId, item.renderStyles, item.renderProps, { componentType: item.type })
            templateCode += `
                <div class="bk-free-layout-${code.uniqueKey} ${item.componentId}" ${vueDirective} ${propDirective}>
                    <div class="bk-free-layout-item-inner-${code.uniqueKey}">
                        ${generateLayout(code, item.renderSlots.default || [], true)}
                    </div>
                </div>
            `
            /* eslint-enable no-unused-vars, indent */
        } else if (item.type === 'h5-container') { // h5容器
            templateCode += generateH5Container(code, item)
        // 其余都是普通组件（行内布局block实现方式与普通组件一致）
        } else {
            templateCode += generateComponent(code, item, vueDirective, propDirective, inFreeLayout)
        }
        if (templateDirective) templateCode += '\n</template>'
    }
    return templateCode
}
