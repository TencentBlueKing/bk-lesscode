export const findRelatedMethodFromRenderProps = (renderProps) => {
    const methodMap = {}
    // prop 设置为 remote 类型时会使用 method
    Object.keys(renderProps).forEach(propName => {
        const prop = renderProps[propName]

        // prop 的format 配置为 value 并且 valueType 为 remote 表示选择的是远程函数
        if ((prop.format === 'value' && prop.valueType === 'remote') || prop.valueType === 'function') {
            if (prop.payload && prop.payload.methodCode) {
                methodMap[`prop.${propName}`] = {
                    source: 'prop',
                    key: propName,
                    code: `${prop.payload.methodCode}`
                }
            }
        }
    })
    // form 组件需要额外检测 rules 的自定义验证规则
    if (renderProps.hasOwnProperty('rules')) {
        const formRuleMap = renderProps.rules.code || {}
        Object.keys(formRuleMap).forEach(propertyName => {
            const propertyRuleList = formRuleMap[propertyName] || []
            
            propertyRuleList.forEach((rule, index) => {
                if (rule.type && rule.validator) {
                    const suffix = index < 1 ? '' : `_${index}`
                    methodMap[`prop.rules.${propertyName}${suffix}`] = {
                        source: 'prop',
                        key: `rules.${propertyName}`,
                        code: `${rule.validator}`
                    }
                }
            })
        })
    }
    return methodMap
}

export const findRelatedMethodFromRenderSlot = (renderSlots) => {
    const methodMap = {}
    Object.keys(renderSlots).forEach(slotName => {
        const slot = renderSlots[slotName]
        const formatSlot = Array.isArray(slot) ? slot : [slot]
        formatSlot.forEach((slot) => {
            // slot 的format 配置为 value 并且 valueType 为 remote 表示选择的是远程函数
            if (slot.format === 'value' && slot.valueType === 'remote') {
                if (slot.payload
                && slot.payload.methodData
                && slot.payload.methodData.methodCode) {
                    methodMap[`slot.${slotName}`] = {
                        source: 'slot',
                        key: slotName,
                        code: `${slot.payload.methodData.methodCode}`
                    }
                }
            }
            // 表格的自定义列中也有绑定函数
            if (slot.component === 'bk-table-column' && slot.format === 'value' && slot.code.length) {
                const customColList = slot.code.filter(item => item.type === 'customCol' && item.methodCode?.length)
                const methodCodes = customColList.reduce((result, current) => {
                    result = result.concat(current.methodCode)
                    return result
                }, [])
                methodCodes.forEach((methodCode, index) => {
                    const suffix = index < 1 ? '' : `_${index}`
                    methodMap[`slot.tableCols.${methodCode}${suffix}`] = {
                        source: 'slot',
                        key: `tableCols.${methodCode}`,
                        code: methodCode
                    }
                })
            }
        })
    })
    return methodMap
}

export const findRelatedMethodFromRenderEvent = renderEvents => {
    const methodMap = {}
    Object.keys(renderEvents).forEach(eventName => {
        const renderEvent = renderEvents[eventName]
        if (renderEvent.enable || renderEvent.enable === undefined) {
            if (renderEvent.type === 'action') {
                renderEvent.actions.forEach((action, index) => {
                    if (action.type === 'method' && action.id) {
                        const suffix = index < 1 ? '' : `_${index}`
                        methodMap[`event.${eventName}${suffix}`] = {
                            source: 'event',
                            key: eventName,
                            code: `${action.id}`
                        }
                    }
                })
            } else if (renderEvent.methodCode) {
                methodMap[`event.${eventName}`] = {
                    source: 'event',
                    key: eventName,
                    code: `${renderEvent.methodCode}`
                }
            }
        }
    })
    return methodMap
}
