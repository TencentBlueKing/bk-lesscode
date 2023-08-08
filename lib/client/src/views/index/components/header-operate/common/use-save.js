import Vue from 'vue'
import { ref, computed, getCurrentInstance } from '@vue/composition-api'
import LC from '@/element-materials/core'
import { useStore } from '@/store'
import { useRoute } from '@/router'
import { BUILDIN_VARIABLE_TYPE_LIST } from 'shared/variable/constant'
import { isEmpty } from 'shared/util'

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
        'variable': window.i18n.t('变量'),
        'expression': window.i18n.t('表达式')
    }
    // 检测选择了自定义变量但是没配置变量
    const checkCustomVariable = (data, componentId, name) => {
        if (data.buildInVariableType === BUILDIN_VARIABLE_TYPE_LIST[1].VAL && (!data.payload || !data.payload.customVariableCode)) {
            errorStack.push(window.i18n.t('组件【{0}】的【{1}】的变量类型配置为【{2}】但没有选择变量', [componentId, window.i18n.t(name), window.i18n.t(BUILDIN_VARIABLE_TYPE_LIST[1].NAME)]))
        }
    }
    // 检测选择 remote 类型但是没选择函数
    const checkRemote = (data, componentId, name, componentType) => {
        // 兼容 methodCode 平铺的老数据
        let methodData = data?.payload?.methodData
        if (data?.payload?.methodCode) {
            methodData = {
                methodCode: data?.payload?.methodCode,
                params: data?.payload?.params
            }
        }
        if (data.valueType === 'remote' && !methodData?.methodCode && !['chart', 'bk-charts', 'bkflow'].includes(componentType)) {
            errorStack.push(window.i18n.t('组件【{0}】的【{1}】的属性初始值来源配置为函数，但没有选择函数', [componentId, window.i18n.t(name)]))
        }
        checkMethodParams(methodData?.params, componentId, '属性', name)
    }
    // 检查选择数据表，但是没选择表
    const checkDataSource = (data, componentId, name) => {
        if ([
            'data-source',
            'select-data-source',
            'table-data-source'
        ].includes(data.valueType) && (!data.payload || !data.payload.sourceData || !data.payload.sourceData.tableName)) {
            errorStack.push(window.i18n.t('组件【{0}】的【{1}】的属性初始值来源配置为数据表，但没有选择数据表', [componentId, window.i18n.t(name)]))
        }
    }
    // 检查 payload 的格式
    const checkPayload = (data, componentId, name) => {
        const payload = data.payload || {}
        // 检查 table pagination
        if (name === 'pagination' && data.format === 'value' && ['local', 'remote'].includes(payload.type)) {
            const paginationVal = payload.val || {}
            Object
                .keys(paginationVal)
                .forEach((key) => {
                    const val = paginationVal[key]
                    if (['variable', 'expression'].includes(val.format) && val.code === '') {
                        errorStack.push(window.i18n.t('组件【{0}】的【pagination】的【{1}】配置为变量或表达式，但没有选择变量或者填写表达式', [componentId, key]))
                    }
                    if ([BUILDIN_VARIABLE_TYPE_LIST[1].VAL].includes(val.buildInVariableType) && !val.customVariableCode) {
                        errorStack.push(window.i18n.t('组件【{0}】的【pagination】的【{1}】的变量类型配置为【{2}】但没有选择变量', [componentId, key, window.i18n.t(BUILDIN_VARIABLE_TYPE_LIST[1].NAME)]))
                    }
                })
        }
    }
    // 检查函数参数的格式是否正确
    const checkMethodParams = (params = [], componentId, type, key) => {
        params.forEach((param) => {
            if (['variable', 'expression'].includes(param.format) && isEmpty(param.code)) {
                errorStack.push(window.i18n.t('组件【{0}】的【{1}】的【{2}】的参数配置为【{3}】但没有设置具体值', [componentId, type, key, formatMap[param.format]]))
            }
        })
    }
    const recTree = node => {
        if (!node) {
            return
        }

        Object.keys(node.renderProps).forEach(propKey => {
            const prop = node.renderProps[propKey]
            // 检测format设置为变量或者表达式但是没配置值
            if (formatMap[prop.format] && prop.code === '') {
                errorStack.push(window.i18n.t('组件【{0}】的属性 {1} 配置为【{2}】但没有设置具体值', [node.componentId, propKey, formatMap[prop.format]]))
            }
            checkCustomVariable(prop, node.componentId, propKey)
            checkRemote(prop, node.componentId, propKey, node.type)
            checkDataSource(prop, node.componentId, propKey)
            checkPayload(prop, node.componentId, propKey)
        })
        const slotsMaterial = node.material?.slots || {}
        Object.keys(node.renderSlots).forEach(slotKey => {
            const slot = node.renderSlots[slotKey]
            const slotMaterial = slotsMaterial[slotKey] || {}
            if (!LC.isNode(slot)) {
                if (['variable', 'expression'].includes(slot?.format)
                && slot.code === '') {
                    errorStack.push(window.i18n.t('组件【{0}】的【{1}】配置为【{2}】但没有设置具体值', [node.componentId, window.i18n.t(slotMaterial.displayName), formatMap[slot.format]]))
                }
                checkCustomVariable(slot, node.componentId, slotMaterial.displayName)
                checkRemote(slot, node.componentId, slotMaterial.displayName)
                checkDataSource(slot, node.componentId, slotMaterial.displayName)
            }
        })
        Object.keys(node.renderEvents).forEach(eventKey => {
            const event = node.renderEvents[eventKey]
            if (event.enable) {
                if (isEmpty(event.methodCode)) {
                    errorStack.push(window.i18n.t('组件【{0}】的【事件】的【{1}】没有设置具体函数', [node.componentId, eventKey]))
                }
                checkMethodParams(event.params, node.componentId, window.i18n.t('事件'), eventKey)
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

    // 当前项目内所有 action 集合
    const projectPermActionList = computed(() => store.getters['iam/projectPermActionList'])

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
            return Promise.reject(new Error(window.i18n.t('数据不完整')))
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

        // 收集生命周期中的函数和变量
        Object.keys(pageDetail.value.lifeCycle).forEach((key) => {
            const value = pageDetail.value.lifeCycle[key]
            const methodData = typeof value === 'object' ? value : { methodCode: value }
            if (methodData.methodCode) {
                relatedMethodCodeMap[methodData.methodCode] = methodData.methodCode
            }
            methodData?.params?.forEach((param) => {
                if (param.format === 'variable' && param.code) {
                    if (!relatedVariableCodeMap[param.code]) {
                        relatedVariableCodeMap[param.code] = []
                    }
                    relatedVariableCodeMap[param.code].push({
                        source: 'lifecycle',
                        key,
                        code: param.code
                    })
                }
            })
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
                    errorStack.push(window.i18n.t('组件【{0}】使用的变量【{1}】不存在', [record.componentId, variableCode]))
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
                errorStack.push(window.i18n.t('组件【{0}】的 {1} {2} 引用标识为【{3}】的函数不存在', [componentId, source, key, methodCode]))
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
                    errorStack.push(window.i18n.t('函数【{0}】函数体中标识为【{1}】的变量不存在', [methodCode, variableCode]))
                }
            })
            Object.keys(funcBodyContainontainMethodMap).forEach(code => {
                if (!projectMethodCodeMap.hasOwnProperty(code)) {
                    errorStack.push(window.i18n.t('函数【{0}】函数体中标识为【{1}】的函数不存在', [methodCode, code]))
                }
            })
        })
        // 检测 variable 和 method 重名
        Object.keys(relatedVariableCodeMap).forEach(variableCode => {
            if (relatedMethodCodeMap[variableCode]) {
                errorStack.push(window.i18n.t('页面中标识为【{0}】的函数与标识为【{1}】的变量存在冲突', [variableCode, variableCode]))
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
            return Promise.reject(new Error(window.i18n.t('数据不完整')))
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
            themeConfig = {},
            menuList = [],
            topMenuList = [],
            renderProps = {}
        } = curTemplateData.value

        const templateData = layoutType === 'empty' ? {} : {
            logo,
            siteName,
            theme,
            themeConfig,
            menuList,
            topMenuList,
            renderProps,
            customMenuCon: LC.getNavCustomCon()?.renderSlots?.default || []
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

        const rootJSON = LC.getRoot().toJSON().renderSlots.default
        // 组装页面中所有配置了操作权限的数据，存入 iam_app_perm_action 表，便于"应用权限模型"表格统计页面组件引用
        const pageComponentPermActionMap = {}
        projectPermActionList.value.forEach(action => {
            pageComponentPermActionMap[action.id] = []
            rootJSON.forEach(component => {
                (component.renderPerms || []).forEach(act => {
                    if (action.id === act.id) {
                        pageComponentPermActionMap[action.id].push({
                            pageCode: pageDetail.value.pageCode,
                            componentId: component.componentId
                        })
                    }
                })
            })
        })

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
                        pageName: pageDetail.value.pageName,
                        content: JSON.stringify(rootJSON),
                        lifeCycle: JSON.stringify(pageDetail.value.lifeCycle || {}),
                        styleSetting: JSON.stringify(pageDetail.value.styleSetting || {})
                    },
                    customCompData: customCompData,
                    functionData: releateMethodIdList,
                    usedVariableMap: relateVariableIdMap,
                    templateData,
                    pageComponentPermActionMap
                }
            }),
            store.dispatch('variable/updatePageBuildInVariable', {
                buildInVariableMap,
                projectId: route.params.projectId,
                pageCode: pageDetail.value.pageCode
            })
        ]).then(async () => {
            currentInstance.proxy.messageSuccess(window.i18n.t('保存成功'))
            // 更新变量引用关系
            await store.dispatch('variable/getAllVariable', {
                projectId: route.params.projectId,
                pageCode: pageDetail.value.pageCode,
                versionId: versionId.value,
                effectiveRange: 0
            })
            // 画布资源保存后，不提示离开确定框
            LC.triggerEventListener('updateCanvas', false)
        }).finally(() => {
            isLoading.value = false
        })
    }

    return [
        isLoading,
        submit
    ]
}
