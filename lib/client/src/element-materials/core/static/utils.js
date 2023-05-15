export default {
    genPropFormatValue (data) {
        if (Object.prototype.toString.call(data) !== '[object Object]') {
            throw new Error(window.i18n.t('genPropFormatValue 的参数值必须是 Object'))
        }
        const baseData = {
            format: '',
            code: '',
            valueType: '',
            payload: {},
            renderValue: '',
            buildInVariableType: undefined,
            modifiers: undefined
        }
        Object.keys(data).forEach(key => {
            if (baseData.hasOwnProperty(key)) {
                baseData[key] = data[key]
            }
        })
        return baseData
    },
    genDirectiveFormatValue (data) {
        if (Object.prototype.toString.call(data) !== '[object Object]') {
            throw new Error(window.i18n.t('genDirectiveFormatValue 的参数值必须是 Object'))
        }
        const baseData = {
            format: '',
            type: '',
            code: '',
            prop: '',
            renderValue: ''
        }
        Object.keys(data).forEach(key => {
            if (baseData.hasOwnProperty(key)) {
                baseData[key] = data[key]
            }
        })
        return baseData
    },
    genSlotFormatValue (data) {
        if (Object.prototype.toString.call(data) !== '[object Object]') {
            throw new Error(window.i18n.t('genSlotFormatValue 的参数值必须是 Object'))
        }
        const baseData = {
            format: '',
            code: '',
            component: '',
            valueType: '',
            payload: {},
            renderValue: ''
        }
        Object.keys(data).forEach(key => {
            if (baseData.hasOwnProperty(key)) {
                baseData[key] = data[key]
            }
        })
        return baseData
    }
}
