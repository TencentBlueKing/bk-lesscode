import {
    isEmpty
} from 'shared/util'

// 监听资源变化
const eventListenerMap = {}

/**
 * 触发更新事件
 * @param {*} type 事件类型
 */
export const triggerEventListener = async (type, payload) => {
    const eventListeners = eventListenerMap[type]
    if (isEmpty(eventListeners)) return
    // 先执行事件监听方法
    eventListeners.forEach((eventListener) => {
        eventListener(payload)
    })
}

/**
 * 添加
 * @param {*} type 事件类型
 * @param {*} callback 回调
 */
export const addEventListener = async (type, callback, options) => {
    if (eventListenerMap[type] && !eventListenerMap[type].includes(callback)) {
        eventListenerMap[type].push(callback)
    }
    if (!eventListenerMap[type]) {
        eventListenerMap[type] = [callback]
    }
    if (options?.immediate) {
        callback()
    }
}

/**
 * 移除
 * @param {*} type 事件类型
 * @param {*} callback 回调
 */
export const removeEventListener = (type, callback) => {
    const eventListeners = eventListenerMap[type]
    const index = eventListeners.findIndex(eventListener => eventListener === callback)
    if (index > -1) {
        eventListeners.splice(index, 1)
    }
}
