/**
 * Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
 * Copyright (C) 2017-2018 THL A29 Limited, a Tencent company. All rights reserved.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */
import { parse } from 'acorn'
import { FUNCTION_TIPS, FUNCTION_TYPE } from './constant'
import {
    METHODS_WITHOUT_DATA,
    parseScheme2Value,
    API_PARAM_VALUE_TYPES,
    getVariableReg,
    getOnlyVariableReg
} from '../api'
import {
    VARIABLE_TYPE,
    VARIABLE_VALUE_TYPE
} from '../variable'
import { sharedI18n } from '../util'

/**
 * 替换函数体中的关键字
 * 变量关键字：lesscode['${prop:variableCode}']
 * 函数关键字：lesscode['${func:funcCode}']()
 * @param {*} funcBody 函数体内容
 * @param {*} callBack 匹配到关键字后的执行回调函数
 * @returns 返回替换完成后的字符串
 */
export const replaceFuncKeyword = (funcBody = '', callBack) => {
    // parse keyword
    const commentsPositions = []
    try {
        parse(funcBody, {
            onComment (isBlock, text, start, end) {
                commentsPositions.push({
                    start,
                    end
                })
            },
            allowReturnOutsideFunction: true,
            allowAwaitOutsideFunction: true,
            ecmaVersion: 2020
        })
    } catch (error) {
        // 此处解析函数体是为了防止注释被处理，如果解析失败表示函数有问题，此处异常由ESLint检查处理
    }
    return funcBody.replace(/lesscode((\[\'\$\{prop:([^}]+)\}\'\])|(\[\'\$\{func:([^}]+)\}\'\]))/g, (all, first, second, variableCode, funcStr, funcCode, index) => {
        const isInComments = commentsPositions.some(position => position.start <= index && position.end >= index)
        return isInComments ? all : callBack(all, first, second, variableCode, funcStr, funcCode)
    })
}

/**
 * 替换函数参数里面的关键字 {{ funcCode || variableCode }}
 * @param {*} param 参数字符串
 * @param {*} callBack 匹配到关键字后的执行回调函数
 * @returns 返回替换完成后的字符串
 */
export const replaceFuncParam = (param = '', callBack) => {
    return param.replace(/(\{([^\}\{]+)\})|(\{\{([^\}\{]+)\}\})/g, (all, firstGroup, firstVariable, secondGroup, secondVariable) => {
        return callBack(secondVariable || firstVariable)
    })
}

/**
 * 获取默认函数所有字段
 * @param {*} options 覆盖字段使用
 * @returns 返回一个空函数
 */
export const getDefaultFunction = (options = {}) => {
    return {
        funcName: '',
        funcCode: '',
        funcGroupId: '',
        funcType: FUNCTION_TYPE.EMPTY,
        funcParams: [],
        remoteParams: ['res'],
        withToken: 0,
        funcApiUrl: '',
        funcMethod: 'get',
        funcApiData: '',
        funcSummary: '',
        funcBody: FUNCTION_TIPS()[FUNCTION_TYPE.EMPTY],
        id: undefined,
        projectId: '',
        versionId: undefined,
        apiChoosePath: [],
        apiQuery: [],
        apiBody: {},
        apiHeader: {},
        ...options
    }
}

/**
 * 获取导出函数字符串
 * @param {*} functionData
 * @returns 导出函数json字符串
 */
export const getExportFunction = (functionData) => {
    function getExportFunc (func) {
        const exportProps = [
            'funcName',
            'funcCode',
            'funcParams',
            'funcBody',
            'funcSummary',
            'funcType',
            'funcMethod',
            'withToken',
            'funcApiData',
            'funcApiUrl',
            'remoteParams',
            'apiBody',
            'apiHeader',
            'apiQuery'
        ]
        return exportProps.reduce((res, prop) => {
            res[prop] = func[prop]
            return res
        }, {})
    }
    const functionList = Array.isArray(functionData) ? functionData : [functionData]
    const funcs = functionList.reduce((acc, cur) => {
        acc.push(getExportFunc(cur))
        return acc
    }, [])
    const source = JSON.stringify(funcs, null, 2)
    return source
}

// 获取远程函数执行时候的参数和使用到的变量
export const getRemoteFunctionInfo = (functionData) => {
    const codes = []
    let apiData = {}
    const getParamVal = (param) => {
        let result
        if (API_PARAM_VALUE_TYPES.VALUE === param.valueType) {
            const variableReg = getVariableReg()
            const onlyVariableReg = getOnlyVariableReg()
            result = param.value
            if (onlyVariableReg.test(result)) {
                // 只包含变量，转换成变量使用
                result = `lesscode{{{${result.replace(variableReg, '$1')}}}}lesscode`
            } else if (variableReg.test(result)) {
                // 部分变量，使用 ${}
                result = `lesscode{{{\`${result.replace(/\`/g, '{{singular}}')}\`}}}lesscode`
            }
        } else if (param.code) {
            codes.push(param.code)
            result = `lesscode{{{this.${param.code}}}}lesscode`
        } else {
            result = param
        }
        return result
    }

    if (METHODS_WITHOUT_DATA.includes(functionData.funcMethod)) {
        (functionData.apiQuery || []).forEach((query) => {
            if (query.name) {
                apiData[query.name] = getParamVal(query)
            }
        })
    } else {
        apiData = parseScheme2Value(functionData.apiBody, getParamVal)
    }

    /**
     * 1. 基于特殊字符去掉变量引号，生成源码的时候让变量生效
     * 2. 基于特殊字符转换转义字符，让单引号生效
     */
    const apiDataString = JSON
        .stringify(apiData || {})
        .replace(/("lesscode{{{|}}}lesscode")/g, '')
        .replace(/\{\{singular\}\}/g, '\\`')
    return { codes, apiDataString }
}

// 获取变量默认值
const getVariableVal = (variable) => {
    const copyVariable = JSON.parse(JSON.stringify(variable))
    const { defaultValue, defaultValueType, valueType } = copyVariable
    let value = defaultValueType === VARIABLE_VALUE_TYPE.SAME ? defaultValue.all : defaultValue.preview
    // 计算变量，赋为空值
    if (valueType === VARIABLE_TYPE.COMPUTED.VAL) {
        value = ''
    }
    // 对象类型，解析为object
    if (valueType === VARIABLE_TYPE.OBJECT.VAL && typeof value !== 'object') {
        value = JSON.parse(value)
    }
    // array 类型，解析为array
    if (valueType === VARIABLE_TYPE.ARRAY.VAL && typeof value !== 'object') {
        value = JSON.parse(value)
    }
    return value
}

// 处理函数体，函数中可能会使用函数或者变量
const processFuncBody = (funcName, funcBody) => {
    return replaceFuncKeyword(funcBody, (all, first, second, variableCode, funcStr, funcCode) => {
        if (funcCode) {
            const curFunc = evalWithSandBox.usedMethodMap[funcCode] || getMethodByCode(funcCode)
            if (curFunc.id) {
                return `${curFunc.funcName}`
            } else {
                throw new Error(`${sharedI18n().t('函数')}【 ${funcName}】${sharedI18n().t('里引用的函数')}【${funcCode}】${sharedI18n().t('不存在，请检查')}`)
            }
        }
        if (variableCode) {
            const curVar = evalWithSandBox.variables.find((variable) => (variable.variableCode === variableCode))
            if (curVar) {
                evalWithSandBox.usedVariableMap[variableCode] = getVariableVal(curVar)
                return `this.${variableCode}`
            } else {
                throw new Error(`${sharedI18n().t('函数')} 【${funcName}】${sharedI18n().t('里引用的变量')}【${variableCode}】${sharedI18n().t('不存在或非应用级变量，请检查')}`)
            }
        }
    })
}

// 基于函数code获取函数内容
const getMethodByCode = (functionCode) => {
    const returnMethod = JSON.parse(JSON.stringify(evalWithSandBox.functions.find(functionData => functionData.funcCode === functionCode)))
    evalWithSandBox.usedMethodMap[returnMethod.funcCode] = returnMethod
    returnMethod.funcBody = processFuncBody(returnMethod.funcName, returnMethod.funcBody)
    return returnMethod
}

// 生成函数体
const getMethodStr = (returnMethod) => {
    const funcParams = (returnMethod.funcParams || []).join(', ')
    if (returnMethod.funcType === 1) {
        const remoteParams = (returnMethod.remoteParams || []).join(', ')
        const {
            apiDataString,
            codes
        } = getRemoteFunctionInfo(returnMethod)
        recordVariable(codes, returnMethod.funcName)
        // 构造 url
        let funcApiUrl = returnMethod.funcApiUrl
        if (returnMethod?.apiChoosePath?.find(path => path.id === 'lesscode-api')) {
            const apiData = evalWithSandBox.apis.find(api => api.code === returnMethod.apiChoosePath[2].code)
            funcApiUrl = apiData?.url || returnMethod.funcApiUrl
        }
        const data = `{
            url: \`${processVarInFunApiUrl(funcApiUrl, returnMethod.funcName)}\`,
            type: '${returnMethod.funcMethod}',
            apiData: ${apiDataString},
            withToken: ${returnMethod.withToken}
        }`
        returnMethod.funcStr = `const ${returnMethod.funcName} = (${funcParams}) => { return this.$store.dispatch('getApiData', ${data}).then((${remoteParams}) => { ${returnMethod.funcBody} }) };`
    } else {
        returnMethod.funcStr = `const ${returnMethod.funcName} = (${funcParams}) => { ${returnMethod.funcBody} };`
    }
    return returnMethod.funcStr
}

// 生成脚本
const generateMethod = (functionCode, params) => {
    const firstMethod = getMethodByCode(functionCode)
    let funcStr = ''
    Object.values(evalWithSandBox.usedMethodMap).forEach((method) => {
        funcStr += getMethodStr(method)
    })
    funcStr += `return ${firstMethod.funcName}(${generateFuncParams(params, firstMethod.funcName)})`
    return funcStr
}

// 处理 url 中使用到的参数
const processVarInFunApiUrl = (str, funcName) => {
    return replaceFuncParam(str || '', (variableCode) => {
        recordVariable(variableCode, funcName)
        return `\${this.${variableCode}}`
    })
}

// 记录用到的变量
const recordVariable = (variableCode, funcName) => {
    const variableCodes = Array.isArray(variableCode) ? variableCode : [variableCode]
    variableCodes.forEach((code) => {
        const curVar = evalWithSandBox.variables.find((variable) => (variable.variableCode === code))
        if (curVar) {
            evalWithSandBox.usedVariableMap[code] = getVariableVal(curVar)
        } else {
            throw new Error(`${sharedI18n().t('函数')}【${funcName}】${sharedI18n().t('里引用的变量')}【${code}】${sharedI18n().t('不存在或非应用级变量，请检查')}`)
        }
    })
}

// 生成函数执行参数
const generateFuncParams = (params = [], funcName) => {
    return params
        .reduce((acc, cur) => {
            if (cur.format === 'value') {
                acc.push(`'${cur.value}'`)
            } else if (cur.format === 'variable' && cur.code) {
                acc.push(`this.${cur.code}`)
                recordVariable(cur.code, funcName)
            } else if (cur.code) {
                acc.push(cur.code)
            }
            return acc
        }, [])
        .join(', ')
}

/**
 * 沙箱中执行函数
 * @param {*} functionCode 函数标识
 * @param {*} params 函数执行参数
 * @param {*} functions 函数列表
 * @param {*} variables 变量列表
 * @param {*} apis api 列表
 * @param {*} global 全局对象
 * @returns {*} 函数执行结果
 */
export const evalWithSandBox = async (functionCode, params, functions, variables, apis, global = {}) => {
    // 挂载当次执行对象
    evalWithSandBox.usedVariableMap = {}
    evalWithSandBox.usedMethodMap = {}
    evalWithSandBox.functions = functions
    evalWithSandBox.variables = variables
    evalWithSandBox.apis = apis
    // 生成函数体
    const script = generateMethod(functionCode, params)
    // 生成沙箱
    const sandBox = createSandBox({
        ...global,
        ...evalWithSandBox.usedVariableMap
    })
    // 执行函数
    const result = await sandBox(script)
    return result
}

/**
 * 构造执行函数沙箱
 * @param {*} contextProxy 全局对象
 * @returns sandBox
 */
export const createSandBox = (contextProxy) => {
    const Fn = Function
    const global = Fn('return this')()
    const createProxy = (context) => {
        const proxy = new Proxy(context, {
            set (target, p, value) {
                target[p] = value
                return true
            },
            get (target, p) {
                switch (p) {
                    case 'document':
                    case 'window':
                    case 'global':
                    case 'self':
                    case 'globalThis':
                        return proxy
                    case 'Function':
                        return (...args) => Fn(...args).bind(proxy)
                    case 'eval':
                        return code => Fn(`return ${code}`).bind(proxy)
                }
                if (!(p in target) && p in global) {
                    const value = global[p]
                    if (typeof value === 'function' && !value.prototype) return value.bind(global)
                    return value
                }
                return target[p]
            },
            has () {
                return true
            }
        })
        return proxy
    }
    const context = createProxy(contextProxy)
    const sandbox = (script) => {
        const hasAwait = /await\s/.test(script)
        const Fn = Function
        const AsyncFunction = new Fn('return Object.getPrototypeOf(async function(){}).constructor')()
        const createFunc = hasAwait ? AsyncFunction : Fn.constructor
        return createFunc(
            'context',
            `
                with (context) {
                    return (function() {
                        "use strict"
                        ${script}
                    }).bind(global)()
                }
            `
        )(context)
    }
    return sandbox
}
