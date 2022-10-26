import {
    getVariableReg
} from 'shared/api'

// 设置是否使用了变量
let hasVariable
// 收集变量依赖
let variableDepend = []

// 初始化变量
export const initVariable = (val) => {
    hasVariable = val
    variableDepend = []
}

// 更新变量的值
export const updateVariable = (val, id) => {
    const variableReg = getVariableReg()
    if (variableReg.test(val)) {
        if (!variableDepend.find(x => x === id)) {
            variableDepend.push(id)
        }
    } else {
        const idIndex = variableDepend.findIndex(depend => depend === id)
        if (idIndex > -1) {
            variableDepend.splice(idIndex, 1)
        }
    }
    hasVariable.value = variableDepend.length > 0
}
