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
import Img403 from '@/images/403.png'
import ApplyPage from '@/components/apply-permission/apply-page.vue'

export const handleError = (err = {}) => {
    console.error(err)
    const response = err.response || {}
    const data = response.data || {}
    const message = data.message || err.message || window.i18n.t('无法连接到后端服务，请稍候再试。')

    const divStyle = `
        text-align: center;
        width: 400px;
        margin: auto;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    `
    const h2Style = 'font-size: 20px;color: #979797; margin: 32px 0;font-weight: normal'
    const content = ''
        + `<div class="bk-exception bk-exception-center" style="${divStyle}">`
        + `<img src="${Img403}"><h2 class="exception-text" style="${h2Style}">${message}</h2>`
        + '</div>'
    const parentNode = document.querySelector('#preview-app')
    parentNode.innerHTML = content
}

export const handleUnauth = (data) => {
    if (data.pass === false) {
        window.app = new Vue({
            el: '#preview-app',
            components: { ApplyPage },
            data () {
                return {
                    authResult: data
                }
            },
            template: '<apply-page :auth-result="authResult"/>'
        })
    } else {
        handleError({
            response: {
                data: {
                    message: '当前页面无权限'
                }
            }
        })
    }
}
