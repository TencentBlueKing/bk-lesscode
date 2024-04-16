/**
 * @file main entry
 * @author
 */

import { createApp } from 'vue'

import App from '@/App'
import router from '@/router'
import store from '@/store'
import { injectCSRFTokenToHeaders } from '@/api'
import auth from '@/common/auth'
import Img403 from '@/images/403.png'
import Exception from '@/components/exception'
import { bus } from '@/common/bus'
import bkui, { bkTooltips, Message } from 'bkui-vue'
import 'bkui-vue/dist/style.css'
import bkuiVueComplex from '@blueking/bkui-vue-complex'
import renderHtml from '@/components/html'
import widgetTableColumn from '@/components/patch/widget-table-column.js'
import widgetBkTable from '@/components/patch/widget-bk-table.vue'
import widgetBkVision from '@/components/patch/widget-bk-vision.vue'
import widgetFormContainer from '@/components/form-engine/renderer/index.js'
import widgetDataManageContainer from '@/components/data-manage-container/form-data-manage/index.js'

import pureAxios from '@/api/pureAxios.js'
${importVantLib}
import AuthButton from '@/components/auth/button.vue'
${importLuckyCanvas}
import cursor from './directives/cursor'

auth.requestCurrentUser().then(user => {
    injectCSRFTokenToHeaders()
    if (user.isAuthenticated) {
        global.bus = bus
        global.mainComponent = createApp(App)
            .use(router)
            .use(store)
            .use(bkui)
            ${useVantLib}
        // 挂载全局组件
        global.mainComponent.component('app-exception', Exception)
        global.mainComponent.component('render-html', renderHtml)
        global.mainComponent.component('widget-bk-vision', widgetBkVision)
        global.mainComponent.component('widget-table-column', widgetTableColumn)
        global.mainComponent.component('widget-bk-table', widgetBkTable)
        global.mainComponent.component('widget-form-container', widgetFormContainer)
        global.mainComponent.component('widget-data-manage-container', widgetDataManageContainer)
        global.mainComponent.component('auth-button', AuthButton)
        ${useVantWidget}
        ${useLuckyCanvas}
        // 安装全局插件
        global.mainComponent.use(cursor)
        global.mainComponent.use(bkuiVueComplex)
        // 挂载全局指令
        global.mainComponent.directive('bk-tooltips', bkTooltips)
        // 挂载全局属性
        global.mainComponent.config.globalProperties.$http = pureAxios
        global.mainComponent.config.globalProperties.$bkMessage = Message
        // mount
        global.mainComponent.mount('#app')
    } else {
        auth.redirectToLogin()
    }
}, err => {
    let message
    if (err.status === 403) {
        message = 'Sorry，您的权限不足!'
        if (err.data && err.data.msg) {
            message = err.data.msg
        }
    } else {
        message = '无法连接到后端服务，请稍候再试。'
    }

    const divStyle = ''
        + 'text-align: center;'
        + 'width: 400px;'
        + 'margin: auto;'
        + 'position: absolute;'
        + 'top: 50%;'
        + 'left: 50%;'
        + 'transform: translate(-50%, -50%);'

    const h2Style = 'font-size: 20px;color: #979797; margin: 32px 0;font-weight: normal'

    const content = ''
        + `<div class="bk-exception bk-exception-center" style="${divStyle}">`
        + `<img src="${Img403}"><h2 class="exception-text" style="${h2Style}">${message}</h2>`
        + '</div>'

    document.write(content)
})
${remJs}