<template>
    <bk-resize-layout
        class="function-monaco"
        placement="bottom"
        :initial-divide="showDebugPanel ? '35%' : '0'"
        :border="false"
        :style="{
            height: height + 'px'
        }"
    >
        <section slot="aside" class="function-debug" v-if="showDebug">
            <debug-header
                v-model="renderDebug"
                :panels="computedPanels"
            />
            <debug-output
                v-show="renderDebug === 'DebugOutput'"
                class="debug-main"
                :outputs="outputs"
            />
            <debug-param
                v-show="renderDebug === 'DebugParam'"
                class="debug-main"
                :params="params"
                @param-change="handleParamChange"
            />
            <debug-problem
                v-show="renderDebug === 'DebugProblem'"
                class="debug-main"
                :problems="problems"
                @show-problem="handleShowProblem"
            />
            <bk-button
                theme="primary"
                class="debug-button"
                :loading="isDebuging"
                @click="handleDebug"
            >{{ showDebugPanel ? $t('执行调试') : $t('打开调试控制台') }}</bk-button>
            <i class="bk-drag-icon bk-drag-close-line" @click="handleCloseDebug"></i>
        </section>
        <monaco
            :value="renderCode"
            :height="height"
            :proposals="proposals"
            :model-markers="problems"
            :full-screen-ele="$el"
            ref="monaco"
            slot="main"
            @change="change">
            <span
                slot="title"
                class="monaco-title"
            >{{ $t('JS 编辑器') }}</span>
            <template v-slot:tools>
                <i class="bk-drag-icon bk-drag-info-tips icon-style" v-bk-tooltips="functionTips"></i>
                <i class="bk-drag-icon bk-drag-fix icon-style" @click="handleFixMethod" v-bk-tooltips="fixMethodTips"></i>
                <slot name="tools"></slot>
            </template>
        </monaco>
    </bk-resize-layout>
</template>

<script>
    import { camelCase, camelCaseTransformMerge } from 'change-case'
    import Monaco from '@/components/monaco'
    import DebugHeader from './children/debug/header.vue'
    import DebugOutput from './children/debug/output.vue'
    import DebugParam from './children/debug/param.vue'
    import DebugProblem from './children/debug/problem.vue'
    import mixins from './form-item-mixins'
    import { mapActions } from 'vuex'
    import LC from '@/element-materials/core'
    import {
        FUNCTION_TIPS,
        FUNCTION_TYPE,
        evalWithSandBox
    } from 'shared/function'
    import {
        BUILDIN_VARIABLE_TYPE_LIST,
        determineShowPropInnerVariable,
        determineShowSlotInnerVariable
    } from 'shared/variable'
    import {
        CustomError
    } from 'shared/custom-error'
    import {
        debounce,
        isEmpty
    } from 'shared/util'

    export default {
        components: {
            Monaco,
            DebugHeader,
            DebugOutput,
            DebugParam,
            DebugProblem
        },

        mixins: [mixins],

        props: {
            height: {
                type: [Number, String],
                default: 600
            },
            functionList: {
                type: Array,
                default: () => ([])
            },
            variableList: {
                type: Array,
                default: () => ([])
            },
            apiList: {
                type: Array,
                default: () => ([])
            },
            tips: {
                type: String
            },
            tipWidth: {
                type: Number
            },
            showDebug: {
                type: Boolean,
                default: true
            }
        },

        data () {
            return {
                fixMethodTips: {
                    content: this.$t('自动修复 ESLint 格式问题'),
                    appendTo: 'parent',
                    boundary: 'window',
                    theme: 'light',
                    placements: ['bottom-end']
                },
                multVal: {
                    ...FUNCTION_TIPS()
                },
                proposals: [],
                renderCode: '',
                renderDebug: 'DebugOutput',
                outputs: [],
                problems: [],
                params: [],
                showDebugPanel: false,
                isDebuging: false
            }
        },

        computed: {
            functionTips () {
                return {
                    content: `<pre class="function-tips">${this.tips || FUNCTION_TIPS()[this.form.funcType]}</pre>`,
                    appendTo: 'parent',
                    boundary: 'window',
                    width: this.tipWidth || 750,
                    theme: 'light',
                    placements: ['bottom-end'],
                    allowHtml: true
                }
            },
            computedPanels () {
                return [
                    { name: 'DebugOutput', label: this.$t('调试结果') },
                    { name: 'DebugParam', label: this.$t('参数设置'), count: this.params.length, tips: this.$t('参数设置后需重新执行方可生效') },
                    { name: 'DebugProblem', label: this.$t('问题'), count: this.problems.length, isError: true, tips: this.$t('点击右上角') + '<i class="bk-drag-icon bk-drag-fix" />' + this.$t('图标自动修复 ESLint 问题') }
                ]
            }
        },

        watch: {
            'form.funcBody' (val) {
                // 由于函数市场选择函数或者切换函数导致的函数体不一致，需要重置状态
                if (this.renderCode !== val) {
                    this.initMultVal()
                }
                this.initDefaultFunc()
                // 函数内容变化的时候，检查函数内容
                this.debounceCheckEslint(val)
            },
            'form.funcType' (type) {
                if (this.multVal[type] !== this.form.funcBody) {
                    this.change(this.multVal[type])
                }
                this.initDefaultFunc()
            },
            functionList () {
                this.initProposals()
            },
            'form.funcParams': {
                handler (val, oldVal) {
                    if (JSON.stringify(val) !== JSON.stringify(oldVal)) {
                        this.params = val.map((key) => {
                            const param = this.params.find(param => param.key === key)
                            return {
                                key,
                                value: param?.value || '',
                                format: 'value'
                            }
                        })
                    }
                },
                immediate: true
            },
            'form.id' () {
                this.outputs = []
                this.params = this.form.funcParams.map((key) => ({ key, value: '', format: 'value' }))
            }
        },

        created () {
            this.initMultVal()
            this.initProposals()
            this.debounceCheckEslint = debounce(this.checkEslint, 500)
        },

        methods: {
            ...mapActions('functions', ['fixFunByEslint']),

            initMultVal (func = this.form) {
                this.multVal = {
                    ...FUNCTION_TIPS(),
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
                this.proposals = []
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
                                    documentation: this.$t('组件【{0}】的【{1}】属性的内置变量', [node.componentId, propKey]),
                                    insertText: `this.${perVariableName}`
                                })
                            } else {
                                this.proposals.push({
                                    label: `lesscode.${node.componentId}.${propKey}`,
                                    kind: window.monaco.languages.CompletionItemKind.Property,
                                    documentation: this.$t('组件【{0}】的【{1}】属性的内置变量', [node.componentId, propKey]),
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
                                documentation: this.$t('组件【{0}】的【{1}.count】属性的内置变量', [node.componentId, propKey]),
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
                                documentation: this.$t('组件【{0}】的【{1}】的内置变量', [node.componentId, config.displayName]),
                                insertText: `this.${perVariableName}Slot${slotKey}`
                            })
                        }
                    })
                    node.children.forEach(childNode => recTree(childNode))
                }
                recTree(LC.getRoot())
                // 组装提示数据
                const sourceNameMap = {
                    prop: this.$t('属性'),
                    event: this.$t('事件'),
                    slot: this.$t('内容配置')
                }
                this.functionList.forEach((functionData) => {
                    const usageArray = relatedMethodCodeMap[functionData.funcCode] || []
                    let documentation = ''
                    // 函数简介
                    if (functionData.funcSummary) {
                        documentation = this.$t('函数简介：') + '\n' + functionData.funcSummary + '\n'
                    }
                    // 函数使用情况
                    if (usageArray.length) {
                        documentation = this.$t('函数使用情况：') + '\n' + documentation
                        usageArray.forEach((usage) => {
                            documentation += this.$t('组件ID【{0}】的【{1}】', [usage.componentId, usage.key])`【${sourceNameMap[usage.source] || usage.source}】\n`
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
                        documentation = this.$t('变量简介：') + '\n' + variableData.description + '\n'
                    }
                    // 变量使用情况
                    if (usageArray.length) {
                        documentation = this.$t('变量使用情况：') + '\n' + documentation
                        usageArray.forEach((usage) => {
                            documentation += `${this.$t('组件ID【{0}】的【{1}】', [usage.componentId, usage.key])}【${sourceNameMap[usage.source] || usage.source}】\n`
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
                        this.messageSuccess(this.$t('函数修复成功'))
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
                            reject(new CustomError(501, this.$t('暂无可修复内容')))
                        }
                    }).catch((err) => {
                        reject(err)
                    })
                })
            },

            checkEslint (funcBody) {
                this
                    .$store
                    .dispatch(
                        'functions/checkEslint',
                        {
                            ...this.form,
                            funcBody
                        }
                    )
                    .then((res) => {
                        this.problems = res.data
                    })
            },

            change (funcBody) {
                this.multVal[this.form.funcType] = funcBody
                this.renderCode = funcBody
                this.updateValue({ funcBody })
                this.$emit('change', funcBody)
            },

            handleParamChange (val) {
                this.params = val
            },

            handleShowProblem (problem) {
                this.$refs.monaco.setPosition({
                    lineNumber: problem.line,
                    column: problem.column
                })
            },

            handleCloseDebug () {
                this.showDebugPanel = false
            },

            async handleDebug () {
                // 打开调试面板
                if (!this.showDebugPanel) {
                    this.showDebugPanel = true
                    return
                }
                if (isEmpty(this.form.funcName)) {
                    this.messageError(this.$t('函数名称不能为空'))
                    return
                }
                this.renderDebug = 'DebugOutput'
                this.outputs = []
                this.isDebuging = true
                // 收集方法
                const collectOutput = (type, content) => {
                    const iconMap = {
                        info: 'bk-icon icon-angle-right-line',
                        output: 'bk-icon icon-angle-left-line',
                        error: 'bk-icon icon-close-circle-shape error'
                    }
                    this.outputs.push({
                        icon: iconMap[type],
                        content
                    })
                }
                try {
                    // 构造函数列表
                    const functionList = this.functionList.map((item) => {
                        // 由于函数间存在互相引用的场景，需要更新为当前编辑的内容进行调试
                        if (item.funcCode === this.form.funcCode) {
                            return {
                                ...this.form
                            }
                        }
                        return {
                            ...item
                        }
                    })
                    // 新增函数需要单独加到列表里面
                    if (!this.form.id) {
                        functionList.push({
                            ...this.form
                        })
                    }
                    // 获取 api
                    const apiList = await this.$store.dispatch('api/getApiList')
                    const content = await evalWithSandBox(
                        this.form.funcCode,
                        this.params,
                        functionList,
                        this.variableList,
                        apiList,
                        {
                            $store: this.$store,
                            $http: this.$http,
                            console: {
                                log (...args) {
                                    console.log(...args)
                                    // 收集打印信息
                                    collectOutput('info', args)
                                },
                                warn (...args) {
                                    console.warn(...args)
                                    // 收集打印信息
                                    collectOutput('info', args)
                                },
                                error (...args) {
                                    console.error(...args)
                                    // 收集打印信息
                                    collectOutput('error', args)
                                }
                            }
                        }
                    )
                    // 收集返回值
                    collectOutput('output', content || 'undefined')
                } catch (error) {
                    // 收集错误信息
                    collectOutput('error', error.message || error)
                } finally {
                    this.isDebuging = false
                }
            }
        }
    }
</script>

<style lang="postcss" scoped>
    @import "@/css/mixins/scroller";

    /deep/ .function-tips {
        margin: 0;
        line-height: 16px;
    }
    .function-monaco {
        overflow: hidden;
        font-size: 12px;
        .function-debug {
            height: 100%;
            position: relative;
        }
        .debug-main {
            @mixin scroller;
            height: calc(100% - 40px);
            overflow: auto;
        }
        .debug-button {
            position: absolute;
            left: 16px;
            top: -48px;
        }
        .bk-drag-close-line {
            position: absolute;
            right: 15.62px;
            top: 15.62px;
            color: #c4c6cc;
            cursor: pointer;
        }
        .monaco-title {
            font-size: 14px;
            color: #C4C6CC;
            padding-left: 25px;
        }
        /deep/ .bk-resize-layout-main {
            position: absolute;
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;
            >section {
                height: 100%;
            }
        }
        /deep/ .bk-resize-layout-aside {
            background: #212121;
            z-index: 10;
            border-top: none;
        }
        /deep/ .bk-resize-layout-aside-content {
            overflow-x: visible !important;
            overflow-y: visible;
        }
    }
</style>
