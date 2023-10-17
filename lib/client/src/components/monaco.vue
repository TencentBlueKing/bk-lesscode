<template>
    <section>
        <section class="monaco-head" v-if="showHeader">
            <span class="monaco-title">
                <slot name="title"></slot>
            </span>
            <span class="monaco-tools">
                <i v-if="!isFull" class="bk-drag-icon bk-drag-code-full-screen icon-style" @click="openFullScreen"></i>
                <i v-else class="bk-drag-icon bk-drag-un-full-screen icon-style" @click="exitFullScreen"></i>
                <slot name="tools"></slot>
            </span>
        </section>
        <section class="monaco-editor"
            :style="{
                height: `calc(${calcSize(renderHeight)} - 40px)`,
                width: calcSize(renderWidth),
                position: 'relative'
            }"
        ></section>
    </section>
</template>

<script>
    export default {
        props: {
            value: String,
            showHeader: {
                type: Boolean,
                default: true
            },
            language: {
                type: String,
                default: 'javascript'
            },
            width: {
                type: [String, Number],
                default: 'auto'
            },
            height: {
                type: [String, Number],
                default: 320
            },
            readOnly: {
                type: Boolean,
                default: false
            },
            options: {
                type: Object,
                default: () => ({})
            },
            // 函数提示， [{ label: 触发提示的字符串, documentation: 说明, insertText: 选择后写入函数中的字符串, kind: 类型 }]
            proposals: {
                type: Array,
                default: () => ([])
            },
            inlineProposals: {
                type: Array,
                default: () => ([])
            },
            // 编辑器代码异常信息
            modelMarkers: {
                type: Array,
                default: () => ([])
            },
            fullScreenEle: {
                type: HTMLDivElement
            }
        },

        data () {
            return {
                initWidth: this.width,
                initHeight: this.height,
                renderWidth: this.width,
                renderHeight: this.height,
                isFull: false,
                editor: {},
                proposalsRef: {},
                inlineProposalsRef: {}
            }
        },

        watch: {
            options: {
                handler (options) {
                    if (this.editor) {
                        this.editor.updateOptions(options)
                        this.editor.layout()
                    }
                },
                deep: true
            },
            // 语言切换后，.layout方法更新无效， 销毁重新渲染
            language (val) {
                if (this.editor) {
                    this.editor?.dispose?.()
                    this.proposalsRef?.dispose?.()
                    this.inlineProposalsRef?.dispose?.()
                    this.initMonaco()
                }
            },

            value (newValue) {
                if (this.editor) {
                    const value = this.editor.getValue()
                    if (newValue !== value) {
                        this.editor.setValue(newValue)
                    }
                }
            },

            width (newVal) {
                this.renderWidth = newVal
                this.initWidth = this.width
                this.$nextTick(() => {
                    this.resize()
                })
            },

            height (newVal) {
                this.renderHeight = newVal
                this.initHeight = this.height
                this.$nextTick(() => {
                    this.resize()
                })
            },

            modelMarkers () {
                this.setModelMarkers()
            }
        },

        mounted () {
            this.initMonaco()
            this.createDependencyProposals()

            // 全局监听事件
            const handleMonacoRejection = (event) => {
                if (event.reason && event.reason.name === 'Canceled') {
                    // monaco editor promise cancelation
                    event.preventDefault()
                }
            }
            const handleEsc = (event) => {
                if (event.code === 'Escape') {
                    this.exitFullScreen()
                }
            }
            window.addEventListener('unhandledrejection', handleMonacoRejection)
            window.addEventListener('keyup', handleEsc)
            // 销毁
            this.$once('hook:beforeDestroy', () => {
                window.removeEventListener('unhandledrejection', handleMonacoRejection)
                window.removeEventListener('keyup', handleEsc)

                setTimeout(() => {
                    this.editor?.dispose?.()
                    this.proposalsRef?.dispose?.()
                    this.inlineProposalsRef?.dispose?.()
                }, 200)
            })
        },

        methods: {
            calcSize (size) {
                const _size = size.toString()
                if (_size.match(/^[\d\.]*$/)) return `${size}px`
                else return _size
            },

            initMonaco () {
                const options = Object.assign({
                    value: this.value,
                    theme: 'vs-dark',
                    language: this.language,
                    fontSize: 14,
                    cursorBlinking: 'solid',
                    fixedOverflowWidgets: true,
                    automaticLayout: true,
                    readOnly: this.readOnly,
                    quickSuggestions: {
                        'other': true,
                        'comments': true,
                        'strings': true
                    },
                    minimap: {
                        enabled: false // 关闭小地图
                    },
                    scrollbar: {
                        alwaysConsumeMouseWheel: false
                    }
                }, this.options)

                const el = this.$el.querySelector('.monaco-editor')
                this.editor = monaco.editor.create(el, options, {
                    storageService: {
                        get () {},
                        getBoolean (key, index, value) {
                            if (key === 'expandSuggestionDocs') return true
                            else return value
                        },
                        store () {},
                        remove () {},
                        onWillSaveState () {},
                        onDidChangeStorage () {},
                        onDidChangeValue: () => () => {}
                    }
                })

                this.editor.onDidChangeModelContent(event => {
                    const value = this.editor.getValue()
                    if (this.value !== value) {
                        this.$emit('update:value', value)
                        this.$emit('change', value)
                    }
                })

                this.editor.onKeyDown((event) => {
                    if (event.keyCode === 13 || event.code === 'Enter') {
                        this.$emit('enter')
                    }
                })

                this.$nextTick(() => {
                    this.editor.setValue(this.value)
                    this.editor.getAction('editor.action.formatDocument').run()
                    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
                        noSemanticValidation: true,
                        noSyntaxValidation: true
                    })
                })
            },

            createDependencyProposals () {
                const self = this
                const getRange = (model, position) => {
                    const word = model.getWordUntilPosition(position)
                    const range = {
                        startLineNumber: position.lineNumber,
                        endLineNumber: position.lineNumber,
                        startColumn: word.startColumn,
                        endColumn: word.endColumn
                    }
                    return range
                }
                // 清除自带的提示
                monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
                    noSemanticValidation: true,
                    noSyntaxValidation: true
                })
                monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
                    noLib: true,
                    allowNonTsExtensions: true
                })
                this.proposalsRef = monaco.languages.registerCompletionItemProvider('javascript', {
                    provideCompletionItems (model, position) {
                        const range = getRange(model, position)
                        const suggestions = self.proposals.map((proposal) => ({
                            range,
                            ...proposal
                        }))
                        return {
                            suggestions
                        }
                    }
                })
                this.inlineProposalsRef = monaco.languages.registerInlineCompletionsProvider('javascript', {
                    freeInlineCompletions () {},
                    provideInlineCompletions (model, position) {
                        const range = getRange(model, position)
                        return {
                            items: self.inlineProposals.map(proposal => ({
                                range,
                                ...proposal
                            }))
                        }
                    }
                })
            },

            setModelMarkers () {
                const markers = this.modelMarkers?.map(err => ({
                    startLineNumber: err.line,
                    endLineNumber: err.endLine,
                    startColumn: err.column,
                    endColumn: err.endColumn,
                    message: `${err.message} (${err.ruleId})`,
                    severity: 8
                }))
                const model = this.editor.getModel()
                monaco.editor.setModelMarkers(model, 'ESLint', markers)
            },

            setPosition (position) {
                this.editor?.focus()
                this.editor?.setPosition(position)
            },

            exitFullScreen () {
                if (!this.isFull) return

                this.isFull = false
                const element = this.fullScreenEle || this.$el
                element.style.position = this.openFullScreen.originStyle.position
                element.style.top = this.openFullScreen.originStyle.top
                element.style.bottom = this.openFullScreen.originStyle.bottom
                element.style.left = this.openFullScreen.originStyle.left
                element.style.right = this.openFullScreen.originStyle.right
                element.style.zIndex = this.openFullScreen.originStyle.zIndex
                element.style.margin = this.openFullScreen.originStyle.margin
                element.style.height = this.openFullScreen.originStyle.height
                element.style.width = this.openFullScreen.originStyle.width
                this.$nextTick().then(() => {
                    this.renderWidth = this.initWidth
                    this.renderHeight = this.initHeight
                    this.editor.layout()
                    this.$emit('exitFullScreen')
                })
            },

            openFullScreen () {
                this.isFull = true
                const element = this.fullScreenEle || this.$el
                this.openFullScreen.originStyle = JSON.parse(JSON.stringify(element.style))
                element.style.position = 'fixed'
                element.style.top = '0'
                element.style.bottom = '0'
                element.style.left = '0'
                element.style.right = '0'
                element.style.zIndex = 100
                element.style.margin = '0px'
                element.style.height = `${window.innerHeight}px`
                element.style.width = `${window.innerWidth}px`
                this.renderWidth = window.innerWidth
                this.renderHeight = window.innerHeight
            },

            getMonaco () {
                return this.editor
            },

            focus () {
                this.editor.focus()
            },

            resize () {
                this.editor.layout()
            }
        }
    }
</script>

<style lang="postcss" scoped>
    .monaco-head {
        line-height: 40px;
        height: 40px;
        background-color: #2E2E2E;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .monaco-title {
            flex: 1;
        }
        .monaco-tools {
            display: flex;
            align-items: center;
        }
    }
    .icon-style {
        width: 16px;
        height: 16px;
        color: #c4c6cc;
        cursor: pointer;
        margin-right: 8px;
        font-size: 16px;
    }
</style>
