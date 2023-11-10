import {
    isJSON
} from './util'

const emptyFunction = () => {}
  
export class Ai {
    constructor ({
        handlerStart,
        handleEnd,
        handleCmd,
        handleMessage,
        handleApiError,
        handleCmdError,
        handleFormatterError,
        systemPrompt,
        needCmd,
        type
    }) {
        // event
        this.handlerStart = handlerStart || emptyFunction
        this.handleEnd = handleEnd || emptyFunction
        this.handleCmd = handleCmd || emptyFunction
        this.handleMessage = handleMessage || emptyFunction
        this.handleApiError = handleApiError || emptyFunction
        this.handleCmdError = handleCmdError || emptyFunction
        this.handleFormatterError = handleFormatterError || emptyFunction

        // Prompt
        this.systemPrompt = systemPrompt
        this.inputs = []

        // type
        this.type = type
        this.needCmd = needCmd

        // content
        this.content = ''

        // controllers
        this.controllers = []

        // init
        this.pushPrompt(systemPrompt, 'system')
    }

    pushPrompt (content, role) {
        this.inputs.push({
            role,
            content
        })
    }

    clearPrompt () {
        this.inputs = []
        this.pushPrompt(this.systemPrompt, 'system')
    }

    receiveMessage (message) {
        this.content += message
        const cmdIndex = this.content.indexOf('``')
        const aiMessage = cmdIndex > 0 ? this.content.slice(0, cmdIndex).trim() : this.content
        // 触发消息更新
        this.handleMessage(aiMessage, this.content)
    }

    async endReceiveMessage () {
        this.pushPrompt(this.content, 'assistant')
        // 触发指令
        const cmdIndex = this.content.indexOf('``')
        const cmdMessage = this.content.slice(cmdIndex)
        if (this.needCmd && cmdIndex > -1 && !/(cmd(?:\d)?): (?:<)?([^>\n]+)(?:>)?/gmi.test(cmdMessage)) {
            this.handleCmdError('', 'It looks like the command is not formatted correctly')
            return
        }
        const exp = /(cmd(?:\d)?): (?:<)?([^\n]+\))(?:>)?/gmi
        let result
        let errorCmd
        let errorMessage
        if (this.needCmd) {
            try {
                do {
                    result = exp.exec(cmdMessage)
                    if (result) {
                        await this.handleCmd(result[1], result[2])
                    }
                } while (result)
            } catch (error) {
                errorCmd = result[2]
                errorMessage = error.message
            }
        }
        // trigger end
        if (errorCmd) {
            this.handleCmdError(errorCmd, errorMessage)
        } else {
            this.handleEnd()
        }
    }

    chatStream (message) {
        // push user prompt
        this.pushPrompt(message, 'user')
        // api
        return fetch('/api/ai/chat/stream', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ inputs: this.inputs, type: this.type })
        }).then(async response => {
            const reader = response.body
                .pipeThrough(new window.TextDecoderStream())
                .getReader()

            // trigger start
            this.handlerStart()

            this.content = ''

            // 临时存储数据
            let temp = ''

            while (true) {
                try {
                    const { value, done } = await reader.read()
                    if (done) break
                    const values = (temp + value.toString()).split(/(?<=})\s*(?={"result")/)
                    values.forEach((value) => {
                        const item = value.trim()
                        if (isJSON(item)) {
                            const {
                                result,
                                data,
                                message
                            } = JSON.parse(item)
                            if (result === true) {
                                const choice = data?.result?.choices?.[0]
                                if (!choice) {
                                    this.handleApiError('模型调用失败，返回对象为空')
                                } else if (choice.finish_reason) {
                                    this.endReceiveMessage()
                                } else if (choice.delta.content) {
                                    this.receiveMessage(choice.delta.content)
                                }
                            } else {
                                this.handleApiError(message || '模型调用失败')
                            }
                            temp = ''
                        } else if (item) {
                            temp = item
                        }
                    })
                } catch (error) {
                    if (error?.code !== 20) {
                        this.handleApiError(`模型调用失败：${error.message}`)
                    }
                    break
                }
            }
        })
    }

    chat (message) {
        // push user prompt
        this.pushPrompt(message, 'user')
        this.handlerStart()
        this.content = ''
        return fetch('/api/ai/chat', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ inputs: this.inputs, type: this.type })
        }).then(async response => {
            const data = await response.json()
            if (data?.result) {
                const choice = data?.data?.result?.choices?.[0]
                if (!choice) {
                    this.handleApiError('模型调用失败，返回对象为空')
                } else {
                    this.receiveMessage(choice.message.content)
                    this.endReceiveMessage()
                }
            } else {
                this.handleApiError(`模型调用失败：${data?.message}`)
            }
        }).catch((error) => {
            this.handleApiError(`模型调用失败：${error.message}`)
        })
    }

    code (prompt, promptSuffix, lang) {
        this.handlerStart()
        this.content = ''
        const controller = new AbortController()
        this.controllers.push(controller)
        return fetch('/api/ai/code', {
            method: 'post',
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt, promptSuffix, lang })
        }).then(async response => {
            const data = await response.json()
            if (data?.result) {
                const result = data?.data?.[0]?.result
                if (!result) {
                    this.handleApiError('模型调用失败，返回对象为空')
                } else {
                    this.receiveMessage(result)
                    this.endReceiveMessage()
                }
            } else {
                this.handleApiError(`模型调用失败：${data?.message}`)
            }
        }).catch((error) => {
            this.handleApiError(`模型调用失败：${error.message}`)
        })
    }

    stop () {
        this.controllers.forEach((controller) => {
            controller?.abort?.()
        })
        this.handleEnd()
    }
}
