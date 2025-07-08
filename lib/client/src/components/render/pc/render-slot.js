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

import {
    getRenderMap,
    vue2RenderList,
    vue3RenderList
} from '@/element-materials/modifier/component/slots/render-config'
import {
    transformHtmlToVnode,
    framework
} from 'bk-lesscode-render'

export default {
    name: 'render-slot',
    functional: true,
    render (vue3Context, vue2Context) {
        const props = framework === 'vue3' ? vue3Context._.attrs : vue2Context.props
        const { renderKey, slotData, comType, comRenderProps, comRenderDirectives } = props

        // 单选按钮组和多选框组 单个选项勾选是否生效判断；
        // 选中值变化优先级： 指令 > 属性modelValue > 单个选项，另外属性modelValue(数据格式为值)< 单个选项
        const isValidChecked = () => {
            if (['bk-radio-group', 'bk-checkbox-group'].includes(comType)) {
                const modelAttr = framework === 'vue3' ? 'modelValue' : 'value'
                const isFormatValue = !comRenderProps?.[modelAttr]?.format || comRenderProps?.[modelAttr].format === 'value'
                const isModelDirective = comRenderDirectives.find((item) => {
                    if (item?.type === 'v-model') {
                        return item?.code?.length > 0
                    }
                    return false
                })
                if (isModelDirective || !isFormatValue) return false
                return true
            }
            return false
        }

        const { component } = slotData
        const slotRenderConfig = getRenderMap(framework)
        let render = () => {}
        if (vue2RenderList.includes(component) || vue3RenderList.includes(component)) {
            render = slotRenderConfig[component] || (() => {})
        }
        const slotRenderParams = []
        let curSlot = slotData
        do {
            const param = {
                val: curSlot.renderValue,
                payload: curSlot.payload,
                valueType: curSlot.valueType,
                valueKeys: curSlot.valueKeys,
                isChecked: isValidChecked(),
                type: 'value',
                from: 'canvas'
            }
            slotRenderParams.push(param)
            curSlot = curSlot.renderSlots
        } while (curSlot && Object.keys(curSlot).length > 0)

        // 转换 vnode
        let children
        if (framework === 'vue2') {
            // vue2 需要有一个父容器包裹
            const html = `<render-slot>${render(...slotRenderParams, renderKey)}</render-slot>`
            children = transformHtmlToVnode(html).children || []
        } else {
            const html = render(...slotRenderParams, renderKey)
            children = transformHtmlToVnode(html) || []
            children = Array.isArray(children) ? children : [children]
        }
        children.forEach?.((vnode) => {
            if (vnode.key) {
                vnode.key = vnode.key + renderKey
            }
        })
        return children
    }
}
