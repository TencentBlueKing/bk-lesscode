import { camelCase, camelCaseTransformMerge } from 'change-case'
import { parseTemplate } from './parse-data'

export const updateFormItemVMode = (formNode) => {
    let formModelKey = `${camelCase(formNode.componentId, { transform: camelCaseTransformMerge })}model`
    const modelProps = formNode.renderProps?.model || {}
    if (modelProps?.buildInVariableType === 'CUSTOM' && modelProps.payload?.customVariableCode) {
        formModelKey = modelProps.payload?.customVariableCode
    }
    formNode.children.forEach(formItemNode => {
        formItemNode.children.forEach(inputNode => {
            inputNode.renderDirectives.forEach(directiveItem => {
                if (directiveItem.type === 'v-model') {
                    directiveItem.code = `${formModelKey}.${formItemNode.prop.property}`
                }
            })
        })
    })
}

// 替换元素中用到 v-from item 的地方
const updateUseVForItemVMode = (node, replaceFun) => {
    const renderProps = node.renderProps || {}
    Object
        .keys(renderProps)
        .forEach((renderPropKey) => {
            const renderProp = renderProps[renderPropKey]
            if (renderProp.format === 'expression') {
                renderProp.code = replaceFun(renderProp.code)
            }
        })
    const renderSlots = node.renderSlots || {}
    Object
        .keys(renderSlots)
        .forEach((renderSlotKey) => {
            const renderSlot = renderSlots[renderSlotKey]
            if (renderSlot.format === 'expression') {
                renderSlot.code = replaceFun(renderSlot.code)
            }
        })
}

const hasUsedVFor = (node) => {
    const renderDirectives = node.renderDirectives || []
    const vForDirective = renderDirectives.find(renderDirective => renderDirective.type === 'v-for')
    return vForDirective && vForDirective.code
}

const syncModel = (node, originData, replaceFunction) => {
    let replaceFun = replaceFunction
    // 当前元素如果用到 v-for，需要记录下来，子元素可能会用到
    if (hasUsedVFor(node)) {
        replaceFun = (str) => str.replace(
            `${camelCase(originData.componentId, { transform: camelCaseTransformMerge })}Item`,
            `${camelCase(node.componentId, { transform: camelCaseTransformMerge })}Item`
        )
    }
    // 替换当前元素和子元素用到 v-for item 的地方
    if (replaceFun) {
        updateUseVForItemVMode(node, replaceFun)
    }
    if (node.type === 'widget-form') {
        updateFormItemVMode(node)
    } else {
        let originChilds = Object.values(originData.renderSlots)
        if (['render-block', 'render-grid', 'render-column', 'free-layout'].includes(originData.type)) {
            originChilds = originData.renderSlots.default
        }
        node.children.forEach((childNode, index) => {
            syncModel(childNode, originChilds[index], replaceFun)
        })
    }
    
    return node
}

export default function (data) {
    const templateNode = parseTemplate([data])

    return syncModel(templateNode, data)
}
