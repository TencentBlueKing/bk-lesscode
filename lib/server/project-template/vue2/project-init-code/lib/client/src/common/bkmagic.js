import Vue from 'vue'

// 全量引入
import './fully-import'

import ApplyPermissionDialog from '@/components/apply-permission/apply-dialog'

// 按需引入
// import './demand-import'

const Message = Vue.prototype.$bkMessage

let messageInstance = null

export const messageError = (message, delay = 3000, ellipsisLine = 3) => {
    messageInstance && messageInstance.close()
    messageInstance = Message({
        message,
        delay,
        theme: 'error',
        ellipsisLine
    })
}

export const messageSuccess = (message, delay = 3000) => {
    messageInstance && messageInstance.close()
    messageInstance = Message({
        message,
        delay,
        theme: 'success'
    })
}

export const messageInfo = (message, delay = 3000) => {
    messageInstance && messageInstance.close()
    messageInstance = Message({
        message,
        delay,
        theme: 'primary'
    })
}

export const messageWarn = (message, delay = 3000) => {
    messageInstance && messageInstance.close()
    messageInstance = Message({
        message,
        delay,
        theme: 'warning',
        hasCloseIcon: true
    })
}

let permissionInstance

export const permissionDialog = (authParams = {}, authResult = {}) => {
    if (!permissionInstance) {
        permissionInstance = new Vue(ApplyPermissionDialog).$mount()
        permissionInstance.$watch(() => permissionInstance.isShowDialog, (isShowDialog) => {
            if (!isShowDialog) {
                document.body.removeChild(permissionInstance.$el)
            }
        })
    }
    permissionInstance.authParams = authParams
    permissionInstance.authResult = authResult
    permissionInstance.show()
    permissionInstance.$nextTick(() => {
        document.body.appendChild(permissionInstance.$el)
    })
}

Vue.prototype.messageError = messageError
Vue.prototype.messageSuccess = messageSuccess
Vue.prototype.messageInfo = messageInfo
Vue.prototype.messageWarn = messageWarn
