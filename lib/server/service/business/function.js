import {
    LCDataService,
    TABLE_FILE_NAME
} from '../common/data-service'
import {
    replaceFuncKeyword,
    replaceFuncParam,
    FUNCTION_TYPE
} from '../../../shared/function'
import {
    checkEslint,
    fixEslint
} from '../common/code-formatter'
import {
    METHODS_WITHOUT_DATA,
    API_PARAM_VALUE_TYPES,
    API_PARAM_TYPES
} from '../../../shared/api'
import {
    isEmpty
} from '../../../shared/util'

// 把版本管理任务跟应用导入任务的公共方法抽取出来
const commonTask = async ({ projectId, newVersionId }, funcGroupList, funcList, funcFuncList) => {
    const funcIdMap = {}
    await LCDataService.transaction(async (transactionalEntityHelper) => {
        // 新增函数分组
        const newFuncGroupList = await transactionalEntityHelper.add(
            TABLE_FILE_NAME.FUNC_GROUP,
            funcGroupList.map(({ id, createTime, updateTime, ...others }) => {
                return {
                    ...others,
                    projectId,
                    versionId: newVersionId
                }
            })
        )
        // 新旧分组的id map
        const funcGroupIdMap = {}
        funcGroupList.forEach((funcGroup, index) => {
            funcGroupIdMap[funcGroup.id] = newFuncGroupList[index]?.id || 0
        })
        // 新增函数
        const newFuncList = await transactionalEntityHelper.add(
            TABLE_FILE_NAME.FUNC,
            funcList.map(({ id, createTime, updateTime, funcGroupId, ...others }) => {
                return {
                    ...others,
                    projectId,
                    versionId: newVersionId,
                    funcGroupId: funcGroupIdMap[funcGroupId] || 0
                }
            })
        )
        // 新增关联关系
        await transactionalEntityHelper.add(
            TABLE_FILE_NAME.FUNC_FUNC,
            funcFuncList.map(({ id, createTime, updateTime, ...others }) => {
                return {
                    ...others,
                    projectId,
                    versionId: newVersionId
                }
            })
        )
        funcList.forEach((item, index) => {
            funcIdMap[item.id] = newFuncList[index]?.id || 0
        })
    })
    return funcIdMap
}

// 版本管理任务
export const versionTask = async (ctx, next) => {
    const { projectId, versionId, newVersionId } = ctx
    // 获取函数和分组数据
    const query = {
        projectId,
        versionId,
        deleteFlag: 0
    }
    const [
        { list: funcGroupList },
        { list: funcList },
        { list: funcFuncList }
    ] = await Promise.all([
        LCDataService.get({
            tableFileName: TABLE_FILE_NAME.FUNC_GROUP,
            query
        }),
        LCDataService.get({
            tableFileName: TABLE_FILE_NAME.FUNC,
            query
        }),
        LCDataService.get({
            tableFileName: TABLE_FILE_NAME.FUNC_FUNC,
            query
        })
    ])

    if (!funcGroupList.length || !funcList.length) {
        await next()
        return
    }

    const funcIdMap = await commonTask({ projectId, newVersionId }, funcGroupList, funcList, funcFuncList)
    // 放入到ctx，在创建关联数据中使用
    ctx.funcIdMap = funcIdMap
    await next()
}

// 应用导入任务
export const importTask = async (ctx, next) => {
    const { projectId } = ctx
    const { funcGroup, func, funcFunc } = ctx.importData

    const funcIdMap = await commonTask({ projectId, newVersionId: null }, funcGroup, func, funcFunc)
    ctx.idMap.funcIdMap = funcIdMap
    await next()
}

/**
 * 检查函数是否符合 eslint 规则
 * @param { Object | Array } functionData 待检查的数据
 */
export const checkFuncBody = async (functionData) => {
    // 抹平入参差异
    const checkList = Array.isArray(functionData)
        ? functionData
        : [functionData]
    // 检查
    for (let index = 0; index < checkList.length; index++) {
        const checkItem = checkList[index]
        const globals = {};
        [...(checkItem.funcParams || []), ...(checkItem.remoteParams || [])].forEach((key) => {
            globals[key] = true
        })
        // 替换函数中使用到的函数和变量，防止错误使用 lesscode 关键字
        // 转换成 this. 语法，并补充 .lcd 防止列信息错误
        const checkBody = replaceFuncKeyword(
            checkItem.funcBody,
            (all, first, variableStr, variableCode, funcStr, funcCode) => {
                if (variableCode) {
                    return `this.lcd${variableStr}`
                }
                if (funcCode) {
                    return `this.lcd${funcStr}`
                }
            }
        )
        // eslint 检查
        await checkEslint(checkBody, globals)
    }
}

/**
 * 使用 eslint 对函数进行修复
 * @param { Object } functionData 待修复的数据
 */
export const fixFuncBody = (functionData) => {
    const globals = { lesscode: true };
    [...(functionData.funcParams || []), ...(functionData.remoteParams || [])].forEach((key) => {
        globals[key] = true
    })
    return fixEslint(functionData.funcBody, globals)
}

/**
 * 检查函数code name的重复
 * @param { Object | Array } functionData 待检查重复的数据
 * @param { Number } projectId 项目 id
 * @param { Number } versionId 版本 id
 */
export const doubleCheckFunction = async (functionData, projectId, versionId) => {
    // 抹平入参差异
    const checkList = Array.isArray(functionData)
        ? functionData
        : [functionData]
    // 提前检查，异常情况下可以减少2次db查数据
    checkList.forEach((checkItem) => {
        // 入参检查
        const sameCodeItems = checkList.filter(item => checkItem.funcCode === item.funcCode)
        if (sameCodeItems.length > 1) {
            throw new global.BusinessError(global.i18n.t('参数存在{{0}}个函数标识为【{{1}}】的函数，请修改后再试', [sameCodeItems.length, checkItem.funcCode]), 400, 400)
        }
        const sameNameItems = checkList.filter(item => checkItem.funcName === item.funcName)
        if (sameNameItems.length > 1) {
            throw new global.BusinessError(global.i18n.t('参数存在{{0}}个函数名称为【{{1}}】的函数，请修改后再试', [sameNameItems.length, checkItem.funcName]), 400, 400)
        }
        // 检查函数参数是否符合规范
        const checkParam = (param) => {
            if (param?.required) {
                if (param.valueType === API_PARAM_VALUE_TYPES.VARIABLE && isEmpty(param.code)) {
                    throw new global.BusinessError(global.i18n.t('函数参数【{{n}}】必填，但是没有选择变量，请修改后再试', { n: param.name }), 400, 400)
                }
                if (
                    param.valueType === API_PARAM_VALUE_TYPES.VALUE
                    && isEmpty(param.value)
                    && [API_PARAM_TYPES.STRING.VAL, API_PARAM_TYPES.BOOLEAN.VAL, API_PARAM_TYPES.NUMBER.VAL].includes(param.type)
                ) {
                    throw new global.BusinessError(global.i18n.t('函数参数【{{n}}】必填，但是没有填值，请修改后再试', { n: param.name }), 400, 400)
                }
            }
        }
        if (METHODS_WITHOUT_DATA.includes(checkItem.funcMethod)) {
            checkItem.apiQuery?.forEach((param) => {
                checkParam(param)
            })
        } else {
            const checkBodyParam = (param) => {
                checkParam(param)
                param?.children?.forEach((childParam) => {
                    checkBodyParam(childParam)
                })
            }
            checkBodyParam(checkItem.apiBody)
        }
    })

    // 准备数据
    const query = {
        projectId,
        versionId,
        deleteFlag: 0
    }
    const [
        { list: functionList },
        { list: variableList }
    ] = await Promise.all([
        LCDataService.get({
            tableFileName: TABLE_FILE_NAME.FUNC,
            query
        }),
        LCDataService.get({
            tableFileName: TABLE_FILE_NAME.VARIABLE,
            query: {
                variableCode: checkList.map(x => x.funcCode),
                ...query
            }
        })
    ])
    const codeMap = {}
    const nameMap = {}
    const variableMap = {}
    functionList.forEach((functionItem) => {
        codeMap[functionItem.funcCode] = functionItem.id || 0
        nameMap[functionItem.funcName] = functionItem.id || 0
    })
    variableList.forEach((variableItem) => {
        variableMap[variableItem.variableCode] = true
    }, {})
    // 检查逻辑
    checkList.forEach((checkItem) => {
        // 1. 检查函数 code,name 是否重复 2. 检查函数名和变量code是否重复 3. 检查name code是否符合规则
        if (
            Reflect.has(codeMap, checkItem.funcCode)
            && codeMap[checkItem.funcCode] !== checkItem.id
        ) {
            throw new global.BusinessError(global.i18n.t('已存在函数标识为【{{n}}】的函数，请修改后再试', { n: checkItem.funcCode }), 400, 400)
        }
        if (
            Reflect.has(nameMap, checkItem.funcName)
            && nameMap[checkItem.funcName] !== checkItem.id
        ) {
            throw new global.BusinessError(global.i18n.t('已存在函数名称为【{{n}}】的函数，请修改后再试', { n: checkItem.funcName }), 400, 400)
        }
        if (
            Reflect.has(variableMap, checkItem.funcName)
        ) {
            throw new global.BusinessError(global.i18n.t('存在变量标识为【{{n}}】的变量，请修改函数名称后再试', { n: checkItem.funcName }), 400, 400)
        }
        if (!/^[A-Za-z_][A-Za-z0-9]*[A-Za-z_]?$/.test(checkItem.funcName)) {
            throw new global.BusinessError(global.i18n.t('函数名称由大小写英文字母数字组成，开头和结尾还可以是下划线。函数名称【{{n}}】不符合规则，请修改后再试', { n: checkItem.funcName }), 400, 400)
        }
        if (!/^[A-Za-z_0-9]*$/.test(checkItem.funcCode)) {
            throw new global.BusinessError(global.i18n.t('由大小写英文字母、下划线、数字组成。函数标识【{{n}}】不符合规则，请修改后再试', { n: checkItem.funcCode }), 400, 400)
        }
    })
}

/**
 * 处理函数与函数，函数与变量的关联关系
 * @param { Object | Array } functionData 待处理关联关系的函数
 * @param { Number } projectId 项目 id
 * @param { Number } versionId 版本 id
 */
export const handleRelation = async (functionData, projectId, versionId) => {
    // 抹平入参差异
    const functionList = Array.isArray(functionData)
        ? functionData
        : [functionData]
    // 准备数据
    const commonQuery = { projectId, versionId }
    const [
        { list: funcFuncRelateList },
        { list: funcVarRelateList },
        { list: funcApiRelateList },
        { list: funcList },
        { list: varList }
    ] = await Promise.all([
        LCDataService.get({
            tableFileName: TABLE_FILE_NAME.FUNC_FUNC,
            query: {
                parentFuncCode: functionList.map(func => func.funcCode),
                ...commonQuery
            }
        }),
        LCDataService.get({
            tableFileName: TABLE_FILE_NAME.FUNC_VARIABLE,
            query: {
                funcCode: functionList.map(func => func.funcCode),
                ...commonQuery
            }
        }),
        LCDataService.get({
            tableFileName: TABLE_FILE_NAME.FUNC_API,
            query: {
                ...commonQuery,
                funcCode: functionList.map(func => func.funcCode)
            }
        }),
        LCDataService.get({
            tableFileName: TABLE_FILE_NAME.FUNC,
            query: commonQuery
        }),
        LCDataService.get({
            tableFileName: TABLE_FILE_NAME.VARIABLE,
            query: commonQuery
        })
    ])
    // 处理关联关系
    const newFuncFuncRelateList = []
    const newFuncVarRelateList = []
    const newFuncApiRelateList = []
    const handleRelation = ({ variableCode, funcCode, parentFunction }) => {
        // 记录函数与变量关联关系
        if (variableCode) {
            const relateVariable = varList.find(variable => variable.variableCode === variableCode)
            if (!relateVariable) {
                throw new global.BusinessError(global.i18n.t('函数中使用了变量标识为【{{n}}】的变量，但是变量列表未找到该变量，请修改后再试', { n: variableCode }))
            }

            const record = newFuncVarRelateList.find(funcVarRelate => (
                funcVarRelate.variableId === relateVariable.id
                && funcVarRelate.funcCode === parentFunction.funcCode
            ))
            if (!record) {
                newFuncVarRelateList.push({
                    projectId: parentFunction.projectId,
                    versionId: parentFunction.versionId,
                    variableId: relateVariable.id,
                    funcCode: parentFunction.funcCode
                })
            }
        }
        // 记录函数与函数关联关系
        if (funcCode) {
            const relateFunc = funcList.find(func => func.funcCode === funcCode)
            if (!relateFunc) {
                throw new global.BusinessError(global.i18n.t('函数中使用了函数标识为【{{n}}】的函数，但是函数列表未找到该函数，请修改后再试', { n: funcCode }))
            }

            const record = newFuncFuncRelateList.find(funcFuncRelate => (
                funcFuncRelate.funcCode === funcCode
                && funcFuncRelate.parentFuncCode === parentFunction.funcCode
            ))
            if (!record) {
                newFuncFuncRelateList.push({
                    parentFuncCode: parentFunction.funcCode,
                    projectId: parentFunction.projectId,
                    versionId: parentFunction.versionId,
                    funcCode: relateFunc.funcCode
                })
            }
        }
    }
    // 记录函数体中的变量和函数
    functionList.forEach((functionItem) => {
        replaceFuncKeyword(functionItem.funcBody, (all, first, second, variableCode, funcStr, funcCode) => {
            handleRelation({ variableCode, funcCode, parentFunction: functionItem })
        })
        if (functionItem.funcType === 1) {
            // 记录 funcApiUrl 中的变量
            replaceFuncParam(functionItem.funcApiUrl || '', (variableCode) => {
                handleRelation({ variableCode, parentFunction: functionItem })
            })
            // 记录参数中的变量
            const handleParamVariable = (param) => {
                if (API_PARAM_VALUE_TYPES.VARIABLE === param?.valueType) {
                    if (param.code) {
                        handleRelation({ variableCode: param.code, parentFunction: functionItem })
                    } else {
                        throw new global.BusinessError(global.i18n.t('函数参数【{{n}}】类型是变量，但是未选择变量，请修改后再试', { n: param.name }))
                    }
                }
            }
            if (METHODS_WITHOUT_DATA.includes(functionItem.funcMethod)) {
                functionItem.apiQuery?.forEach((queryItem) => {
                    handleParamVariable(queryItem)
                })
            } else {
                const handleBodyParam = (param) => {
                    handleParamVariable(param)
                    param?.children?.forEach((childParam) => {
                        handleBodyParam(childParam)
                    })
                }
                handleBodyParam(functionItem.apiBody)
            }
        }
        // 记录函数使用到的 api
        if (functionItem.funcType === FUNCTION_TYPE.REMOTE) {
            newFuncApiRelateList.push({
                funcCode: functionItem.funcCode,
                apiCode: functionItem.apiCode,
                projectId: functionItem.projectId,
                versionId: functionItem.versionId
            })
        }
    })

    // 使用事务操作数据
    await LCDataService.transaction(async (transactionalEntityHelper) => {
        await transactionalEntityHelper.add(TABLE_FILE_NAME.FUNC_FUNC, newFuncFuncRelateList)
        await transactionalEntityHelper.add(TABLE_FILE_NAME.FUNC_VARIABLE, newFuncVarRelateList)
        await transactionalEntityHelper.add(TABLE_FILE_NAME.FUNC_API, newFuncApiRelateList)
        await transactionalEntityHelper.delete(funcFuncRelateList)
        await transactionalEntityHelper.delete(funcVarRelateList)
        await transactionalEntityHelper.delete(funcApiRelateList)
    })
}

/**
 * 获取函数的关联关系，函数在哪些地方使用了
 * @param { Object | Array } functionData 待处理关联关系的函数
 * @param { Number } projectId 项目 id
 * @param { Number } versionId 版本 id
 */
export const injectRelation = async (functionData, projectId, versionId) => {
    // 抹平入参差异
    const functionList = Array.isArray(functionData)
        ? functionData
        : [functionData]

    // 获取关联数据
    const commonRelateQuery = {
        projectId,
        versionId,
        deleteFlag: 0
    }
    const [
        { list: funcRelateList },
        { list: pageRelateList },
        { list: variableRelateList }
    ] = await Promise.all([
        LCDataService.get({
            tableFileName: TABLE_FILE_NAME.FUNC_FUNC,
            query: {
                ...commonRelateQuery,
                funcCode: functionList.map(x => x.funcCode)
            }
        }),
        LCDataService.get({
            tableFileName: TABLE_FILE_NAME.PAGE_FUNC,
            query: {
                ...commonRelateQuery,
                funcId: functionList.map(x => x.id)
            }
        }),
        LCDataService.get({
            tableFileName: TABLE_FILE_NAME.VARIABLE_FUNC,
            query: {
                ...commonRelateQuery,
                funcCode: functionList.map(x => x.funcCode)
            }
        })
    ])
    // 获取展示数据
    const [
        { list: pageList },
        { list: variableList }
    ] = await Promise.all([
        LCDataService.get({
            tableFileName: TABLE_FILE_NAME.PAGE,
            query: {
                id: pageRelateList.map(x => x.pageId)
            }
        }),
        LCDataService.get({
            tableFileName: TABLE_FILE_NAME.VARIABLE,
            query: {
                id: variableRelateList.map(x => x.variableId)
            }
        })
    ])
    // 组合使用数据
    functionList.forEach((functionItem) => {
        const funcCodes = funcRelateList
            .filter(funcRelate => funcRelate.funcCode === functionItem.funcCode)
            .map(funcRelate => funcRelate.parentFuncCode)
        const pageNames = pageList
            .filter(page => pageRelateList.find(pageRelate => (
                pageRelate.pageId === page.id
                && pageRelate.funcId === functionItem.id
            )))
            .map(page => page.pageName)
        const variableCodes = variableList
            .filter(variable => variableRelateList.find((variableRelate) => (
                variableRelate.variableId === variable.id
                && variableRelate.funcCode === functionItem.funcCode
            )))
            .map(variable => variable.variableCode)

        functionItem.useInfo = {
            funcCodes,
            pageNames,
            variableCodes
        }
    })

    return functionData
}

/**
 * 获取项目下的分组列表和分组下的函数列表
 * @param { Number } projectId 项目 id
 * @param { Number } versionId 版本 id
 */
export const getAllGroupAndFunction = async (projectId, versionId) => {
    const query = {
        projectId,
        versionId,
        deleteFlag: 0
    }
    const [
        { list: groupList },
        { list: functionList }
    ] = await Promise.all([
        LCDataService.get({
            tableFileName: TABLE_FILE_NAME.FUNC_GROUP,
            query,
            order: {
                order: 'ASC'
            }
        }),
        LCDataService.get({
            tableFileName: TABLE_FILE_NAME.FUNC,
            query
        })
    ])
    const formattedList = handleFunctionOutDb(functionList)
    groupList.forEach((group) => {
        const children = formattedList.filter(formattedItem => formattedItem.funcGroupId === group.id)
        group.children = children
    })
    return groupList
}

/**
 * 函数入库前对数据进行修改
 * @param { Object | Array } functionData 待处理数据
 * @returns 处理后的数据
 */
export const handleFunctionIntoDb = (functionData) => {
    const functionList = Array.isArray(functionData) ? functionData : [functionData]
    functionList.forEach((functionItem) => {
        functionItem.funcParams = (functionItem.funcParams || []).join(',')
        functionItem.remoteParams = (functionItem.remoteParams || []).join(',')
    })
    return functionData
}

/**
 * 函数出库前对数据进行修改
 * @param { Object | Array } functionData 待处理数据
 * @returns 处理后的数据
 */
export const handleFunctionOutDb = (functionData) => {
    const functionList = Array.isArray(functionData) ? functionData : [functionData]
    functionList.forEach((functionItem) => {
        functionItem.funcParams = (functionItem.funcParams || '').split(',').filter(v => v)
        functionItem.remoteParams = (functionItem.remoteParams || '').split(',').filter(v => v)
    })
    return functionData
}
