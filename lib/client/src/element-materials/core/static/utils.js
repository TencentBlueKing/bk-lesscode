export default {
    genPropFormatValue (data) {
        if (Object.prototype.toString.call(data) !== '[object Object]') {
            throw new Error('genPropFormatValue 的参数值必须是 Object')
        }
        const baseData = {
            format: '',
            code: '',
            valueType: '',
            payload: {},
            renderValue: '',
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
            throw new Error('genDirectiveFormatValue 的参数值必须是 Object')
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
            throw new Error('genSlotFormatValue 的参数值必须是 Object')
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
