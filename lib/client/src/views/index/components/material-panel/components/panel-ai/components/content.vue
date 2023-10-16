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
    import { bkMessage } from 'bk-magic-vue'
    import Send from './send.vue'
    import * as createHacker from '../../common/group-box/hacker.js'

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
                if (currentMessage.status === 'loading') {
                    currentMessage.status = ''
                }
                isLoading.value = false
                if (cmdMessage) {
                    currentMessage = pushMessage('ai', '正在努力生成中，请稍等', 'loading')
                    aiHelper.chatStream(cmdMessage)
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
                aiHelper.chatStream(cmdMessage)
            }

            const clearMessage = () => {
                messages.value = []
                isLoading.value = false
                aiHelper.clearPrompt()
                bkMessage({ theme: 'success', message: window.i18n.t('聊天记录清空成功'), limit: 1 })
                pushMessage('ai', 'Hi，我是小鲸，我可以帮你实现添加组件，函数生成等复杂功能，你可以尝试说帮我新增一个表格')
            }

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
                    pushMessage('ai', `请输入变量：${result.join('、')}`, '')
                    // 上下文携带完整对话
                    aiHelper.pushPrompt(userInput, 'user')
                    aiHelper.pushPrompt(`请输入变量：${result.join('、')}`, 'system')
                } else {
                    // 返回loading message
                    currentMessage = pushMessage('ai', '正在努力生成中，请稍等', 'loading')
                    // 输入框loading状态
                    isLoading.value = true
                    aiHelper.chatStream(`help me solve this task:\n ${userInput}`)
                }
            }

            const handleComponentNotExist = (infoPrefix, componentId) => {
                cmdMessage += [
                    '',
                    '# cmd',
                    `${infoPrefix}. The component "${componentId}" does not exist. please rethink and issue commands`
                ].join('\n')
            }

            // ai 指令
            const handleSetProp = (componentId, prop, value) => {
                const node = getNode(componentId)
                if (!node) {
                    handleComponentNotExist(
                        `Updating the ${prop} prop of the component failed`,
                        componentId
                    )
                    return
                }
                if (!node.material?.props?.[prop]) {
                    cmdMessage += [
                        '',
                        '# cmd',
                        `Updating the ${prop} prop of the component failed. The component "${componentId}" does not have ${prop} attribute. please rethink and issue commands`,
                        'Note: you can use `component.getInfo("<componentId>")` to get the configuration information of a component.'
                    ].join('\n')
                    return
                }
                if (!value.code) {
                    value.code = value.renderValue
                }
                if (!value.renderValue) {
                    value.renderValue = value.code
                }
                node.setProp({
                    [prop]: {
                        payload: {},
                        valueType: Array.isArray(node.material.props[prop].type) ? node.material.props[prop].type[0] : node.material.props[prop].type,
                        ...node.renderProps[prop],
                        format: 'value',
                        ...value
                    }
                })
                cmdMessage += [
                    '',
                    '# cmd',
                    'The prop has been successfully set.',
                    'Have you finished the task? If so, call `done()`. Otherwise please continue.'
                ].join('\n')
            }
            const handleSetStyle = (componentId, style, value) => {
                const node = getNode(componentId)
                if (!node) {
                    handleComponentNotExist(
                        `Updating the ${style} style of the component failed`,
                        componentId
                    )
                    return
                }
                node.setRenderStyles({
                    ...node.renderStyles,
                    [style]: value
                })
                cmdMessage += [
                    '',
                    '# cmd',
                    'The style has been successfully set.',
                    'Have you finished the task? If so, call `done()`. Otherwise please continue.'
                ].join('\n')
            }
            const handleSetEvent = (componentId, event, functionCode) => {
                const item = store.getters['functions/functionList'].find(x => x.funcCode === functionCode)
                if (!item) {
                    cmdMessage += [
                        '',
                        '# cmd',
                        `Updating the ${event} event of the component failed. The function "${functionCode}" does not exist. please rethink and issue commands`
                    ].join('\n')
                    return
                }
                // 修改event
                const node = getNode(componentId)
                if (!node) {
                    handleComponentNotExist(
                        `Updating the ${event} event of the component failed`,
                        componentId
                    )
                    return
                }
                node.setRenderEvents({
                    ...node.renderEvents,
                    [event]: {
                        enable: true,
                        methodCode: functionCode,
                        params: []
                    }
                })
                cmdMessage += [
                    '',
                    '# cmd',
                    'The event has been successfully set.',
                    'Have you finished the task? If so, call `done()`. Otherwise please continue.'
                ].join('\n')
            }
            const handleSetSlot = (componentId, slot, value) => {
                const node = getNode(componentId)
                if (!node) {
                    handleComponentNotExist(
                        `Updating the ${slot} slot of the component failed`,
                        componentId
                    )
                    return
                }
                if (!value.code) {
                    value.code = value.renderValue
                }
                if (!value.renderValue) {
                    value.renderValue = value.code
                }
                node.setSlot(slot, {
                    ...node.renderSlots[slot],
                    ...value
                })
                cmdMessage += [
                    '',
                    '# cmd',
                    'The slot has been successfully set.',
                    'Have you finished the task? If so, call `done()`. Otherwise please continue.'
                ].join('\n')
            }
            const handleDelete = (componentId) => {
                const node = getNode(componentId)
                if (!node) {
                    handleComponentNotExist(
                        `Delete the ${componentId} component failed`,
                        componentId
                    )
                    return
                }
                node.parentNode.removeChild(node)
                cmdMessage += [
                    '',
                    '# cmd',
                    `deleted ${componentId}`,
                    'Have you finished the task? If so, call `done()`. Otherwise please continue.'
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
                    const node = LC.createNode(type)
                    node.componentId = componentId
                    Object.values(createHacker).forEach(task => task(node, node.material))
                    parentNode.appendChild(node)
                    cmdMessage += [
                        '# cmd',
                        `inserted ${componentId}`,
                        'Have you finished the task? If so, call `done()`. Otherwise please continue.'
                    ].join('\n')
                }
            }
            const handleSelect = (componentId) => {
                setTimeout(() => {
                    const node = getNode(componentId)
                    if (!node) {
                        handleComponentNotExist(
                            `Select the ${componentId} component failed`,
                            componentId
                        )
                        return
                    }
                    node.active()
                    cmdMessage += [
                        '',
                        '# cmd',
                        `selected ${componentId}`,
                        'Have you finished the task? If so, call `done()`. Otherwise please continue.'
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
                    ...components.map(component => `- ${component.type} (${component.displayName})`)
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
                    getComponentConfig(component)
                ].join('\n')
            }
            const handleGetInfo = (componentId) => {
                const node = getNode(componentId)
                if (!node) {
                    handleComponentNotExist(
                        `Get configuration of ${componentId} component failed`,
                        componentId
                    )
                    return
                }
                // 减少重复无意义 token
                const nodeJson = node.toJSON()
                Object.keys(nodeJson.renderProps).forEach((key) => {
                    const renderProp = nodeJson.renderProps[key]
                    if (Array.isArray(renderProp.code)) {
                        renderProp.code = renderProp.code.slice(0, 1)
                    }
                    if (Array.isArray(renderProp.renderValue)) {
                        renderProp.renderValue = renderProp.renderValue.slice(0, 1)
                    }
                })
                cmdMessage += [
                    '',
                    '# cmd',
                    `The complete configuration of the ${componentId} component is as follows:`,
                    JSON.stringify(nodeJson)
                ].join('\n')
            }
            const handleCreateOrUpdateFunction = async (funcName, funcBody) => {
                if (!funcName || !funcBody) {
                    cmdMessage += [
                        '',
                        '# cmd',
                        'Create or update function fail. The funcName or funcBody is empty. please rethink and issue commands'
                    ].join('\n')
                    return
                }
                let functionItem = store.getters['functions/functionList'].find(item => item.funcCode === funcName)
                
                if (functionItem) {
                    // 更新函数
                    functionItem.funcBody = funcBody
                    const code = await store.dispatch('functions/fixFunByEslint', functionItem)
                    await store.dispatch('functions/editFunction', {
                        ...functionItem,
                        funcBody: code || funcBody
                    })
                } else {
                    // 生成函数
                    functionItem = store.getters['functions/functionList'][0]
                    const functionData = getDefaultFunction({
                        funcName,
                        funcCode: funcName,
                        funcBody,
                        projectId: functionItem.projectId,
                        funcGroupId: functionItem.funcGroupId
                    })
                    const code = await store.dispatch('functions/fixFunByEslint', functionData)
                    await store.dispatch('functions/createFunction', {
                        ...functionData,
                        funcBody: code || funcBody
                    })
                }

                // 更新函数列表
                return store.dispatch('functions/getAllGroupAndFunction', {
                    projectId: functionItem.projectId,
                    versionId: functionItem.versionId
                }).then((functionData) => {
                    store.commit('functions/setFunctionData', functionData)
                })
            }
            const handleGetFunctions = () => {
                const functionList = store.getters['functions/functionList']
                cmdMessage += [
                    '',
                    '# cmd',
                    'You can use these functions:',
                    ...functionList.map(item => `- ${item.funcName} (${item.funcCode})`)
                ].join('\n')
            }
            const handleDataSourceTable = (componentId, tableName) => {
                const node = getNode(componentId)
                if (!node) {
                    handleComponentNotExist(
                        `Setting ${componentId} component to display data from the ${tableName} table failed`,
                        componentId
                    )
                    return
                }
                const common = {
                    format: 'value',
                    code: [],
                    renderValue: [],
                    payload: {
                        sourceData: {
                            tableName,
                            dataSourceType: 'preview',
                            showOperationColumn: true
                        }
                    }
                }
                if (node.type === 'widget-bk-table') {
                    node.setRenderProps({
                        ...node.renderProps,
                        data: {
                            ...common,
                            valueType: 'table-data-source'
                        }
                    })
                    // 选中并触发更新表头
                    handleSelect(componentId)
                    setTimeout(() => {
                        const btn = document.querySelector('.prop-operation')
                        btn.click()
                    }, 10)
                } else if (node.type === 'bk-select') {
                    node.setSlot('default', {
                        ...node.renderSlots.default,
                        ...common,
                        valueType: 'select-data-source'
                    })
                } else if (node.type === 'bk-transfer') {
                    node.setProp({
                        'source-list': {
                            ...node.renderProps['source-list'],
                            ...common,
                            valueType: 'data-source'
                        }
                    })
                }
                cmdMessage += [
                    '',
                    '# cmd',
                    `Successfully set ${componentId} component to display data from the ${tableName} table`,
                    'Have you finished the task? If so, call `done()`. Otherwise please continue.'
                ].join('\n')
            }
            const handleDataSourceMethod = (componentId, functionCode) => {
                const item = store.getters['functions/functionList'].find(x => x.funcCode === functionCode)
                if (!item) {
                    cmdMessage += [
                        '',
                        '# cmd',
                        `Setting ${componentId} component to display data from the ${functionCode} function failed. The function "${functionCode}" does not exist. please rethink and issue commands`
                    ].join('\n')
                    return
                }
                const node = getNode(componentId)
                if (!node) {
                    handleComponentNotExist(
                        `Setting ${componentId} component to display data from the ${functionCode} function failed`,
                        componentId
                    )
                    return
                }

                const material = node.material
                let propHasRemote = false
                Object.keys(material.props || {}).forEach((key) => {
                    const prop = material.props[key]
                    const valueType = prop.type?.find?.(item => item.includes('remote'))
                    if (valueType) {
                        propHasRemote = true
                        node.setProp({
                            [key]: {
                                ...node.renderProps[key],
                                valueType,
                                payload: {
                                    methodCode: functionCode,
                                    params: []
                                }
                            }
                        })
                    }
                })
                if (node.type === 'widget-bk-table') {
                    // 选中并触发更新表头
                    handleSelect(componentId)
                    setTimeout(() => {
                        const btn = document.querySelector('.prop-operation')
                        btn.click()
                    }, 10)
                }
                if (!propHasRemote) {
                    Object.keys(material.slots || {}).forEach((key) => {
                        const slot = material.slots[key]
                        const valueType = slot.type?.find?.(item => item.includes('remote'))
                        if (valueType) {
                            node.setSlot(key, {
                                ...node.renderSlots[key],
                                valueType,
                                payload: {
                                    methodData: {
                                        methodCode: functionCode,
                                        params: []
                                    }
                                }
                            })
                        }
                    })
                }
                cmdMessage += [
                    '',
                    '# cmd',
                    `Successfully set ${componentId} component to display data from the ${functionCode} function`,
                    'Have you finished the task? If so, call `done()`. Otherwise please continue.'
                ].join('\n')
            }
            const handleDone = () => {
                currentMessage.status = 'success'
                aiHelper.clearPrompt()
                errorTime = 0
            }
            const handleClear = () => {
                const root = LC.getRoot()
                root.children.forEach(children => {
                    root.removeChild(children)
                })
                LC.triggerEventListener('reset')
                cmdMessage += [
                    '',
                    '# cmd',
                    'Successfully clear.',
                    'Have you finished the task? If so, call `done()`. Otherwise please continue.'
                ].join('\n')
            }
            const cmd = {
                component: {
                    setProp: handleSetProp,
                    setStyle: handleSetStyle,
                    setEvent: handleSetEvent,
                    setSlot: handleSetSlot,
                    delete: handleDelete,
                    insert: handleInsert,
                    select: handleSelect,
                    all: handleGetAll,
                    get: handleGet,
                    getInfo: handleGetInfo
                },
                dataSource: {
                    table: handleDataSourceTable,
                    method: handleDataSourceMethod
                },
                method: {
                    createOrUpdate: handleCreateOrUpdateFunction,
                    get: handleGetFunctions
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
