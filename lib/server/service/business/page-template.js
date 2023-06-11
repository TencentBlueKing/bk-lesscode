import { getRepository, In } from 'typeorm'
import {
    getAllGroupAndFunction
} from './function'
import VariableModel from '../../model/variable'
import FuncVariable from '../../model/entities/func-variable'

export const getProjectFuncAndVar = async (ctx) => {
    const { projectId, versionId, pageCode } = ctx.query
    const variableList = await VariableModel.getAll({ projectId, versionId, effectiveRange: 0, pageCode })
    const funcGroups = await getAllGroupAndFunction(projectId, versionId)
    const data = {
        variableList,
        funcGroups
    }
    ctx.send({
        code: 0,
        message: 'success',
        data
    })
}

export const getRealVarAndFunc = async ({ projectId, fromProjectId, versionId, valList, funcList }) => {
    let varIds = []
    const funcIds = []
    const funcCodes = []
    const projectValList = await VariableModel.getAll({ projectId, effectiveRange: 0, versionId })
    // 应用到默认版本
    const projectFuncGroupList = await getAllGroupAndFunction(projectId, versionId)
    const projectFuncList = []
    projectFuncGroupList.map(item => {
        projectFuncList.splice(0, 0, ...item.children)
    })
    const defaultFuncGroupId = projectFuncGroupList[0] && projectFuncGroupList[0].id
    funcList.map(func => {
        if (projectFuncList.filter(item => item.funcCode === func.funcCode).length === 0 && !funcCodes.includes(func.funcCode)) {
            funcIds.push(func.id)
            funcCodes.push(func.funcCode)
        }
    })
    // 找出函数中使用的变量
    const funcVarList = await getRepository(FuncVariable).find({
        where: {
            projectId: fromProjectId,
            versionId,
            deleteFlag: 0,
            funcCode: In(funcCodes)
        }
    })
    // 直接绑定的变量和函数使用到的变量放在变量列表
    funcVarList.map(item => {
        valList.push({ id: item.variableId })
    })
    // 如果项目中已经存在相同的variableCode的项目级变量，则不重复添加
    valList.map(val => {
        if (projectValList.filter(item => item.variableCode === val.variableCode).length === 0) {
            varIds.push(val.id)
        }
    })
    // 变量id去重
    varIds = varIds.map(item => typeof item === 'string' ? parseInt(item) : item)
    varIds = Array.from(new Set(varIds))
    return { varIds, funcIds, defaultFuncGroupId }
}

export const filterFuncAndVars = async ({ projectId, versionId, valList, funcList }) => {
    const projectValList = await VariableModel.getAll({ projectId, versionId, effectiveRange: 0 })
    const projectFuncGroupList = await getAllGroupAndFunction(projectId, versionId)
    const projectFuncList = []
    projectFuncGroupList.map(item => {
        projectFuncList.splice(0, 0, ...item.children)
    })
    const defaultFuncGroupId = projectFuncGroupList[0] && projectFuncGroupList[0].id
    funcList = funcList.filter(item => !projectFuncList.find(func => func.funcCode === item.funcCode))
    valList = valList.filter(item => !projectValList.find(val => val.variableCode === item.variableCode))
    return { valList, funcList, defaultFuncGroupId }
}
