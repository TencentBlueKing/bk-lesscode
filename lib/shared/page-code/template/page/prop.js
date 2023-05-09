import { camelCase, camelCaseTransformMerge } from 'change-case'
import { getMethodByCode } from '../../common/utils'

/**
 * @desc 生成每个组件的props部分
 * @param { CodeModel } code
 * @param { String } type 组件类型
 * @param { String } compId 组件id
 * @param { Object } props props配置
 * @param { Object } directives dircetives配置
 * @param { Object } slots slots配置
 * @returns { String }
 */
export default function getItemProps (code, type, compId, props, directives, slots) {
    const hasProps = props && typeof props === 'object' && Object.keys(props).length > 0
    const dirProps = (directives || []).filter((directive) => (directive.code !== undefined && directive.code !== ''))
    let itemProps = ''
    if (hasProps || slots) {
        itemProps = getPropsStr(code, type, compId, props, dirProps, slots)
    }
    return itemProps
}

/**
 * @desc 根据renderProps和renderDirective设置，解析拼接出propsStr
 * @param { CodeModel } code
 * @param { String } type 组件类型
 * @param { String } compId 组件id
 * @param { Object } props props配置
 * @param { Object } directives dircetives配置
 * @param { Object } slots slots配置
 * @returns { String }
 */
function getPropsStr (code, type, compId, props, dirProps, slots) {
    let propsStr = ''
    const preCompId = camelCase(compId, { transform: camelCaseTransformMerge })
    // 需配置vmodel的组件
    let modelComId = ''
    const componentType = type

    // table历史问题处理
    if (type === 'bk-table') {
        if (props.hasOwnProperty('show-pagination-info') && props.hasOwnProperty('showPaginationInfo')) {
            delete props.showPaginationInfo
        }
    }
    // 处理使用了数据表类型数据源的组件
    if (props.data?.valueType === 'table-data-source') {
        propsStr += `table-name="${props.data?.payload?.sourceData?.tableName}" bk-data-source-type="${props.data?.payload?.sourceData?.dataSourceType}" :show-operation-column="${props.data?.payload?.sourceData?.showOperationColumn}" `
    }

    for (const i in props) {
        if (dirProps.find((directive) => (directive.prop === i)) && !['remote', 'data-source', 'table-data-source'].includes(props[i].valueType)) continue

        if (i !== 'slots' && i !== 'class') {
            compId = `${preCompId}${camelCase(i, { transform: camelCaseTransformMerge })}`
            if (i === 'value') modelComId = compId
            
            const { valueType: type, modifiers = [], renderValue, buildInVariableType, payload = {} } = props[i]
            const { sourceData = {}, customVariableCode = '' } = payload
            let { format, code: val } = props[i]

            /**
             * format为value，code为空 ， 用renderValue的值
             * format为variable,code为空，把format改为value， 用renderValue的值
             */
            if (!val) {
                val = renderValue
                format = 'value'
            }

            // 特殊处理兼容tab的active属性
            if (i === 'active' && componentType === 'bk-tab' && !modifiers.includes('sync')) {
                modifiers.push('sync')
            }

            let useCustomVariable = false
            let propVar = compId
            if (format !== 'value') {
                propVar = val
            // 自定义变量代替默认变量名称
            } else if (buildInVariableType === 'CUSTOM' && customVariableCode) {
                useCustomVariable = true
                propVar = customVariableCode
                val = customVariableCode
                code.handleUsedVariable('variable', val, `组件【${compId}】的【${i}】属性`)
            }

            const propName = format !== 'value' && modifiers && modifiers.length ? `${i}.${modifiers.join('.')}` : i
            const curPropStr = `${val === undefined ? '' : ':'}${propName}="${propVar}" `

            // 属性值类型不为value、绑定了变量或表达式
            if (format !== 'value') {
                code.handleUsedVariable(format, val, `组件【${compId}】的【${i}】属性`)
                propsStr += curPropStr
                continue
            // 处理封装的table组件的分页
            } else if (i === 'pagination' && ['widget-bk-table', 'widget-el-table'].includes(componentType)) {
                if (['local', 'remote'].includes(payload.type)) {
                    const paginationStr = Object
                        .keys(payload.val)
                        .reduce((acc, cur) => {
                            const item = payload.val[cur]
                            if (cur === 'count') {
                                let countVariableName = `${camelCase(compId, { transform: camelCaseTransformMerge })}Count`
                                if (item.buildInVariableType === 'CUSTOM') {
                                    code.handleUsedVariable('variable', item.customVariableCode, `组件【${compId}】的【${i}】属性`)
                                    countVariableName = item.customVariableCode
                                } else {
                                    code.dataTemplate(countVariableName, 0)
                                }
                                acc.push(`'${cur}': ${countVariableName}`)
                            } else if (item.format === 'value') {
                                acc.push(`'${cur}': ${item.val}`)
                            } else {
                                code.handleUsedVariable(item.format, item.code, `组件【${compId}】的【${i}】属性`)
                                acc.push(`'${cur}': ${item.code}`)
                            }
                            return acc
                        }, [])
                        .join(',')
                    propsStr += `:pagination="{ ${paginationStr} }" pagination-type="${payload.type}" `
                }
                propsStr += `data-value-type="${props.data.valueType}" `
                continue
            // 使用了远程函数
            } else if (type === 'remote' && payload.methodCode) {
                const curDir = dirProps.find((directive) => (directive.prop === i))
                const key = (curDir || {}).code || propVar
                code.remoteMethodsTemplate(key, payload || {})
                if (!curDir) {
                    !useCustomVariable && code.dataTemplate(propVar, JSON.stringify([]))
                    propsStr += curPropStr
                }
                continue
            // 使用了数据源类型
            } else if (type && ['data-source', 'table-data-source', 'select-data-source'].includes(type) && sourceData.tableName) {
                const curDir = dirProps.find((directive) => (directive.prop === i))
                const key = (curDir || {}).code || propVar
                code.dataSourceTemplate(key, sourceData || {})
                if (!curDir) {
                    !useCustomVariable && code.dataTemplate(propVar, JSON.stringify([]))
                    propsStr += curPropStr
                }
                continue
            // 类型为array或object、则写到data变量中
            } else if (type === 'array' || type === 'object' || typeof val === 'object') {
                if (componentType === 'widget-form' && i === 'rules') {
                    handleFormRules(code, propVar, val)
                } else {
                    !useCustomVariable && code.dataTemplate(propVar, JSON.stringify(val))
                }
                propsStr += curPropStr
                continue
            // 如果时函数、添加函数到页面中
            } else if (type === 'function') {
                const [method, params] = getMethodByCode(props[i].payload || {}, code.funcGroups)
                if (method.funcName && method.funcCode) {
                    if (method?.funcParams?.length > 0) {
                        propsStr += `:${propName}="(args) => ${method.funcName}(${code.getFuncParamStr(method, params, `属性【${i}】`)}, ...args)"`
                    } else {
                        propsStr += (`:${propName}="${method.funcName}" `)
                    }

                    code.addUsedFunc(method.funcCode)
                }
                continue
            // h5容器动画属性的特殊处理, 将数字转为字符串  3 => 3s
            } else if (['swiper-animate-duration', 'swiper-animate-delay'].includes(propName)) {
                const propValue = val.replace(/^((0\.)?\d+)s?$/, '$1')
                propsStr += ` ${propName}="${propValue}s"`
                continue
            } else if (i === 'active' && componentType === 'widget-tab') {
                code.dataTemplate(propVar, JSON.stringify(val))
                propsStr += `:active.sync="${propVar}"`
                continue
            } else {
                if (val !== undefined) {
                    const v = (typeof val === 'object' ? JSON.stringify(val).replace(/\"/g, '\'') : val)
                    propsStr += `${typeof val === 'string' ? '' : ':'}${propName}="${v}" `
                }
            }
        }
    }
    // 某些组件库组件的联动首先是靠增加vmodel实现的，需要程序自动生成
    const hasVModel = dirProps.filter(item => item.type === 'v-model').length
    if (type === 'bk-checkbox-group' && !hasVModel) {
        const checkedValue = (slots.default.code || []).filter(c => c.checked === true).map(c => c.value)
        code.dataTemplate(`${compId}Vmodel`, JSON.stringify(checkedValue))
        propsStr += `v-model="${compId}Vmodel"`
    }
    if (type === 'bk-radio-group' && !hasVModel) {
        const checkedItem = (slots.default.code || []).find(c => c.checked === true)
        const checkedValue = (checkedItem && checkedItem.value) || ''
        code.dataTemplate(`${compId}Vmodel`, `'${checkedValue}'`)
        propsStr += `v-model="${compId}Vmodel"`
    }
    // element组件、vant组件添加vmodel
    if (type.startsWith('el-') || type.startsWith('van')) {
        if (!hasVModel && modelComId !== '') {
            const valueType = typeof props['value'].code
            if (valueType !== 'array' && valueType !== 'object') {
                let vModelValue = props['value'].code.toString()
                if (valueType === 'string') vModelValue = `'${props['value'].code}'`
                code.dataTemplate(modelComId, vModelValue)
            }
            // 当value为变量时，v-model直接绑定相应的变量； 否则要绑定默认生成的变量
            propsStr += `v-model="${props['value'].format === 'variable' ? props['value'].code : modelComId}"`
        }
    }

    return propsStr
}

/**
 * @desc 表单容器的校验规则、需要特殊处理、在data中生成相应的变量或函数
 * @param { CodeModel } code
 * @param { String } propsVar 变量名称
 * @param { Object } val 变量值
 */
function handleFormRules (code, propVar, val) {
    // 这几个类型的key、值不为字符串
    const notStringType = ['required', 'validator', 'regex']
    const reg = /,$/gi
    let jsonStr = '{'
    try {
        if (typeof val === 'object' && Object.keys(val).length > 0) {
            // 遍历解析每一项表单项的校验规则、拼成jsonStr字符串
            for (const i in val) {
                jsonStr += `${i}: [`
                if (val[i] && val[i].length) {
                    // 配置了validator的，为自定义函数校验、需要把函数添加到页面中
                    const funcItems = val[i].filter(item => item.validator)

                    funcItems.map(item => {
                        const [method] = getMethodByCode({ methodCode: item.validator }, code.funcGroups)
                        if (method.funcCode) {
                            code.addUsedFunc(method.funcCode)
                        }
                        item.validator = `this.${item.validator}`
                    })
                    val[i].map(rule => {
                        jsonStr += '{'
                        for (const j in rule) {
                            if (notStringType.indexOf(j) === -1) {
                                jsonStr += `${j}: '${rule[j]}',`
                            } else {
                                if ((j === 'regex' || j === 'validator') && !rule[j]) {
                                    // 为空则忽略
                                } else if (j === 'regex' && (!rule[j].startsWith('/') || !rule[j].endsWith('/'))) {
                                    // 为空则忽略
                                } else {
                                    jsonStr += `${j}: ${rule[j]},`
                                }
                            }
                        }
                        jsonStr += '},'
                    })
                    jsonStr = jsonStr.replace(reg, '')
                }
                jsonStr += '],'
            }
            jsonStr = jsonStr.replace(reg, '')
            jsonStr += '}'
        } else {
            jsonStr = '{}'
        }
    } catch (err) {
        console.log(err, 'ruleError')
        jsonStr = '{}'
    }
    // 把生成的字符串放到data中
    code.dataTemplate(propVar, jsonStr)
}
