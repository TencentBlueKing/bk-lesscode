<template>
    <section>
        <AIBlueking
            ref="aiRef"
            :placeholder="$t('1. 键入“/”查看更多Prompt 2. 输入“{”唤起组件ID、数据表、函数、变量等列表进行选择')"
            :enable-cursor-popup="false"
            :is-show="isShowAi"
            :loading="loading"
            :messages="messages"
            :prompts="prompts"
            :enable-popup="false"
            @clear="handleClearMessage"
            @close="handleClose"
            @send="handleSend"
            @stop="handleStop"
            @change-prompt="handleChangePrompt"
        />
        <PageInfo
            :is-show.sync="isShowPageInfo"
            @choose="handleChoose"
        />
    </section>
</template>
<script>
    import { ref, onMounted } from 'vue'
    import { bkMessage } from 'bk-magic-vue'

    import AIBlueking, { RoleType, MessageStatus } from '@blueking/ai-blueking/vue2'
    import '@blueking/ai-blueking/dist/vue2/style.css'

    import { Ai } from '@/common/ai'
    import LC from '@/element-materials/core'
    import store from '@/store'

    import systemPrompt from './system-prompt.txt'
    import useComponent from './hooks/use-component'
    import useDataSource from './hooks/use-data-source'
    import useMethod from './hooks/use-method'
    import usePage from './hooks/use-page'
    import useIcon from './hooks/use-icon'

    import PageInfo from './children/page-info.vue'

    export default {
        components: {
            AIBlueking,
            PageInfo
        },

        emits: ['close'],
        props: { isShowAi: Boolean },
        setup (_, { emit }) {
            const aiRef = ref(null)
            const loading = ref(false)
            const currentMessage = ref({})
            const cmdMessage = ref('')
            const messages = ref([])
            const prompts = ref([])
            const isShowPageInfo = ref(false)
            let errorTime = 0

            const pushMessage = (role, content, status) => {
                const message = {
                    role,
                    content,
                    status
                }
                messages.value.push(message)
                return message
            }

            // 处理 ai 消息
            const handleMessage = (message, content) => {
                currentMessage.value.content = message
            }

            // 开始处理 ai 消息
            const handlerStart = () => {
                currentMessage.value.status = ''
                currentMessage.value.content = ''
                cmdMessage.value = ''
            }
            
            // 结束 ai 消息处理
            const handleEnd = () => {
                loading.value = false
                if (currentMessage.value.status === MessageStatus.Loading) {
                    currentMessage.value.status = MessageStatus.Error
                    currentMessage.value.content = '聊天内容已中断'
                    aiHelper.clearPrompt()
                }
                if (cmdMessage.value) {
                    loading.value = true
                    currentMessage.value = pushMessage(RoleType.Assistant, '正在努力生成中，请稍等', MessageStatus.Loading)
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
                currentMessage.value.content = message
                currentMessage.value.status = MessageStatus.Error
                loading.value = false
                aiHelper.clearPrompt()
            }

            // ai 指令异常
            const handleCmdError = (errorCmd, errorMessage) => {
                currentMessage.value.status = MessageStatus.Error
                errorTime += 1
                if (errorTime >= 2) {
                    pushMessage(RoleType.Assistant, 'AI 多次执行任务失败，请重新发布任务', MessageStatus.Error)
                    aiHelper.clearPrompt()
                    errorTime = 0
                    loading.value = false
                } else {
                    cmdMessage.value += [
                        '',
                        '# cmd',
                        `It looks like the execution of the ${errorCmd} commands failed. ${errorMessage} Please rethink and issue commands`
                    ].join('\n')
                    loading.value = true
                    currentMessage.value = pushMessage(RoleType.Assistant, '正在努力生成中，请稍等', MessageStatus.Loading)
                    aiHelper.chatStream(cmdMessage.value)
                }
            }

            // 清空会话
            const handleClearMessage = () => {
                messages.value = []
                loading.value = false
                aiHelper.clearPrompt()
                bkMessage({ theme: 'success', message: window.i18n.t('聊天记录清空成功'), limit: 1 })
                pushMessage(RoleType.System, 'Hi，我是小鲸，我可以帮你实现添加组件，函数生成等复杂功能，你可以尝试说帮我新增一个表格')
            }

            // 用户输入
            const handleSend = (args) => {
                if (loading.value) return

                // 记录输入的数据
                const userInput = args.prompt || args.content
                pushMessage(RoleType.User, userInput)

                if (/\{\{.+\}\}/.test(userInput)) {
                    // 包含变量就引导一下
                    const reg = /{{\s*([^}]*)\s*}}/g
                    const result = []
                    let match
                    while ((match = reg.exec(userInput)) !== null) {
                        result.push(match[1])
                    }
                    pushMessage(RoleType.Assistant, `请提供以下信息：${result.join('、')}`, '')
                    // 上下文携带完整对话
                    aiHelper.pushPrompt(userInput, 'user')
                    aiHelper.pushPrompt(`请提供以下信息：${result.join('、')}`, 'assistant')
                } else {
                    // 返回loading message
                    currentMessage.value = pushMessage(RoleType.Assistant, '正在努力生成中，请稍等', MessageStatus.Loading)
                    // 输入框loading状态
                    loading.value = true
                    aiHelper.chatStream(`help me solve this task:\n ${userInput}`)
                }
            }

            // 结束
            const handleDone = () => {
                currentMessage.value.status = MessageStatus.Success
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
                handleUseTemplate,
                handleGetTemplates
            } = usePage(cmdMessage)
            // 图标
            const {
                handleInsertIcon,
                handleGetIcons
            } = useIcon(cmdMessage)
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
                    useTemplate: handleUseTemplate,
                    getTemplates: handleGetTemplates
                },
                icon: {
                    insert: handleInsertIcon,
                    get: handleGetIcons
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

            // 暂停聊天
            const handleStop = () => {
                aiHelper.stop()
            }

            const handleClose = () => {
                emit('close')
            }

            const handleChangePrompt = (prompt) => {
                isShowPageInfo.value = prompt.endsWith('{')
            }

            const handleChoose = (val) => {
                const textareaElm = document.querySelector('.send-prompt-container textarea')
                const finalVal = textareaElm.value.slice(0, textareaElm.selectionStart - 1) + val + textareaElm.value.slice(textareaElm.selectionEnd)
                aiRef.value.setInputMessage(finalVal)
                textareaElm.focus()
            }

            // prompts
            const handleGetPrompts = () => {
                store.dispatch('ai/getPrompts', { search: '' }).then((res) => {
                    prompts.value = res.list.map(item => ({
                        id: item.id,
                        content: item.prompt
                    }))
                })
            }

            const handleInit = () => {
                pushMessage('ai', 'Hi，我是小鲸，我可以帮你实现添加组件，函数生成等复杂功能，你可以尝试说帮我新增一个表格')
                handleGetPrompts()
            }

            onMounted(handleInit)

            return {
                aiRef,
                loading,
                messages,
                prompts,
                isShowPageInfo,
                handleClearMessage,
                handleClose,
                handleStop,
                handleSend,
                handleChangePrompt,
                handleChoose
            }
        }
    }
</script>
<style>
.ai-modal {
    z-index: 99999 !important;
}
</style>
