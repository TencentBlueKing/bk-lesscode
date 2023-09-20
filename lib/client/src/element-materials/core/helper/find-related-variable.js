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
        // 远程函数或者类型是函数的属性
        if (((prop.format === 'value' && prop.valueType === 'remote') || prop.valueType === 'function')) {
            prop?.payload.params?.forEach((param) => {
                if (param.format === 'variable' && param.code) {
                    variableMap[`prop.${propName}`] = {
                        source: 'prop',
                        key: propName,
                        code: `${param.code}`
                    }
                }
            })
        }
        return variableMap
    }, {})
}

export const findRelatedVariableFromRenderDirective = renderDirectives => {
    return renderDirectives.reduce((variableMap, directive) => {
        // 含有.的v-model指令是form表单内的组件
        if (directive.format === 'variable' && directive.code && !(directive.code.indexOf('.') !== -1 && directive.type === 'v-model')) {
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
        // slot 的format 配置为 value 并且 valueType 为 remote 表示选择的是远程函数
        if (slot.format === 'value' && ['select-remote', 'remote'].includes(slot.valueType) && slot.payload) {
            slot.payload.params?.forEach((param) => {
                if (param.format === 'variable' && param.code) {
                    variableMap[`slot.${slotName}`] = {
                        source: 'slot',
                        key: slotName,
                        code: `${param.code}`
                    }
                }
            })
        }
        return variableMap
    }, {})
}

export const findRelatedVariableFromRenderEvent = renderEvents => {
    return Object.keys(renderEvents).reduce((variableMap, eventName) => {
        const renderEvent = renderEvents[eventName]
        if (renderEvent.enable || renderEvent.enable === undefined) {
            if (renderEvent.type === 'action') {
                renderEvent.actions.forEach((action, index) => {
                    if (action.type === 'variable' && action.id) {
                        const suffix = index < 1 ? '' : `_${index}`
                        variableMap[`event.${eventName}${suffix}`] = {
                            source: 'event',
                            key: eventName,
                            code: action.id
                        }
                    }
                })
            } else {
                renderEvent.params?.forEach((param) => {
                    if (param.format === 'variable' && param.code) {
                        variableMap[`event.${eventName}`] = {
                            source: 'event',
                            key: eventName,
                            code: param.code
                        }
                    }
                })
            }
        }
        return variableMap
    }, {})
}
