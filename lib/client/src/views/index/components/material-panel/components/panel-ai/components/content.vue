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
            <bk-input
                size="large"
                class="ai-operation-input"
                :disabled="isLoading"
                v-model="content"
                @enter="handleUserInput"
            ></bk-input>
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
    import {
        isEmpty
    } from 'shared/util'
    import {
        getDefaultFunction
    } from 'shared/function'
    import RenderMessage from './message.vue'
    import systemPrompt from './system-prompt.txt'
    import {
        Ai
    } from '@/common/ai'
    import store from '@/store'
    import vue2Materials from '@/element-materials/materials/vue2'
    import vue3Materials from '@/element-materials/materials/vue3'

    export default {
        components: {
            RenderMessage
        },

        setup () {
            let currentMessage = ref({})
            let cmdMessage = ''
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

            // 获取当前操作的节点
            const getNode = (id) => {
                return isEmpty(id) ? LC.getRoot() : LC.getNodeById(id)
            }

            // 处理 ai 消息
            const handleMessage = (message, content) => {
                currentMessage.content = message
                scrollToBottom()
            }

            // 开始处理 ai 消息
            const handlerStart = () => {
                currentMessage.content = ''
                cmdMessage = ''
            }
            
            // 结束 ai 消息处理
            const handleEnd = () => {
                isLoading.value = false
                currentMessage.status = 'success'
                if (cmdMessage) {
                    currentMessage = pushMessage('ai', '正在努力生成中，请稍等', 'loading')
                    aiHelper.chat(cmdMessage)
                }
            }
            
            // 执行 ai 指令
            const handleCmd = (cmdName, cmdString) => {
                console.log(cmdString, 'cmd')
                const context = {
                    cmdName,
                    ...cmd
                }

                Function.constructor(
                    'context',
                    `
                        with (context) {
                            return (function() {
                                "use strict"
                                ${cmdString}
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

            const handleCmdError = (errorCmd) => {
                currentMessage.status = 'error'
                isLoading.value = false
                errorTime += 1
                if (errorTime >= 2) {
                    pushMessage('ai', 'AI 多次执行任务失败，请重新发布任务', 'error')
                    aiHelper.clearPrompt()
                    errorTime = 0
                    return
                }
                cmdMessage += [
                    '',
                    '# cmd',
                    `It looks like the execution of the ${errorCmd} commands failed. Please rethink and issue commands`
                ].join('\n')
                currentMessage = pushMessage('ai', '正在努力生成中，请稍等', 'loading')
                aiHelper.chat(cmdMessage)
            }

            const clearMessage = () => {
                messages.value = []
                isLoading.value = false
                aiHelper.clearPrompt()
                pushMessage('ai', 'Hi，我是小鲸，我可以帮你实现添加组件，函数生成等复杂功能，你可以尝试说帮我新增一个表格')
            }

            const handleUserInput = () => {
                // 记录输入的数据
                const userInput = content.value
                pushMessage('user', userInput)
                // 清除input
                content.value = ''
                // 返回loading message
                currentMessage = pushMessage('ai', '正在努力生成中，请稍等', 'loading')
                // 输入框loading状态
                isLoading.value = true
                aiHelper.chat(`help me solve this task:\n ${userInput}`)
            }

            // ai 指令
            const handleSetProp = (componentId, prop, value) => {
                const node = getNode(componentId)
                if (!node.renderProps[prop]) {
                    cmdMessage += [
                        '',
                        '# cmd',
                        `Updating the ${prop} prop of the component failed. The component "${componentId}" does not have ${prop} attribute. please rethink and issue commands`,
                        'Note: you can use `component.getInfo("<componentId>")` to get the configuration information of a component.'
                    ].join('\n')
                    return
                }
                node.setRenderProps({
                    ...node.renderProps,
                    [prop]: {
                        ...node.renderProps[prop],
                        format: 'value',
                        code: value,
                        renderValue: value
                    }
                })
                cmdMessage += [
                    '',
                    '# cmd',
                    'The prop has been successfully set.',
                    'Have you finished the task? If so, call `done()`. Otherwise please continue."'
                ].join('\n')
            }
            const handleSetStyle = (componentId, style, value) => {
                const node = getNode(componentId)
                node.setRenderStyles({
                    ...node.renderStyles,
                    [style]: value
                })
                cmdMessage += [
                    '',
                    '# cmd',
                    'The style has been successfully set.',
                    'Have you finished the task? If so, call `done()`. Otherwise please continue."'
                ].join('\n')
            }
            const handleSetEvent = (componentId, event, funcName, funcBody) => {
                // 生成函数
                if (funcBody && funcName) {
                    const firstFunction = store.getters['functions/functionList'][0]
                    const functionData = getDefaultFunction({
                        funcName,
                        funcCode: funcName,
                        funcBody,
                        projectId: firstFunction.projectId,
                        funcGroupId: firstFunction.funcGroupId
                    })
                    store.dispatch('functions/fixFunByEslint', functionData).then((code) => {
                        store.dispatch('functions/createFunction', {
                            ...functionData,
                            funcBody: code || funcBody
                        }).then(() => {
                            store.dispatch('functions/getAllGroupAndFunction', {
                                projectId: firstFunction.projectId,
                                versionId: firstFunction.versionId
                            }).then((functionData) => {
                                store.commit('functions/setFunctionData', functionData)
                            })
                        })
                    })
                }

                if (funcName) {
                    // 修改event
                    const node = getNode(componentId)
                    node.setRenderEvents({
                        ...node.renderEvents,
                        [event]: {
                            enable: true,
                            methodCode: funcName,
                            params: []
                        }
                    })
                    cmdMessage += [
                        '',
                        '# cmd',
                        'The event has been successfully set.',
                        'Have you finished the task? If so, call `done()`. Otherwise please continue."'
                    ].join('\n')
                }
            }
            const handleDelete = (componentId) => {
                const node = getNode(componentId)
                node.parentNode.removeChild(node)
                cmdMessage += [
                    '',
                    '# cmd',
                    `deleted ${componentId}`,
                    'Have you finished the task? If so, call `done()`. Otherwise please continue."'
                ].join('\n')
            }
            const handleInsert = (type, componentId) => {
                const isExist = getNode(componentId)
                if (isExist) {
                    cmdMessage += [
                        '# cmd',
                        `insert failed! the componentId ${componentId} already exists! Please generate a new componentId and reissue the command.`
                    ].join('\n')
                } else {
                    const parentNode = getNode()
                    const node = LC.createNodeFromData({ type, componentId })
                    parentNode.appendChild(node)
                    cmdMessage += [
                        '# cmd',
                        `inserted ${componentId}`,
                        'Have you finished the task? If so, call `done()`. Otherwise please continue."'
                    ].join('\n')
                }
            }
            const handleSelect = (componentId) => {
                setTimeout(() => {
                    const node = getNode(componentId)
                    node.active()
                    cmdMessage += [
                        '',
                        '# cmd',
                        `selected ${componentId}`,
                        'Have you finished the task? If so, call `done()`. Otherwise please continue."'
                    ].join('\n')
                }, 10)
            }
            const handleGetAll = () => {
                const framework = LC.getFramework()
                const components = framework === 'vue3'
                    ? LC.platform === 'MOBILE' ? vue3Materials.vant : vue3Materials.bk
                    : LC.platform === 'MOBILE' ? vue2Materials.vant : vue2Materials.bk
                cmdMessage += [
                    '',
                    '# cmd',
                    'You can use these component type:',
                    ...components.map(component => `- ${component.type} (${component.displayName})`),
                    'Note: before inserting or updating a component, use `component.get("<componentType>")` to learn how to write configuration.'
                ].join('\n')
            }
            const getComponentConfig = (component) => {
                const getPropType = (prop) => {
                    if (prop.options) {
                        return prop.options.join('|')
                    }
                    if (Array.isArray(prop.type)) {
                        return prop.type.join('|')
                    }
                    return prop.type
                }
                const propString = Object.keys(component.props).map(prop => `${prop}: ${getPropType(component.props[prop])}, //${component.props[prop].tips || ''}`).join('\n')
                const eventString = component.events.map(event => `${event.name}, //${event.tips || ''}`).join('\n')
                return [
                    `type: \'${component.type}\'`,
                    `props: { ${propString} }`,
                    `event: { ${eventString} }`
                ].join('\n')
            }
            const handleGet = (componentType) => {
                const framework = LC.getFramework()
                const components = framework === 'vue3'
                    ? LC.platform === 'MOBILE' ? vue3Materials.vant : vue3Materials.bk
                    : LC.platform === 'MOBILE' ? vue2Materials.vant : vue2Materials.bk
                const component = components.find(component => component.type === componentType)
                cmdMessage += [
                    '',
                    '# cmd',
                    `The complete configuration of the ${componentType} component is as follows:`,
                    getComponentConfig(component),
                    `Note: you can use 'component.insert("<componentType>", "<componentId>")' to insert ${componentType} component.`
                ].join('\n')
            }
            const handleGetInfo = (componentId) => {
                const node = getNode(componentId)
                cmdMessage += [
                    '',
                    '# cmd',
                    `The complete configuration of the ${componentId} component is as follows:`,
                    getComponentConfig(node.material),
                    'Note: you can use "component.setProp("<componentId>", "<prop key>", "<value>")" to change prop',
                    'Note: you can use "component.setStyle("<componentId>", "<css property key>", "<value>")" to change style',
                    'Note: you can use "component.setEvent("<componentId>", "<event name>", "<functionName>",  "<functionBody>")" to change event'
                ].join('\n')
            }
            const handleConnect = (componentId, tableName) => {
                const node = getNode(componentId)
                node.setRenderProps({
                    ...node.renderProps,
                    data: {
                        format: 'value',
                        code: [],
                        renderValue: [],
                        valueType: 'table-data-source',
                        payload: {
                            sourceData: {
                                tableName,
                                dataSourceType: 'preview',
                                showOperationColumn: true
                            }
                        }
                    }
                })
                // 选中并触发更新表头
                handleSelect(componentId)
                setTimeout(() => {
                    const btn = document.querySelector('.prop-operation')
                    btn.click()
                }, 10)
                cmdMessage += [
                    '',
                    '# cmd',
                    'Successfully connecting component and table',
                    'Have you finished the task? If so, call `done()`. Otherwise please continue."'
                ].join('\n')
            }
            const handleDone = () => {
                aiHelper.clearPrompt()
                errorTime = 0
            }
            const cmd = {
                component: {
                    setProp: handleSetProp,
                    setStyle: handleSetStyle,
                    setEvent: handleSetEvent,
                    delete: handleDelete,
                    insert: handleInsert,
                    select: handleSelect,
                    all: handleGetAll,
                    get: handleGet,
                    getInfo: handleGetInfo,
                    connect: handleConnect
                },
                done: handleDone
            }

            const aiHelper = new Ai({
                handlerStart,
                handleEnd,
                handleCmd,
                handleMessage,
                handleApiError,
                handleCmdError,
                systemPrompt
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
        height: 64px;
        padding: 12px;
        display: flex;
        align-items: center;
    }
    .ai-operation-input {
        margin-right: 7px;
        /deep/ .bk-form-input {
            border-color: transparent;
            background: #F5F7FA;
            border-radius: 2px;
            color: #63656E;
        }
    }
    .ai-operation-button {
        padding: 0 3px 0 0 !important;
        min-width: 84px;
    }
</style>
