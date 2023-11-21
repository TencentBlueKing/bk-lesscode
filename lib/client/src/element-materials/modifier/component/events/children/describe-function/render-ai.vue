<template>
    <section>
        <bk-input
            v-model="prompt"
            type="textarea"
            :placeholder="$t('请描述当该事件被触发时，期望达成的效果。示例：\n1. 修改组件 button-xxx 的高度为 50px，宽度为 80px\n2. 执行函数 getData，参数为1，20\n3. 跳转至 home 页面')"
            :rows="7"
            @change="handleChange"
        />
        <section
            class="ai-button"
        >
            <bk-button
                theme="primary"
                size="small"
                :disabled="!prompt.trim()"
                :loading="loading"
                @click="handleGenerateByAi"
            >
                {{ $t('生成事件行为') }}
            </bk-button>
        </section>
        <bk-alert
            v-if="errorMessage"
            class="ai-tips"
            theme="error"
            :title="errorMessage"
        />
    </section>
</template>

<script>
    import {
        Ai
    } from '@/common/ai'
    import {
        ref
    } from '@vue/composition-api'
    import {
        messageError
    } from '@/common/bkmagic'
    import {
        EVENT_ACTION_TYPE
    } from 'shared/function/constant'
    import {
        cssProperties
    } from '@/common/util'
    import store from '@/store/index'
    import LC from '@/element-materials/core'

    const hasComponent = (tree, componentId) => {
        let result = false

        tree?.forEach((node) => {
            if (node.componentId === componentId) {
                result = true
            }

            if (hasComponent(node.children, componentId)) {
                result = true
            }
        })

        return result
    }

    const systemPrompt = [
        'You are a event generator using a interactive command terminal to edit event.',
        '## Commands',
        `setComponentStyle("<componentId>", [{ key: "<prop key>", value: "<value>" }]) // change component style, You can only pass (${cssProperties.join('|')}) to the prop key. Multiple component styles can be modified at once.`,
        'setVariableValue("<variableCode>", "<value>") // change variable value',
        'executeFunction("<functionCode>", [{ value: "<param1>", value: "<param2>" }]) // execute function, pass all parameters at the end.',
        'jumpByAddress("<address>") // jump to address',
        'jumpByPage("<pageName>") // jump to page',
        '## Rules',
        'You must adhere to the following rules:',
        '- You can only use the commands mentioned above.',
        '- Write command argument in JSON format.',
        '- You can use the first few parameters of the event in the form of ${args[0]}',
        '- Your respond must only contain the commands like this:',
        '```',
        '+cmd: <command>',
        '+cmd: <command>',
        '```'
    ].join('\n')

    export default {
        event: ['plus-action'],

        setup (_, { emit }) {
            const prompt = ref('')
            const errorMessage = ref('')
            const loading = ref(false)

            const setComponentStyle = (componentId, value) => {
                if (!hasComponent(LC.getRoot().children, componentId)) {
                    messageError(window.i18n.t('没有找到 componentId 为{0}的组件，生成组件事件行为失败', [componentId]))
                    return
                }

                const action = {
                    type: EVENT_ACTION_TYPE.COMPONENT,
                    id: componentId,
                    value
                }
                emit('plus-action', action)
            }

            const setVariableValue = (variableCode, value) => {
                const variableList = store.getters['variable/variableList']
                if (!variableList.some((item) => item.variableCode === variableCode)) {
                    messageError(window.i18n.t('没有找到 variableCode 为{0}的变量，生成变量事件行为失败', [variableCode]))
                    return
                }
                const action = {
                    type: EVENT_ACTION_TYPE.VARIABLE,
                    id: variableCode,
                    value
                }
                emit('plus-action', action)
            }
            
            const executeFunction = (functionCode, params) => {
                const functionList = store.getters['functions/functionList']
                if (!functionList.some(item => item.funcCode === functionCode)) {
                    messageError(window.i18n.t('没有找到 functionCode 为{0}的函数，生成函数事件行为失败', [functionCode]))
                    return
                }
                const action = {
                    type: EVENT_ACTION_TYPE.METHOD,
                    id: functionCode,
                    value: params.map(param => ({
                        format: 'value',
                        value: param.value
                    }))
                }
                emit('plus-action', action)
            }

            const jumpByAddress = (value) => {
                const action = {
                    type: EVENT_ACTION_TYPE.LINK,
                    value
                }
                emit('plus-action', action)
            }

            const jumpByPage = (pageName) => {
                let hasPageName = false
                const routeGroup = store.getters['page/routeGroup']
                Object.keys(routeGroup).forEach((key) => {
                    const routes = routeGroup[key]
                    routes.forEach((route) => {
                        if (route.pageName === pageName) {
                            hasPageName = true
                            const action = {
                                type: EVENT_ACTION_TYPE.LINK,
                                value: (key === '/' ? key : `${key}/`) + route.path
                            }
                            emit('plus-action', action)
                        }
                    })
                })
                if (!hasPageName) {
                    messageError(window.i18n.t('没有找到 pageName 为{0}的页面，生成跳转事件行为失败', [pageName]))
                }
            }

            const handlerStart = () => {
                errorMessage.value = ''
            }

            const handleMessage = (aiMessage, content) => {
                if (!/(cmd(?:\d)?): (?:<)?([^>\n]+)(?:>)?/gmi.test(content)) {
                    errorMessage.value = window.i18n.t('生成失败，请优化你的提示词')
                } else {
                    prompt.value = ''
                }
                loading.value = false
            }

            const handleCmd = (cmdName, cmdString) => {
                console.log(cmdString, 'cmd')
                const context = {
                    cmdName,
                    setComponentStyle,
                    setVariableValue,
                    executeFunction,
                    jumpByAddress,
                    jumpByPage
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

            const handleApiError = (message) => {
                messageError(message)
                loading.value = false
            }

            const handleGenerateByAi = () => {
                loading.value = true
                aiHelper.chat(prompt.value)
            }

            const handleChange = () => {
                errorMessage.value = ''
            }

            const aiHelper = new Ai({
                handleCmd,
                handlerStart,
                handleMessage,
                handleApiError,
                systemPrompt,
                type: 'event',
                needCmd: true
            })

            return {
                prompt,
                errorMessage,
                loading,
                handleGenerateByAi,
                handleChange
            }
        }
    }
</script>

<style lang="postcss" scoped>
  .ai-button {
    display: inline-block;
    margin: 9px 0 24px;
  }
  .ai-tips {
    margin: -15px 0 24px;
    background-color: #ffeded;
    border-color: #ffd2d2;
    >>>.icon-info {
        color: #ea3636 !important;
    }
  }
</style>
