<template>
    <section class="ai-content">
        <ul class="ai-messages">
            <render-message
                v-for="(message, index) in messages"
                :key="index.content"
                :message="message"
                class="ai-message"
            />
        </ul>

        <section
            class="ai-operation"
            v-bk-tooltips="{
                content: $t('内容正在执行中，请执行完成后再输入'),
                disabled: !isLoading
            }"
        >
            <send
                v-model="content"
                :is-show-ai="isShowAi"
                class="ai-send"
                @enter="handleUserInput"
            />
            <bk-button
                size="large"
                theme="primary"
                class="ai-operation-button"
                :disabled="isLoading || !content"
                @click="handleUserInput"
            >
                <i class="bk-drag-icon bk-drag-fasong"></i>
                {{ $t('发送') }}
            </bk-button>
        </section>
    </section>
</template>
<script>
    import {
        ref,
        onBeforeMount,
        nextTick
    } from '@vue/composition-api'
    import LC from '@/element-materials/core'
    import RenderMessage from './message.vue'
    import systemPrompt from './system-prompt.txt'
    import {
        Ai
    } from '@/common/ai'
    import { bkMessage } from 'bk-magic-vue'
    import Send from './send.vue'
    import useComponent from '../hooks/use-component'
    import useDataSource from '../hooks/use-data-source'
    import useMethod from '../hooks/use-method'
    import usePage from '../hooks/use-page'

    export default {
        components: {
            RenderMessage,
            Send
        },
        props: {
            isShowAi: Boolean
        },
        setup () {
            let currentMessage = ref({})
            const cmdMessage = ref('')
            let errorTime = 0
            const messages = ref([])
            const content = ref('')
            const isLoading = ref(false)

            const scrollToBottom = () => {
                nextTick(() => {
                    const container = document.querySelector('.ai-messages')
                    container.scrollTop = container.scrollHeight
                })
            }

            const pushMessage = (type, content, status) => {
                const message = {
                    type,
                    content,
                    status
                }
                messages.value.push(message)
                scrollToBottom()
                return message
            }

            // 处理 ai 消息
            const handleMessage = (message, content) => {
                currentMessage.content = message
                scrollToBottom()
            }

            // 开始处理 ai 消息
            const handlerStart = () => {
                currentMessage.content = ''
                cmdMessage.value = ''
            }
            
            // 结束 ai 消息处理
            const handleEnd = () => {
                if (currentMessage.status === 'loading') {
                    currentMessage.status = ''
                }
                isLoading.value = false
                if (cmdMessage.value) {
                    currentMessage = pushMessage('ai', '正在努力生成中，请稍等', 'loading')
                    aiHelper.chatStream(cmdMessage.value)
                }
            }
            
            // 执行 ai 指令
            const handleCmd = (cmdName, cmdString) => {
                console.log(cmdString, 'cmd')
                const context = {
                    cmdName,
                    ...cmd
                }
                const Fn = Function
                return new Fn('return Object.getPrototypeOf(async function(){}).constructor')()(
                    'context',
                    `
                        with (context) {
                            return (function() {
                                "use strict"
                                return ${cmdString}
                            })()
                        }
                    `
                )(context)
            }

            // 异常处理
            const handleApiError = (message) => {
                currentMessage.content = message
                currentMessage.status = 'error'
                isLoading.value = false
                aiHelper.clearPrompt()
            }

            // ai 指令异常
            const handleCmdError = (errorCmd, errorMessage) => {
                currentMessage.status = 'error'
                isLoading.value = false
                errorTime += 1
                if (errorTime >= 2) {
                    pushMessage('ai', 'AI 多次执行任务失败，请重新发布任务', 'error')
                    aiHelper.clearPrompt()
                    errorTime = 0
                    return
                }
                cmdMessage.value += [
                    '',
                    '# cmd',
                    `It looks like the execution of the ${errorCmd} commands failed. ${errorMessage} Please rethink and issue commands`
                ].join('\n')
                currentMessage = pushMessage('ai', '正在努力生成中，请稍等', 'loading')
                aiHelper.chatStream(cmdMessage.value)
            }

            // 清空会话
            const clearMessage = () => {
                messages.value = []
                isLoading.value = false
                aiHelper.clearPrompt()
                bkMessage({ theme: 'success', message: window.i18n.t('聊天记录清空成功'), limit: 1 })
                pushMessage('ai', 'Hi，我是小鲸，我可以帮你实现添加组件，函数生成等复杂功能，你可以尝试说帮我新增一个表格')
            }

            // 用户输入
            const handleUserInput = () => {
                if (isLoading.value) return

                // 记录输入的数据
                const userInput = content.value
                pushMessage('user', userInput)
                // 清除input
                content.value = ''

                if (/\{\{.+\}\}/.test(userInput)) {
                    // 包含变量就引导一下
                    const reg = /{{\s*([^}]*)\s*}}/g
                    const result = []
                    let match
                    while ((match = reg.exec(userInput)) !== null) {
                        result.push(match[1])
                    }
                    pushMessage('ai', `请提供以下信息：${result.join('、')}`, '')
                    // 上下文携带完整对话
                    aiHelper.pushPrompt(userInput, 'user')
                    aiHelper.pushPrompt(`请提供以下信息：${result.join('、')}`, 'system')
                } else {
                    // 返回loading message
                    currentMessage = pushMessage('ai', '正在努力生成中，请稍等', 'loading')
                    // 输入框loading状态
                    isLoading.value = true
                    aiHelper.chatStream(`help me solve this task:\n ${userInput}`)
                }
            }

            // 结束
            const handleDone = () => {
                currentMessage.status = 'success'
                aiHelper.clearPrompt()
                errorTime = 0
            }

            // 清除组件
            const handleClear = () => {
                const root = LC.getRoot()
                root.children.forEach(children => {
                    root.removeChild(children)
                })
                LC.triggerEventListener('reset')
                cmdMessage.value += [
                    '',
                    '# cmd',
                    'Successfully clear.',
                    'Have you finished the task? If so, call `done()`. Otherwise please continue.'
                ].join('\n')
            }
            // 组件
            const {
                handleSetProp,
                handleSetStyle,
                handleSetAlign,
                handleSetEvent,
                handleSetSlot,
                handleDelete,
                handleInsert,
                handleSelect,
                handleGetAll,
                handleGet,
                handleGetInfo,
                handleInsertComponentIntoComponent
            } = useComponent(cmdMessage)
            // 数据源
            const {
                handleDataSourceTable,
                handleDataSourceMethod
            } = useDataSource(cmdMessage)
            // 函数
            const {
                handleCreateOrUpdateFunction,
                handleGetFunctions
            } = useMethod(cmdMessage)
            // 页面
            const {
                handleGetTemplate,
                handleUpdatePageSetting
            } = usePage(cmdMessage)
            const cmd = {
                component: {
                    setProp: handleSetProp,
                    setStyle: handleSetStyle,
                    setEvent: handleSetEvent,
                    setSlot: handleSetSlot,
                    setAlign: handleSetAlign,
                    delete: handleDelete,
                    insert: handleInsert,
                    select: handleSelect,
                    all: handleGetAll,
                    get: handleGet,
                    getInfo: handleGetInfo,
                    insertComponentIntoComponent: handleInsertComponentIntoComponent
                },
                dataSource: {
                    table: handleDataSourceTable,
                    method: handleDataSourceMethod
                },
                method: {
                    createOrUpdate: handleCreateOrUpdateFunction,
                    get: handleGetFunctions
                },
                page: {
                    getTemplate: handleGetTemplate,
                    updatePageSetting: handleUpdatePageSetting
                },
                done: handleDone,
                clear: handleClear
            }

            const aiHelper = new Ai({
                handlerStart,
                handleEnd,
                handleCmd,
                handleMessage,
                handleApiError,
                handleCmdError,
                systemPrompt,
                needCmd: true,
                type: 'layout'
            })

            onBeforeMount(() => {
                pushMessage('ai', 'Hi，我是小鲸，我可以帮你实现添加组件，函数生成等复杂功能，你可以尝试说帮我新增一个表格')
            })

            return {
                messages,
                content,
                isLoading,
                handleUserInput,
                clearMessage
            }
        }
    }
</script>
<style lang="postcss" scoped>
    @import "@/css/mixins/scroller";
    .ai-content {
        flex: 1;
        height: calc(100% - 48px);
    }
    .ai-messages {
        height: calc(100% - 64px);
        overflow-y: auto;
        @mixin scroller;
        padding: 16px 16px 0 16px;
        .ai-message {
            margin-bottom: 16px;
        }
    }
    .ai-operation {
        background: #FFFFFF;
        padding: 12px;
        display: flex;
    }
    .ai-send {
        margin-right: 7px;
        width: calc(100% - 108px);
    }
    .ai-operation-button {
        padding: 0 3px 0 0 !important;
        min-width: 84px;
        font-size: 14px;
    }
</style>
