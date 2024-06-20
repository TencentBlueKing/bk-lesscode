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
import { registerComponent, install, vue3Resource, bkuiResource } from 'bk-lesscode-render'
// 注入组件库
import '@/common/bkui-vue-complex'
import '@/common/fully-import'
import '@/common/element'

// 注入全局组件
import renderHtml from '@/components/render/pc/widget/html/index'
import widgetBkTable from '@/components/render/pc/widget/table/table'
import widgetElTable from '@/components/patch/widget-el-table/index.vue'
import widgetTableColumn from '@/components/render/pc/widget/table/table-column'
import widgetVanPicker from '@/components/render/pc/widget/van-picker'
import bkCharts from '@/components/render/pc/widget/bk-charts/bk-charts'
import chart from '@/components/render/pc/widget/chart/chart'
import WidgetFormContainer from '@/form-engine/renderer/index'
import WidgetDataManageContainer from '@/components/render/pc/widget/data-manage-container/form-data-manage/preview'
import processForm from '@/components/flow-form-comp/process-form'
import dataManage from '@/components/flow-form-comp/data-manage'
import BkLuckyCanvas from '@/components/render/pc/widget/bk-lucky-canvas'
import mavonEditor from 'mavon-editor'

const importVant2 = () => import('@/common/vant')

const loadCustomComponents = (projectId, versionId, framework) => {
    return new Promise((resolve, reject) => {
        // 注入自定义组件
        window.previewCustomCompontensPlugin = []
        window.registerPreview = function (callback) {
            window.previewCustomCompontensPlugin.push(callback)
        }

        framework === 'vue2' && importVant2() // 为防止Vant2和Vant3的样式冲突，vue2时引入Vant2,否则使用lesscode-render中的Vant3
        
        const script = document.createElement('script')
        script.src = `/${parseInt(projectId)}/component/preview-register.js?v=${versionId || ''}`
        script.onload = () => {
            window.previewCustomCompontensPlugin.forEach(callback => {
                const [config, source] = callback(framework === 'vue2' ? Vue : vue3Resource, vue3Resource, bkuiResource)
                new Promise((resolve) => source(resolve)).then((component) => {
                    registerComponent(config.type, component)
                })
            })
            resolve()
        }
        script.onerror = (err) => {
            reject(err.message || err || window.i18n.t('获取自定义组件失败'))
        }
        document.body.appendChild(script)
    })
}

const registerSysComponents = () => {
    return new Promise((resolve, reject) => {
        // 注入全局组件
        registerComponent('render-html', renderHtml)
        registerComponent('widget-bk-table', widgetBkTable)
        registerComponent('widget-el-table', widgetElTable)
        registerComponent('widget-table-column', widgetTableColumn)
        registerComponent('processForm', processForm)
        registerComponent('dataManage', dataManage)
        registerComponent('bk-charts', bkCharts)
        registerComponent('chart', chart)
        registerComponent('widget-van-picker', widgetVanPicker)
        registerComponent('widget-form-container', WidgetFormContainer)
        registerComponent('widget-data-manage-container', WidgetDataManageContainer)
        registerComponent('bk-lucky-canvas', BkLuckyCanvas)
        install(mavonEditor)
        resolve()
    })
}

export const registerComponents = (projectId, versionId, framework) => {
    return Promise.all([
        loadCustomComponents(projectId, versionId, framework),
        registerSysComponents()
    ])
}
