
export class Ai {
    constructor ({
        handlerStart,
        handleEnd,
        handleCmd,
        handleMessage,
        handleApiError,
        handleCmdError,
        systemPrompt
    }) {
        // event
        this.handlerStart = handlerStart
        this.handleEnd = handleEnd
        this.handleCmd = handleCmd
        this.handleMessage = handleMessage
        this.handleApiError = handleApiError
        this.handleCmdError = handleCmdError

        // Prompt
        this.systemPrompt = systemPrompt
        this.inputs = []

        // content
        this.content = ''

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

    endReceiveMessage () {
        this.pushPrompt(this.content, 'assistant')
        // 触发指令
        const cmdIndex = this.content.indexOf('``')
        const cmdMessage = this.content.slice(cmdIndex)
        if (cmdIndex > -1 && !/(cmd(?:\d)?): (?:<)?([^>\n]+)(?:>)?/gmi.test(cmdMessage)) {
            this.chart('It looks like the command is not formatted correctly, please rethink and issue commands')
            return
        }
        const exp = /(cmd(?:\d)?): (?:<)?([^>\n]+)(?:>)?/gmi
        let result
        let errorCmd
        try {
            do {
                result = exp.exec(cmdMessage)
                if (result) {
                    this.handleCmd(result[1], result[2])
                }
            } while (result)
        } catch (error) {
            errorCmd = result[2]
        }
        this.content = ''
        // trigger end
        if (errorCmd) {
            this.handleCmdError(errorCmd)
        } else {
            this.handleEnd()
        }
    }

    chat (message) {
        // push user prompt
        this.pushPrompt(message, 'user')
        // api
        return fetch('/api/ai/chat/stream', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ inputs: this.inputs })
        }).then(async response => {
            const reader = response.body
                .pipeThrough(new window.TextDecoderStream())
                .getReader()

            // trigger start
            this.handlerStart()

            // 临时存储数据
            let temp = ''

            while (true) {
                const { value, done } = await reader.read()
                if (done) break
                const values = (temp + value.toString()).split(/(?<=})\s*(?={\"errors\")/)
                values.forEach((value) => {
                    const item = value.trim()
                    if (item.startsWith('{') && item.endsWith('}')) {
                        const {
                            data,
                            message
                        } = JSON.parse(item)
                        if (data?.status === 'success') {
                            const choice = JSON.parse(data?.data?.[0]?.output?.[0]?.output)?.choices[0] || {}
                            if (!choice?.finish_reason) {
                                this.receiveMessage(choice?.delta?.content)
                            } else {
                                this.endReceiveMessage()
                            }
                        } else {
                            this.handleApiError(message || '调用 aiops 接口失败')
                        }
                        temp = ''
                    } else if (item) {
                        temp = item
                    }
                })
            }
        })
    }
}
