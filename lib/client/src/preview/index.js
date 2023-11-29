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
import VueCompositionAPI from '@vue/composition-api'
import pureAxios from '@/api/pureAxios.js'
import {
    init as handleInit,
    addGlobalProperty
} from 'bk-lesscode-render'
import {
    handleError,
    handleUnauth
} from './overlay'
import {
    handleRender
} from './render'
import {
    handleStyle
} from './style'
import {
    registerComponents as handleRegisterComponents
} from './component'
import '@vant/touch-emulator' // PC端模拟移动端事件 用于预览

// 设置 未发布请勿分享 的国际化
const previewTipDom = document.getElementById('preview-tip')
if (previewTipDom) {
    previewTipDom.innerHTML = window.i18n.t('未发布<br>请勿分享')
    previewTipDom.setAttribute('style', 'display: block')
}
document.title = window.i18n.t('运维开发平台 | 腾讯蓝鲸智云')

// 解析 url 参数
const location = window.location
const projectIdReg = new RegExp(`${location.origin}/preview/project/(\\d+)(/version/(\\d+))?(/platform/(PC|MOBILE))?`)
const [, projectId, , versionId = null, , platform] = projectIdReg.exec(location.href) || []

// 获取当前url中的query参数，将其pageId的值赋值给pageId变量
const query = location.search.match(/pageId=(\d+)/)
const pageId = query?.length > 1 ? query[1] : ''

Vue.use(VueCompositionAPI)

pureAxios
    .get('/projectCode/previewCode', {
        params: {
            projectId,
            platform,
            versionId,
            pageId
        }
    })
    .then(async (res) => {
        const { code, data } = res
        if (code === 403) {
            handleUnauth(data)
        } else {
            handleInit(data.framework)
            await handleRegisterComponents(projectId, versionId, data.framework)
            handleStyle(data.framework)
            handleRender(data, projectId, versionId, platform)
            addGlobalProperty('$http', pureAxios)
        }
    })
    .catch(handleError)
