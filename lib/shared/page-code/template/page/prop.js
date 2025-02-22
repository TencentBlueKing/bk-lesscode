import { camelCase, camelCaseTransformMerge } from 'change-case'
import { getMethodByCode } from '../../common/utils'
import { sharedI18n, isLesscodeVarStr, getLesscodeVarCode } from '../../../util'

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
        propsStr += `table-name="${props.data?.payload?.sourceData?.tableName}" bk-data-source-type="${props.data?.payload?.sourceData?.dataSourceType}" third-part-d-b-name="${props.data?.payload?.sourceData?.thirdPartDBName}" :show-operation-column="${props.data?.payload?.sourceData?.showOperationColumn}" `
    }

    // 暂存属性key， 避免部分属性有些是驼峰有些是连字符
    const keyList = []
    for (const i in props) {
        if ((dirProps.find((directive) => (directive.prop === i)) && !['remote', 'data-source', 'table-data-source'].includes(props[i].valueType))
            || (['bk-checkbox-group', 'bk-radio-group'].includes(type) && ['value', 'modelValue'].includes(i) && props[i].format === 'value')) continue
        
        const keyId = camelCase(i, { transform: camelCaseTransformMerge })
        if (keyList.indexOf(keyId) > -1) {
            continue
        } else {
            keyList.push(keyId)
        }
        if (i !== 'slots' && i !== 'class') {
            compId = `${preCompId}${keyId}`
            if (i === 'value') modelComId = compId
            
            const { valueType: type, modifiers = [], renderValue, buildInVariableType, payload = {}, directive = '' } = props[i]
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
                code.handleUsedVariable('variable', val, `${sharedI18n().t('组件')}【${compId}】【${i}】${sharedI18n().t('属性')}`)
            }

            let propName = i
            if (format !== 'value' && modifiers?.length > 0) {
                propName = `${i}.${modifiers.join('.')}`
            }
            // 设置了directive指令
            if (directive) {
                if (code.framework === 'vue3') {
                    propName = `${directive}:${i}`
                } else {
                    propName = `${directive}`
                }
            }
            const curPropStr = `${val === undefined || directive ? '' : ':'}${propName}="${propVar}" `

            // 属性值类型不为value、绑定了变量或表达式
            if (format !== 'value') {
                code.handleUsedVariable(format, val, `${sharedI18n().t('组件')}【${compId}】【${i}】${sharedI18n().t('属性')}`)
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
                                    code.handleUsedVariable('variable', item.customVariableCode, `${sharedI18n().t('组件')}【${compId}】【${i}】${sharedI18n().t('属性')}`)
                                    countVariableName = item.customVariableCode
                                } else {
                                    code.dataTemplate(countVariableName, 0)
                                }
                                acc.push(`'${cur}': ${countVariableName}`)
                            } else if (item.format === 'value') {
                                acc.push(`'${cur}': ${item.val}`)
                            } else {
                                code.handleUsedVariable(item.format, item.code, `${sharedI18n().t('组件')}【${compId}】【${i}】${sharedI18n().t('属性')}`)
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
                // chart的remoteoption不需要
                if (!(componentType === 'chart' && key?.endsWith('remoteOptions'))) {
                    code.remoteMethodsTemplate(key, payload || {})
                }
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
            } else if (type === 'array' || type === 'object' || typeof val === 'object' || directive) {
                if (componentType === 'widget-form' && i === 'rules') {
                    handleFormRules(code, propVar, val)
                } else {
                    !useCustomVariable && code.dataTemplate(propVar, JSON.stringify(val))

                    // 表单容器里的字段默认值可能使用变量
                    if (componentType === 'widget-form-container' && i === 'fields') {
                        const { code: fieldList } = props[i]
                        const globalVarsProp = []
        
                        fieldList.forEach(field => {
                            if (isLesscodeVarStr(field.configure.value)) {
                                const varCode = getLesscodeVarCode(field.configure.value)
                                if (varCode) {
                                    globalVarsProp.push(`'bk_lesscode_${varCode}': ${varCode}`)
                                    code.handleUsedVariable('variable', varCode, `${sharedI18n().t('表单容器')}【${compId}】${sharedI18n().t('字段')}【${field.configure.name}】${sharedI18n().t('默认值')}`)
                                }
                            }
                        })
                        propsStr += `:globalVars="{${globalVarsProp.join(',')}}"`
                    }
                }
                propsStr += curPropStr
                continue
            // 如果时函数、添加函数到页面中
            } else if (type === 'function') {
                const [method, params] = getMethodByCode(props[i].payload || {}, code.funcGroups)
                if (method.funcName && method.funcCode) {
                    if (method?.funcParams?.length > 0) {
                        propsStr += `:${propName}="(...args) => ${method.funcName}(${code.getFuncParamStr(method, params, `${sharedI18n().t('属性')}【${i}】`)}, ...args)"`
                    } else {
                        propsStr += (`:${propName}="${method.funcName}" `)
                    }

                    code.addUsedFunc(method.funcCode)
                }
                continue
            // h5容器动画属性的特殊处理, 将数字转为字符串  3 => 3s
            } else if (['swiper-animate-duration', 'swiper-animate-delay', 'swiper-animate-effect'].includes(propName)) {
                switch (propName) {
                    case 'swiper-animate-effect':
                        propsStr += ` data-${propName}="animate__${val}"`
                        break
                    default:
                        const propValue = val.replace(/^((0\.)?\d+)s?$/, '$1')
                        propsStr += ` data-${propName}="${propValue}s"`
                        break
                }
                continue
            } else if (i === 'active' && componentType === 'widget-tab' && code.framework !== 'vue3') {
                code.dataTemplate(propVar, JSON.stringify(val))
                propsStr += `:active.sync="${propVar}"`
                continue
            } else if (i === 'rate' && componentType === 'bk-rate' && code.framework !== 'vue3') {
                code.dataTemplate(propVar, val)
                propsStr += `:rate.sync="${propVar}"`
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
    // 绑定值格式是value
    const isModelTypeVal = props.value?.format || props.modelValue?.format
    if (type === 'bk-checkbox-group' && !hasVModel && isModelTypeVal === 'value') {
        const propVal = props.value?.code || props.modelValue?.code
        const checkedItem = (slots.default.code || []).filter(c => c.checked === true).map(c => c.value)
        const checkedValue = checkedItem?.length ? checkedItem : propVal
        code.dataTemplate(`${compId}Vmodel`, JSON.stringify(checkedValue))
        propsStr += `v-model="${compId}Vmodel"`
    }
    if (type === 'bk-radio-group' && !hasVModel && isModelTypeVal === 'value') {
        const propVal = props.value?.renderValue || props.modelValue?.renderValue
        const checkedItem = (slots.default.code || []).find(c => c.checked === true)
        const checkedValue = (checkedItem && checkedItem.value) || propVal || ''
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
