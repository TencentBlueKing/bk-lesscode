const DEFAULT_ERROR_MESSAGE = '系统错误'

const getDefaultMessage = () => {
    try {
        return window.i18n?.t?.(DEFAULT_ERROR_MESSAGE) || DEFAULT_ERROR_MESSAGE
    } catch {
        return DEFAULT_ERROR_MESSAGE
    }
}

/**
 * 将接口返回的 message 转为可展示的字符串（避免 [object Object]）
 */
export const formatErrorMessage = (message, fallback = getDefaultMessage()) => {
    if (message == null || message === '') {
        return fallback
    }
    if (typeof message === 'string') {
        return message
    }
    if (typeof message === 'number' || typeof message === 'boolean') {
        return String(message)
    }
    if (message instanceof Error) {
        return formatErrorMessage(message.message, fallback)
    }
    if (Array.isArray(message)) {
        if (typeof message[0] === 'string' && window.i18n?.t) {
            try {
                return window.i18n.t(...message)
            } catch {
                // fall through
            }
        }
        return message
            .map(item => formatErrorMessage(item, ''))
            .filter(Boolean)
            .join('; ') || fallback
    }
    if (typeof message === 'object') {
        if (Object.keys(message).length === 0) {
            return fallback
        }
        if (message.message != null) {
            return formatErrorMessage(message.message, fallback)
        }
        if (message.msg != null) {
            return formatErrorMessage(message.msg, fallback)
        }
        if (message.content != null) {
            return formatErrorMessage(message.content, fallback)
        }
        if (message.detail != null) {
            return formatErrorMessage(message.detail, fallback)
        }
        if (message.error != null) {
            return formatErrorMessage(message.error, fallback)
        }
        if (typeof message.key === 'string' && window.i18n?.t) {
            try {
                return window.i18n.t(message.key, message.params || message.values || message.args)
            } catch {
                // fall through
            }
        }
        const locale = window.i18n?.locale || 'zh-cn'
        const localeMessage = message[locale] ?? message['zh-cn'] ?? message.en ?? message.zh
        if (localeMessage != null) {
            return formatErrorMessage(localeMessage, fallback)
        }
        const stringValues = Object.values(message).filter(value => typeof value === 'string')
        if (stringValues.length === 1) {
            return stringValues[0]
        }
        try {
            return JSON.stringify(message)
        } catch {
            return fallback
        }
    }
    return String(message)
}

export default class RequestError extends Error {
    constructor (code, message, response) {
        const displayMessage = formatErrorMessage(message)
        super(displayMessage)
        this.name = 'RequestError'
        this.code = code
        this.message = displayMessage
        this.response = response
    }
}
