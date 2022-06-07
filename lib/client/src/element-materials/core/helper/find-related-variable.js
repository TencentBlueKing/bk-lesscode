import { BUILDIN_VARIABLE_TYPE_LIST } from 'shared/variable/constant'

export const findRelatedVariableFromRenderProps = renderProps => {
    return Object.keys(renderProps).reduce((variableMap, propName) => {
        const prop = renderProps[propName]
        if (prop.format === 'variable' && prop.code) {
            variableMap[`prop.${propName}`] = {
                source: 'prop',
                key: propName,
                code: prop.code
            }
        }
        if (prop.buildInVariableType === BUILDIN_VARIABLE_TYPE_LIST[1].VAL && prop.payload && prop.payload.customVariableCode) {
            variableMap[`prop.${propName}`] = {
                source: 'prop',
                key: propName,
                code: prop.payload.customVariableCode,
                type: 'buildIn' // 表示变量使用方式：自定义变量 or 右上角切换为变量
            }
        }
        return variableMap
    }, {})
}

export const findRelatedVariableFromRenderDirective = renderDirectives => {
    renderDirectives.reduce((variableMap, directive) => {
        if (directive.format === 'variable' && directive.code) {
            variableMap[`${directive.type}${directive.prop ? '.' + directive.prop : ''}`] = {
                source: directive.type,
                key: directive.prop,
                code: directive.code
            }
        }
        
        return variableMap
    }, {})
}

export const findRelatedVariableFromRenderSlot = renderSlots => {
    return Object.keys(renderSlots).reduce((variableMap, slotName) => {
        const slot = renderSlots[slotName]
        if (slot.format === 'variable' && slot.code) {
            variableMap[`slot.${slotName}`] = {
                source: 'slot',
                key: slotName,
                code: slot.code
            }
        }
        if (slot.buildInVariableType === BUILDIN_VARIABLE_TYPE_LIST[1].VAL && slot.payload && slot.payload.customVariableCode) {
            variableMap[`slot.${slotName}`] = {
                source: 'slot',
                key: slotName,
                code: slot.payload.customVariableCode,
                type: 'buildIn' // 表示变量使用方式：自定义变量 or 右上角切换为变量
            }
        }
        return variableMap
    }, {})
}
