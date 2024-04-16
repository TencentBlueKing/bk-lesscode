/**
 * @file main entry
 * @author
 */

import Vue from 'vue'

import App from '@/App'
import router from '@/router'
import store from '@/store'
import { injectCSRFTokenToHeaders } from '@/api'
import auth from '@/common/auth'
import Img403 from '@/images/403.png'
import Exception from '@/components/exception'
import { bus } from '@/common/bus'
import '@/common/bkmagic'
import '@/common/bkui-vue-complex'
import mavonEditor from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'
import renderHtml from '@/components/html'
import widgetTableColumn from '@/components/patch/widget-table-column.js'
import widgetBkTable from '@/components/patch/widget-bk-table.vue'
import widgetBkVision from '@/components/patch/widget-bk-vision.vue'
import widgetFormContainer from '@/components/form-engine/renderer/index.js'
import widgetDataManageContainer from '@/components/data-manage-container/form-data-manage/index.js'
${importElementLib}
import pureAxios from '@/api/pureAxios.js'
${importVantLib}
import AuthButton from '@/components/auth/button.vue'
${importLuckyCanvas}
import cursor from './directives/cursor'

// 用户调用接口使用，无业务逻辑，直接返回数据
Vue.prototype.$http = pureAxios

Vue.component('app-exception', Exception)
Vue.component('render-html', renderHtml)
Vue.component('widget-bk-vision', widgetBkVision)
Vue.component('widget-table-column', widgetTableColumn)
Vue.component('widget-bk-table', widgetBkTable)
Vue.component('widgetFormContainer', widgetFormContainer)
Vue.component('widgetDataManageContainer', widgetDataManageContainer)
Vue.component('auth-button', AuthButton)
Vue.use(mavonEditor)
${useLuckyCanvas}

Vue.use(cursor)

auth.requestCurrentUser().then(user => {
    injectCSRFTokenToHeaders()
    if (user.isAuthenticated) {
        global.bus = bus
        global.mainComponent = new Vue({
            el: '#app',
            router,
            store,
            components: { App },
            template: '<App/>'
        })
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