import { replaceFuncKeyword, replaceFuncParam, getRemoteFunctionInfo } from '../../../function/helper'
import { VARIABLE_TYPE, VARIABLE_EFFECTIVE_RANGE } from '../../../variable/constant'
import { getMethodByCode } from '../../common/utils'

/**
 * @desc 解析完json以后，处理使用到的函数和变量，方便后续生成源码使用
 * @param { CodeModel } code
 */
export default function handleUsedVarAndFunc (code) {
    while (code.unhandledFunc.length > 0 || code.unhandledVariables.length > 0) {
        // 处理函数
        for (let index = 0, l = code.unhandledFunc.length; index < l; index++) {
            const funcCode = code.unhandledFunc.shift()
            const func = getCompleteFuncByCode(code, funcCode) || {}
            if (func.code) {
                code.methodStrList.push({
                    id: func.id,
                    funcStr: func.code
                })
            }
        }

        // 处理变量
        for (let index = 0, l = code.unhandledVariables.length; index < l; index++) {
            const variable = code.unhandledVariables.shift()

            // 项目级别变量，添加到store中
            if (
                !['vueCode', 'previewSingle'].includes(code.pageType)
                && variable.effectiveRange === VARIABLE_EFFECTIVE_RANGE.PROJECT
            ) {
                code.projectVariables.push(variable)
            }

            // 页面级别变量
            if (
                ['vueCode', 'previewSingle'].includes(code.pageType)
                || variable.effectiveRange === VARIABLE_EFFECTIVE_RANGE.PAGE
            ) {
                // 处理非计算变量
                if (variable.valueType !== VARIABLE_TYPE.COMPUTED.VAL) {
                    const { defaultValue = {}, variableCode, defaultValueType } = variable
                    if ([VARIABLE_TYPE.ARRAY.VAL, VARIABLE_TYPE.OBJECT.VAL].includes(variable.valueType)) {
                        ['all', 'prod', 'stag'].forEach((key) => {
                            const val = defaultValue[key]
                            if (typeof val === 'string' && val) {
                                defaultValue[key] = JSON.parse(val)
                            }
                        })
                    }
                    code.dataTemplate(variableCode, `getInitVariableValue(${JSON.stringify(defaultValue)}, ${defaultValueType})`)
                    code.pageDataVariables.push(variable)
                }

                // 处理计算变量
                if (variable.valueType === VARIABLE_TYPE.COMPUTED.VAL) {
                    variable.defaultValue.all = processFuncBody(code.variable.defaultValue.all)
                    code.pageComputedVariables.push(variable)
                }
            }
        }
    }
}

/**
 * @desc 根据methodCode获取函数详情
 * @param { CodeModel } code
 * @param { String } methodCode
 * @returns { String }
 */
function getCompleteFuncByCode (code, methodCode) {
    const [returnMethod] = getMethodByCode(methodCode, code.funcGroups) || {
        id: '',
        funcName: 'emptyFunc',
        previewStr: '',
        vueCodeStr: '',
        funcBody: ''
    }
    const paramsStr = (returnMethod.funcParams || []).join(', ')
    // 函数体内容有await， 则方法前面需要添加async
    const addFuncStr = (funcBody = '') => {
        const hasAwait = /await\s/.test(funcBody)
        return `${hasAwait ? 'async' : ''} ${returnMethod.funcName} (${paramsStr}) { ${funcBody} }`
    }
    const funcBody = processFuncBody(code, returnMethod.funcBody)
    // 远程函数类型
    if (returnMethod.funcType === 1) {
        const remoteParams = (returnMethod.remoteParams || []).join(', ')
        const {
            apiDataString,
            codes
        } = getRemoteFunctionInfo(returnMethod)
        codes.forEach((funcCode) => {
            code.handleVarInFunc(funcCode)
        })
        // 构造 url
        let funcApiUrl = returnMethod.funcApiUrl
        if (returnMethod?.apiChoosePath?.find(path => path.id === 'lesscode-api')) {
            const apiData = code.apiList.find(api => api.code === returnMethod.apiChoosePath[2].code)
            funcApiUrl = apiData?.url || returnMethod.funcApiUrl
        }
        const data = `{
            url: \`${processFuncUrl(funcApiUrl)}\`,
            type: '${returnMethod.funcMethod}',
            apiData: ${apiDataString},
            withToken: ${returnMethod.withToken}
        }`
        returnMethod.code = addFuncStr(`return this.$store.dispatch('getApiData', ${data}).then((${remoteParams}) => { ${funcBody} }).catch((err) => { console.error(err) })`)
    } else {
        returnMethod.code = addFuncStr(funcBody)
    }
    return returnMethod
}

/**
 * @desc 解析处理函数url
 * @param { CodeModel } code
 * @param { String } str url
 * @returns { String }
 */
function processFuncBody (code, bodyCode) {
    // 需要删除首行注释和转义尖括号
    const encodeCode = (bodyCode || '')
        .replace(
            /(<)(\/?)([^>\r\n]+)(>)/gi,
            (match, p1, p2, p3, p4, offset, string) => `\\${p1}` + `${p2 && `\\${p2}`}` + p3 + `\\${p4}`
        )
        .replace(/^\/\*[\s\S]*?\*\/(\r\n)?/, '')

    return replaceFuncKeyword(encodeCode, (all, first, second, dirKey, funcStr, funcCode) => {
        return code.handleVarInFunc(dirKey, funcCode) || all
    })
}

/**
 * @desc 解析处理函数url
 * @param { CodeModel } code
 * @param { String } str url
 * @returns { String }
 */
function processFuncUrl (code, str) {
    return replaceFuncParam(str || '', (variableCode) => {
        return `\$\{${code.handleVarInFunc(variableCode)}\}`
    })
}
