import { camelCase, camelCaseTransformMerge } from 'change-case'
import slotRenderConfig from '../../../../client/src/element-materials/modifier/component/slots/render-config'
import { transformToString } from '../../common/utils'

import generataLayout from './layout'

/**
 * @desc 从renderSlot中解析生成组件或布局的slot
 * @param { CodeModel } code
 * @param { String } propsVar 变量名称
 * @param { Object } val 变量值
 */
export default function renderSlot (code, type, compId, slots) {
    if (!slots) {
        return ''
    }

    let slotStr = ''
    compId = `${compId}`.replace('-', '')
    compId = `${camelCase(compId, { transform: camelCaseTransformMerge })}Slot`
    const slotKeys = Object.keys(slots)
    slotKeys.forEach((key) => {
        const slot = slots[key]
        const isDefaultSlot = key === 'default'
        compId = compId + key
        slotStr += type === 'p' ? '' : '\n'
        if (!isDefaultSlot) slotStr += `<template slot="${key}">\n`
        if (Array.isArray(slot)) {
            slotStr += generataLayout(code, slot)
        } else if (typeof slot === 'object' && slot.componentId) {
            const codeArr = []
            codeArr.push(slot)
            slotStr += generataLayout(code, codeArr)
        } else {
            // 兼容code为空的情形
            if (!slot.code) {
                slot.val = slot.renderValue
                slot.format = 'value'
            } else {
                slot.val = slot.code
            }
            slot.name = slot.component
            const render = slotRenderConfig[slot.name] || (() => {})
            const slotRenderParams = []
            let curSlot = slot
            do {
                const defaultValMap = {
                    '[object Array]': [],
                    '[object Object]': {},
                    '[object Number]': 0,
                    '[object Boolean]': false,
                    '[object String]': ''
                }
                const { methodData = {}, sourceData = {}, customVariableCode = '' } = slot.payload || {}
                const type = Object.prototype.toString.call(slot.val)
                let disPlayVal = defaultValMap[type] || ''
                const param = { val: disPlayVal, type: 'variable', payload: slot.payload, valueType: slot.valueType, valueKeys: slot.valueKeys }

                let slotVar = compId
                // 自定义变量代替默认变量名称
                let useCustomVariable = false
                if (slot.format === 'value' && slot.buildInVariableType === 'CUSTOM' && customVariableCode) {
                    useCustomVariable = true
                    slot.val = customVariableCode
                    slotVar = customVariableCode
                    code.handleUsedVariable('variable', slot.val, `组件【${compId}】的【${key}】属性`)
                }

                if (slot.format !== 'value') {
                    disPlayVal = code.handleUsedVariable(slot.format, slot.val, `组件【${compId}】的【${key}】属性`)
                } else if (['remote', 'select-remote'].includes(slot.valueType) && methodData.methodCode) {
                    !useCustomVariable && code.dataTemplate(slotVar, transformToString(disPlayVal))
                    code.remoteMethodsTemplate(slotVar, methodData || {})
                    disPlayVal = slotVar
                } else if (slot.valueType && ['data-source', 'table-data-source', 'select-data-source'].includes(slot.valueType) && sourceData.tableName) {
                    !useCustomVariable && code.dataTemplate(slotVar, transformToString(disPlayVal))
                    code.dataSourceTemplate(slotVar, sourceData || {})
                    disPlayVal = slotVar
                } else {
                    if (typeof slot.val === 'object') {
                        !useCustomVariable && code.dataTemplate(slotVar, transformToString(slot.val))
                        disPlayVal = slotVar
                    } else {
                        disPlayVal = slot.val
                        param.type = 'value'
                    }
                }
                // table slot 可能会用到fun，需要特殊处理一下。其他情况也可以在slot value 里面加上 methodCode 字段来处理
                if (Array.isArray(slot.val)) {
                    (slot.val || []).forEach((item) => {
                        const methodCodeList = Array.isArray(item.methodCode) ? item.methodCode : [item.methodCode]
                        methodCodeList.forEach((methodCode) => {
                            if (methodCode) {
                                code.addUsedFunc(methodCode)
                            }
                        })
                    })
                }
                param.val = disPlayVal
                slotRenderParams.push(param)
                curSlot = curSlot.renderSlots
            } while (curSlot && Object.keys(curSlot).length > 0)
            slotStr += render(...slotRenderParams)
        }
        if (!isDefaultSlot) slotStr += '\n</template>\n'
    })
    return slotStr
}
