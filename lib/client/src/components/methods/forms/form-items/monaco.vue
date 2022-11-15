<template>
    <monaco
        :value="renderCode"
        :height="height"
        :proposals="proposals"
        ref="monaco"
        @change="change">
        <template v-slot:tools>
            <i class="bk-drag-icon bk-drag-info-tips icon-style" v-bk-tooltips="functionTips"></i>
            <i class="bk-drag-icon bk-drag-fix icon-style" @click="handleFixMethod" v-bk-tooltips="fixMethodTips"></i>
            <slot name="tools"></slot>
        </template>
    </monaco>
</template>

<script>
    import { camelCase, camelCaseTransformMerge } from 'change-case'
    import monaco from '@/components/monaco'
    import mixins from './form-item-mixins'
    import { mapActions } from 'vuex'
    import { FUNCTION_TIPS, FUNCTION_TYPE } from 'shared/function'
    import LC from '@/element-materials/core'
    import {
        determineShowPropInnerVariable,
        determineShowSlotInnerVariable
    } from 'shared/variable'
    import { BUILDIN_VARIABLE_TYPE_LIST } from 'shared/variable/constant'
    import { CustomError } from 'shared/custom-error'

    export default {
        components: {
            monaco
        },

        mixins: [mixins],

        props: {
            height: {
                type: [Number, String],
                default: 458
            },
            functionList: {
                type: Array,
                default: () => ([])
            },
            variableList: {
                type: Array,
                default: () => ([])
            },
            tips: {
                type: String
            },
            tipWidth: {
                type: Number
            }
        },

        data () {
            return {
                fixMethodTips: {
                    content: '自动修复 Eslint 格式问题',
                    appendTo: 'parent',
                    boundary: 'window',
                    theme: 'light',
                    placements: ['bottom-end']
                },
                multVal: {
                    ...FUNCTION_TIPS
                },
                proposals: [],
                renderCode: ''
            }
        },

        computed: {
            functionTips () {
                return {
                    content: `<pre class="function-tips">${this.tips || FUNCTION_TIPS[this.form.funcType]}</pre>`,
                    appendTo: 'parent',
                    boundary: 'window',
                    width: this.tipWidth || 750,
                    theme: 'light',
                    placements: ['bottom-end']
                }
            }
        },

        watch: {
            'form.funcBody' (val) {
                // 由于函数市场选择函数或者切换函数导致的函数体不一致，需要重置状态
                if (this.renderCode !== val) {
                    this.initMultVal()
                }
                this.initDefaultFunc()
            },
            'form.funcType' (type) {
                if (this.multVal[type] !== this.form.funcBody) {
                    this.change(this.multVal[type])
                }
                this.initDefaultFunc()
            },
            functionList () {
                this.initProposals()
            }
        },

        created () {
            this.initMultVal()
            this.initProposals()
        },

        methods: {
            ...mapActions('functions', ['fixFunByEslint']),

            initMultVal (func = this.form) {
                this.multVal = {
                    ...FUNCTION_TIPS,
                    [func.funcType]: func.funcBody
                }
                this.renderCode = this.multVal[this.form.funcType]
            },

            initDefaultFunc () {
                if (!this.form.id
                    && this.form.funcType === FUNCTION_TYPE.REMOTE
                    && this.form.funcBody === FUNCTION_TIPS[FUNCTION_TYPE.REMOTE]
                ) {
                    this.change(this.form.funcBody + 'return res\n')
                }
            },

            initProposals () {
                // 获取页面中使用到的函数和变量
                const relatedMethodCodeMap = {}
                const relatedVariableCodeMap = {}
                const recTree = node => {
                    if (!node) {
                        return
                    }
                    Object.keys(node.method).forEach(methodPathKey => {
                        const methodNode = node.method[methodPathKey]
                        if (!Reflect.has(relatedMethodCodeMap, methodNode.code)) {
                            relatedMethodCodeMap[methodNode.code] = []
                        }
                        relatedMethodCodeMap[methodNode.code].push({
                            ...methodNode,
                            componentId: node.componentId
                        })
                    })
                    Object.keys(node.variable).forEach(variablePathKey => {
                        const variableNode = node.variable[variablePathKey]
                        if (!Reflect.has(relatedVariableCodeMap, variableNode.code)) {
                            relatedVariableCodeMap[variableNode.code] = []
                        }
                        relatedVariableCodeMap[variableNode.code].push({
                            ...variableNode,
                            componentId: node.componentId
                        })
                    })
                    // 获取页面中自带的变量，可以配置远程函数和数据源的需要使用内置变量
                    const material = node.material
                    const renderProps = node.renderProps
                    const perVariableName = camelCase(node.componentId, { transform: camelCaseTransformMerge })
                    // 属性中需要展示内置变量
                    Object.keys(material.props || {}).forEach(propKey => {
                        const prop = material.props[propKey]
                        const renderProp = renderProps[propKey]
                        const needShowInnerVariable = determineShowPropInnerVariable(prop.type, propKey, node.type)
                        if (needShowInnerVariable && renderProp.buildInVariableType !== BUILDIN_VARIABLE_TYPE_LIST[1].VAL) {
                            const isChart = node.type === 'chart'
                            if (isChart) {
                                this.proposals.push({
                                    label: `lesscode.${node.componentId}.${propKey}`,
                                    kind: window.monaco.languages.CompletionItemKind.Property,
                                    documentation: `组件【${node.componentId}】的【${propKey}】属性的内置变量`,
                                    insertText: `this.${perVariableName}`
                                })
                            } else {
                                this.proposals.push({
                                    label: `lesscode.${node.componentId}.${propKey}`,
                                    kind: window.monaco.languages.CompletionItemKind.Property,
                                    documentation: `组件【${node.componentId}】的【${propKey}】属性的内置变量`,
                                    insertText: `this.${perVariableName}${camelCase(propKey, { transform: camelCaseTransformMerge })}`
                                })
                            }
                        }
                        if (propKey === 'pagination'
                            && ['remote', 'local'].includes(renderProp?.payload?.type)
                            && renderProp.payload.val.count.buildInVariableType !== BUILDIN_VARIABLE_TYPE_LIST[1].VAL
                        ) {
                            this.proposals.push({
                                label: `lesscode.${node.componentId}.${propKey}.count`,
                                kind: window.monaco.languages.CompletionItemKind.Property,
                                documentation: `组件【${node.componentId}】的【${propKey}.count】属性的内置变量`,
                                insertText: `this.${perVariableName}paginationCount`
                            })
                        }
                    })
                    // slots 中需要展示内置变量
                    const renderSlots = node.renderSlots
                    Object.keys(material.slots || {}).forEach(slotKey => {
                        const config = material.slots[slotKey]
                        const renderSlot = renderSlots[slotKey]
                        const needShowInnerVariable = determineShowSlotInnerVariable(config.type)
                        if (needShowInnerVariable && renderSlot.buildInVariableType !== BUILDIN_VARIABLE_TYPE_LIST[1].VAL) {
                            this.proposals.push({
                                label: `lesscode.${node.componentId}.${config.displayName}`,
                                kind: window.monaco.languages.CompletionItemKind.Property,
                                documentation: `组件【${node.componentId}】的【${config.displayName}】的内置变量`,
                                insertText: `this.${perVariableName}Slot${slotKey}`
                            })
                        }
                    })
                    node.children.forEach(childNode => recTree(childNode))
                }
                recTree(LC.getRoot())
                // 组装提示数据
                const sourceNameMap = {
                    prop: '属性',
                    event: '事件',
                    slot: '内容配置'
                }
                this.functionList.forEach((functionData) => {
                    const usageArray = relatedMethodCodeMap[functionData.funcCode] || []
                    let documentation = ''
                    // 函数简介
                    if (functionData.funcSummary) {
                        documentation = '函数简介：\n' + functionData.funcSummary + '\n'
                    }
                    // 函数使用情况
                    if (usageArray.length) {
                        documentation = '函数使用情况：\n' + documentation
                        usageArray.forEach((usage) => {
                            documentation += `组件ID【${usage.componentId}】的【${usage.key}】【${sourceNameMap[usage.source] || usage.source}】\n`
                        })
                    }
                    this.proposals.push({
                        label: `lesscode.${functionData.funcName}`,
                        kind: window.monaco.languages.CompletionItemKind.Function,
                        documentation,
                        insertText: `lesscode['\${func:${functionData.funcCode}}'](${(functionData.funcParams || []).join(', ')})`
                    })
                })
                this.variableList.forEach((variableData) => {
                    const usageArray = relatedVariableCodeMap[variableData.variableCode] || []
                    let documentation = ''
                    // 变量简介
                    if (variableData.description) {
                        documentation = '变量简介：\n' + variableData.description + '\n'
                    }
                    // 变量使用情况
                    if (usageArray.length) {
                        documentation = '变量使用情况：\n' + documentation
                        usageArray.forEach((usage) => {
                            documentation += `组件ID【${usage.componentId}】的【${usage.key}】【${sourceNameMap[usage.source] || usage.source}】\n`
                        })
                    }
                    this.proposals.push({
                        label: `lesscode.${variableData.variableCode}`,
                        kind: window.monaco.languages.CompletionItemKind.Property,
                        documentation,
                        insertText: `lesscode['\$\{prop:${variableData.variableCode}\}']`
                    })
                })
            },

            handleFixMethod () {
                this
                    .fixMethod()
                    .then(() => {
                        this.messageSuccess('函数修复成功')
                    })
                    .catch((err) => {
                        if (err?.code === 499) {
                            this.messageHtmlError(err.message || err)
                        } else if (err?.code === 501) {
                            this.messageWarn(err.message || err)
                        } else {
                            this.messageError(err.message || err)
                        }
                    })
            },

            fixMethod () {
                // 执行修复函数，只有当真正有修复的时候，才算修复成功
                return new Promise((resolve, reject) => {
                    this.fixFunByEslint(this.form).then((code) => {
                        if (code) {
                            this.change(code)
                            resolve()
                        } else {
                            reject(new CustomError(501, '暂无可修复内容'))
                        }
                    }).catch((err) => {
                        reject(err)
                    })
                })
            },

            change (funcBody) {
                this.multVal[this.form.funcType] = funcBody
                this.renderCode = funcBody
                this.updateValue({ funcBody })
                this.$emit('change', funcBody)
            }
        }
    }
</script>

<style lang="postcss" scoped>
    /deep/ .function-tips {
        margin: 0;
        line-height: 16px;
    }
</style>
