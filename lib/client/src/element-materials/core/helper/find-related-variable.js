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
        // table 组件的 pagination 属性
        if (prop.format === 'value' && propName === 'pagination' && ['local', 'remote'].includes(prop?.payload?.type)) {
            const paginationVal = prop.payload.val || {}
            Object
                .keys(paginationVal)
                .forEach((key) => {
                    const val = paginationVal[key]
                    if ((val.format === 'variable' && val.code) || (val.buildInVariableType === 'CUSTOM')) {
                        variableMap[`prop.pagination.${key}`] = {
                            source: 'prop',
                            key: `pagination.${key}`,
                            code: val.code || val.customVariableCode
                        }
                    }
                })
        }
        return variableMap
    }, {})
}

export const findRelatedVariableFromRenderDirective = renderDirectives => {
    return renderDirectives.reduce((variableMap, directive) => {
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
