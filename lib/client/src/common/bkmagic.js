/**
 * Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
 * Copyright (C) 2025 Tencent. All rights reserved.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

import Vue from 'vue'
// 全量引入
import './fully-import'
import { transformHtmlToVnode } from './util'

import ApplyPermissionDialog from '@/components/apply-permission/apply-dialog'

// 按需引入
// import './demand-import'

const Message = Vue.prototype.$bkMessage

let messageInstance = null

export const messageHtmlError = (errMessage, delay = 3000, ellipsisLine = 0) => {
    messageInstance && messageInstance.close()
    const message = transformHtmlToVnode(errMessage)
    messageInstance = Message({
        message,
        delay,
        theme: 'error',
        ellipsisLine,
        extCls: 'auto-width'
    })
}

export const messageError = (message, delay = 3000, ellipsisLine = 0) => {
    messageInstance && messageInstance.close()
    messageInstance = Message({
        message,
        delay,
        theme: 'error',
        ellipsisLine
    })
}

export const messageSuccess = (message, delay = 3000, ellipsisLine = 0) => {
    messageInstance && messageInstance.close()
    messageInstance = Message({
        message,
        delay,
        theme: 'success',
        ellipsisLine
    })
}

export const messageInfo = (message, delay = 3000, ellipsisLine = 0) => {
    messageInstance && messageInstance.close()
    messageInstance = Message({
        message,
        delay,
        theme: 'primary',
        ellipsisLine
    })
}

export const messageWarn = (message, delay = 3000, ellipsisLine = 0) => {
    messageInstance && messageInstance.close()
    messageInstance = Message({
        message,
        delay,
        theme: 'warning',
        hasCloseIcon: true,
        ellipsisLine
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

Vue.prototype.messageHtmlError = messageHtmlError
Vue.prototype.messageError = messageError
Vue.prototype.messageSuccess = messageSuccess
Vue.prototype.messageInfo = messageInfo
Vue.prototype.messageWarn = messageWarn
