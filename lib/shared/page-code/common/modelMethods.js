import { getValue, getMethodByCode, getValueType } from './utils'
import { uuid, sharedI18n, toPascal, capitalizeFirstChar } from '../../util'
import { EVENT_ACTION_TYPE } from '../../function/constant'
import { camelCase, camelCaseTransformMerge } from 'change-case'

/**
 * @desc 追加样式，将页面每个元素的样式追加到css中
 * @param { CodeModel } code
 * @param { String } cssStr 需要拼接的css样式
 */
export function setProperty (code, key, value) {
    code[key] = value
}

/**
 * @desc 追加样式，将页面每个元素的样式追加到css中
 * @param { CodeModel } code
 * @param { String } cssStr 需要拼接的css样式
 */
export function appendCss (code, cssStr) {
    const newValue = code.cssStr + cssStr
    setProperty(code, 'cssStr', newValue)
}

/**
 * @desc 添加变量到data中
 * @param { CodeModel } code
 * @param { String } key 需要添加的变量key
 * @param { String } value 需要添加的变量value
 */
export function dataTemplate (code, key, value) {
    Object.assign(code.dataObj, { [key]: value })
}

/**
 * @desc 生成远程函数
 * @param { CodeModel } code
 * @param { String } key 远程函数key
 * @param { Object } payload 放置远程函数相关的信息
 * @param { Boolean } isChartType 是否是图表组件相关函数
 */
export function remoteMethodsTemplate (code, key, payload, chartType = false) {
    const [method, params] = getMethodByCode(payload, code.funcGroups)
    if (method.id) {
        let newValue = code.remoteDataStr
        if (chartType) {
            newValue += key.endsWith('options')
                ? `const ${key}Remote = await this.${method.funcName}(${getFuncParamStr(code, method, params, `${sharedI18n().t('远程函数')}【${method.funcName}】`, true)})\nthis.$set(this, '${key}', ${key}Remote)\n`
                : `const ${key}Remote = await this.${method.funcName}(${getFuncParamStr(code, method, params, `${sharedI18n().t('远程函数')}【${method.funcName}】`, true)})\nObject.assign(this.${key}, ${key}Remote)\n`
        } else {
            newValue += `this.${key} = await this.${method.funcName}(${getFuncParamStr(code, method, params, `${sharedI18n().t('远程函数')}【${method.funcName}】`, true)})\n`
        }
        setProperty(code, 'remoteDataStr', newValue)
    }
    // 处理chartRemote
    if (method.funcCode) addUsedFunc(code, method.funcCode)
}

/**
 * @desc 生成数据源函数
 * @param { CodeModel } code
 * @param { String } key 数据源函数key
 * @param { Object } payload 放置远程函数相关的信息
 */
export function dataSourceTemplate (code, key, sourceData) {
    const hashId = uuid(4)
    let newValue = code.remoteDataStr
    newValue += `const ${key}Source${hashId} = await this.$http.get('/data-source/user/tableName/${sourceData.tableName}?bkDataSourceType=${sourceData.dataSourceType}')\nthis.${key} = ${key}Source${hashId}.data.list || []\n`
    setProperty(code, 'remoteDataStr', newValue)
}

/**
 * @desc 生成事件描述
 * @param { CodeModel } pageCode
 * @param {*} componentId 组件id
 * @param {*} eventName 事件名
 * @param {*} actions 事件描述
 */
export function eventActionTemplate (pageCode, componentId, eventName, actions, errMessagePerfix) {
    const getComponentStr = (cur, index) => {
        return cur.value.reduce((acc, cur) => {
            acc.push(`element${index}Ref.style['${cur.key}'] = ${getShowValue(cur.value)}`)
            return acc
        }, []).join('\n')
    }
    const getShowValue = (val) => {
        // 变量
        if (/\$\{args\[[0-10]\]\}/.test(val)) {
            return val.replace(/\$\{(args\[[0-10]\])\}/g, '$1')
        }
        // 对象，数组，数字
        if (['object', 'number', 'boolean'].includes(getValueType(val))) {
            return val
        }

        return `'${val}'`
    }
    const name = `handle${capitalizeFirstChar(toPascal(componentId))}${capitalizeFirstChar(toPascal(eventName))} (...args)`
    const code = actions.reduce((acc, cur, index) => {
        switch (cur.type) {
            case EVENT_ACTION_TYPE.COMPONENT:
                acc += `
                const element${index}Ref = document.querySelector('.${camelCase(cur.id, { transform: camelCaseTransformMerge })}')
                if (element${index}Ref) {
                    ${getComponentStr(cur, index)}
                }
                `
                break
            case EVENT_ACTION_TYPE.LINK:
                acc += `
                this.$router.push(${getShowValue(cur.value)})
                `
                break
            case EVENT_ACTION_TYPE.METHOD:
                const [method] = getMethodByCode(cur.id, pageCode.funcGroups)
                if (method) {
                    const paramStr = cur.value.reduce((acc, cur) => {
                        acc.push(getShowValue(cur.value))
                        return acc
                    }, []).join(', ')
                    addUsedFunc(pageCode, cur.id)
                    acc += `
                    await this.${method.funcName}(${paramStr})
                    `
                } else {
                    pageCode.codeErrMessage = `${errMessagePerfix}${sharedI18n().t('使用了不存在的函数')}【${cur.id}】，${sharedI18n().t('请修改后重试')}`
                }
                break
            case EVENT_ACTION_TYPE.VARIABLE:
                const variable = pageCode.variableList.find(x => x.variableCode === cur.id)
                if (variable) {
                    addUsedVariable(pageCode, variable)
                    acc += `
                    this.${cur.id} = ${getShowValue(cur.value)}
                    `
                } else {
                    pageCode.codeErrMessage = `${errMessagePerfix}${sharedI18n().t('使用了不存在的变量')}【${cur.value}】，${sharedI18n().t('请修改后重试')}`
                }
                break
        }
        return acc
    }, '')
    pageCode.eventActionList.push({
        name,
        code
    })
}

/**
 * @desc 获取解析后的函数参数
 * @param { CodeModel } code
 * @param { Object } method 函数相关信息
 * @param { Object } params 参数列表
 * @param { String } errMessagePerfix 错误提示
 * @param { Boolean } withThis 是否包含this
 * @param { String } defaultFormat 默认格式
 * @returns { String } 解析后的参数字符串
 */
export function getFuncParamStr (code, method, params, errMessagePerfix, withThis, defaultFormat = 'value') {
    const displayParams = method?.funcParams?.map((paramKey, index) => {
        let param = {
            value: '',
            code: '',
            format: defaultFormat
        }
        if (params?.[index]) {
            param = params[index]
        }
        return param
    }) || []

    // 记录上一个事件提供的数据
    let lastIndex = 0
    return displayParams
        ?.reduce((acc, cur, index) => {
            if (cur.format === 'value') {
                acc.push(code.handleUsedVariable(cur.format, cur.value, errMessagePerfix) || '\'\'')
            } else if (withThis && cur.format === 'variable') {
                acc.push(`this.${code.handleUsedVariable(cur.format, cur.code, errMessagePerfix)}`)
            } else if (cur.format === 'event') {
                acc.push(`args[${lastIndex}]`)
                lastIndex += 1
            } else {
                acc.push(code.handleUsedVariable(cur.format, cur.code, errMessagePerfix))
            }
            return acc
        }, [])
        .join(', ')
}

/**
 * @desc 处理页面用到的变量
 * @param { CodeModel } code
 * @param { String } 处理页面用到的变量
 */
export function handleUsedVariable (code, valType, val, errMessagePerfix, dataSourceId, dataSourceType) {
    let disPlayVal = val
    switch (valType) {
        case 'value':
            disPlayVal = getValue(val)
            break
        case 'variable':
            const variable = code.variableList.find(x => x.variableCode === val)
            // form表单内的v-model绑定值忽略这个判断
            if (!variable && !(errMessagePerfix.indexOf('v-model') > 0 && val.indexOf('.') > 0)) {
                code.codeErrMessage = `${errMessagePerfix}${sharedI18n().t('使用了不存在的变量')}【${val}】，${sharedI18n().t('请修改后重试')}`
            }
            if (variable) {
                addUsedVariable(code, variable)
            }
            break
        case 'expression':
            code.variableList.forEach((variable) => {
                if (val.includes(variable.variableCode)) {
                    addUsedVariable(code, variable)
                }
            })
            break
        case 'dataSource':
            disPlayVal = dataSourceId
            dataTemplate(code, dataSourceId, JSON.stringify([]))
            dataSourceTemplate(code, dataSourceId, { tableName: val, dataSourceType })
            break
    }
    return disPlayVal
}

/**
 * @desc 记录页面用到的函数
 * @param { CodeModel } code
 * @param { String } 函数code
 */
export function addUsedFunc (code, funcCode) {
    if (code.usingFuncCodes.includes(funcCode)) return

    code.unhandledFunc.push(funcCode)
    code.usingFuncCodes.push(funcCode)
}

/**
 * @desc 记录页面用到的变量
 * @param { CodeModel } code
 * @param { String } 变量code
 */
export function addUsedVariable (code, variable) {
    if (code.usingVariables.find(x => x.variableCode === variable.variableCode)) return

    code.unhandledVariables.push(variable)
    code.usingVariables.push(variable)
}
