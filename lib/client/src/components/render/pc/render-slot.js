/**
 * Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company. All rights reserved.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

import { transformHtmlToVnode } from '@/common/util'
import slotRenderConfig from '@/element-materials/modifier/component/slots/render-config'

export default {
    name: 'render-slot',
    functional: true,
    props: {
        key: [Number, String],
        slotData: {
            type: [Number, String, Boolean, Object, Array],
            default: ''
        }
    },
    render (h, ctx) {
        const { key, slotData } = ctx.props

        const { component } = slotData
        const render = slotRenderConfig[component] || (() => {})
        const slotRenderParams = []
        let curSlot = slotData
        do {
            const param = {
                val: curSlot.renderValue,
                payload: curSlot.payload,
                valueType: curSlot.valueType,
                valueKeys: curSlot.valueKeys,
                type: 'value',
                from: 'canvas'
            }
            slotRenderParams.push(param)
            curSlot = curSlot.renderSlots
        } while (curSlot && Object.keys(curSlot).length > 0)

        const html = `<render-slot>${render(...slotRenderParams, key)}</render-slot>`
        const slotChildrenInstance = transformHtmlToVnode(html).children || []
        slotChildrenInstance?.forEach((vnode) => {
            vnode.key = vnode.key + key
        })
        return slotChildrenInstance
    }
}
