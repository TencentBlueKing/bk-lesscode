
import { Message } from 'bkui-vue'

export const messageError = (message, delay = 3000, ellipsisLine = 3) => {
    Message({
        message,
        delay,
        theme: 'error',
        ellipsisLine
    })
}

export const messageSuccess = (message, delay = 3000) => {
    Message({
        message,
        delay,
        theme: 'success'
    })
}

export const messageInfo = (message, delay = 3000) => {
    Message({
        message,
        delay,
        theme: 'primary'
    })
}

export const messageWarn = (message, delay = 3000) => {
    Message({
        message,
        delay,
        theme: 'warning',
        hasCloseIcon: true
    })
}
