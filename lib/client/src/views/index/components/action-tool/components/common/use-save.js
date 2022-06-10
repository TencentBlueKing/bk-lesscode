import Vue from 'vue'
import { ref, computed, getCurrentInstance } from '@vue/composition-api'
import LC from '@/element-materials/core'
import { useStore } from '@/store'
import { useRoute } from '@/router'
import { BUILDIN_VARIABLE_TYPE_LIST } from 'shared/variable/constant'

const parseFuncBodyVariable = str => {
    const pat = /lesscode\['\$\{prop:([^}]+)\}'\]/g
    const res = {}
    let match = null
    while ((match = pat.exec(str)) !== null) {
        res[match[1]] = true
    }
    return res
}

const parseFuncBodyMethod = str => {
    const pat = /lesscode\['\$\{func:([^}]+)\}'\]/g
    const res = {}
    let match = null
    while ((match = pat.exec(str)) !== null) {
        res[match[1]] = true
    }
    return res
}

const checkValueConfig = rootNode => {
    const errorStack = []
    const formatMap = {
        'variable': '变量',
        'expression': '表达式'
    }
    // 检测选择了自定义变量但是没配置变量
    const checkCustomVariable = (data, componentId, name) => {
        if (data.buildInVariableType === BUILDIN_VARIABLE_TYPE_LIST[1].VAL && (!data.payload || !data.payload.customVariableCode)) {
            errorStack.push(`组件【${componentId}】的【${name}】的变量类型配置为【${BUILDIN_VARIABLE_TYPE_LIST[1].NAME}】但没有选择变量`)
        }
    }
    // 检测选择 remote 类型但是没选择函数
    const checkRemote = (data, componentId, name) => {
        // 兼容 methodCode 平铺的老数据
        let methodData = data?.payload?.methodData
        if (typeof methodData === 'string') {
            methodData = {
                methodCode: methodData
            }
        }
        if (data.valueType === 'remote' && !methodData.methodCode) {
            errorStack.push(`组件【${componentId}】的【${name}】的属性初始值来源配置为函数，但没有选择函数`)
        }
    }
    // 检查选择数据表，但是没选择表
    const checkDataSource = (data, componentId, name) => {
        if ([
            'data-source',
            'select-data-source',
            'table-data-source'
        ].includes(data.valueType) && (!data.payload || !data.payload.sourceData || !data.payload.sourceData.tableName)) {
            errorStack.push(`组件【${componentId}】的【${name}】的属性初始值来源配置为数据表，但没有选择数据表`)
        }
    }
    const recTree = node => {
        if (!node) {
            return
        }
    
        Object.keys(node.renderProps).forEach(propKey => {
            const prop = node.renderProps[propKey]
            // 检测format设置为变量或者表达式但是没配置值
            if (formatMap[prop.format] && prop.code === '') {
                errorStack.push(`组件【${node.componentId}】的属性 ${propKey} 配置为【${formatMap[prop.format]}】但没有设置具体值`)
            }
            checkCustomVariable(prop, node.componentId, propKey)
            checkRemote(prop, node.componentId, propKey)
            checkDataSource(prop, node.componentId, propKey)
        })
        const slotsMaterial = node.material?.slots || {}
        Object.keys(node.renderSlots).forEach(slotKey => {
            const slot = node.renderSlots[slotKey]
            const slotMaterial = slotsMaterial[slotKey] || {}
            if (!LC.isNode(slot)) {
                if (['variable', 'expression'].includes(slot.format)
                && slot.code === '') {
                    errorStack.push(`组件【${node.componentId}】的【${slotMaterial.displayName}】配置为【${formatMap[slot.format]}】但没有设置具体值`)
                }
                checkCustomVariable(slot, node.componentId, slotMaterial.displayName)
                checkRemote(slot, node.componentId, slotMaterial.displayName)
                checkDataSource(slot, node.componentId, slotMaterial.displayName)
            }
        })
        node.children.forEach(childNode => recTree(childNode))
    }
    recTree(rootNode)
    return errorStack
}

export default () => {
    const store = useStore()
    const route = useRoute()

    const isLoading = ref(false)
    const functionList = computed(() => store.getters['functions/functionList'])
    const variableList = computed(() => store.getters['variable/variableList'])
    const curTemplateData = computed(() => store.getters['drag/curTemplateData'])
    const pageDetail = computed(() => store.getters['page/pageDetail'])
    const versionId = computed(() => store.getters['projectVersion/currentVersionId'])

    const currentInstance = getCurrentInstance()

    const submit = () => {
        const valueConfigError = checkValueConfig(LC.getRoot())
        if (valueConfigError.length > 0) {
            const h = currentInstance.proxy.$createElement
            currentInstance.proxy.$bkMessage({
                theme: 'error',
                offsetY: 80,
                ellipsisLine: 0,
                message: h('div', {}, valueConfigError.map(errorText => h('div', errorText)))
            })
            return Promise.reject(new Error('数据不完整'))
        }
        const relatedCustomComponentMap = {}
        const relatedVariableCodeMap = {}
        const relatedMethodCodeMap = {}
        const buildInVariableMap = {}

        const recTree = node => {
            if (!node) {
                return
            }

            // 收集页面使用的自定义组件
            if (node.isCustomComponent) {
                relatedCustomComponentMap[node.type] = true
            }
            Object.keys(node.method).forEach(methodPathKey => {
                relatedMethodCodeMap[node.method[methodPathKey].code] = Object.assign(node.method[methodPathKey], {
                    componentId: node.componentId
                })
            })
            Object.keys(node.variable).forEach(variablePathKey => {
                const variable = node.variable[variablePathKey]
                const variableCode = variable.code
                if (!variableCode) {
                    return
                }
                // 一个变量可能被一个组件多次使用
                // 需要记录变量的每一处使用细节
                if (!relatedVariableCodeMap[variableCode]) {
                    relatedVariableCodeMap[variableCode] = []
                }
                relatedVariableCodeMap[variableCode].push(Object.assign(variable, {
                    componentId: node.componentId
                }))
                // 内置变量需要记录，然后更新该变量的默认值
                if (variable.type === 'buildIn') {
                    const renderKey = variable.source === 'prop' ? 'renderProps' : 'renderSlots'
                    const renderItem = node[renderKey][variable.key]
                    buildInVariableMap[variable.code] = renderItem.renderValue
                }
            })
            node.children.forEach(childNode => recTree(childNode))
        }
        // 遍历 node tree 收集组件中 variable、method 的引用信息
        recTree(LC.getRoot())

        // 收集生命周期中的函数
        Object.keys(pageDetail.value.lifeCycle).forEach((key) => {
            const value = pageDetail.value.lifeCycle[key]
            const methodCode = typeof value === 'object' ? value.methodCode : value
            if (methodCode) {
                relatedMethodCodeMap[methodCode] = methodCode
            }
        })

        const errorStack = []
        // 应用中所有变量，以 variableCode 作为索引 key
        const projectVarialbeCodeMap = variableList.value.reduce((result, variableData) => {
            result[variableData.variableCode] = variableData
            return result
        }, {})
        // 应用中所有函数，以 funcCode 作为索引 key
        const projectMethodCodeMap = functionList.value.reduce((result, methodData) => {
            result[methodData.funcCode] = methodData
            return result
        }, {})

        // 检测 varaible 有效性
        Object.keys(relatedVariableCodeMap).forEach(variableCode => {
            if (!projectVarialbeCodeMap.hasOwnProperty(variableCode)) {
                relatedVariableCodeMap[variableCode].forEach(record => {
                    errorStack.push(`组件【${record.componentId}】使用的变量【${variableCode}】不存在`)
                })
            }
        })

        // 检测 method 有效性
        // 解析被引用 method 的 funcBody 内使用的 method、variable
        Object.keys(relatedMethodCodeMap).forEach(methodCode => {
            if (!projectMethodCodeMap.hasOwnProperty(methodCode)) {
                const {
                    componentId,
                    source,
                    key
                } = relatedMethodCodeMap[methodCode]
                errorStack.push(`组件【${componentId}】的 ${source} ${key} 引用标识为【${methodCode}】的函数不存在`)
                return
            }
            const funcBodyContainontainMethodMap = {}
            const funcBodyContainontainVariableMap = {}
            const funcbody = projectMethodCodeMap[methodCode].funcBody
            // 使用的函数在检测变量时需要解析出 funcbody 引用的变量，并判断变量的有效性
            Object.assign(funcBodyContainontainMethodMap, parseFuncBodyMethod(funcbody))
            Object.assign(funcBodyContainontainVariableMap, parseFuncBodyVariable(funcbody))
            Object.keys(funcBodyContainontainVariableMap).forEach(variableCode => {
                if (!projectVarialbeCodeMap.hasOwnProperty(variableCode)) {
                    errorStack.push(`函数【${methodCode}】函数体中标识为【${variableCode}】的变量不存在`)
                }
            })
            Object.keys(funcBodyContainontainMethodMap).forEach(code => {
                if (!projectMethodCodeMap.hasOwnProperty(code)) {
                    errorStack.push(`函数【${methodCode}】函数体中标识为【${code}】的函数不存在`)
                }
            })
        })
        // 检测 variable 和 method 重名
        Object.keys(relatedVariableCodeMap).forEach(variableCode => {
            if (relatedMethodCodeMap[variableCode]) {
                errorStack.push(`页面中标识为【${variableCode}】的函数与标识为【${variableCode}】的变量存在冲突`)
            }
        })

        // 错误提示
        if (errorStack.length > 0) {
            const h = currentInstance.proxy.$createElement
            currentInstance.proxy.$bkMessage({
                theme: 'error',
                offsetY: 80,
                ellipsisLine: 0,
                message: h('div', {}, errorStack.map(errorText => h('div', errorText)))
            })
            return Promise.reject(new Error('数据不完整'))
        }

        // 转换 variableCode、methodCode 到具体的资源 id
        const relateVariableIdMap = Object.keys(relatedVariableCodeMap).reduce((result, variableCode) => {
            result[projectVarialbeCodeMap[variableCode].id] = relatedVariableCodeMap[variableCode]
            return result
        }, {})
        const releateMethodIdList = Object.keys(relatedMethodCodeMap).reduce((result, methodCode) => {
            result.push(projectMethodCodeMap[methodCode].id)
            return result
        }, [])

        // 页面模板数据
        const {
            layoutType,
            logo,
            siteName,
            theme,
            menuList = [],
            topMenuList = [],
            renderProps = {}
        } = curTemplateData.value

        const templateData = layoutType === 'empty' ? {} : {
            logo,
            siteName,
            theme,
            menuList,
            topMenuList,
            renderProps
        }

        // 关联自定义组件的id、versionId
        const customCompData = window.customCompontensPlugin.reduce((result, registerCallback) => {
            const [
                config,
                ,
                baseInfo
            ] = registerCallback(Vue)
            if (relatedCustomComponentMap[config.type]) {
                result.push({
                    compId: baseInfo.id,
                    versionId: baseInfo.versionId
                })
            }
            return result
        }, [])

        isLoading.value = true
        return Promise.all([
            store.dispatch('page/update', {
                data: {
                    from: '',
                    projectId: route.params.projectId,
                    pageCode: pageDetail.value.pageCode,
                    versionId: versionId.value,
                    pageData: {
                        id: parseInt(route.params.pageId),
                        content: JSON.stringify(LC.getRoot().toJSON().renderSlots.default)
                    },
                    customCompData: customCompData,
                    functionData: releateMethodIdList,
                    usedVariableMap: relateVariableIdMap,
                    templateData
                }
            }),
            store.dispatch('variable/updatePageBuildInVariable', {
                buildInVariableMap,
                projectId: route.params.projectId,
                pageCode: pageDetail.value.pageCode
            })
        ]).then(() => {
            currentInstance.proxy.messageSuccess('保存成功')
        }).finally(() => {
            isLoading.value = false
        })
    }

    return [
        isLoading,
        submit
    ]
}
