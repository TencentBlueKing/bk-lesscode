/**
 * Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
 * Copyright (C) 2017-2018 THL A29 Limited, a Tencent company. All rights reserved.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

import Vue from 'vue'
import VueDraggable from 'vuedraggable'
import mavonEditor from 'mavon-editor'
import VueCompositionAPI from '@vue/composition-api'
import 'mavon-editor/dist/css/index.css'
import '@/common/bkui-vue-complex'
import '@/common/bkmagic'
import '@/common/element'
import '@/common/vant'
import auth from '@/common/auth'

import App from '@/App'
import router from '@/router'
import store from '@/store'
import i18n from '@/locales/i18n'
import { injectCSRFTokenToHeaders } from '@/api'

import Img403 from '@/images/403.png'
import Exception from '@/components/exception'
import { bus } from '@/common/bus'
import appHeader from '@/components/app-header.vue'
import ProjectVersionSelector from '@/components/project-version-selector.vue'
import AuthButton from '@/components/auth/button.vue'
import AuthComponent from '@/components/auth/component'
import AuthRouterLink from '@/components/auth/router-link.vue'
import NotExist from '@/components/not-exist.vue'
import EmptyStatus from '@/components/project/empty-status'
import LcForm from '@/components/lc-form/index.vue'
import LcFormItem from '@/components/lc-form/item.vue'
import LcSideslider from '@/components/lc-sideslider/index.vue'

import targetData from '@/common/targetData.js'
import pureAxios from '@/api/pureAxios.js'
import MgContentLoader from '@/components/loader'

import './directives'
import { IAM_ACTION } from 'shared/constant'

import './bk-icon/style.css'
import './bk-icon/iconcool.js'

// 用户调用接口使用，无业务逻辑，直接返回数据
Vue.prototype.$http = pureAxios
Vue.prototype.$td = targetData
Vue.prototype.$IAM_ACTION = IAM_ACTION

Vue.use(mavonEditor)
Vue.use(VueCompositionAPI)

Vue.component('VueDraggable', VueDraggable)
Vue.component('app-exception', Exception)
Vue.component('app-header', appHeader)
Vue.component('project-version-selector', ProjectVersionSelector)
Vue.component('mg-content-loader', MgContentLoader)
Vue.component('auth-button', AuthButton)
Vue.component('auth-component', AuthComponent)
Vue.component('auth-router-link', AuthRouterLink)
Vue.component('not-exist', NotExist)
Vue.component('empty-status', EmptyStatus)
Vue.component('LcForm', LcForm)
Vue.component('LcFormItem', LcFormItem)
Vue.component('LcSideslider', LcSideslider)

window.leaveConfirm = false

auth.requestCurrentUser().then(user => {
    injectCSRFTokenToHeaders()
    if (!user.isAuthenticated) {
        auth.redirectToLogin()
    } else {
        global.bus = bus
        global.mainComponent = new Vue({
            el: '#app',
            components: { App },
            router,
            store,
            i18n,
            template: '<App/>'
        })
    }
}, err => {
    let message
    if (err.status === 403) {
        message = window.i18n.t('Sorry，您的权限不足')
        if (err.data && err.data.msg) {
            message = err.data.msg
        }
    } else {
        message = window.i18n.t('无法连接到后端服务，请稍候再试')
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

router.beforeEach((to, from, next) => {
    document.title = window.i18n.t('运维开发平台 | 腾讯蓝鲸智云')
    next()
})

export default Vue
