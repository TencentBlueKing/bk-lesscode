import { camelCase, camelCaseTransformMerge } from 'change-case'
import { handleRenderStyles, getAlignStr, getFreeLayoutItemStyle } from '../../../common/utils'
import getItemProps from '../prop'
import getItemStyles from '../style'
import getItemEvents from '../event'
import renderSlot from '../slot'
import handleSpecialTypeFlag from './special-type-flag'

import generateChart from './special-type/chart'
import generateFlow from './special-type/bk-flow'
import generateP from './special-type/p'
import generateMd from './special-type/md'
import generateSelfClosingTag from './special-type/self-closing-tag'
import generateWidgetForm from './special-type/widget-form'
import { handleTableWidth } from './special-type/table'

// 单闭合标签
const selfClosingTags = ['img', 'input', 'link', 'hr', 'br']

/**
 * @desc 生成组件的template源码
 * @param { CodeModel } code
 * @param { Object } item 当前组件的配置
 * @param { String } compId 组件id
 * @param { Object } vueDirective 组件上的vueDirective配置
 * @param { Object } propDirective 组件上的propDirective配置
 * @param { Boolean } inFreeLayout 是否在自由布局内部
 * @returns { String }
 */
export default function generateComponment (code, item, vueDirective, propDirective, inFreeLayout = false) {
    let componentCode = ''

    item = Object.assign({}, item, { componentType: item.type, componentId: camelCase(item.componentId, { transform: camelCaseTransformMerge }) })

    // 处理绑定的事件event跟绑定的属性props
    const itemEvents = getItemEvents(code, item.renderEvents, item.componentId)
    let itemProps = getItemProps(code, item.componentType, item.componentId, item.renderProps, item.renderDirectives, item.renderSlots)
    
    // 是否渲染权限组件
    if (code.isRenderAppPermComponents) {
        if (item.renderPerms && item.renderPerms.length) {
            if (code.appPermComponents[item.type]) {
                item.type = code.appPermComponents[item.type]
                itemProps += ` auth="${item.renderPerms.map(perm => perm.actionId).join(',')}"`
            }
        }
    }

    // css变量用于存放自由布局时，组件外层div的css样式
    let css = ''
    let styles = handleRenderStyles(item.renderStyles)
    const alignStr = getAlignStr(item.renderAlign || {}, inFreeLayout)

    if (inFreeLayout) {
        const { css: returnCss, styles: returnStyles } = getFreeLayoutItemStyle(styles, item.type)
        css = returnCss
        styles = returnStyles
    }

    // icon 组件，样式中设置字体大小不生效，是因为 bk-icon 组件通过 size 属性来设置 font-size，默认值为 inherit
    if (item.type === 'bk-icon') {
        item.renderProps['size'] = {
            format: 'value',
            code: item.renderStyles.fontSize,
            valueType: 'string',
            renderValue: item.renderStyles.fontSize
        }
    }

    // widget-tab类型，转换成bk-tab， 并处理内置的active变量
    if (item.type === 'widget-tab') item.type = 'bk-tab'

    // widget-van-tab类型，转换成van-tabs
    if (item.type === 'widget-van-tab') item.type = 'van-tabs'

    // widget-form-item， 生成源码时需要转换成bk-form-item
    if (item.type === 'widget-form-item') item.type = 'bk-form-item'

    if (item.type === 'render-block') {
        item.type = 'div'
        if (!styles['position']) {
            styles.position = 'relative'
        }
    }

    const componentCssPrefix = `.bk-layout-component-${code.uniqueKey}`
    // 处理完styles， 再生成样式到css
    const { itemClass = '' } = getItemStyles(code, item.componentId, styles, item.renderProps, { cssNamePrefix: componentCssPrefix, inFreeLayout })
    // 特殊类型的组件，需要在page-code类的属性做标识，如elementUi、bkCharts、custom等
    handleSpecialTypeFlag(code, item)
    
    // 需要特殊处理的组件类型： chart、form、flow、单闭合标签等
    if (item.name && item.name.startsWith('chart-')) {
        componentCode = generateChart(code, item, { styles, vueDirective, propDirective, css, alignStr })
    } else if (item.type === 'widget-md-editor') {
        componentCode = generateMd(code, item, { itemClass })
    } else if (item.type === 'widget-form') {
        componentCode = generateWidgetForm(code, item, { vueDirective, propDirective, itemProps, itemClass, css, alignStr })
    } else if (item.name === 'bk-flow') {
        componentCode = generateFlow(code, item, { css, alignStr })
    } else if (selfClosingTags.includes(item.type)) {
        componentCode = generateSelfClosingTag(code, item, { vueDirective, propDirective, itemProps, itemClass, css, alignStr })
    } else {
        const slotStr = renderSlot(code, item.type, item.componentId, item.renderSlots)
        // 自由布局中的表格，如果不设置宽度，那么宽度会一直增大，表格组件本身的缺陷
        if (css && !item.renderStyles.width && (item.type === 'bk-table' || item.type === 'el-table')) {
            css += handleTableWidth(item)
        }
        if (item.type === 'p') {
            componentCode = generateP(code, item, { vueDirective, propDirective, itemProps, itemClass, itemEvents, slotStr, css, alignStr })
        // 通用组件处理
        } else {
            // css有值，则表示在自由布局中，需要外层包一层div
            if (css) {
                componentCode += `
                    <div${alignStr}style="${css}" ${vueDirective}>
                        <${item.type} ${itemProps} ${itemClass} ${itemEvents} ${propDirective}>${slotStr}</${item.type}>
                    </div>`
            // 非自由布局
            } else {
                componentCode += `
                    <${item.type}${alignStr}${itemClass} ${itemProps}${itemEvents} ${vueDirective} ${propDirective}
                        >${slotStr}
                    </${item.type}>`
            }
        }
    }
    return componentCode
}
